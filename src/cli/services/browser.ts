/* eslint-disable @typescript-eslint/no-explicit-any */
import puppeteer, { Page } from 'puppeteer'

type AnyFunctionMap<T> = {
  [K in keyof T]: (...args: any[]) => any
}

export class Browser<TDef extends AnyFunctionMap<TDef>> {
  private instanceId = crypto.randomUUID()
  private page!: Page

  get isClosed(): boolean {
    return this.page.isClosed()
  }

  get url(): string {
    return this.page.url()
  }

  constructor() {}

  async launch() {
    // ブラウザを起動する
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      protocolTimeout: 0,
      timeout: 0,
      userDataDir: '.data/puppeteer',
      // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      // args: ['--window-size=800,800'],
      args: ['--no-default-browser-check', '--hide-crash-restore-bubble'],
    })

    void (await browser.pages()).map((page) => page.close())
    this.page = await browser.newPage()

    // 放置してもブラウザが勝手に強制終了しないように設定
    this.page.setDefaultTimeout(0)
    this.page.setDefaultNavigationTimeout(0)

    // bfcache対策
    // https://stackoverflow.com/questions/7248111/how-to-prevent-content-being-displayed-from-back-forward-cache-in-firefox
    await this.evaluateOnNavigate({
      script: () => {
        window.addEventListener('unload', () => {})
        window.addEventListener('beforeunload', () => {})
      },
    })

    return this
  }

  async exit() {
    await this.page.browser().close()
  }

  onDisconnected(callback: () => void) {
    this.page.browser().once('disconnected', callback)
  }

  async exposeFunction<TName extends keyof TDef & string>(
    name: TName,
    callback: TDef[TName],
  ) {
    const realName = `${this.instanceId}__${name}`
    await this.page.exposeFunction(realName, callback)
  }

  async focus() {
    await this.page.bringToFront()
  }

  async onNavigate({ url, callback }: { url?: RegExp; callback: () => void }) {
    this.page.on('domcontentloaded', () => {
      if (url && !url.test(this.page.url())) return
      callback()
    })
  }

  async onBack(callback: () => void) {
    const id = crypto.randomUUID()

    await this.exposeFunction<any>(id, callback as any)
    await this.evaluateOnNavigate({
      script: (context, id) => {
        const windowId = `__onBack_${id}`
        if ((window as any)[windowId] !== undefined) return
        ;(window as any)[windowId] = true

        // これだけ難しかったのでAIさんに書いてもらいました
        window.addEventListener('pageshow', () => {
          const nav = performance
            .getEntriesByType('navigation')
            .find((e) => e instanceof PerformanceNavigationTiming)
          if (!nav || nav.type !== 'back_forward') return
          ;(context as any)[id]()
        })
      },
      args: [id],
    })
  }

  async evaluate<T>(callback: (context: TDef) => T): Promise<T>
  async evaluate<T, TArgs extends unknown[]>(
    callback: (context: TDef, ...args: TArgs) => T,
    args: TArgs,
  ): Promise<T>
  async evaluate<T, TArgs extends unknown[]>(
    callback: (context: TDef, ...args: TArgs) => T,
    args?: TArgs,
  ): Promise<T> {
    return await this.page.evaluate(
      ({ instanceId, callback, args = [] }) => {
        const context = new Proxy(
          {},
          {
            get(_, name) {
              if (typeof name !== 'string') return

              const realName = `${instanceId}__${name}`
              return (globalThis as any)[realName]
            },
          },
        )
        const res = new Function(
          'context, args',
          `return (${callback}\n)(context, ...args)`,
        )(context, args)
        return res
      },
      { instanceId: this.instanceId, callback: callback.toString(), args },
    )
  }

  async evaluateOnNavigate<TArgs extends unknown[]>({
    url,
    script,
    style,
    args = [] as unknown as TArgs,
  }: {
    url?: RegExp
    script?: (context: TDef, ...args: TArgs) => void
    style?: string
    args?: TArgs
  }) {
    this.page.on('domcontentloaded', async () => {
      if (url && !url.test(this.page.url())) return

      if (style !== undefined) {
        await this.page.addStyleTag({ content: style })
      }

      if (script !== undefined) {
        await this.evaluate(script, args)
      }
    })
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' })
  }

  async waitForUrl(url: string) {
    if (this.page.url() === url) return

    return new Promise<void>((resolve) => {
      const handler = () => {
        if (this.page.url() !== url) return

        this.page.off('framenavigated', handler)
        resolve()
      }
      this.page.on('framenavigated', handler)
    })
  }
}
