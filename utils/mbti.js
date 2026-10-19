/**
 * MBTI 计分引擎（纯函数，无副作用）
 *
 * 输入：questions（本次抽到的题目数组）、answers（与 questions 对齐的数组，值为 0-4 或 null）
 * 输出：{ type, scores, dimensions, wolfIndex, isWolf, threshold }
 */

const CONFIG = require('../config/index.js')

/** 四个维度的定义与展示文案（label 为新版原型结果页的维度名） */
const DIMS = [
  { key: 'EI', label: '精力走向', pos: 'E', neg: 'I', posLabel: '外向', negLabel: '内向' },
  { key: 'SN', label: '认知方式', pos: 'S', neg: 'N', posLabel: '实感', negLabel: '直觉' },
  { key: 'TF', label: '决策方式', pos: 'T', neg: 'F', posLabel: '思考', negLabel: '情感' },
  { key: 'JP', label: '生活态度', pos: 'J', neg: 'P', posLabel: '判断', negLabel: '知觉' }
]

/** 单题换算：0-4 → -2 ~ +2 */
function rawScore(answerIndex) {
  if (answerIndex === null || answerIndex === undefined) return 0
  return answerIndex + 1 - 3
}

/** 单题在所属维度轴上的贡献（positive 为维度负极时取反） */
function contribution(question, answerIndex, dim) {
  const raw = rawScore(answerIndex)
  if (raw === 0) return 0
  return question.positive === dim.pos ? raw : -raw
}

/**
 * 主计算入口
 * @param {Array} questions 题目数组
 * @param {Array} answers   与 questions 对齐的答案（0-4 / null）
 */
function calcResult(questions, answers) {
  const scores = {}
  const counts = {}
  const lastNonNeutral = {} // 平局决胜：记录每维度最后一题的非中立倾向
  let wolfIndex = 0

  DIMS.forEach(d => {
    scores[d.key] = 0
    counts[d.key] = 0
    lastNonNeutral[d.key] = 0
  })

  questions.forEach((q, i) => {
    const dim = DIMS.find(d => d.key === q.dimension)
    if (!dim) return
    const answer = answers[i]
    const c = contribution(q, answer, dim)
    scores[q.dimension] += c
    counts[q.dimension] += 1
    if (c !== 0) lastNonNeutral[q.dimension] = c

    // 狼性指数：狼题「有点像我」+1 / 「完全就是我」+2
    if (q.wolf) {
      const raw = rawScore(answer)
      wolfIndex += raw >= 2 ? 2 : raw === 1 ? 1 : 0
    }
  })

  // 维度字母与百分比
  const dimensions = DIMS.map(d => {
    const score = scores[d.key]
    const count = counts[d.key] || 1
    let letter
    let balanced = false
    if (score > 0) {
      letter = d.pos
    } else if (score < 0) {
      letter = d.neg
    } else {
      // 平局：取该维度最后一题的非中立倾向；全中立则取负极并标记「平衡」
      const last = lastNonNeutral[d.key]
      if (last > 0) letter = d.pos
      else if (last < 0) letter = d.neg
      else {
        letter = d.neg
        balanced = true
      }
    }
    const percent = Math.round(50 + (Math.abs(score) / (2 * count)) * 50)
    // 双向百分比（对齐新版原型「外向 E 12% / 内向 I 88%」）
    const posPercent = letter === d.pos ? percent : 100 - percent
    const negPercent = 100 - posPercent
    return {
      key: d.key,
      label: d.label,
      letter,
      score,
      percent,
      balanced,
      posLetter: d.pos,
      negLetter: d.neg,
      posLabel: d.posLabel,
      negLabel: d.negLabel,
      posPercent,
      negPercent,
      majorPercent: Math.max(posPercent, negPercent),
      side: letter === d.pos ? d.posLabel : d.negLabel
    }
  })

  const type = dimensions.map(d => d.letter).join('')
  const isWolf = wolfIndex >= CONFIG.WOLF_THRESHOLD

  return {
    type,
    scores,
    dimensions,
    wolfIndex,
    isWolf,
    threshold: CONFIG.WOLF_THRESHOLD
  }
}

/** 仅根据维度字母取阵营：F → 小红帽型，T → 大灰狼型 */
function campOf(type) {
  if (!type || type.length < 3) return 'hood'
  return type[2] === 'T' ? 'wolf' : 'hood'
}

module.exports = {
  DIMS,
  rawScore,
  calcResult,
  campOf
}
