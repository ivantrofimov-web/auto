// Вставляет готовую разметку в dist/index.html, чтобы страница читалась без JavaScript.
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { render, meta } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const file = path.join(root, 'dist/index.html')
const html = (await readFile(file, 'utf8'))
  .replace('<!--title-->', esc(meta.title))
  .replace('<!--description-->', esc(meta.description))
  .replace('<!--app-->', render())

await writeFile(file, html)
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerender: dist/index.html, ${(html.length / 1024).toFixed(1)} КБ разметки`)
