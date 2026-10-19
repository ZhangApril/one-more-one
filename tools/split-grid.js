/**
 * 九宫格切图 + 色键抠图工具
 *
 * 用途：把 image_gen 生成的 3×3 九宫格图（统一纯色背景）切成 9 张独立透明 PNG。
 *
 * 用法：
 *   node split-grid.js                     # 按底部 GRIDS 配置处理全部九宫格
 *   node split-grid.js --grid grid-a-hood  # 只处理指定九宫格
 *   node split-grid.js --grid grid-a-hood --mode grid          # 强制等分（不走连通域检测）
 *   node split-grid.js --grid grid-a-hood --key "#FF00FF" --tol 70 --max 400
 *
 * 参数：
 *   --key   键控背景色，默认 #FF00FF（洋红，避免与森林绿主体冲突）
 *   --tol   颜色容差（0-255 距离），默认 70
 *   --max   输出图最长边像素，默认 400
 *   --mode  auto（默认，连通域检测；失败自动回退等分）| grid（强制 3×3 等分）
 */

const path = require('path')
const fs = require('fs')
const Jimp = require('jimp')

const ROOT = path.resolve(__dirname, '..')
const GEN_DIR = path.join(ROOT, 'generated-images')

/** 九宫格 → 输出文件映射（顺序对应生成图中从左到右、从上到下的格子） */
const GRIDS = [
  {
    input: 'grid-a-hood.png',
    names: [
      'assets/character/infp.png',   // 1 林间诗人
      'assets/character/enfp.png',   // 2 野餐篮
      'assets/character/infj.png',   // 3 守林人
      'assets/character/enfj.png',   // 4 提灯人
      'assets/character/isfp.png',   // 5 采花人
      'assets/character/esfp.png',   // 6 篝火中心
      'assets/character/isfj.png',   // 7 提篮的人
      'assets/character/esfj.png',   // 8 茶会主人
      'assets/character/_spare-hood.png'
    ]
  },
  {
    input: 'grid-b-wolf.png',
    names: [
      'assets/character/intj.png',   // 1 制图师
      'assets/character/intp.png',   // 2 谜语猫头鹰
      'assets/character/entj.png',   // 3 狩猎队长
      'assets/character/entp.png',   // 4 变装艺人
      'assets/character/istj.png',   // 5 守门人
      'assets/character/estj.png',   // 6 巡逻队长
      'assets/character/istp.png',   // 7 刀具匠
      'assets/character/estp.png',   // 8 先冲进去的人
      'assets/character/_spare-wolf.png'
    ]
  },
  {
    input: 'grid-c-extra.png',
    names: [
      'assets/character/wolf-king.png',   // 1 隐藏结局狼王
      'assets/scene/wolf-moon.png',       // 2 狼与月亮剪影
      'assets/scene/hood-back.png',       // 3 小红帽背影
      'assets/scene/crossroad.png',       // 4 岔路口指示牌
      'assets/scene/moon-pine.png',       // 5 满月与松树
      'assets/scene/loading-dots.png',    // 6 发光光点
      'assets/scene/empty-state.png',     // 7 林间空地长椅
      'assets/ui/badge-pattern.png',      // 8 徽章底纹
      'assets/ui/hat-icon.png'            // 9 红帽子图标
    ]
  }
]

function parseArgs(argv) {
  const args = {
    grid: null,
    mode: 'auto',
    key: 'auto', // auto = 从图像边框自动估计键控色
    tol: 70,
    max: 400
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--grid') args.grid = argv[++i]
    else if (a === '--mode') args.mode = argv[++i]
    else if (a === '--key') args.key = argv[++i]
    else if (a === '--tol') args.tol = Number(argv[++i])
    else if (a === '--max') args.max = Number(argv[++i])
  }
  return args
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  }
}

/** 从图像四周边框取样，取中位数作为键控背景色（AI 生成的背景往往不是精确的设定色） */
function estimateKey(img) {
  const { width: W, height: H, data } = img.bitmap
  const rs = [], gs = [], bs = []
  const ring = Math.max(2, Math.round(Math.min(W, H) * 0.004))
  const push = (x, y) => {
    const p = (y * W + x) * 4
    rs.push(data[p]); gs.push(data[p + 1]); bs.push(data[p + 2])
  }
  for (let y = 0; y < H; y++) {
    for (let k = 0; k < ring; k++) { push(k, y); push(W - 1 - k, y) }
  }
  for (let x = 0; x < W; x++) {
    for (let k = 0; k < ring; k++) { push(x, k); push(x, H - 1 - k) }
  }
  const median = arr => {
    const s = arr.slice().sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)]
  }
  return { r: median(rs), g: median(gs), b: median(bs) }
}

