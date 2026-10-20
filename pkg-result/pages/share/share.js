// 注意：本页位于分包 pkg-result/pages/share/，回根目录需三级（../../../）
const CONFIG = require('../../../config/index.js')
const { getPersonality, WOLF } = require('../../../data/personalities.js')
const { drawPoster, W, H } = require('../../../utils/canvas-card.js')
const { getIdentity } = require('../../../utils/identity.js')

Page({
  data: {
    backText: CONFIG.BTN_BACK_HOME,
    posterPath: '',
    type: '',
    role: '',
    noResult: false
  },

  onLoad() {
    const result = wx.getStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT)
    // 没有结果时不再静默 redirectTo 首页（会让人以为“点分享被跳走”），改为展示空态由用户自己决定
    if (!result || !result.type) {
      this.setData({ noResult: true })
      return
    }
    const isWolf = !!result.isWolf
    const type = isWolf ? 'WOLF' : result.type
    const persona = isWolf ? WOLF : getPersonality(result.type)
    const campLabel = persona.camp === 'wolf' ? '大灰狼型' : '小红帽型'

    this.setData({ type, role: persona.role })
    this.persona = persona
    this.campLabel = campLabel
  },

  onReady() {
    this.renderPoster()
  },

  renderPoster() {
    if (!this.persona) return
    wx.createSelectorQuery()
      .select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res && res[0] && res[0].node
        if (!canvas) {
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }
        drawPoster(canvas, {
          type: this.data.type,
          persona: this.persona,
          campLabel: this.campLabel,
          qrUrl: CONFIG.QR_CODE_URL,
          // 游客自动使用默认小红帽头像 +「游客」
          identity: getIdentity()
        })
          .then(() => {
            wx.canvasToTempFilePath({
              canvas,
              destWidth: W,
              destHeight: H,
              success: r => this.setData({ posterPath: r.tempFilePath }),
              fail: () => wx.showToast({ title: '海报生成失败', icon: 'none' })
            })
          })
          .catch(() => wx.showToast({ title: '海报绘制失败', icon: 'none' }))
      })
  },

  onSave() {
    const { posterPath } = this.data
    if (!posterPath) {
      wx.showToast({ title: '海报还没生成好', icon: 'none' })
      return
    }
    const save = () => {
      wx.saveImageToPhotosAlbum({
        filePath: posterPath,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: err => {
          const msg = String(err.errMsg || '')
          if (msg.indexOf('auth deny') >= 0 || msg.indexOf('authorize') >= 0) {
            wx.showModal({
              title: '需要相册权限',
              content: '保存图片需要开启「保存到相册」权限，是否去设置？',
              confirmText: '去设置',
              success: r => {
                if (r.confirm) wx.openSetting()
              }
            })
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        }
      })
    }

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum'] === false) {
          wx.showModal({
            title: '需要相册权限',
            content: '保存图片需要开启「保存到相册」权限，是否去设置？',
            confirmText: '去设置',
            success: r => {
              if (r.confirm) wx.openSetting()
            }
          })
          return
        }
        save()
      },
      fail: save
    })
  },

  onBackHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  /**
   * 转发给微信好友：由微信接管（点击会弹出好友选择面板，页面本身不会跳转）
   * path 是「好友点开分享卡片后的落地页」——指向首页，让好友从测试开始
   * （注意：开发者工具里做“转发调试”时会按这个 path 打开页面，看上去像是跳到了首页，属于预期行为）
   */
  onShareAppMessage() {
    const { type, role, posterPath } = this.data
    const share = {
      title: `我是 ${type} ${role}，你也来试试？`,
      path: '/pages/index/index'
    }
    // 海报已生成时作为分享卡片配图，未生成则不传（微信会用页面截图）
    if (posterPath) share.imageUrl = posterPath
    return share
  },

  onShareTimeline() {
    const { type, role, posterPath } = this.data
    const share = {
      title: `我是 ${type} ${role}，你也来试试？`,
      // 朋友圈分享不支持自定义 path，只能带 query（拼在当前页面路径后）
      query: 'from=timeline'
    }
    if (posterPath) share.imageUrl = posterPath
    return share
  },

  /**
   * 朋友圈分享（open-type="shareTimeline"）仅在真机生效，开发者工具点击无响应。
   * 这里在工具环境给出明确提示，避免误以为按钮坏了。
   */
  onShareTimelineTap() {
    try {
      const info = wx.getSystemInfoSync()
      if (info.platform === 'devtools') {
        wx.showToast({ title: '朋友圈分享请用「预览」在真机体验', icon: 'none' })
      }
    } catch (e) {
      // 忽略：取不到系统信息时不影响原生分享
    }
  }
})
