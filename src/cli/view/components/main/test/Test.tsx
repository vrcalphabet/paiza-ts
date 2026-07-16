import { useEffect, useState } from 'react'
import { Box, useInput } from 'ink'
import { useTest } from '../../../hooks/useTest'
import { TestHeader } from './TestHeader'
import { CaseDetails } from './cases/CaseDetails'
import { TestCases } from './cases/TestCases'

export function Test() {
  const status = useTest((state) => state.status)
  const cases = useTest((state) => state.cases)
  const [cursor, setCursor] = useState(0)

  useInput((input) => {
    if (status !== 'done') return

    if (input === 'q') {
      setCursor(Math.max(cursor - 1, 0))
    }

    if (input === 'e') {
      setCursor(Math.min(cursor + 1, cases.length - 1))
    }
  })

  useEffect(() => {
    setCursor(0)
  }, [status])

  return (
    <Box flexDirection="column">
      <TestHeader />
      <TestCases cursor={cursor} />
      {status === 'done' && <CaseDetails key={cursor} cursor={cursor} />}
    </Box>
  )
}
