import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

// 自行生成的测试图形和合成音源，不使用第三方版权素材。
const root = fileURLToPath(new URL('../apps/portal/public/media/', import.meta.url))
await mkdir(root, { recursive: true })
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'
const run = args =>
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
run([
  '-f',
  'lavfi',
  '-i',
  'color=c=0x1e40af:s=640x360:d=1',
  '-vf',
  'drawbox=x=60:y=60:w=520:h=240:color=0x93c5fd:t=6,drawbox=x=260:y=120:w=120:h=120:color=0xffffff:t=fill',
  '-frames:v',
  '1',
  join(root, 'sample.png'),
])
run([
  '-f',
  'lavfi',
  '-i',
  'sine=frequency=440:duration=6:sample_rate=44100',
  '-af',
  'volume=0.15',
  join(root, 'sample.wav'),
])
run([
  '-f',
  'lavfi',
  '-i',
  'testsrc2=size=640x360:rate=24:duration=6',
  '-f',
  'lavfi',
  '-i',
  'sine=frequency=440:duration=6',
  '-af',
  'volume=0.15',
  '-c:v',
  'libvpx-vp9',
  '-b:v',
  '350k',
  '-c:a',
  'libopus',
  '-shortest',
  join(root, 'sample.webm'),
])

// 最小标准 PDF，三页可用于翻页、定位、缩放及解析回归。
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [4 0 R 6 0 R 8 0 R] /Count 3 >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
]
for (let page = 1; page <= 3; page++) {
  const contentId = objects.length + 2
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
  )
  const body = `BT /F1 24 Tf 1 0 0 1 60 740 Tm (Dream Sports Academy) Tj 0 -45 Td /F1 16 Tf (Local PDF fixture - Page ${page} of 3) Tj 0 -40 Td (Practice safely. Learn together.) Tj ET\n`
  // 文本流以 ASCII 字节计数，偏移量与 xref 保持一致。
  objects.push(`<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}endstream`)
}
let pdf = '%PDF-1.4\n'
const offsets = [0]
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf))
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
})
const xref = Buffer.byteLength(pdf)
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
pdf += offsets
  .slice(1)
  .map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)
  .join('')
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 /ID [<61636164656d79> <61636164656d79>] >>\nstartxref\n${xref}\n%%EOF\n`
await writeFile(join(root, 'sample.pdf'), pdf)
console.info('已生成本地 PNG、WAV、WebM 和三页 PDF 测试素材。')
