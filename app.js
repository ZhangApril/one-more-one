// app.js
App({
  onLaunch() {
    // 一期无后端：不调用 wx.login 换取 openId
  },
  globalData: {
    // 最近一次测试结果（同时存在 storage 中，供结果页/分享页直接打开）
    lastResult: null
  }
})
