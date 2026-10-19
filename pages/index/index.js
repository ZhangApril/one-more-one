const CONFIG = require('../../config/index.js')

const DEFAULT_AVATAR = CONFIG.DEFAULT_AVATAR

Page({
  data: {
    brand: CONFIG.BRAND,
    brandSubCn: CONFIG.BRAND_SUB_CN,
    heroTagline: CONFIG.HERO_TAGLINE,
    lead: CONFIG.HOME_LEAD,
    trust: CONFIG.HOME_TRUST,
    startText: CONFIG.BTN_START,
    skipText: CONFIG.SKIP_TEXT,
    avatarUrl: DEFAULT_AVATAR,
    nickName: ''
  },

  onLoad() {
    const profile = wx.getStorageSync(CONFIG.STORAGE_KEYS.PROFILE)
    if (profile) {
      this.setData({
        avatarUrl: profile.avatarUrl || DEFAULT_AVATAR,
        nickName: profile.nickName || ''
      })
    }
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) return
    this.setData({ avatarUrl })
    this.saveProfile()
  },

  onNicknameChange(e) {
    const value = e.detail.value || ''
    this.setData({ nickName: value })
    this.saveProfile()
  },

  /** 保存授权信息（游客态不写，保持 null） */
  saveProfile() {
    const { avatarUrl, nickName } = this.data
    if (avatarUrl === DEFAULT_AVATAR) return
    wx.setStorageSync(CONFIG.STORAGE_KEYS.PROFILE, { avatarUrl, nickName })
  },

  goQuiz() {
    wx.navigateTo({ url: '/pages/question/question' })
  },

  onStart() {
    this.saveProfile()
    this.goQuiz()
  },

  /** 游客模式：跳过授权直接开测 */
  onSkip() {
    wx.removeStorageSync(CONFIG.STORAGE_KEYS.PROFILE)
    this.setData({ avatarUrl: DEFAULT_AVATAR, nickName: '' })
    this.goQuiz()
  },

  onShareAppMessage() {
    return {
      title: '在黑森林里，找到你的另一个自己',
      path: '/pages/index/index'
    }
  }
})
