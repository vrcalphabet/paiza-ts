import { Box } from 'ink'
import { useTitle } from '../../hooks/useTitle'
import { Padding } from '../ui/Padding'
import { KeyBinds } from './KeyBinds'

export function Footer() {
  const id = useTitle((state) => state.id)

  return (
    <Box position="absolute" bottom={0} left={0} right={0} justifyContent="center">
      <Padding>
        <KeyBinds quitOnly={id === undefined} />
      </Padding>
    </Box>
  )
}
