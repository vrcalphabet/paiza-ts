import fs from 'node:fs/promises'
import { regex } from 'arkregex'
import { minify } from 'terser'
import { build as tsdownBuild } from 'tsdown'
import { execAll } from '../utils'

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
        alwaysBundle: [/.*/],
      },
    })

    await minifyBuild()

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: String(err),
    }
  }
}

async function minifyBuild() {
  const code = await fs.readFile('.data/temp/dist/main.cjs', 'utf-8')
  const normalizedCode = code.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')

  let result = ''
  const pushResult = (path: string | undefined, code: string) => {
    if (path !== undefined) {
      result += `\n//#region ${path}`
    }
    result += `\n${code}\n`
    if (path !== undefined) {
      result += `//#endregion\n`
    }
  }

  const matcher = regex(
    '//#endregion\n(?!//#region)(?<code>[\\s\\S]+?)(?=\n//#region|$)|//#region (?<path>.+)\n(?<code>[\\s\\S]+?)(?=\n//#endregion)',
    'g',
  )
  await execAll(matcher, normalizedCode, async (match) => {
    const { path, code } = match.groups
    const trimmedCode = code.trim()
    if (!trimmedCode) return

    if (path !== undefined) {
      const isSourceDir = ['src', 'lib'].includes(path.split('/')[0]!)
      if (isSourceDir) {
        pushResult(path, trimmedCode)
        return
      }
    }

    const output = await minify(code, {
      compress: { unused: false },
      ecma: 2022,
    })
    pushResult(path, output.code!.trim())
  })

  await fs.writeFile('.data/temp/dist/main.cjs', result.trimStart())
}
