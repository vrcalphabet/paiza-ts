import { Box, Text } from 'ink'
import { type DetailedBuildInfo, useTest } from '../../../hooks/useTest'
import { BuildHeader } from './BuildHeader'

export function Build() {
  const status = useTest((state) => state.status)
  const buildInfo = useTest((state) => state.buildInfo)

  return (
    <Box flexDirection="column">
      <BuildHeader />
      {status === 'build_failed' && (
        <Box paddingLeft={2}>
          <Text>{(buildInfo as DetailedBuildInfo).error}</Text>
        </Box>
      )}
    </Box>
  )
}
