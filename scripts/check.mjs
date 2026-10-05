// Проверка критериев готовности по собранному dist. Запуск: npm run build && npm run check
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' КБ'
let failed = false
const verdict = (ok, text) => {
  if (!ok) failed = true
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${text}\n`)
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  )
  return files.flat()
}

// 1. Вес первого экрана: всё, что браузер запрашивает до прокрутки.
// Картинка в контактах — loading="lazy" и далеко за первым экраном, в расчёт не входит.
const LIMIT = 150 * 1024
const html = await readFile(path.join(dist, 'index.html'), 'utf8')
const firstScreen = (await walk(dist)).filter((f) => !f.includes(`${path.sep}img${path.sep}`))
let raw = 0
let wire = 0
console.log('Первый экран, файл'.padEnd(44), 'на диске'.padStart(10), 'по сети (gzip)'.padStart(16))
for (const file of firstScreen) {
  const buf = await readFile(file)
  // woff2 уже сжат; текстовые файлы GitHub Pages отдаёт в gzip
  const sent = /\.(woff2|avif|webp|jpg)$/.test(file) ? buf.length : gzipSync(buf, { level: 6 }).length
  raw += buf.length
  wire += sent
  console.log(path.relative(dist, file).padEnd(44), kb(buf.length), kb(sent).padStart(16))
}
console.log('ИТОГО'.padEnd(44), kb(raw), kb(wire).padStart(16))
verdict(wire < LIMIT, `первый экран по сети ${kb(wire).trim()} при лимите 150 КБ`)

// 2. Абсолютные пути, которые сломаются в подпапке GitHub Pages.
const texts = (await walk(dist)).filter((f) => /\.(html|css|js|svg)$/.test(f))
const absolute = []
for (const file of texts) {
  const body = await readFile(file, 'utf8')
  for (const m of body.matchAll(/["'(=,\s]\/(assets|img|fonts)\b[^"')\s]*/g)) {
    absolute.push(`${path.relative(dist, file)}: ${m[0].trim()}`)
  }
}
console.log(`Поиск путей /assets, /img, /fonts в ${texts.length} файлах dist: найдено ${absolute.length}`)
absolute.forEach((line) => console.log('  ' + line))
verdict(absolute.length === 0, 'абсолютных путей нет')

// 3. Заглушки.
const sources = [...(await walk(path.join(root, 'src'))).filter((f) => /\.(jsx?|css)$/.test(f)), path.join(dist, 'index.html')]
const stubs = []
for (const file of sources) {
  const body = await readFile(file, 'utf8')
  body.split('\n').forEach((line, i) => {
    if (/ВСТАВЬ_|TODO|FIXME|lorem ipsum|заглушк/i.test(line)) stubs.push(`${path.relative(root, file)}:${i + 1}`)
  })
}
console.log(`Поиск ВСТАВЬ_ / TODO / FIXME / lorem в ${sources.length} файлах: найдено ${stubs.length}`)
stubs.forEach((line) => console.log('  ' + line))
verdict(stubs.length === 0, 'заглушек нет')

// 4. Страница читается без JavaScript и ничего не спрятано.
const visibleText = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ')
const rows = (html.match(/<td class="num">/g) || []).length
const css = await readFile(firstScreen.find((f) => f.endsWith('.css')), 'utf8')
const hidden = (css.match(/opacity:\s*0(?![.\d])|visibility:\s*hidden/g) || []).length
const motion = (css.match(/@keyframes|animation:|transition:/g) || []).length
console.log(`В готовом HTML без скриптов: ${visibleText.split(/\s+/).length} слов, строк с ценами и стажем: ${rows}`)
console.log(`В CSS: opacity:0 / visibility:hidden — ${hidden}, @keyframes / animation / transition — ${motion}`)
verdict(rows >= 30 && hidden === 0 && motion === 0, 'контент в HTML, скрытых блоков и CSS-анимаций нет')

process.exit(failed ? 1 : 0)
