const CONFIG = require('../../config/index.js')
const { getPersonality, WOLF } = require('../../data/personalities.js')
const { drawPoster, W, H } = require('../../utils/canvas-card.js')

Page({
  data: {
    backText: CONFIG.BTN_BACK_HOME,
    posterPath: '',
    type: '',
    role: ''
  },

  onLoad() {
    const result = wx.getStorageSync(CONFIG.STORAGE_KEYS.LAST_RESULT)
    if (!result || !result.type) {
      wx.redirectTo({ url: '/pages/index/index' })
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
          qrUrl: CONFIG.QR_CODE_URL
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

  onShareAppMessage() {
    const { type, role } = this.data
    return {
      title: `我是 ${type} ${role}，你也来试试？`,
      path: '/pages/index/index'
    }
  },

  onShareTimeline() {
    const { type, role } = this.data
    return {
      title: `我是 ${type} ${role}，你也来试试？`,
      query: ''
    }
  }
})
