import type { PropsWithChildren } from 'react'
import { Box, Text } from 'ink'

interface PaddingProps extends PropsWithChildren {
  padding?: number | undefined
}

export function Padding({ padding = 1, children }: PaddingProps) {
  return (
    <Box>
      <Text>{' '.repeat(padding)}</Text>
      {children}
      <Text>{' '.repeat(padding)}</Text>
    </Box>
  )
}
