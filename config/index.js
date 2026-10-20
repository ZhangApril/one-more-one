/**
 * 全局配置：品牌文案、二维码、测试参数
 */
module.exports = {
  // 品牌
  BRAND: 'One More One',
  BRAND_POSTER: 'ONE MORE ONE · 森林人格测试',
  BRAND_SUB_CN: '小红帽与大灰狼的森林人格测试',
  HERO_TAGLINE: '森林深处，藏着另一个你',
  // 首页横幅插画（由 generated-images 生成后裁切压缩，750×525）
  HERO_BANNER: '/assets/scene/banner-home.jpg',

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

  // 二维码：一期无后端，使用原型切图（design/10_二维码.jpeg 裁切）；接入服务端后改为远程 URL
  QR_CODE_URL: '/assets/ui/qrcode.png',

  // 默认头像（游客态）：由整页原型图裁切出的头像专用图，保证人物够大
  DEFAULT_AVATAR: '/assets/character/avatar-guest.jpg',
  // 未上传头像时的占位相机图标
  DEFAULT_CAMERA: '/assets/ui/icon-camera.png',
  // 游客态默认昵称（已授权时用微信昵称）
  DEFAULT_NICKNAME: '游客',

  // 隐藏结局阈值
  WOLF_THRESHOLD: 4,

  // 本地存储 key
  STORAGE_KEYS: {
    PROFILE: 'ono_profile',
    LAST_RESULT: 'ono_last_result',
    LAST_QUESTION_IDS: 'ono_last_question_ids'
  }
}
