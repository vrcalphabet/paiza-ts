export class Time<T> {
  private startTime: number | undefined = undefined

  constructor(private callback: (t: number) => T) {}

  start() {
    this.startTime = performance.now()
  }

  end() {
    if (this.startTime === undefined) {
      throw new Error('start() を呼んでください')
    }

    const endTime = performance.now()
    const value = this.callback(endTime - this.startTime)
    this.startTime = undefined

    return value
  }
}
