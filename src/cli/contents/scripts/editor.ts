import type { MessageType } from '../../types/message'

export async function editorScript(context: MessageType) {
  const sampleElements = document.querySelectorAll(
    '.sample-container .sample-content__input',
  )
  const samples = [...sampleElements].map((sample) => {
    const text = sample.textContent

    // 何故か末尾に改行が含まれていない出力例（D166とか）があるのでその対策
    return text.replace(/([^\n])$/, '$1\n')
  })

  // 入出力例をバックエンドに送信
  await context.samples(samples)

  // 提出ボタンと動作確認ボタンをフッターに移動させる
  const submitContainer = document.createElement('div')
  submitContainer.className = 'PT_submit_container'
  submitContainer.innerHTML = /* html */ `
    <div class="PT_timer"></div>
    <div class="PT_buttons"></div>
  `

  const PTTimer = submitContainer.querySelector('.PT_timer')!
  const PTButtons = submitContainer.querySelector('.PT_buttons')!

  const timer = document.querySelector('.js-count-up-elapsed-time')
  const testButton = document.querySelector('#do_compile')!
  const submitButton = document.querySelector('#handin')!

  PTTimer.append(timer ?? '時間切れ')
  PTButtons.append(testButton, submitButton)
  document.body.append(submitContainer)

  testButton.addEventListener(
    'click',
    async (e) => {
      e.stopImmediatePropagation()
      e.preventDefault()

      // 動作確認ボタンが押されたことをバックエンドに送信
      await context.test()
    },
    // 実行優先順位を高くする
    { capture: true },
  )

  submitButton.addEventListener(
    'click',
    async (e) => {
      e.stopImmediatePropagation()
      e.preventDefault()

      // コード提出ボタンが押されたことをバックエンドに送信
      await context.submit()
    },
    // 実行優先順位を高くする
    { capture: true },
  )

  // 入出力例をサイドバーに移動させる
  const sidebar = document.createElement('div')
  sidebar.className = 'PT_sidebar'
  sidebar.innerHTML = /* html */ `
    <div class="PT_sidebar_inner"></div>
    <div class="PT_pin">
      <button>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 17v5"></path>
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
        </svg>
      </button>
    </div>
  `
  
  const pin = sidebar.querySelector(".PT_pin")!
  pin.addEventListener("click", () => {
    pin.classList.toggle("active")
  })

  const tips = document.createElement('div')
  tips.className = 'PT_tips'
  tips.textContent = '◆ 制約と入出力例は左のサイドバーに移動しました。'

  const innerSidebar = sidebar.querySelector('.PT_sidebar_inner')!

  const inr2 = document.querySelector('.boxSkillcheck .inr2')!
  const sampleContainer = document.querySelector('.boxSkillcheck .sample-container')!

  inr2.before(tips, sidebar)
  innerSidebar.append(inr2, sampleContainer)

  document.addEventListener('scroll', () => {
    sidebar.dataset['padding'] = Math.max(72 - window.scrollY, 0).toString()
    console.log(sidebar.dataset['padding'])
  })
}
