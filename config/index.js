/**
 * 全局配置：品牌文案、二维码、测试参数
 */
module.exports = {
  // 品牌
  BRAND: 'One More One',
  BRAND_POSTER: 'ONE MORE ONE · 森林人格测试',
  BRAND_SUB_CN: '小红帽与大灰狼的森林人格测试',
  HERO_TAGLINE: '森林深处，藏着另一个你',

  // 首页
  HOME_LEAD: '走进童话森林，用 10 道小问题，遇见藏在心里的那只小红帽，或那匹温柔的大灰狼。',
  HOME_TRUST: '已有 12,847 人在森林里找到了自己的人格',
  BTN_START: '立即测试',
  SKIP_TEXT: '跳过，直接测试 →',

  // 答题页
  QUIZ_TITLE: '森林人格测试',
  QUIZ_HINT: '这句话有多像你?',
  QUIZ_LOADING: '森林正在解析你的身份…',
  QUIZ_COUNT: 10, // 每次抽题数量

  // 结果页
  RESULT_LEAD: '你的森林人格是',
  RESULT_DISCLAIMER: '· 仅供参考 · 娱乐向测试 ·',
  BTN_SHARE: '生成我的分享卡片',
  BTN_RETEST: '重新测试',

  // 分享页
  SHARE_TITLE: '分享给好友',
  SHARE_QR_TIP: '长按识别二维码 测测你的森林人格',
  BTN_BACK_HOME: '返回首页',

  // 二维码：一期无后端，使用本地占位图；接入服务端后改为远程 URL 即可
  QR_CODE_URL: '/assets/ui/qrcode-placeholder.jpg',

  // 默认头像（游客态）
  DEFAULT_AVATAR: '/assets/character/red-riding-hood.jpg',
  DEFAULT_NICKNAME: '旅人',

  // 隐藏结局阈值
  WOLF_THRESHOLD: 4,

  // 本地存储 key
  STORAGE_KEYS: {
    PROFILE: 'ono_profile',
    LAST_RESULT: 'ono_last_result',
    LAST_QUESTION_IDS: 'ono_last_question_ids'
  }
}
