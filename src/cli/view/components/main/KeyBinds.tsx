import { Box, Text, useInput } from 'ink'
import { useGlobal } from '../../hooks/useGlobal'
import { useTest } from '../../hooks/useTest'
import { useTitle } from '../../hooks/useTitle'
import { executeSubmit, executeTest } from '../../services/execute'
import { Badge } from '../ui/Badge'

export function KeyBinds() {
  const id = useTitle((state) => state.id)
  const type = useTest((state) => state.type)
  const status = useTest((state) => state.status)

  const onQuit = useGlobal((state) => state.onQuit)!
  const page = useGlobal((state) => state.page)!

  const isSubmit = type === 'submit' && (status === 'running' || status === 'done')

  useInput(async (input, key) => {
    if (input === 'c' && key.ctrl) {
      await onQuit()
      return
    }

    if (id === undefined) return

    if (input === 't') {
      await executeTest()
    }

    if (input === 'r' && key.ctrl) {
      await executeSubmit(page)
    }
  })

  const keyBindMap =
    id === undefined || isSubmit ?
      { 'Ctrl+C': 'Quit' }
    : {
        T: 'Test',
        'Ctrl+R': 'Submit',
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
