import { create } from 'zustand'
import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'

interface UseGlobalState {
  page: Browser<MessageType> | undefined
  onQuit: (() => Promise<void>) | undefined
  setGlobal: (state: {
    page: Browser<MessageType>
    onQuit: () => Promise<void>
  }) => void
}

export const useGlobal = create<UseGlobalState>((set) => {
  return {
    page: undefined,
    onQuit: undefined,

    setGlobal({ page, onQuit }) {
      set({ page, onQuit })
    },
  }
})
