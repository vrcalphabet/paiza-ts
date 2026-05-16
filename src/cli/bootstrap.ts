import c from 'chalk'
import terminalSize from 'terminal-size'
import { Time } from './lib/time'
import { Browser } from './services/browser'
import type { MessageType } from './types/message'

export async function bootstrap() {
  const time = new Time((t) => `${c.bold(Math.floor(t).toLocaleString())} ms`)
  time.start()

  process.on('unhandledRejection', (reason) => {
    console.error('[warn] unhandledRejection:', reason)
  })

  process.on('uncaughtException', (e) => {
    console.error('[warn] uncaughtException:', e)
  })

  if (process.env.TERM_PROGRAM !== 'vscode') {
    console.log(
      c.yellowBright(
        'WARN: vscode のターミナル以外での実行を確認しました。予期せぬ動作が発生する可能性があります。',
      ),
    )
  }

  const { columns, rows } = terminalSize()
  if (columns < 60 || rows < 18) {
    console.log(
      c.yellowBright(
        'WARN: 画面サイズ 60x18 未満での実行を確認しました。UIが崩れて表示される可能性があります。',
      ),
    )
  }

  try {
    const page = await new Browser<MessageType>().launch()

    console.log(
      `\n${c.bold.greenBright('paiza-ts')} ${c.gray('ready in')} ${time.end()}\n`,
    )

    return page
  } catch {
    // 別のコンテキストですでにブラウザが開かれている場合
    console.log(
      c.redBright(
        '\nERROR: 既に別のコンテキストでブラウザが開かれています。処理を停止します。',
      ),
    )
    process.exit(1)
  }
}
