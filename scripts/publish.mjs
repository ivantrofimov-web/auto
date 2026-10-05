// Кладёт собранный сайт из dist в корень репозитория — его GitHub Pages показывает как есть.
// Запуск: npm run publish, затем git add -A && git commit && git push
import { cp, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLISHED = ['index.html', 'favicon.svg', 'assets', 'img']

for (const name of PUBLISHED) {
  await rm(path.join(root, name), { recursive: true, force: true })
  await cp(path.join(root, 'dist', name), path.join(root, name), { recursive: true })
}
// Без этого файла Pages прогоняет сайт через Jekyll
await writeFile(path.join(root, '.nojekyll'), '')
console.log('publish: в корне обновлены', PUBLISHED.join(', '))
