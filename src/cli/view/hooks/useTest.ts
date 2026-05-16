import { create } from 'zustand'
import type { Browser } from '../../services/browser'
import { type BuildInfo } from '../../services/build'
import type { MessageType } from '../../types/message'
import { executeTest } from '../services/execute'

export type NotDoneCase = {
  status: 'idle' | 'testing'
  hasError: false
  elapsed?: never
}

export type DoneCase = {
  status: 'passed' | 'failed'
  hasError: boolean
  elapsed: number
}

export type Case = (NotDoneCase | DoneCase) & {
  no: number
  input: string
  output: string
  expected: string
}

export type DetailedBuildInfo = { elapsed: number } & BuildInfo

type TestState = {
  type: 'test' | 'submit'
  cases: Case[]
} & (
  | {
      status: 'idle' | 'building'
      buildInfo: Record<string, never>
    }
  | {
      status: 'build_failed' | 'running' | 'done'
      buildInfo: DetailedBuildInfo
    }
)

export const useTest = create<TestState>(() => {
  return {
    type: 'test',
    status: 'idle',
    buildInfo: {},
    cases: [],
  }
})

export async function initializeTestHook(page: Browser<MessageType>) {
  await page.exposeFunction('test', executeTest)

  await page.onNavigate({
    callback() {
      useTest.setState({
        status: 'idle',
        buildInfo: {},
        cases: [],
      })
    },
  })
}
