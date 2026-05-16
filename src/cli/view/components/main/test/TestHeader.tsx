import { Box, Text } from 'ink'
import { nani } from '../../../../utils'
import { type Case, type DoneCase, useTest } from '../../../hooks/useTest'
import { Badge } from '../../ui/Badge'

export function TestHeader() {
  const status = useTest((state) => state.status)
  const cases = useTest((state) => state.cases)

  const doneCases = cases.filter(
    (c): c is Case & DoneCase => c.status === 'passed' || c.status === 'failed',
  )
  const totalElapsed = doneCases.reduce((sum, c) => sum + c.elapsed, 0)
  const avgElapsed = nani(Math.floor(totalElapsed / doneCases.length), 0)
  const passed = !doneCases.some((c) => c.status === 'failed')

  return (
    <Box justifyContent="space-between">
      <Box>
        <Box marginRight={2}>
          <Text color="gray">◈ </Text>
          <Text color="magentaBright" bold>
            TEST
          </Text>
        </Box>
        {status === 'build_failed' && <Text color="gray">skipped</Text>}
        {cases.length > 0 &&
          cases.length === doneCases.length &&
          (passed ?
            <Badge backgroundColor="greenBright">PASSED</Badge>
          : <Badge backgroundColor="redBright">FAILED</Badge>)}
      </Box>
      {(status === 'testing' || status === 'done') && (
        <Box columnGap={2}>
          <Box>
            <Text color="cyanBright">{avgElapsed.toLocaleString()} ms/case</Text>
          </Box>
          <Box columnGap={1}>
            <Text color="gray">TOTAL</Text>
            <Text>{cases.length}</Text>
          </Box>
          <Box columnGap={1}>
            <Text color="gray">PASSED</Text>
            <Text color="greenBright">
              {doneCases.filter((c) => c.status === 'passed').length}
            </Text>
          </Box>
          <Box columnGap={1}>
            <Text color="gray">FAILED</Text>
            <Text color="redBright">
              {doneCases.filter((c) => c.status === 'failed').length}
            </Text>
          </Box>
        </Box>
      )}
      {(status === 'submitting' || status === 'submitted') && (
        <Box
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Text color="greenBright">✓ Successfully submitted!</Text>
          <Text color="greenBright">Well Done.</Text>
        </Box>
      )}
    </Box>
  )
}
