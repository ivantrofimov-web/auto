// Режет шрифты до реально используемых знаков и нужных начертаний.
// Запуск: npm run fonts. Результат лежит в src/fonts и коммитится.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import subsetFont from 'subset-font'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = (pkg, file) => path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)
const out = path.join(root, 'src/fonts')

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('')

const CYRILLIC = range(0x410, 0x44f) + 'Ёё№'
const LATIN = range(0x20, 0x7e) + ' «»·×—–…  '
const DIGITS = '0123456789 ().,:+-–—/%   ' + range(0x41, 0x5a)

const jobs = [
  ['sofia-sans-extra-condensed', 'sofia-sans-extra-condensed-cyrillic-wght-normal.woff2', 'display-cyr.woff2', CYRILLIC, { wght: 800 }],
  ['sofia-sans-extra-condensed', 'sofia-sans-extra-condensed-latin-wght-normal.woff2', 'display-lat.woff2', LATIN, { wght: 800 }],
  ['golos-text', 'golos-text-cyrillic-wght-normal.woff2', 'text-cyr.woff2', CYRILLIC, { wght: { min: 400, max: 600 } }],
  ['golos-text', 'golos-text-latin-wght-normal.woff2', 'text-lat.woff2', LATIN, { wght: { min: 400, max: 600 } }],
  ['jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'mono-digits.woff2', DIGITS, { wght: 500 }],
]

await mkdir(out, { recursive: true })
for (const [pkg, file, name, text, variationAxes] of jobs) {
  const input = await readFile(src(pkg, file))
  const result = await subsetFont(input, text, { targetFormat: 'woff2', variationAxes })
  await writeFile(path.join(out, name), result)
  console.log(name.padEnd(20), (input.length / 1024).toFixed(1).padStart(6), 'КБ →', (result.length / 1024).toFixed(1).padStart(5), 'КБ')
}
