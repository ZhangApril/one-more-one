/**
 * 生成 UI 图标：默认头像占位「相机」（透明 PNG，无需外部素材）
 * 运行：node tools/gen-ui-icon.js
 */
const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')

const ROOT = path.join(__dirname, '..')
const SIZE = 144
const COLOR = { r: 0x8a, g: 0x7f, b: 0x6b, a: 255 } // 暖灰，适配奶油白底

function fillRect(img, x0, y0, x1, y1, c) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      img.setPixelColor(Jimp.rgbaToInt(c.r, c.g, c.b, c.a), x, y)
    }
  }
}

function fillCircle(img, cx, cy, r, c) {
  for (let y = Math.ceil(cy - r); y <= cy + r; y++) {
    for (let x = Math.ceil(cx - r); x <= cx + r; x++) {
      const d = Math.pow(x - cx, 2) + Math.pow(y - cy, 2)
      if (d <= r * r) img.setPixelColor(Jimp.rgbaToInt(c.r, c.g, c.b, c.a), x, y)
    }
  }
}

/** 圆角矩形（半径 r） */
function fillRoundRect(img, x0, y0, x1, y1, r, c) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = Math.min(x - x0, x1 - x)
      const dy = Math.min(y - y0, y1 - y)
      if (dx >= r || dy >= r) fillRect(img, x, y, x, y, c)
      else {
        const ox = r - dx
        const oy = r - dy
        if (ox * ox + oy * oy <= r * r) fillRect(img, x, y, x, y, c)
      }
    }
  }
}

async function main() {
  const img = new Jimp(SIZE, SIZE, 0x00000000)
  // 机身
  fillRoundRect(img, 24, 52, SIZE - 24, SIZE - 30, 10, COLOR)
  // 顶部取景凸起
  fillRoundRect(img, 54, 36, 90, 56, 6, COLOR)
  // 镜头外圈
  fillCircle(img, SIZE / 2, 88, 22, COLOR)
  // 镜头内圈（挖空）
  const hole = { r: COLOR.r, g: COLOR.g, b: COLOR.b, a: 0 }
  fillCircle(img, SIZE / 2, 88, 14, hole)
  // 镜头高光点
  fillCircle(img, SIZE / 2, 88, 5, COLOR)
  // 闪光灯
  fillRoundRect(img, 96, 60, 108, 70, 3, COLOR)

  const out = path.join(ROOT, 'assets/ui/icon-camera.png')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  await img.writeAsync(out)
  console.log('生成:', out, (fs.statSync(out).size / 1024).toFixed(1) + 'KB')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
