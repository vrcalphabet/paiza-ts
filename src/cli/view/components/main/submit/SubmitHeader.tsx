import { Box, Text } from 'ink'
import { useTest } from '../../../hooks/useTest'
import { Badge } from '../../ui/Badge'

export function SubmitHeader() {
  const status = useTest((state) => state.status)

  return (
    <Box>
      <Box marginRight={1}>
        <Text color="gray">◈ </Text>
        <Text color="magentaBright" bold>
          SUBMIT
        </Text>
      </Box>
      {status === 'done' && (
        <Badge backgroundColor="greenBright">SUCCEEDED</Badge>
      )}
    </Box>
  )
}
