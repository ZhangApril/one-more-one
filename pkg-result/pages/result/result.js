// 注意：本页位于分包 pkg-result/pages/result/，回根目录需三级（../../../）
const CONFIG = require('../../../config/index.js')
const { getPersonality, WOLF } = require('../../../data/personalities.js')
const { getIdentity } = require('../../../utils/identity.js')

Page({
  data: {
    lead: CONFIG.RESULT_LEAD,
    avatarUrl: '',
    nickName: '',
    disclaimer: CONFIG.RESULT_DISCLAIMER,
    shareText: CONFIG.BTN_SHARE,
    retestText: CONFIG.BTN_RETEST,
    threshold: CONFIG.WOLF_THRESHOLD,
    type: '',
    displayType: '',
    campLabel: '',
    p: {},
    wolf: WOLF,
    dimensions: [],
    wolfIndex: 0,
    isWolf: false,
    showWolf: false
  },

  onLoad(options) {
    const result = wx.getStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT)
    if (!result || !result.type) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    const type = options.type || result.type
    // 身份：已授权显示微信头像 + 昵称，游客显示默认小红帽头像 + 「游客」
    const { avatarUrl, nickName } = getIdentity()
    this.setData({ avatarUrl, nickName })
    this.render(type, result)

    // 命中隐藏结局：先展示正常人格，1.2s 后翻转为 WOLF
    if (result.isWolf) {
      setTimeout(() => {
        this.setData({ showWolf: true }, () => this.render('WOLF', result))
      }, 1200)
    }
  },

  render(type, result) {
    const p = getPersonality(type)
    const campLabel = type === 'WOLF' ? '大灰狼型' : p.camp === 'wolf' ? '大灰狼型' : '小红帽型'
    this.setData({
      type: result.type,
      displayType: type === 'WOLF' ? 'WOLF' : type,
      campLabel,
      p,
      dimensions: result.dimensions || [],
      wolfIndex: result.wolfIndex || 0,
      isWolf: !!result.isWolf
    })
  },

  /** 隐藏结局：切回正常人格卡片 */
  onToggleWolf() {
    const result = wx.getStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT) || {}
    this.setData({ showWolf: false })
    this.render(result.type || this.data.type, result)
  },

  onGoShare() {
    wx.navigateTo({ url: '/pkg-result/pages/share/share' })
  },

  onRetest() {
    wx.removeStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT)
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    const { p, displayType } = this.data
    return {
      title: `我是 ${displayType} ${p.role}，你也来试试？`,
      path: '/pages/index/index'
    }
  }
})
