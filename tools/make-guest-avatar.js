/**
 * 生成游客默认头像：小红帽头像专用裁切版
 *
 * 背景：assets/character/red-riding-hood.jpg 是 750×1624 的整页原型图，
 * 人物只占中间约 112×237，直接当头像显示时人物极小。
 * 这里裁出人物上半部分（帽子 + 头部）并放大为正方形头像。
 *
 * 用法：node tools/make-guest-avatar.js
 */
const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'assets/character/red-riding-hood.jpg')
const OUT = path.join(ROOT, 'assets/character/avatar-guest.jpg')

// 内容框（由像素扫描得到）：x=354 y=457 w=112 h=237，取上部 124×124 作为头像区域
const BOX = { x: 348, y: 451, w: 124, h: 124 }
const SIZE = 400

async function main() {
  const img = await Jimp.read(SRC)
  // 自动兜底：若源图尺寸变化，按内容框重新扫描
  const { width: W, height: H, data } = img.bitmap
  let minX = W, minY = H, maxX = -1, maxY = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4
      const lum = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114
      if (lum < 235) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const contentW = maxX - minX + 1
  const side = Math.max(contentW, Math.min(contentW * 1.1, maxY - minY + 1))
  const box = {
    x: Math.max(0, Math.round(minX + contentW / 2 - side / 2)),
    y: Math.max(0, minY - 6),
    w: Math.min(Math.round(side), W),
    h: Math.min(Math.round(side), H)
  }
  if (box.x + box.w > W) box.w = W - box.x
  if (box.y + box.h > H) box.h = H - box.y

  const use = maxX > 0 ? box : BOX
  const cut = img.crop(use.x, use.y, use.w, use.h).resize(SIZE, SIZE)
  // 游客态用灰白模式：去色 + 轻微提对比，避免发灰发糊
  cut.greyscale().contrast(0.15)
  await cut.quality(88).writeAsync(OUT)
  console.log(
    `内容框 ${contentW}x${maxY - minY + 1} → 裁切 ${use.w}x${use.h} @(${use.x},${use.y}) → ${SIZE}x${SIZE}`,
    (fs.statSync(OUT).size / 1024).toFixed(1) + 'KB'
  )
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
