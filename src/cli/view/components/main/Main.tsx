import { Box, Text } from 'ink'
import { useTest } from '../../hooks/useTest'
import { useTitle } from '../../hooks/useTitle'
import { Build } from './build/Build'
import { Submit } from './submit/Submit'
import { Test } from './test/Test'

export function Main() {
  const id = useTitle((state) => state.id)
  const type = useTest((state) => state.type)
  const status = useTest((state) => state.status)

  return (
    <Box
      width="100%"
      height="100%"
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      flexDirection="column"
    >
      {id !== undefined && status !== 'idle' ?
        <>
          <Build />
          {type === 'test' && <Test />}
          {type === 'submit' && <Submit />}
        </>
      : <Box justifyContent="center" alignItems="center" width="100%" height="100%">
          {id !== undefined ?
            <Box flexDirection="column" alignItems="center">
              <Box>
                <Text color="gray">watching </Text>
                <Text color="greenBright">src/main.ts</Text>
              </Box>
              <Text color="gray">Waiting for build to start</Text>
            </Box>
          : <Text color="gray">Please select a problem</Text>}
        </Box>
      }
    </Box>
  )
}
