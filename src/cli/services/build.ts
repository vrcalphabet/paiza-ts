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

  const result = {
    source: '',
    runtime: '',
    external: '',
  }

  const pushResult = (
    path: string | undefined,
    code: string,
    isSourceDir: boolean,
  ) => {
    // ランタイムは 'rolldown' に、外部ライブラリの場合はそのライブラリの名前に
    const nameMatch = path?.match(/\/?node_modules\/((@[^/]+\/)?[^/]+)/)
    const name =
      nameMatch ? nameMatch[1]
      : path === '\\0rolldown/runtime.js' ? 'rolldown'
      : path

    const region = `\n// ${name}`
    const body = `\n${code}\n`

    if (name === undefined || name === 'rolldown') {
      // 野良コード（組み込みライブラリの呼び出し）やランタイムは、ランタイムの最後に移動する
      result.runtime += name === undefined ? body.trimStart() : region + body
    } else if (isSourceDir) {
      // ユーザが書いたコードは、__main__の中に移動する
      result.source += region + body
    } else {
      // 外部ライブラリは、__main__の外に移動する
      result.external += region + body
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
        pushResult(path, trimmedCode, true)
        return
      }
    }

    const output = await minify(code, {
      compress: { unused: false },
      ecma: 2022,
    })
    pushResult(path, output.code!.trim(), false)
  })

  await fs.writeFile(
    '.data/temp/dist/main.cjs',
    /* js */ `
function __main__() {
${result.source.trim()}
}

//========================== 外部ライブラリ群 ==========================//
${result.runtime}${result.external}
;__main__()
`.trimStart(),
  )
}
