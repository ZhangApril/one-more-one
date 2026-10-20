const CONFIG = require('../../config/index.js')

Page({
  data: {
    brand: CONFIG.BRAND,
    brandSubCn: CONFIG.BRAND_SUB_CN,
    heroTagline: CONFIG.HERO_TAGLINE,
    heroBanner: CONFIG.HERO_BANNER,
    lead: CONFIG.HOME_LEAD,
    trust: CONFIG.HOME_TRUST,
    startText: CONFIG.BTN_START,
    skipText: CONFIG.SKIP_TEXT,
    cameraIcon: CONFIG.DEFAULT_CAMERA,
    avatarUrl: '',
    nickName: '',
    nickFocus: false
  },

  onLoad() {
    const profile = wx.getStorageSync(CONFIG.STORAGE_KEYS.PROFILE)
    if (profile) {
      this.setData({
        avatarUrl: profile.avatarUrl || '',
        nickName: profile.nickName || ''
      })
    }
  },

  /**
   * 头像+昵称授权：微信只开放头像能力，昵称需用户确认。
   * 拿到头像后立刻自动聚焦昵称框（键盘上方会出现「使用微信昵称」），
   * 让「头像 + 昵称」在一次连贯操作里一起替换完成。
   */
  onChooseAvatar(e) {
    const avatarUrl = (e.detail && e.detail.avatarUrl) || ''
    if (!avatarUrl) return
    this.setData({ avatarUrl }, () => this.saveProfile())
    // 选完头像立刻拉起昵称输入：键盘上方会出现「使用微信昵称」，
    // 点一下即填入微信昵称，与头像一起保存（微信仅提供这两个分离的能力）
    this.setData({ nickFocus: false }, () => {
      setTimeout(() => this.setData({ nickFocus: true }), 30)
    })
  },

  /** 输入过程中实时同步（微信昵称填入时也会走 input 事件） */
  onNicknameInput(e) {
    const nickName = (e.detail && e.detail.value) || ''
    this.setData({ nickName })
  },

  onNicknameChange(e) {
    const nickName = ((e.detail && e.detail.value) || '').trim()
    this.setData({ nickName }, () => this.saveProfile())
  },

  onNicknameBlur() {
    this.setData({ nickFocus: false })
  },

  /** 保存授权信息（游客态不写，保持 null） */
  saveProfile() {
    const { avatarUrl, nickName } = this.data
    if (!avatarUrl && !nickName) return
    wx.setStorageSync(CONFIG.STORAGE_KEYS.PROFILE, { avatarUrl, nickName })
  },

  goQuiz() {
    wx.navigateTo({
      url: '/pages/question/question',
      fail: err => {
        console.error('[index] 跳转答题页失败：', err)
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' })
      }
    })
  },

  onStart() {
    this.saveProfile()
    this.goQuiz()
  },

  /** 游客模式：跳过授权直接开测 */
  onSkip() {
    wx.removeStorageSync(CONFIG.STORAGE_KEYS.PROFILE)
    this.setData({ avatarUrl: '', nickName: '', nickFocus: false })
    this.goQuiz()
  },

  onShareAppMessage() {
    return {
      title: '在黑森林里，找到你的另一个自己',
      path: '/pages/index/index'
    }
  }
})
