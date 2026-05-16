export function nani(value: number, defaultValue: number) {
  return Number.isNaN(value) ? defaultValue : value
}

export function omitUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<{
    [K in keyof T]: Exclude<T[K], undefined>
  }>
}
