/**
 * 从 design/ 整页原型图中精确裁出图标与二维码，输出到 assets/ui/
 *
 * 坐标来源：tools/_probe-design.js 对整页图做非白区域连通域分析后得到
 *   - 分享页底部三个图标：12_微信好友 / 13_朋友圈 / 14_保存图片，位于 y≈1280
 *   - 二维码：10_二维码，位于 y≈1016
 *
 * 处理：裁切 → 白底色键抠图（透明 PNG）→ 去透明边 → 等比放大
 *      二维码保留白底（保证可扫），仅裁切 + 加白边
 *
 * 用法：node tools/crop-design-icons.js
 */
const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')

const ROOT = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'design')
const OUT_DIR = path.join(ROOT, 'assets/ui')

const CROPS = [
  { page: '12_微信好友.jpeg', box: [168, 1264, 80, 80], out: 'icon-wechat.png', size: 160, white: true },
  { page: '13_朋友圈.jpeg', box: [336, 1264, 80, 80], out: 'icon-timeline.png', size: 160, white: true },
  // 保存图标长宽比偏窄（约 102×125），占比适当调高，让视觉重量与另两枚一致
  { page: '14_保存图片.jpeg', box: [512, 1264, 80, 80], out: 'icon-save.png', size: 160, ratio: 0.84, white: true },
  { page: '10_二维码.jpeg', box: [110, 980, 220, 220], out: 'qrcode.png', size: 320, white: false }
]

/** 白底转透明（软边） */
function keyWhite(img, tol) {
  const { width: W, height: H, data } = img.bitmap
  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    const lum = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114
    if (lum > 250) data[p + 3] = 0
    else if (lum > 250 - tol) data[p + 3] = Math.round(((250 - lum) / tol) * 255)
  }
}

/** 按 alpha 裁掉空白边 */
function trimAlpha(img) {
  const { width: W, height: H, data } = img.bitmap
  let minX = W, minY = H, maxX = -1, maxY = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return null
  return img.clone().crop(minX, minY, maxX - minX + 1, maxY - minY + 1)
}

/** 按亮度裁掉白边（用于二维码这类需要白底的图） */
function trimWhite(img, th = 246) {
  const { width: W, height: H, data } = img.bitmap
  let minX = W, minY = H, maxX = -1, maxY = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4
      const lum = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114
      if (lum < th) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return null
  return img.clone().crop(minX, minY, maxX - minX + 1, maxY - minY + 1)
}

function pad(img, n, color = 0xffffffff) {
  const out = new Jimp(img.bitmap.width + n * 2, img.bitmap.height + n * 2, color)
  out.composite(img, n, n)
  return out
}

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

/** 按 alpha 加权重心（不透明像素的“视觉重心”） */
function centroid(img) {
  const { width: W, height: H, data } = img.bitmap
  let sx = 0, sy = 0, s = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = data[(y * W + x) * 4 + 3] / 255
      if (a > 0) { sx += x * a; sy += y * a; s += a }
    }
  }
  if (!s) return { cx: W / 2, cy: H / 2 }
  return { cx: sx / s, cy: sy / s }
}

/**
 * 把内容等比缩放后放进正方形画布，并**按视觉重心居中**
 * 说明：像“保存图片”这类左重右轻的图形，按包围盒居中会明显偏左，
 * 因此这里用不透明像素的重心对齐画布中心。
 */
function placeSquare(img, size, ratio, bg = 0x00000000, byMass = true) {
  const target = Math.round(size * ratio)
  const inner = img.clone()
  inner.contain(target, target)
  let posX = (size - inner.bitmap.width) / 2
  let posY = (size - inner.bitmap.height) / 2

  if (byMass) {
    // 重心居中时若图形会被画布边界裁掉，就等比缩小直到放得下
    for (let i = 0; i < 40; i++) {
      const w = inner.bitmap.width
      const h = inner.bitmap.height
      const { cx, cy } = centroid(inner)
      posX = size / 2 - cx
      posY = size / 2 - cy
      if (posX >= 0 && posX + w <= size && posY >= 0 && posY + h <= size) break
      if (w < size * 0.35) break
      inner.resize(Math.max(1, Math.round(w * 0.97)), Jimp.AUTO)
    }
  }

  const w = inner.bitmap.width
  const h = inner.bitmap.height
  const canvas = new Jimp(size, size, bg)
  canvas.composite(inner, Math.round(clamp(posX, 0, size - w)), Math.round(clamp(posY, 0, size - h)))
  return canvas
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const c of CROPS) {
    const src = path.join(SRC_DIR, c.page)
    if (!fs.existsSync(src)) {
      console.log('跳过（缺原图）:', c.page)
      continue
    }
    const img = await Jimp.read(src)
    let cut = img.clone().crop(c.box[0], c.box[1], c.box[2], c.box[3])

    if (c.white) {
      keyWhite(cut, 30)
      cut = trimAlpha(cut)
      if (cut) cut = placeSquare(cut, c.size, c.ratio || 0.78)
    } else {
      cut = trimWhite(cut)
      if (cut) cut = placeSquare(pad(cut, 8), c.size, c.ratio || 0.9, 0xffffffff)
    }
    if (!cut) {
      console.log('裁切为空:', c.out)
      continue
    }
    const out = path.join(OUT_DIR, c.out)
    await cut.writeAsync(out)
    console.log(`${c.out}  ${cut.bitmap.width}x${cut.bitmap.height}  ${(fs.statSync(out).size / 1024).toFixed(1)}KB`)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
