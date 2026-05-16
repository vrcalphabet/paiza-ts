import { useLayoutEffect, useRef, useState } from 'react'
import { Box, type DOMElement, Text, measureElement, useWindowSize } from 'ink'
import { useCaseScroll } from '../../../../hooks/useCaseScroll'
import { type Case, useTest } from '../../../../hooks/useTest'
import { Badge } from '../../../ui/Badge'
import { Padding } from '../../../ui/Padding'
import { CaseDetail } from './CaseDetail'

interface CaseDetailsProps {
  cursor: number
}

function getScrollSize(c: Case) {
  const getSize = (text: string) => {
    const lines = text.split('\n')
    return {
      width: lines.reduce((width, line) => Math.max(width, line.length), 0),
      height: lines.length,
    }
  }

  const input = getSize(c.input)
  const expected = getSize(c.expected)
  const output = getSize(c.output)

  // prettier-ignore
  return {
    scrollWidth: Math.max(input.width, output.width, c.hasError ? expected.width : 0),
    scrollHeight: Math.max(input.height, output.height, c.hasError ? expected.height : 0),
  }
}

export function CaseDetails({ cursor }: CaseDetailsProps) {
  const cases = useTest((state) => state.cases)
  const currentCase = cases[cursor]!

  const boxRef = useRef<DOMElement>(null)

  const [innerWidth, setInnerWidth] = useState(0)
  const [innerHeight, setInnerHeight] = useState(0)
  const [boxSizes, setBoxSizes] = useState<{ width: number; height: number }[]>([])

  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    if (!boxRef.current) return

    const boxes = boxRef.current.childNodes.filter(
      (child): child is DOMElement => child.nodeName !== '#text',
    )

    const boxSizes = boxes.map((elem, i) => {
      // 最初のボックスだけ左のボーダーが存在するため
      const BORDER_X_SIZE = i === 0 ? 2 : 1
      const BORDER_Y_SIZE = 2
      const PADDING_SIZE = 2

      const { width, height } = measureElement(elem)
      return {
        width: width - BORDER_X_SIZE - PADDING_SIZE,
        height: height - BORDER_Y_SIZE,
      }
    })

    const { width, height } = boxSizes.reduce((innerSize, size) => ({
      width: Math.min(innerSize.width, size.width),
      height: Math.min(innerSize.height, size.height),
    }))

    setBoxSizes(boxSizes)
    setInnerWidth(width)
    setInnerHeight(height)
  }, [cases, windowSize])

  const { scrollWidth, scrollHeight } = getScrollSize(currentCase)

  const viewport = useCaseScroll({
    innerWidth,
    innerHeight,
    scrollWidth,
    scrollHeight,
  })

  const defaultSize = { width: 0, height: 0 }

  return (
    <Box height="100%" position="relative">
      <Box width="100%" justifyContent="space-between" ref={boxRef}>
        <CaseDetail isFirst={true} title="Input" titleColor="gray">
          {visibleReturn(currentCase.input, boxSizes[0] ?? defaultSize, viewport)}
        </CaseDetail>
        {!currentCase.hasError ?
          <>
            <CaseDetail title="Expected" titleColor="greenBright">
              {visibleReturn(
                currentCase.expected,
                boxSizes[1] ?? defaultSize,
                viewport,
              )}
            </CaseDetail>
            <CaseDetail
              title="Output"
              titleColor={
                currentCase.status === 'passed' ? 'greenBright' : 'redBright'
              }
            >
              {visibleReturn(
                currentCase.output,
                boxSizes[2] ?? defaultSize,
                viewport,
              )}
            </CaseDetail>
          </>
        : <CaseDetail
            title={
              <>
                Output <Badge backgroundColor="redBright">Runtime Error</Badge>
              </>
            }
            titleColor="redBright"
            flexGrow={2}
          >
            {visibleReturn(currentCase.output, boxSizes[1] ?? defaultSize, viewport)}
          </CaseDetail>
        }
      </Box>
      <Box position="absolute" bottom={0} right={0} left={0} justifyContent="center">
        <Padding>
          <Text color="gray">Use W/A/S/D to scroll</Text>
        </Padding>
      </Box>
      <Box position="absolute" bottom={0} right={1}>
        <Padding>
          <Text color="gray">∎ = EOF</Text>
        </Padding>
      </Box>
    </Box>
  )
}

function getHeight(text: string) {
  return text.split('\n').length
}

function sliceLines(text: string, start: number, height: number) {
  return text.split('\n').slice(start, start + height)
}

function visibleReturn(
  text: string,
  { width, height }: { width: number; height: number },
  {
    scrollX,
    scrollY,
  }: {
    scrollX: number
    scrollY: number
  },
) {
  const textHeight = getHeight(text)
  const sliced = sliceLines(text, scrollY, height)

  return (
    <Box flexDirection="column" position="relative" width="100%">
      {sliced.map((v, i) => {
        const mark = scrollY + i === textHeight - 1 ? '∎' : '↵'
        const truncated = (v + mark).slice(scrollX)
        const result =
          // 行が画面を突き破る場合は削って３点マークを
          truncated.length > width ? `${truncated.slice(0, width - 1)}…`
            // 行が画面より左にいるときは、画面左に３点マークを
          : v.length >= 0 && truncated.length === 0 ? '…'
            // resultが空文字だと行が詰められてしまうので空白を追加
          : truncated || ' '

        return (
          <Box key={`${i}-${v}`}>
            <Text wrap="truncate">{result}</Text>
          </Box>
        )
      })}
      {scrollY > 0 && (
        <Box justifyContent="center" width="100%" position="absolute" top={0}>
          <Padding padding={2}>
            <Text color="gray">︙</Text>
          </Padding>
        </Box>
      )}
      {scrollY + height < textHeight && (
        <Box justifyContent="center" width="100%" position="absolute" bottom={0}>
          <Padding padding={2}>
            <Text color="gray">︙</Text>
          </Padding>
        </Box>
      )}
    </Box>
  )
}
