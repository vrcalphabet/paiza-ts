import fs from 'node:fs/promises'
import path from 'node:path'
import { format } from 'date-fns'
import { importree } from 'importree'
import { fsEx } from '../../lib/fs-extended'
import { useTitle } from '../hooks/useTitle'

export async function archive(resultUrl: string) {
  const { id, internalId, name } = useTitle.getState()
  if (id === undefined || name === undefined) return

  // アーカイブ保存先のフォルダを作成

  await fs.mkdir(`.data/archive/${id}/`, { recursive: true })
  const branches = await fs.readdir(`.data/archive/${id}/`)
  const maxBranch = branches.map(Number).sort().at(-1) ?? 0

  // エントリポイントから参照しているファイルをすべて取得

  const fileTree = await importree('src/main.ts', {
    aliases: {
      '@/src': './src',
      '@/src*': './src*',
      '@/lib': './lib',
      '@/lib*': './lib*',
    },
  })

  const files = fileTree.files.map((filePath) =>
    path.relative(process.cwd(), filePath),
  )
  files.push('package.json')
  files.push('tsconfig.json')

  // ファイル群をアーカイブ保存先に複製

  const nextBranchPath = `.data/archive/${id}/${maxBranch + 1}/`
  for (const file of files) {
    await fsEx.copyFile(file, nextBranchPath)
  }

  // メタデータを保存

  const metadata = {
    id,
    name,
    submit_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    retry_url: `https://paiza.jp/challenges/${internalId}/retry`,
    result_url: resultUrl,
  }
  await fs.writeFile(`${nextBranchPath}meta.json`, JSON.stringify(metadata, null, 2))
}
