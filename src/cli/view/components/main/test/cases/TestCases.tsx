import { Box, Spacer, Text } from 'ink'
import Spinner from 'ink-spinner'
import { useTest } from '../../../../hooks/useTest'

interface TestCasesProps {
  cursor: number
}

export function TestCases({ cursor }: TestCasesProps) {
  const cases = useTest((state) => state.cases)

  return (
    <Box flexDirection="column" flexShrink={0}>
      {cases.slice(0, 3).map((c, i) => (
        <Box key={i}>
          <Box columnGap={1}>
            {c.status === 'idle' && <Text color="gray">·</Text>}
            {c.status === 'testing' && (
              <Text color="cyanBright">
                <Spinner type="dots" />
              </Text>
            )}
            {c.status === 'passed' && <Text color="greenBright">✓</Text>}
            {c.status === 'failed' && <Text color="redBright">✗</Text>}
            {i === cursor ?
              <Box columnGap={2}>
                <Text color="black" backgroundColor="white">
                  Case #{c.no}
                </Text>
                <Text color="gray">Press Q/E to move the cursor</Text>
              </Box>
            : <Text color="gray">Case #{c.no}</Text>}
          </Box>
          <Spacer />
          <Text color="gray">{c.elapsed?.toLocaleString() ?? '-'} ms</Text>
        </Box>
      ))}
    </Box>
  )
}
