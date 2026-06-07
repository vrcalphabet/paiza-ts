import fs from 'node:fs/promises'
import { fsEx } from '../../lib/fs-extended'
import { Time } from '../../lib/time'
import type { Browser } from '../../services/browser'
import { build } from '../../services/build'
import { test } from '../../services/test'
import type { MessageType } from '../../types/message'
import { type Case, useTest } from '../hooks/useTest'
import { archive } from './archive'

async function executeBuild() {
  const time = new Time((t) => Math.floor(t))

  useTest.setState({
    status: 'building',
    buildInfo: {},
    cases: [],
  })

  time.start()

  const buildResult = await build()

  useTest.setState({
    buildInfo: {
      ...buildResult,
      elapsed: time.end(),
    },
  })

  return buildResult
}

export async function executeSubmit(page: Browser<MessageType>) {
  const status = useTest.getState().status
  if (!['idle', 'build_failed', 'done'].includes(status)) {
    return
  }

  useTest.setState({ type: 'submit' })
  const buildResult = await executeBuild()

  if (buildResult.success) {
    useTest.setState({ status: 'running' })
  } else {
    useTest.setState({ status: 'build_failed' })
    return
  }

  const code = await fs.readFile('.data/temp/dist/main.cjs', 'utf-8')

  await page.focus()

  await page.evaluate(
    (_, code: string) => {
      // https://cdn-paiza.paiza.jp/packs/partials/commons/challenge_code_submit.521270a72f1d189e.js
      remove_stored_history()
      
      document.querySelector<HTMLInputElement>('#code')!.value = code
      document.querySelector<HTMLInputElement>('#programming_language_id')!.value =
        '2308' // JavaScript

      document.querySelector<HTMLFormElement>('#code_hand_in')?.submit()
    },
    [code],
  )

  const resultUrl = await page.waitForUrl(
    /^https:\/\/paiza.jp\/challenges\/\d+\/(?:page\/result|retry_result)/,
  )

  // 画面が完全に切り替わるまで待つ
  await new Promise((resolve) => setTimeout(resolve, 500))

  useTest.setState({ status: 'done' })

  await archive(resultUrl)
}

export async function executeTest() {
  const status = useTest.getState().status
  if (!['idle', 'build_failed', 'done'].includes(status)) {
    return
  }

  useTest.setState({ type: 'test' })
  const buildResult = await executeBuild()

  if (buildResult.success) {
    useTest.setState({ status: 'running' })
  } else {
    useTest.setState({ status: 'build_failed' })
    return
  }

  const time = new Time((t) => Math.floor(t))

  const cases: Case[] = await fsEx.mapDir('.data/temp/samples/', async (dir, i) => {
    const input = await fs.readFile(`${dir}/input.txt`, 'utf-8')
    const expected = await fs.readFile(`${dir}/output.txt`, 'utf-8')
    return {
      no: i + 1,
      status: 'idle',
      input: normalize(input),
      output: '',
      expected: normalize(expected),
      hasError: false,
      error: undefined,
    }
  })
  useTest.setState({ cases })

  await fsEx.eachDir('.data/temp/samples/', async (dir, i) => {
    updateCase(i, {
      status: 'testing',
    })

    time.start()

    const { success, output, hasError } = await test({
      entryPath: '.data/temp/dist/main.cjs',
      inputPath: `${dir}/input.txt`,
      outputPath: `${dir}/output.txt`,
    })

    updateCase(i, {
      status: success ? 'passed' : 'failed',
      hasError,
      elapsed: time.end(),
      output: normalize(output),
    })
  })

  useTest.setState({ status: 'done' })
}

function updateCase(index: number, c: Partial<Case>) {
  useTest.setState((state) => {
    const newCase = [...state.cases]
    Object.assign(newCase[index]!, c)
    return { cases: newCase }
  })
}

function normalize(str: string) {
  return str.replaceAll('\r', '').replaceAll('\t', '  ')
}
