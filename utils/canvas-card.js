/**
 * 分享海报 Canvas 绘制（Canvas 2D）
 *
 * 设计稿尺寸 750 × 1000，对齐 2026-10-19 新版原型（UIref/04_分享页）：
 * 深绿渐变海报卡 + 顶部品牌小字 + 角色形象 + 人格名 + 类型 + 标语 +
 * 分割线 + 白色圆角卡内嵌二维码 + 右侧两行文案。
 */

const CONFIG = require('../config/index.js')

const W = 750
const H = 1000

function loadImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = err => reject(err)
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 简单按宽度换行 */
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 圆形头像：网络头像（微信）失败时回退到本地默认小红帽头像 */
async function drawAvatar(ctx, canvas, src) {
  const r = 28
  const cx = W - 80
  const cy = 66
  const paint = async url => {
    const img = await loadImage(canvas, url)
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
  }
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  try {
    await paint(src)
  } catch (e) {
    try {
      await paint(CONFIG.DEFAULT_AVATAR)
    } catch (e2) {
      /* 都失败则不画头像 */
    }
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
}

/**
 * 绘制海报
 * @param {Object} canvas canvas 节点（type="2d"）
 * @param {Object} opts   { type, persona, campLabel, qrUrl, identity }
 */
async function drawPoster(canvas, opts) {
  const { type, persona, campLabel, qrUrl, identity } = opts
  const ctx = canvas.getContext('2d')
  const dpr = (wx.getSystemInfoSync().pixelRatio || 2)
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // 深绿渐变底（隐藏结局时切灰红）
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (type === 'WOLF') {
    bg.addColorStop(0, '#3A2E2C')
    bg.addColorStop(1, '#6E2B26')
  } else if (persona.camp === 'wolf') {
    bg.addColorStop(0, '#2A3430')
    bg.addColorStop(1, '#1B231F')
  } else {
    bg.addColorStop(0, '#26432F')
    bg.addColorStop(1, '#183024')
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 圆角裁切效果（海报本身是圆角卡，画布导出后由页面 image 圆角呈现）

  // 顶部品牌小字
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '22px sans-serif'
  ctx.fillText(CONFIG.BRAND_POSTER, W / 2, 76)

  // 右上角身份：头像 + 昵称（游客为默认小红帽头像 +「游客」）
  if (identity) {
    await drawAvatar(ctx, canvas, identity.avatarUrl || CONFIG.DEFAULT_AVATAR)
    // 昵称以头像圆心为基准居中（超出可用宽度时截断加省略号）
    const rawName = identity.nickName || CONFIG.DEFAULT_NICKNAME
    const avatarCx = W - 80
    const maxWidth = (W - avatarCx - 12) * 2
    ctx.font = '18px sans-serif'
    let name = rawName
    while (name.length > 1 && ctx.measureText(name + '…').width > maxWidth) {
      name = name.slice(0, -1)
    }
    if (ctx.measureText(rawName).width > maxWidth) name = name + '…'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(name, avatarCx, 120)
  }

  // 角色形象
  const imgSize = 300
  try {
    const personaImg = await loadImage(canvas, persona.image)
    ctx.drawImage(personaImg, (W - imgSize) / 2, 110, imgSize, imgSize)
  } catch (e) {
    /* 角色图缺失时不阻断绘制 */
  }

  // 人格名
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px sans-serif'
  ctx.fillText(persona.role, W / 2, 486)

  // 类型：INFP · 小红帽型
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '28px sans-serif'
  ctx.fillText(`${type} · ${campLabel}`, W / 2, 534)

  // 标语
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '24px sans-serif'
  const sloganLines = wrapText(ctx, persona.slogan, W - 200)
  sloganLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 586 + i * 38)
  })

  // 分割线
  const dividerY = 700
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(90, dividerY)
  ctx.lineTo(W - 90, dividerY)
  ctx.stroke()

  // 二维码：白色圆角卡内嵌
  const cardX = 70
  const cardY = dividerY + 34
  const cardSize = 190
  const qrSize = 160
  const qrSrc = qrUrl || CONFIG.QR_CODE_URL
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, cardX, cardY, cardSize, cardSize, 16)
  ctx.fill()
  try {
    const qr = await loadImage(canvas, qrSrc)
    ctx.drawImage(qr, cardX + (cardSize - qrSize) / 2, cardY + (cardSize - qrSize) / 2, qrSize, qrSize)
  } catch (e) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '20px sans-serif'
    ctx.fillText('二维码加载失败', W / 2, cardY + cardSize / 2)
  }

  // 右侧两行文案（左对齐）
  const tipLines = CONFIG.SHARE_QR_TIP.split(' ')
  ctx.textAlign = 'left'
  ctx.fillStyle = '#F0E6D0'
  ctx.font = '26px sans-serif'
  tipLines.forEach((line, i) => {
    ctx.fillText(line, cardX + cardSize + 36, cardY + 70 + i * 46)
  })

  return { width: W, height: H }
}

module.exports = {
  W,
  H,
  drawPoster
}
