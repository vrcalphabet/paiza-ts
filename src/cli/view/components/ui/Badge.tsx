import type { PropsWithChildren } from 'react'
import type { ForegroundColorName } from 'ansi-styles'
import { Text } from 'ink'
import type { LiteralUnion } from 'type-fest'

interface BadgeProps extends PropsWithChildren {
  backgroundColor: LiteralUnion<ForegroundColorName, string>
}

export function Badge({ backgroundColor, children }: BadgeProps) {
  return (
    /* prettier-ignore */
    <Text backgroundColor={backgroundColor} color="white"> {children} </Text>
  )
}
