/**
 * 用户身份（头像 + 昵称）统一读取
 *
 * 规则：
 * - 已授权（storage 中有 profile 且头像或昵称任一不为空）→ 用微信头像 + 用户昵称
 * - 游客（未授权 / 点了「跳过，直接测试」）→ 默认小红帽头像 + 「游客」
 *
 * 用法：const { getIdentity } = require('./identity.js')
 */
const CONFIG = require('../config/index.js')

/** @returns {{isGuest: boolean, avatarUrl: string, nickName: string}} */
function getIdentity() {
  let profile = null
  try {
    profile = wx.getStorageSync(CONFIG.STORAGE_KEYS.PROFILE)
  } catch (e) {
    profile = null
  }
  const authorized = !!(profile && (profile.avatarUrl || profile.nickName))
  return {
    isGuest: !authorized,
    avatarUrl: (profile && profile.avatarUrl) || CONFIG.DEFAULT_AVATAR,
    nickName: (profile && profile.nickName) || CONFIG.DEFAULT_NICKNAME
  }
}

module.exports = { getIdentity }
