import { useEffect } from 'react'
import { Box, useInput, useWindowSize } from 'ink'
import type { Browser } from '../../services/browser'
import type { MessageType } from '../../types/message'
import { executeSubmit, executeTest } from '../services/execute'
import { initializeHooks } from '../services/initialize'
import { setup } from '../services/setup'
import { Footer } from './main/Footer'
import { Header } from './main/Header'
import { Main } from './main/Main'

interface AppProps {
  page: Browser<MessageType>
  onQuit: () => Promise<void>
}

export function App({ page, onQuit }: AppProps) {
  const { columns, rows } = useWindowSize()

  useInput(async (input, key) => {
    if (input === 'c' && key.ctrl) {
      await onQuit()
      return
    }

    if (input === 't') {
      await executeTest()
    }

    if (input === 's' && key.ctrl) {
      await executeSubmit(page)
    }
  })

  useEffect(() => {
    ;(async () => {
      await setup(page)
      await initializeHooks(page)

      await page.exposeFunction('submit', async () => {
        await executeSubmit(page)
      })
    })()
  }, [page])

  return (
    <Box position="relative" width={columns} height={rows}>
      <Main />
      <Header />
      <Footer />
    </Box>
  )
}

// TODO: ケースが4つ以上あるときの動作
