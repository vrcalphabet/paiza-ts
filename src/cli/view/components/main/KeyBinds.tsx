import { Box, Text } from 'ink'
import { Badge } from '../ui/Badge'

interface KeyBindsProps {
  quitOnly: boolean
}

export function KeyBinds({ quitOnly }: KeyBindsProps) {
  const keyBindMap =
    quitOnly ?
      { 'Ctrl+C': 'Quit' }
    : {
        T: 'Test',
        'Ctrl+S': 'Submit',
        'Ctrl+C': 'Quit',
      }

  return (
    <Box>
      {Object.entries(keyBindMap).map(([bind, name], i, arr) => (
        <Box key={bind}>
          <Badge backgroundColor="gray">{bind}</Badge>
          <Text color="gray"> to </Text>
          <Text bold>
            {name}
            {i < arr.length - 1 && ' '}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
