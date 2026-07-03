import fs from 'node:fs/promises'
import { challengesScript } from '../../contents/scripts/challenges'
import { editorScript } from '../../contents/scripts/editor'
import { globalScript } from '../../contents/scripts/global'
import { resultScript } from '../../contents/scripts/result'
import { fsEx } from '../../lib/fs-extended'
import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'
import challengesCss from '../../contents/styles/challenges.css?inline'
import editorCss from '../../contents/styles/editor.css?inline'
import globalCss from '../../contents/styles/global.css?inline'
import readyCss from '../../contents/styles/ready.css?inline'
import resultCss from '../../contents/styles/result.css?inline'
import resultsCss from '../../contents/styles/results.css?inline'

export async function setup(page: Browser<MessageType>) {
  // ウィンドウ幅を狭めてもレイアウトが崩れないようなCSSを挿入する
  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza.jp\//,
    style: globalCss,
    script: globalScript,
  })

  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza\.jp\/challenges\/\d+\/ready$/,
    style: readyCss,
  })

  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza\.jp\/challenges\/\d+\/(?:show|retry)$/,
    style: editorCss,
    script: editorScript,
  })

  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza\.jp\/challenges\/\d+\/(?:page\/result|retry_result)/,
    style: resultCss,
    script: resultScript,
  })

  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza\.jp\/skill_checks\/(?:retry_|sql_retry_)?results/,
    style: resultsCss,
  })

  await page.evaluateOnNavigate({
    url: /^https:\/\/paiza.jp\/challenges\/ranks\//,
    style: challengesCss,
    script: challengesScript,
  })

  await page.navigate('https://paiza.jp/challenges')

  // ログイン画面にリダイレクトしてしまった場合は、ログインが完了するまで待機
  await page.waitForUrl('https://paiza.jp/challenges')

  await page.exposeFunction('samples', async (data: string[]) => {
    await fsEx.remake('.data/temp/samples')

    for (let i = 1; data.length > 0; i++) {
      const [input, output] = data.splice(0, 2)
      if (input === undefined || output === undefined) break

      const base = `.data/temp/samples/${i}`
      await fs.mkdir(base, { recursive: true })
      await fs.writeFile(`${base}/input.txt`, input)
      await fs.writeFile(`${base}/output.txt`, output)
    }
  })

  page.onDialog(async (dialog) => {
    await dialog.accept()
  })
}
