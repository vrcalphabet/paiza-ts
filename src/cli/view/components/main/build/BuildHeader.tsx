import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { type DetailedBuildInfo, useTest } from '../../../hooks/useTest'
import { Badge } from '../../ui/Badge'

export function BuildHeader() {
  const type = useTest((state) => state.type)
  const status = useTest((state) => state.status)
  const buildInfo = useTest((state) => state.buildInfo)

  return (
    <Box>
      <Box marginRight={type === 'submit' ? 2 : 1}>
        <Text color="gray">◈ </Text>
        <Text color="magentaBright" bold>
          BUILD
        </Text>
      </Box>
      {status === 'building' && (
        <>
          <Text color="cyanBright">
            <Spinner type="dots" />
          </Text>
          <Text color="gray"> rebuilding...</Text>
        </>
      )}
      {(status === 'running' || status === 'done') && (
        <>
          <Badge backgroundColor="greenBright">SUCCEEDED</Badge>
          <Text color="gray"> rebuilt in </Text>
          <Text color="greenBright">
            {(buildInfo as DetailedBuildInfo).elapsed} ms
          </Text>
        </>
      )}
      {status === 'build_failed' && (
        <Badge backgroundColor="redBright">FAILED</Badge>
      )}
    </Box>
  )
}
