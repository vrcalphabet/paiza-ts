import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { useTest } from '../../../hooks/useTest'
import { SubmitHeader } from './SubmitHeader'

export function Submit() {
  const status = useTest((state) => state.status)

  return (
    <Box flexDirection="column">
      <SubmitHeader />
      <Box justifyContent="center" alignItems="center" height="100%">
        {status === 'running' && (
          <Text>
            <Spinner type="dots" /> Submitting...
          </Text>
        )}
        {status === 'done' && (
          <Text color="greenBright">✓ Successfully submitted!</Text>
        )}
      </Box>
    </Box>
  )
}