/** 连通域检测：返回非背景区域的包围盒列表（按从左到右、从上到下排序） */
function detectRegions(img, key, tol) {
  const { width: W, height: H, data } = img.bitmap
  const tol2 = tol * tol
  const bg = new Uint8Array(W * H) // 1 = 背景
  for (let i = 0, p = 0; i < W * H; i++, p += 4) {
    const dr = data[p] - key.r
    const dg = data[p + 1] - key.g
    const db = data[p + 2] - key.b
    bg[i] = dr * dr + dg * dg + db * db <= tol2 ? 1 : 0
  }

  const label = new Int32Array(W * H).fill(-1)
  const boxes = []
  const stack = new Int32Array(W * H)
  for (let start = 0; start < W * H; start++) {
    if (bg[start] || label[start] !== -1) continue
    const id = boxes.length
    let sp = 0
    stack[sp++] = start
    label[start] = id
    let minX = W, minY = H, maxX = 0, maxY = 0, area = 0
    while (sp > 0) {
      const idx = stack[--sp]
      const x = idx % W
      const y = (idx - x) / W
      area++
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      const neighbours = [
        x > 0 ? idx - 1 : -1,
        x < W - 1 ? idx + 1 : -1,
        y > 0 ? idx - W : -1,
        y < H - 1 ? idx + W : -1
      ]
      for (const n of neighbours) {
        if (n >= 0 && !bg[n] && label[n] === -1) {
          label[n] = id
          stack[sp++] = n
        }
      }
    }
    boxes.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, area })
  }

  const total = W * H
  // 噪点过滤：面积小于 0.3% 的丢弃
  const minArea = total * 0.003
  let regions = boxes.filter(b => b.area >= minArea)

  // 若最大连通域覆盖超过 55% 画面（说明存在贯穿的网格线把主体连成一片），判定检测失败
  if (regions.length) {
    const biggest = Math.max(...regions.map(b => b.area))
    if (biggest > total * 0.55) return null
  }
  if (regions.length < 2) return null

  // 按行聚类排序（容差 = 行高的一半），行内按 x 排序
  const avgH = regions.reduce((s, b) => s + b.h, 0) / regions.length
  regions.sort((a, b) => (a.y > b.y + avgH / 2 ? 1 : a.y < b.y - avgH / 2 ? -1 : a.x - b.x))
  return regions
}

/** 3×3 等分（回退方案） */
function gridBoxes(W, H) {
  const boxes = []
  const padX = Math.round(W * 0.02)
  const padY = Math.round(H * 0.02)
  const cw = Math.floor((W - padX * 2) / 3)
  const ch = Math.floor((H - padY * 2) / 3)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      boxes.push({ x: padX + c * cw, y: padY + r * ch, w: cw, h: ch })
    }
  }
  return boxes
}

/**
 * 把连通域按 3×3 单元格归并：一个格子内的多个碎片合成一个包围盒，
 * 保证输出顺序与九宫格视觉顺序严格一致（避免碎片导致的错位）。
 */
function mergeIntoCells(regions, cells) {
  const merged = cells.map(() => null)
  const union = (a, b) => {
    const x = Math.min(a.x, b.x)
    const y = Math.min(a.y, b.y)
    return {
      x,
      y,
      w: Math.max(a.x + a.w, b.x + b.w) - x,
      h: Math.max(a.y + a.h, b.y + b.h) - y
    }
  }
  regions.forEach(r => {
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    let idx = cells.findIndex(c => cx >= c.x && cx < c.x + c.w && cy >= c.y && cy < c.y + c.h)
    if (idx < 0) {
      // 落在格子缝隙里：归到中心最近的格子
      let best = 0
      let bestD = Infinity
      cells.forEach((c, i) => {
        const d = Math.pow(c.x + c.w / 2 - cx, 2) + Math.pow(c.y + c.h / 2 - cy, 2)
        if (d < bestD) { bestD = d; best = i }
      })
      idx = best
    }
    merged[idx] = merged[idx] ? union(merged[idx], r) : { x: r.x, y: r.y, w: r.w, h: r.h }
  })
  return merged
}

