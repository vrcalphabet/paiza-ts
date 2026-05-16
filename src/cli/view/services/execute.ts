import fs from 'node:fs/promises'
import { fsEx } from '../../lib/fs-extended'
import { Time } from '../../lib/time'
import type { Browser } from '../../services/browser'
import { build, test } from '../../services/build'
import type { MessageType } from '../../types/message'
import { type Case, useTest } from '../hooks/useTest'

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
      remove_stored_history()

      code =
        code
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
          .replace(/^\t+/gm, (m) => m.replaceAll('\t', '  '))
          .replace(/^(\/\/#region )/gm, '\n$1')
          .replace(/^(\/\/#endregion)$/gm, '$1\n')
          .trim() + '\n'

      // https://cdn-paiza.paiza.jp/packs/partials/commons/challenge_code_submit.521270a72f1d189e.js
      document.querySelector<HTMLInputElement>('#code')!.value = code
      document.querySelector<HTMLInputElement>('#programming_language_id')!.value =
        '2308' // JavaScript

      document.querySelector<HTMLFormElement>('#code_hand_in')?.submit()
    },
    [code],
  )

  await new Promise((resolve) => setTimeout(resolve, 5000))

  useTest.setState({ status: 'done' })
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
      input: input.replaceAll('\r', ''),
      output: '',
      expected: expected.replaceAll('\r', ''),
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
      output: output.replaceAll('\r', ''),
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
