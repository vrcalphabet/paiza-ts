export async function resultScript() {
  const wrap = (selector: string) => {
    const target = document.querySelector(selector)
    if (!target) return

    const wrapper = document.createElement('div')
    wrapper.classList.add('PT_editor_wrapper')

    target.before(wrapper)
    wrapper.append(target)
  }

  wrap('#editor-handin-div')
  wrap('.not_shown_yet')

  await new Promise((resolve) => setTimeout(resolve, 50))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).ace.edit('editor-handin-div').resize()
}
