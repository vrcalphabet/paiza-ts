import { render } from 'ink'
import { bootstrap } from './bootstrap'
import { fsEx } from './lib/fs-extended'
import { App } from './view/components/App'

;(async () => {
  const page = await bootstrap()

  let isShuttingDown = false

  const shutdown = async () => {
    if (isShuttingDown) return
    isShuttingDown = true

    if (!page.isClosed) {
      // ブラウザが閉じるまで待ってるとUXが低下するため
      void page.exit()
    }

    app.unmount()
    await fsEx.remake('.data/temp')

    console.log('\n\nお疲れさまでした。\n')
  }

  process.once('SIGINT', shutdown)
  page.onDisconnected(shutdown)

  const app = render(<App page={page} onQuit={shutdown} />, {
    exitOnCtrlC: false,
  })
})()
