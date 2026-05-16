import { Box, Text } from 'ink'
import { useTitle } from '../../hooks/useTitle'
import { Padding } from '../ui/Padding'

export function Header() {
  const id = useTitle((state) => state.id)

  return (
    <Box
      position="absolute"
      top={0}
      left={1}
      right={1}
      justifyContent="space-between"
    >
      <Padding>
        <Text color="gray">Problem #{id}</Text>
      </Padding>
      {id !== undefined && (
        <Padding>
          <Text color="gray">Watching </Text>
          <Text color="greenBright">src/main.ts</Text>
        </Padding>
      )}
    </Box>
  )
}
