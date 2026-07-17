import spawn from 'cross-spawn'

const targetDir = process.cwd()
await runNpmCommand([
  'i',
  '@vrcalphabet/paiza-ts',
  '@vrcalphabet/paiza-ts-input-parser',
])

async function runNpmCommand(command: string[]) {
  const { promise, resolve } = Promise.withResolvers<void>()

  console.log(`> npm ${command.join(' ')}`)
  const child = spawn.spawn('npm', command, {
    cwd: targetDir,
    stdio: 'inherit',
  })

  child.on('close', (code) => {
    if (code !== 0) process.exit(code)
    resolve()
  })

  return promise
}
