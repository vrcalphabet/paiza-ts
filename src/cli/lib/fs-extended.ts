import fs from 'node:fs/promises'
import path from 'node:path'

export const fsEx = {
  async remake(path: string) {
    await fs.rm(path, { recursive: true, force: true })
    await fs.mkdir(path, { recursive: true })
  },

  async copyFile(sourceFile: string, targetRootDir: string) {
    const targetDir = path.join(targetRootDir, path.dirname(sourceFile))
    await fs.mkdir(targetDir, { recursive: true })
    await fs.copyFile(sourceFile, path.join(targetDir, path.basename(sourceFile)))
  },

  async eachDir(path: string, callback: (name: string, index: number) => void) {
    const dirs = await fs.readdir(path)
    for (const [index, dir] of dirs.entries()) {
      await Promise.resolve(callback(path + dir, index))
    }
  },

  async mapDir<T>(
    path: string,
    callback: (name: string, index: number) => T,
  ): Promise<Awaited<T>[]> {
    const result = []
    const dirs = await fs.readdir(path)
    for (const [index, dir] of dirs.entries()) {
      result.push(await Promise.resolve(callback(path + dir, index)))
    }

    return result
  },

  async dirLength(path: string) {
    const dirs = await fs.readdir(path)
    return dirs.length
  },
}
