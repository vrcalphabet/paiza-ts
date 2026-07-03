export function globalScript() {
  const logo = document.querySelector<HTMLAnchorElement>('#global-header > a')
  if (!logo) return

  const results = document.createElement('a')
  results.classList.add('PT_results_link')
  results.href = '/skill_checks/results'
  results.textContent = '採点結果一覧'

  logo.href = '/challenges'
  logo.after(results)

  const sidebar = document.querySelector<HTMLElement>(
    '.p-challenges-layout-container__sub, .d-challenges-ready__boxInr-side',
  )
  if (!sidebar) return

  document.addEventListener('scroll', () => {
    sidebar.dataset['padding'] = Math.max(72 - window.scrollY, 0).toString()
  })
}
