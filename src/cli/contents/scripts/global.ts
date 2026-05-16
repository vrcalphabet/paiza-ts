export function globalScript() {
  const logo = document.querySelector<HTMLAnchorElement>('#global-header > a')!
  logo.href = '/challenges'

  const results = document.createElement('a')
  results.classList.add('PT_results_link')
  results.href = '/skill_checks/results'
  results.textContent = '採点結果一覧'

  logo.after(results)
}
