export function challengesScript() {
  const problems = (() => {
    const problems = document.querySelectorAll('.problem-group .problem-box')
    return [...problems].flatMap((problem) => {
      const $ = (selector: string) => problem.querySelector(selector)?.textContent

      const parse = (value: string, pattern: RegExp) => {
        const match = value.match(pattern)
        if (!match) return

        const [, s1, s2] = match as [never, string, string]
        return Number(s1) + Number(s2) / Math.pow(10, s2.length)
      }

      const btnType = problem.querySelector(
        '.problem-box__challenge_button a',
      )!.className

      const rateElem = $('.problem-box__data dd')
      const diffElem = $('.problem-box__data dd:nth-of-type(4)')
      const timeElem = $('.problem-box__header__note strong')

      const rate = parse(rateElem!, /(\d+)\.(\d+)％/)
      const diff = parse(diffElem!, /(\d+) ±(\d+)/)
      const time = parse(timeElem ?? '0分0秒', /(\d+)分(\d+)秒/)

      if (rate === undefined || diff === undefined || time === undefined) return []
      return [
        {
          type: btnType,
          target: problem,
          rate,
          diff,
          time,
        },
      ]
    })
  })()

  const title = document.querySelector('.problem-group__title')!

  const sort = document.createElement('div')
  sort.className = 'PT_sort'
  sort.innerHTML = /* html */ `
    <select class="PT_sort_by">
      <option value="diff">難易度順</option>
      <option value="rate">正答率順</option>
      <option value="time">回答時間順</option>
    </select>
    <button class="PT_sort_order"></button>
  `
  title.append(sort)

  const sortByElem = sort.querySelector<HTMLSelectElement>('.PT_sort_by')!
  const sortOrderElem = sort.querySelector<HTMLElement>('.PT_sort_order')!

  const sortChangeHandler = () => {
    const grouped = Object.groupBy(problems, (problem) => problem.type)
    const sortBy = sortByElem.value as 'rate' | 'diff' | 'time'
    const desc = sortOrderElem.classList.contains('desc')

    for (const type in grouped) {
      grouped[type]!.sort((a, b) => a[sortBy] - b[sortBy])
      if (desc) grouped[type]!.reverse()
    }

    const sortedProblems = Object.values(grouped).flat()

    const group = document.querySelector('.problem-group')!
    for (const problem of sortedProblems) {
      group.append(problem!.target)
    }
  }

  sortByElem.addEventListener('change', sortChangeHandler)
  sortOrderElem.addEventListener('click', () => {
    sortOrderElem.classList.toggle('desc')
    sortChangeHandler()
  })
}
