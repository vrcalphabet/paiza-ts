import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'
import { initializeTestHook } from '../hooks/useTest'
import { initializeTitleHook } from '../hooks/useTitle'

export async function initializeHooks(page: Browser<MessageType>) {
  await initializeTitleHook(page)
  await initializeTestHook(page)
}
