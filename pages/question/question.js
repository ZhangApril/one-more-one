const CONFIG = require('../../config/index.js')
const { QUESTIONS, SCALE } = require('../../data/questions.js')
const { pickQuestions } = require('../../utils/pick.js')
const { calcResult } = require('../../utils/mbti.js')

Page({
  data: {
    quizTitle: CONFIG.QUIZ_TITLE,
    quizHint: CONFIG.QUIZ_HINT,
    scale: SCALE,
    questions: [],
    answers: [],
    total: 0,
    curIndex: 0,
    current: null,
    curAnswer: null,
    percent: 0,
    submitting: false
  },

  onLoad() {
    const lastIds = wx.getStorageSync(CONFIG.STORAGE_KEYS.LAST_QUESTION_IDS) || []
    const questions = pickQuestions(QUESTIONS, { count: CONFIG.QUIZ_COUNT, lastIds })
    wx.setStorageSync(CONFIG.STORAGE_KEYS.LAST_QUESTION_IDS, questions.map(q => q.id))
    this.setData(
      {
        questions,
        answers: questions.map(() => null),
        total: questions.length,
        curIndex: 0
      },
      () => this.sync()
    )
  },

  sync() {
    const { questions, answers, curIndex, total } = this.data
    this.setData({
      current: questions[curIndex] || null,
      curAnswer: answers[curIndex] === undefined ? null : answers[curIndex],
      percent: Math.round(((curIndex + 1) / total) * 100)
    })
  },

  onSelect(e) {
    if (this.data.submitting) return
    const index = Number(e.currentTarget.dataset.index)
    const { answers, curIndex, total } = this.data
    const next = answers.slice()
    next[curIndex] = index
    this.setData({ answers: next, curAnswer: index })

    setTimeout(() => {
      if (curIndex < total - 1) {
        this.setData({ curIndex: curIndex + 1 }, () => this.sync())
      } else {
        this.finish()
      }
    }, 200)
  },

  onNext() {
    const { curAnswer, curIndex, total } = this.data
    if (curAnswer === null) {
      wx.showToast({ title: '先选一个答案', icon: 'none' })
      return
    }
    if (curIndex < total - 1) {
      this.setData({ curIndex: curIndex + 1 }, () => this.sync())
    } else {
      this.finish()
    }
  },

  onPrev() {
    const { curIndex } = this.data
    if (curIndex === 0) return
    this.setData({ curIndex: curIndex - 1 }, () => this.sync())
  },

  onBack() {
    const { curIndex } = this.data
    if (curIndex === 0) {
      wx.navigateBack()
      return
    }
    wx.showModal({
      title: '要退出测试吗？',
      content: '当前进度不会保存，重新开始会换一批题目。',
      confirmText: '退出',
      cancelText: '继续答',
      success: res => {
        if (res.confirm) wx.navigateBack()
      }
    })
  },

  finish() {
    if (this.data.submitting) return
    this.setData({ submitting: true })
    wx.showLoading({ title: CONFIG.QUIZ_LOADING, mask: true })

    setTimeout(() => {
      const { questions, answers } = this.data
      const result = calcResult(questions, answers)
      const payload = Object.assign({}, result, { ts: Date.now() })
      wx.setStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT, payload)
      wx.hideLoading()
      wx.redirectTo({ url: '/pkg-result/pages/result/result?type=' + result.type })
    }, 800)
  }
})
