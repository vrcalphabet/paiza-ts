import { create } from 'zustand'
import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'

interface TitleState {
  id: string | undefined
  // 将来のために予約
  name: string | undefined
}

export const useTitle = create<TitleState>(() => {
  return {
    id: undefined,
    name: undefined,
  }
})

export async function initializeTitleHook(page: Browser<MessageType>) {
  await page.onNavigate({
    callback: async () => {
      const url = /^https:\/\/paiza\.jp\/challenges\/\d+\/(?:show|retry)$/
      if (!url.test(page.url)) {
        useTitle.setState({ id: undefined, name: undefined })
        return
      }

      const title = await page.evaluate(() => {
        return document.querySelector('.d-problem__page-title')?.textContent
      })
      if (title === undefined) return

      const [, id, name] = title.match(/^(?:再チャレンジ )?(\w\d+):(.+)$/) ?? []
      if (id === undefined || name === undefined) return

      useTitle.setState({ id, name })
    },
  })

  await page.onBack(() => {
    useTitle.setState({ id: undefined, name: undefined })
  })
}
