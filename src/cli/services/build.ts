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
        alwaysBundle: [/.*/],
      },
    })

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: String(err),
    }
  }
}
