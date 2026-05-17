import type { MessageType } from '../../types/message'

export async function editorScript(context: MessageType) {
  const sampleElements = document.querySelectorAll(
    '.sample-container .sample-content__input',
  )
  const samples = [...sampleElements].map((sample) => {
    const text = sample.textContent

    // 何故か末尾に改行が含まれていない出力例（#D166とか）があるのでその対策
    if (text.at(-1) !== '\n') return text + '\n'
    return text
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

  PTTimer.append(timer ?? '\u200b')
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
    { capture: true },
  )
}