/** 裁剪 + 色键抠图（软边 + 去色溢） + 去透明边 + 缩放 */
function cutRegion(img, box, key, tol, maxSize) {
  const { width: W, height: H, data } = img.bitmap
  const x0 = Math.max(0, box.x)
  const y0 = Math.max(0, box.y)
  const w = Math.min(box.w, W - x0)
  const h = Math.min(box.h, H - y0)

  const buf = Buffer.alloc(w * h * 4)
  const tolInner = tol
  const tolOuter = tol * 1.8

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = ((y0 + y) * W + (x0 + x)) * 4
      const d = (y * w + x) * 4
      let r = data[s], g = data[s + 1], b = data[s + 2]
      const dr = r - key.r, dg = g - key.g, db = b - key.b
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)
      let a = 255
      if (dist <= tolInner) {
        a = 0
      } else if (dist < tolOuter) {
        a = Math.round(255 * ((dist - tolInner) / (tolOuter - tolInner)))
        // 去色溢：削弱残留的洋红染色
        const cap = g + 40
        if (r > cap) r = cap
        if (b > cap) b = cap
      }
      buf[d] = r
      buf[d + 1] = g
      buf[d + 2] = b
      buf[d + 3] = a
    }
  }

  // 去掉全透明边缘
  let minX = w, minY = h, maxX = -1, maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (buf[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return null // 整格都是背景

  const tw = maxX - minX + 1
  const th = maxY - minY + 1
  const trimmed = Buffer.alloc(tw * th * 4)
  for (let y = 0; y < th; y++) {
    buf.copy(trimmed, y * tw * 4, ((y + minY) * w + minX) * 4, ((y + minY) * w + minX + tw) * 4)
  }

  const out = new Jimp(tw, th)
  out.bitmap.data = trimmed
  // 若裁剪后仍占满整格，说明色键没生效，供上层给出警告
  out.__fullCover = tw >= w * 0.98 && th >= h * 0.98

  // 等比缩放，最长边不超过 maxSize
  const scale = Math.min(1, maxSize / Math.max(tw, th))
  if (scale < 1) {
    out.resize(Math.max(1, Math.round(tw * scale)), Math.max(1, Math.round(th * scale)))
  }
  return out
}

async function processGrid(grid, args) {
  const inputPath = path.join(GEN_DIR, grid.input)
  if (!fs.existsSync(inputPath)) {
    console.error(`[skip] 找不到 ${grid.input}`)
    return
  }
  const img = await Jimp.read(inputPath)
  const key = args.key === 'auto' ? estimateKey(img) : hexToRgb(args.key)
  const { width: W, height: H } = img.bitmap
  console.log(`  键控色 = rgb(${key.r}, ${key.g}, ${key.b})`)

  const cells = gridBoxes(W, H)
  let boxes = null
  let mode = args.mode
  if (mode === 'auto') {
    const regions = detectRegions(img, key, args.tol)
    if (regions) {
      boxes = mergeIntoCells(regions, cells)
      mode = 'regions'
      console.log(`  ${grid.input}: 连通域 ${regions.length} 个，按 3×3 单元格归并`)
    } else {
      console.log(`  ${grid.input}: 连通域检测不可用，回退 3×3 等分`)
    }
  }
  if (!boxes) {
    boxes = cells
    mode = 'grid'
  }

  const used = boxes.filter(Boolean).length
  console.log(`\n[${grid.input}] ${W}x${H} · 模式=${mode} · 有效格子=${used}/9`)

  const tasks = []
  boxes.forEach((box, i) => {
    if (!box) {
      console.log(`  ${i + 1}. ${grid.names[i] || '(未命名)'} → 空格（跳过）`)
      return
    }
    const out = cutRegion(img, box, key, args.tol, args.max)
    const rel = grid.names[i] || `assets/character/_extra-${grid.input}-${i + 1}.png`
    const outPath = path.join(ROOT, rel)
    if (!out) {
      console.log(`  ${i + 1}. ${rel} → 空（跳过）`)
      return
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    tasks.push(out.writeAsync(outPath).then(() => {
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1)
      const warn = mode === 'grid' && out.__fullCover ? '  ⚠ 色键可能未生效' : ''
      console.log(`  ${i + 1}. ${rel}  ${out.bitmap.width}x${out.bitmap.height}  ${kb}KB${warn}`)
    }))
  })
  await Promise.all(tasks)
}

;(async () => {
  const args = parseArgs(process.argv)
  const grids = args.grid ? GRIDS.filter(g => g.input.includes(args.grid)) : GRIDS
  console.log(`键控色 ${args.key} · 容差 ${args.tol} · 最长边 ${args.max}px`)
  for (const g of grids) {
    await processGrid(g, args)
  }
  console.log('\n完成。')
})().catch(err => {
  console.error(err)
  process.exit(1)
})
