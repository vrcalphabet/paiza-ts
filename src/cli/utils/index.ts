import type { Regex } from 'arkregex'

export function nani(value: number, defaultValue: number) {
  return Number.isNaN(value) ? defaultValue : value
}

export async function execAll<T extends Regex>(
  matcher: T,
  str: string,
  callback: (g: T['inferExecArray']) => void,
) {
  let match
  while ((match = matcher.exec(str)) !== null) {
    await Promise.resolve(callback(match))
  }
}
