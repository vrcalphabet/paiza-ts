import { create } from 'zustand'
import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'

interface TitleState {
  id: string | undefined
  internalId: string | undefined
  name: string | undefined
}

export const useTitle = create<TitleState>(() => {
  return {
    id: undefined,
    internalId: undefined,
    name: undefined,
  }
})

export async function initializeTitleHook(page: Browser<MessageType>) {
  await page.onNavigate({
    callback: async () => {
      const resultUrl =
        /^https:\/\/paiza.jp\/challenges\/\d+\/(?:page\/result|retry_result)/
      if (resultUrl.test(page.url)) {
        return
      }

      const challengeUrl = /^https:\/\/paiza\.jp\/challenges\/\d+\/(?:show|retry)$/
      if (!challengeUrl.test(page.url)) {
        useTitle.setState({ id: undefined, name: undefined })
        return
      }

      const title = await page.evaluate(() => {
        return document.querySelector('.d-problem__page-title')?.textContent
      })
      if (title === undefined) return

      const [, id, name] = title.match(/(\w\d{3}):(.+)$/) ?? []
      if (id === undefined || name === undefined) return

      const [, internalId] =
        page.url.match(/\/challenges\/(\d+)\/(?:show|retry)$/) ?? []
      if (internalId === undefined) return

      useTitle.setState({ id, internalId, name })
    },
  })

  await page.onBack(() => {
    useTitle.setState({ id: undefined, name: undefined })
  })
}
