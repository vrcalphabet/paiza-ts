import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import { build as tsdownBuild } from 'tsdown'

export type BuildInfo =
  | {
      success: false
      error: string
    }
  | {
      success: true
      error?: never
    }

export async function build(): Promise<BuildInfo> {
  try {
    await tsdownBuild({
      entry: ['src/main.ts'],
      outDir: '.data/temp/dist/',
      format: 'cjs',
      // https://paiza.jp/guide/language Node.js v16.17.1
      target: 'node16.17',
      logLevel: 'silent',
      failOnWarn: true,
      deps: {
        alwaysBundle: [/.*/]
      }
    })

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: String(err),
    }
  }
}

export async function test({
  entryPath,
  inputPath,
  outputPath,
}: {
  entryPath: string
  inputPath: string
  outputPath: string
}) {
  const result = await new Promise<{
    stdout: string
    stderr: string
    code: number | null
  }>((resolve) => {
    const child = spawn(
      'node',
      // https://paiza.jp/guide/language max memory 512MB, timeout 16s
      [entryPath, '--max-old-space-size=512'],
      { timeout: 16000 },
    )

    createReadStream(inputPath, 'utf-8').pipe(child.stdin)

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => (stdout += chunk.toString()))
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()))

    child.on('close', (code) => resolve({ stdout, stderr, code }))
  })

  if (result.code !== 0) {
    return {
      success: false,
      hasError: true,
      output: `${result.stdout}${result.stderr}`,
    }
  }

  const output = await fs.readFile(outputPath, 'utf-8')
  return {
    success: result.stdout === output,
    hasError: false,
    output: result.stdout,
  }
}
