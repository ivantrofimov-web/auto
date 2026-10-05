// Рисует ориентир для блока контактов (ворота бокса) и сохраняет в avif / webp / jpg.
// Запуск: npm run images. Результат лежит в public/img и коммитится.
import { mkdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/img')
const [W, H] = [960, 540]
const QUALITY = 80

// Профлист ворот: чередуем светлые и тёмные вертикальные рёбра.
const ribs = Array.from({ length: 31 }, (_, i) => {
  const x = 190 + i * 19
  return `<rect x="${x}" y="110" width="9" height="340" fill="#8f8c80"/><rect x="${x + 9}" y="110" width="2" height="340" fill="#6f6c62"/>`
}).join('')

const stripes = Array.from({ length: 22 }, (_, i) => {
  const x = 170 + i * 30
  return `<polygon points="${x},450 ${x + 15},450 ${x + 45},390 ${x + 30},390" fill="#1c1a16"/>`
}).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#bdb8aa"/>
  <rect y="0" width="${W}" height="70" fill="#a9a497"/>
  <rect x="170" y="90" width="620" height="366" fill="#1c1a16"/>
  <rect x="190" y="110" width="580" height="340" fill="#7d7a6f"/>
  ${ribs}
  <clipPath id="gate"><rect x="190" y="390" width="580" height="60"/></clipPath>
  <rect x="190" y="390" width="580" height="60" fill="#f2b300"/>
  <g clip-path="url(#gate)">${stripes}</g>
  <rect x="190" y="246" width="580" height="6" fill="#55524a"/>
  <rect x="462" y="300" width="36" height="10" fill="#1c1a16"/>
  <rect x="80" y="170" width="46" height="62" fill="#f2b300"/>
  <rect x="88" y="178" width="30" height="46" fill="#1c1a16"/>
  <rect x="840" y="120" width="14" height="330" fill="#8f8c80"/>
  <rect y="456" width="${W}" height="84" fill="#6c695f"/>
  <rect y="456" width="${W}" height="6" fill="#55524a"/>
  <rect x="60" y="500" width="150" height="8" fill="#d6d1c4"/>
  <rect x="290" y="500" width="150" height="8" fill="#d6d1c4"/>
  <rect x="520" y="500" width="150" height="8" fill="#d6d1c4"/>
  <rect x="750" y="500" width="150" height="8" fill="#d6d1c4"/>
</svg>`

// Зерно бетона: мягкий шум поверх рисунка, чтобы плоскости не были стерильными.
const grain = await sharp({
  create: { width: W / 2, height: H / 2, channels: 3, background: '#808080', noise: { type: 'gaussian', mean: 128, sigma: 14 } },
})
  .greyscale()
  .resize(W, H)
  .blur(0.6)
  .png()
  .toBuffer()

const base = await sharp(Buffer.from(svg))
  .composite([{ input: grain, blend: 'soft-light' }])
  .png()
  .toBuffer()

await mkdir(out, { recursive: true })
const targets = {
  'gate.avif': (s) => s.avif({ quality: QUALITY }),
  'gate.webp': (s) => s.webp({ quality: QUALITY }),
  'gate.jpg': (s) => s.jpeg({ quality: QUALITY, mozjpeg: true }),
}
for (const [name, encode] of Object.entries(targets)) {
  const file = path.join(out, name)
  await encode(sharp(base)).toFile(file)
  console.log(name.padEnd(10), ((await stat(file)).size / 1024).toFixed(1), 'КБ')
}
