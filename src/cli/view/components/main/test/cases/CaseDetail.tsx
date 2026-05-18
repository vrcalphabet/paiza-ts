import { type PropsWithChildren, type ReactNode } from 'react'
import type { ForegroundColorName } from 'chalk'
import { Box, type BoxProps, Text } from 'ink'
import type { LiteralUnion } from 'type-fest'

interface CaseDetailProps extends BoxProps, PropsWithChildren {
  isFirst?: boolean
  title: ReactNode
  titleColor: LiteralUnion<ForegroundColorName, string>
}

export function CaseDetail({
  isFirst = false,
  title,
  titleColor,
  children,
  ...props
}: CaseDetailProps) {
  return (
    <Box
      position="relative"
      width="100%"
      flexGrow={1}
      flexShrink={1}
      flexBasis="0%"
      {...props}
    >
      <Box
        borderColor="gray"
        borderLeft={isFirst}
        borderStyle="round"
        width="100%"
        paddingX={1}
        overflow="hidden"
      >
        {children}
      </Box>
      <Box position="absolute" top={0} left={isFirst ? 1 : 0} right={1}>
        <Text color={titleColor}> {title} </Text>
      </Box>
    </Box>
  )
}
