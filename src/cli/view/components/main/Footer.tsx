import { Box } from 'ink'
import { Padding } from '../ui/Padding'
import { KeyBinds } from './KeyBinds'

export function Footer() {
  return (
    <Box position="absolute" bottom={0} left={0} right={0} justifyContent="center">
      <Padding>
        <KeyBinds />
      </Padding>
    </Box>
  )
}
