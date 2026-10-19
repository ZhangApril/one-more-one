/**
 * 随机抽题：分层抽样 + 狼题保底 + 与上次去重
 *
 * 规则（见 REQUIREMENTS.md 4.3）：
 *   - 题库每维度 8 题，共 32 题
 *   - 每次抽 10 题：EI 3 / SN 3 / TF 2 / JP 2
 *   - 狼题（wolf: true）保底命中 3 道
 *   - 10 题整体打乱顺序，避免维度规律暴露
 *   - 若与上次题目完全相同则重抽一次
 */

const QUOTA = { EI: 3, SN: 3, TF: 2, JP: 2 }
const WOLF_COUNT = 3

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

/**
 * @param {Array} pool    全部题库
 * @param {Object} opts   { count, lastIds }
 * @returns {Array} 抽到的题目数组
 */
function pickQuestions(pool, opts) {
  const options = opts || {}
  const count = options.count || 10
  const lastIds = options.lastIds || []

  const first = pickOnce(pool, count)
  const sameAsLast =
    lastIds.length > 0 && first.length === lastIds.length && first.every((q, i) => q.id === lastIds[i])
  return sameAsLast ? pickOnce(pool, count) : first
}

function pickOnce(pool, count) {
  const byDim = {}
  Object.keys(QUOTA).forEach(k => {
    byDim[k] = shuffle(pool.filter(q => q.dimension === k))
  })

  const picked = []
  const usedIds = {}
  const take = q => {
    if (usedIds[q.id]) return false
    usedIds[q.id] = true
    picked.push(q)
    return true
  }

  // 1) 狼题保底：从 3 个不同维度各取 1 道狼题
  const dimsWithWolf = shuffle(Object.keys(QUOTA).filter(k => byDim[k].some(q => q.wolf)))
  let wolfTaken = 0
  for (const dim of dimsWithWolf) {
    if (wolfTaken >= WOLF_COUNT) break
    const wolf = byDim[dim].find(q => q.wolf && !usedIds[q.id] && QUOTA[dim] >= 2)
    if (wolf && take(wolf)) wolfTaken++
  }
  // 若不足 3 道（题库配置变化时兜底），从剩余狼题里补齐
  if (wolfTaken < WOLF_COUNT) {
    const restWolves = shuffle(
      pool.filter(q => q.wolf && !usedIds[q.id] && QUOTA[q.dimension] >= 2)
    )
    for (const q of restWolves) {
      if (wolfTaken >= WOLF_COUNT) break
      if (take(q)) wolfTaken++
    }
  }

  // 2) 按维度配额补齐剩余题目（狼题已占用的名额从配额中扣除）
  Object.keys(QUOTA).forEach(dim => {
    const usedInDim = picked.filter(q => q.dimension === dim).length
    let need = QUOTA[dim] - usedInDim
    for (const q of byDim[dim]) {
      if (need <= 0) break
      if (!q.wolf && take(q)) need--
    }
  })

  // 3) 兜底：配额未填满时补任意题，超过时截断
  if (picked.length < count) {
    for (const q of shuffle(pool)) {
      if (picked.length >= count) break
      take(q)
    }
  }

  return shuffle(picked).slice(0, count)
}

module.exports = {
  QUOTA,
  pickQuestions
}
