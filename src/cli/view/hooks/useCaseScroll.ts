import { useState } from 'react'
import { useInput } from 'ink'

interface UseCaseScrollParams {
  innerWidth: number
  innerHeight: number
  scrollWidth: number
  scrollHeight: number
}

export function useCaseScroll({
  innerWidth,
  innerHeight,
  scrollWidth, scrollHeight
}: UseCaseScrollParams) {
  const SCROLL_X_SPEED = 2
  const SCROLL_Y_SPEED = 1

  const [scrollX, setScrollX] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  const maxScrollX = Math.max(scrollWidth - innerWidth, 0)
  const maxScrollY = Math.max(scrollHeight - innerHeight, 0)

  // 左右のスクロール
  useInput((input) => {
    // コンテナに要素が収まっている場合はスクロール不要
    if (scrollWidth <= innerWidth) return

    if (input === 'a') {
      setScrollX((prev) => Math.max(prev - SCROLL_X_SPEED, 0))
    }

    if (input === 'd') {
      setScrollX((prev) => Math.min(prev + SCROLL_X_SPEED, maxScrollX + 1))
    }
  })

  // 上下のスクロール
  useInput((input) => {
    // コンテナに要素が収まっている場合はスクロール不要
    if (scrollHeight <= innerHeight) return

    if (input === "w") {
      setScrollY((prev) => Math.max(prev - SCROLL_Y_SPEED, 0))
    }

    if (input === "s") {
      setScrollY((prev) => Math.min(prev + SCROLL_Y_SPEED, maxScrollY))
    }
  })

  return {
    scrollX,
    scrollY,
  }
}
