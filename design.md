# 项目设计说明（design.md）

> 用途：沉淀本项目的目录结构与技术要点，作为后续需求讨论与代码修改的共同上下文。
> 生成日期：2026-10-16
> 项目位置：`y:/xiaochengxu/xiaochengxu-onemoreone`

---

## 一、项目定位

这是一个 **微信「多端应用」小程序模板**（由微信开发者工具创建的官方 template 改造而来），
具备一次开发、同时发布到 **微信小程序 / Android App / iOS App / 鸿蒙（HarmonyOS）元服务** 的能力。
当前正在基于该模板开发 **One More One —— 小红帽找大灰狼 MBTI 人格测试**（需求见 `REQUIREMENTS.md`）。

- AppID：`wx7aec1d0de2af82b4`
- 项目名：`one-more-one`
- 架构标识：`projectArchitecture: "multiPlatform"`、`miniVersion: "v2"`
- 业务目标：首页（授权 + 游客）→ 10 道 5 级量表题 → 人格结果卡 → 分享海报
- 视觉基准：**`UIref/`（4 张高保真原型）+ `design/`（49 张组件切图）**，森林夜景扁平几何插画风

---

## 二、目录结构

```
xiaochengxu-onemoreone/
├─ app.js                        小程序入口（模板日志/登录逻辑已清理）
├─ app.json                      全局配置：主包 2 页 + 分包 pkg-result + preloadRule
├─ app.wxss                      全局样式：主题 CSS 变量 + 通用按钮/卡片/文本类
├─ app.miniapp.json              多端应用适配配置（绑定原始小程序 userName）
│
├─ project.config.json           开发者工具项目配置（appid、编译选项）
├─ project.miniapp.json          多端应用主配置（android / ios / ohos 三端 SDK 与资源）
├─ project.private.config.json   个人本地配置，优先级高于 project.config.json
├─ sitemap.json                  微信索引配置（allow 全部页面）
│
├─ .gitignore                    忽略 node_modules / miniprogram_npm / project.private.config.json
│
├─ REQUIREMENTS.md               需求文档（PRD，当前 v0.4）
├─ design.md                     本文件：目录结构与技术要点
│
├─ UIref/                        【视觉参照·不入包】4 张高保真原型
│  ├─ 01_首页.jpeg
│  ├─ 02_回答页.jpeg
│  ├─ 03_测试结果页.jpeg
│  └─ 04_分享页.jpeg
│
├─ design/                       【视觉参照·不入包】49 张组件切图（jpeg，文字已烘焙）
│
├─ generated-images/             【中间产物·不入包】image_gen 产出的 3×3 九宫格原图
│
├─ tools/                        【不入包】图片处理脚本
│  ├─ split-grid.js              九等分 + 色键抠图 + 压缩（Node + jimp）
│  └─ package.json               仅声明 jimp 依赖
│
├─ assets/                       【入包】小程序实际使用的图片资产
│  ├─ scene/                     背景、英雄区、地面、月亮、松树 A/B/C
│  ├─ character/                 16 型人格形象 + 小红帽 / 大灰狼 / WOLF
│  └─ ui/                        状态栏、顶部栏、分享图标、二维码占位
│
├─ config/
│  ├─ index.js                   QR_CODE_URL（占位二维码）、品牌文案、数据信任数字
│  └─ ads.js                     广告开关（一期全关）
│
├─ data/
│  ├─ questions.js               32 题题库 + SCALE 常量
│  └─ personalities.js           16 型文案与配色 + WOLF 配置
│
├─ i18n/
│  └─ base.json                  多端应用显示名国际化（ios / android / common）
│
├─ miniapp/
│  └─ android/
│     └─ nativeResources/        Android 原生资源占位（当前全为空目录）
│        ├─ app/
│        ├─ assets/
│        └─ res/
│           └─ raw/
│
├─ pages/
│  ├─ index/                     首页：英雄区 + 授权卡 + 游客入口
│  └─ question/                  答题页：5 级量表 + 进度条
│
├─ pkg-result/                  【分包 result】结果页与分享页 + 16 型形象
│  ├─ pages/result/             结果页：人格卡 / 维度解析 / 特质 / 分析
│  ├─ pages/share/              分享页：Canvas 海报 + 保存图片
│  └─ assets/character/         16 型人格形象 + WOLF（753KB）
│
└─ utils/
   ├─ util.js                    formatTime / formatNumber（保留）
   ├─ mbti.js                    计分 / 类型判定 / 百分比 / 狼性指数
   ├─ pick.js                    随机抽题（分层抽样 + 狼题保底 + 去重）
   └─ canvas-card.js             海报 Canvas 绘制
   └─ util.js                    工具函数：formatTime / formatNumber（CommonJS 导出）
```

**说明**：项目当前**没有** `components/` 目录、**没有** 根目录 `package.json` / `node_modules` / `miniprogram_npm`
（仅 `tools/` 下会有仅供本机图片处理用的 `package.json`，不参与小程序构建）。

**环境与工具约束**：

- **Python 不可用**：`C:\Users\...\WindowsApps\python.exe` 为 Microsoft Store 存根，无法执行脚本
- **Node 可用**：`D:\nodejs\node.exe` → 切图/抠图等脚本统一用 Node 实现
- **图片生成**：使用 `image_gen` 能力（通过 `DeferExecuteTool` 调用），支持 `prompt / size / n / quality / style / output_dir`
- **包体上限**：小程序主包 2MB，图片资产需压缩并规划分包/按需加载

---

## 三、技术要点

### 1. 全局配置 `app.json`

```json
{
  "pages": ["pages/index/index", "pages/logs/logs"],
  "window": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "Weixin",
    "navigationBarBackgroundColor": "#ffffff"
  },
  "style": "v2",
  "componentFramework": "glass-easel",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

- 首页为 `pages/index/index`（`pages` 数组第一项）。
- **`componentFramework: "glass-easel"`**：已启用新版 glass-easel 组件框架（配合 `showShadowRootInWxmlPanel: true` 调试影子根）。
- `lazyCodeLoading: "requiredComponents"`：按需注入，启动更快。
- `window` 未配置 `backgroundColor`、`enablePullDownRefresh`、`navigationStyle`、`tabBar`。

### 2. 编译与运行环境 `project.config.json` / `project.private.config.json`

| 配置项 | 值 | 含义 |
|---|---|---|
| `compileType` | `miniprogram` | 小程序 |
| `libVersion` | `3.17.4`（private 覆盖） | 基础库版本 |
| `es6` / `enhance` / `postcss` | `true` | 启用 ES6 转 ES5、增强编译、PostCSS |
| `minified` / `minifyWXSS` / `minifyWXML` | `true` | 上传时压缩 |
| `useCompilerPlugins` | `false` | 未启用 TS / Sass / Less 编译插件 |
| `compileWorklet` | `false` | 未启用 worklet |
| `skylineRenderEnable` | `false` | **未启用 Skyline**，仍为 WebView 渲染 |
| `packNpmRelationList` | `[]` | 无 npm 构建 |

> `project.private.config.json` 优先级更高，本地调试改动优先看这个文件。

### 3. 多端应用配置 `project.miniapp.json`

按平台分区，三个顶层 key：

| 平台 | SDK | Toolkit | 关键配置 |
|---|---|---|---|
| `mini-ohos` | 0.5.1 | — | — |
| `mini-android` | 1.7.0 | 0.11.0 | `resourcePath: miniapp/android/nativeResources`、vConsole 开、隐私开、图标/闪屏待填 |
| `mini-ios` | 1.7.0 | 0.0.9 | vConsole 开、隐私关、`enableOpenUrlNavigate: true` |

- `"i18nFilePath": "i18n"` → 指向 `i18n/base.json`，用于多端应用显示名（当前为「未命名多端应用」）。
- `useExtendedSdk`：android（media/bluetooth/network/scanner/xweb 全 false）、ios（仅 `WeAppOpenFuns: true`）。

### 4. 多端适配规则

- **不做文件名后缀差异化**。全项目不存在 `index.ohos.wxml`、`index.android.js` 这类变体。
- 采用 **配置文件按平台分区** 的方式：`app.json`（微信端）与 `app.miniapp.json`（多端）成对存在。
- 若将来需要页面级差异，规则是 `页面名.平台.扩展名`（如 `index.ohos.wxml`），优先级高于通用文件。

### 5. 全局样式 `app.wxss`

```css
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}
```

- **无 CSS 变量、无 `@import`、无全局 reset**，只有一个 `.container`。
- 尺寸单位统一 `rpx`；`page { height: 100vh }` 在 index / logs 各自 wxss 中重复定义。

### 6. 核心逻辑

**`app.js`**
- `onLaunch`：把 `Date.now()` unshift 进 `wx.getStorageSync('logs')` 并写回（启动日志）。
- `wx.login` 获取 `code`（**未接后端换取 openId / sessionKey**，为待办）。
- `globalData: { userInfo: null }`。

**`pages/index/index.js`**
- `data`：`motto`、`userInfo{avatarUrl, nickName}`、`hasUserInfo`、两个 `wx.canIUse` 兼容标记。
- `onChooseAvatar`：`open-type="chooseAvatar"` 按钮回调，写入 `userInfo.avatarUrl`。
- `onInputChange`：`type="nickname"` 输入框 `bind:change` 回调，写入 `userInfo.nickName`。
- `getUserProfile`：低版本基础库兜底方案（需用户确认授权）。
- `bindViewTap`：`wx.navigateTo` 跳转 `../logs/logs`。

**`pages/logs/logs.js`**
- `require('../../utils/util.js')`（CommonJS，非 ES Module）调用 `formatTime`。
- 把 storage 中的时间戳数组映射为 `{ date, timeStamp }` 渲染。

**`utils/util.js`**
- `formatTime`：输出 `YYYY/MM/DD hh:mm:ss`；`formatNumber`：补零。
- `module.exports = { formatTime }`。

### 7. 技术栈判定汇总

| 项 | 结论 |
|---|---|
| 语言 | 原生 JavaScript（**无 TypeScript**，无 tsconfig） |
| 渲染 | WebView（Skyline 未启用） |
| 组件框架 | glass-easel |
| 模块化 | CommonJS（`require` / `module.exports`） |
| 依赖管理 | 无 npm，`packNpmManually: false` |
| 自定义组件 | 无 `components/`，页面 `usingComponents` 均为空 |
| 状态管理 | 无（仅页面内 `data` + `globalData`） |
| 网络层 | 无封装（模板未发任何请求） |

---

## 四、已知问题与待办

1. **`onInputSexChange` 是无效实现**（`pages/index/index.js:36-39`）：
   ```js
   onInputSexChange(e) {
     const nickName = e.detail.value
     const sex = '男'        // 局部变量，未 setData，性别输入不生效
   }
   ```
   性别字段目前既不存储也不展示，需要的话应补 `userInfo.sex` 并同步 `index.wxml`。

2. **`wx.login` 未接后端**：`code` 未换取 openId / sessionKey。
3. **数据未持久化**：用户信息仅存于页面 `data`，刷新即丢失（可考虑 `wx.setStorageSync`）。
4. **`app.json` 的 `navigationBarTitleText` 仍为 "Weixin"**，需要改成实际项目名。
5. **`i18n/base.json` 应用名仍为「未命名多端应用」**，且只有 base 无语种文件。
6. **Android / iOS / 鸿蒙 图标与闪屏路径全为空字符串**，发布 App 前必须补齐。
7. **`miniapp/android/nativeResources` 为空目录**，原生资源待放入。
8. 缺少 `components/` 目录、缺 npm 构建，如需引入 UI 库要先建 `package.json` 并执行「构建 npm」。

---

## 五、后续扩展建议位置

| 需求类型 | 建议落点 |
|---|---|
| 新增页面 | `pages/<name>/<name>.{js,json,wxml,wxss}` + 在 `app.json` 的 `pages` 注册 |
| 公共组件 | 新建 `components/`，在页面 `.json` 的 `usingComponents` 引入 |
| 公共样式/变量 | 在 `app.wxss` 用 `:root { --xx }` 定义 CSS 变量（当前为空，可自由设计） |
| 接口请求 | 新建 `utils/request.js` 封装 `wx.request`（含 baseURL、token、错误拦截） |
| 工具函数 | 追加到 `utils/util.js` 或按职责拆分 `utils/*.js` |
| 全局状态 | `app.js` 的 `globalData`，或引入轻量 store |
| 多端差异 | 优先用 `project.miniapp.json` 的平台分区；页面级差异再用 `xxx.<platform>.<ext>` |
| 原生能力 | `project.miniapp.json` 的 `useExtendedSdk` 打开对应开关 |

---

## 六、需求沟通约定

后续提需求时，可直接引用本文件的章节号（如「改三.6 的 `onInputSexChange`」），
我会先更新此文件的对应章节，再落地代码修改，保证设计与实现同步。

---

## 附录 A：资产清单（design/ 切图 → assets/ 归档）

### A.1 已归档为图片资产（17 个，共约 494KB）

| 目标文件 | 源切图 | 状态 |
|---|---|---|
| `assets/scene/bg-page.jpg` | `00_页面背景` | 可直接用（整幅背景） |
| `assets/scene/bg-hero.jpg` | `02_英雄区背景` | 可直接用（首页英雄区整幅） |
| `assets/scene/bg-poster.jpg` | `03_海报背景` | 可直接用（海报整幅底） |
| `assets/scene/bg-card.jpg` | `03_人格卡片背景` | 可直接用（卡片底） |
| `assets/scene/ground.jpg` | `08_地面` | **待抠图**（jpeg 不透明） |
| `assets/scene/moon.jpg` | `04_月亮` | **待抠图** |
| `assets/scene/pine-a.jpg` | `05_松树A` | **待抠图** |
| `assets/scene/pine-b.jpg` | `06_松树B` | **待抠图** |
| `assets/scene/pine-c.jpg` | `07_松树C` | **待抠图** |
| `assets/character/red-riding-hood.jpg` | `09_小红帽` | **待抠图** |
| `assets/character/wolf.jpg` | `10_大灰狼` | **待抠图** |
| `assets/ui/status-bar.jpg` | `01_状态栏` | 参照（建议用代码实现） |
| `assets/ui/top-bar.jpg` | `02_顶部栏` | 参照（建议用代码实现） |
| `assets/ui/icon-wechat.jpg` | `12_微信好友` | **待抠图**（分享图标） |
| `assets/ui/icon-timeline.jpg` | `13_朋友圈` | **待抠图** |
| `assets/ui/icon-save.jpg` | `14_保存图片` | **待抠图** |
| `assets/ui/qrcode-placeholder.jpg` | `10_二维码` | 占位二维码，`config/index.js` 的 `QR_CODE_URL` 指向它 |

> 待抠图项将在 M2.5 用 `tools/split-grid.js` 统一处理（或由新生成的九宫格图替代），
> 在此之前页面先用整幅背景图（`bg-hero` / `bg-page` / `bg-card`）搭建视觉，不叠加未抠图元素。

### A.2 仅作视觉参照、必须用代码重写（文字类）

`03_英雄文案`、`04_海报品牌文字`、`04_卡片引导文字`、`04_题号`、`05_MBTI徽章`、`05_海报角色`、
`05_题干`、`06_海报人格名`、`06_人格角色`、`07_海报人格类型`、`07_人格名称`、`08_海报标语`、
`08_人格副称`、`08_上一题按钮`、`09_海报分割线`、`09_人格标语`、`09_下一题按钮`、`10_维度解析卡片`、
`10_二维码`、`11_二维码文案`、`11_品牌标题`、`11_特质卡片`、`12_在森林里的你`、`12_中文副标题`、
`13_生成分享按钮`、`13_引导文案`、`14_立即测试按钮`、`14_重新测试按钮`、`15_返回首页按钮`、`15_数据信任`、
`03_进度条`、`06_选项A_选中`、`07_选项B`

原因：文字随数据变化（16 型动态渲染）、jpeg 无透明通道、需支持换行与长文本、包体可控。

### A.3 从原型提取的视觉规范（写入 `app.wxss` CSS 变量）

> **2026-10-19 新版原型已全量更新（四张均换）**：视觉从「深色夜景 + 绿色主色」
> 切换为「奶油白底 + 红色主色 + 深绿插画卡」。下表为新版取值。

| 规范项 | 取值 |
|---|---|
| 主色（按钮 / 进度条 / 量表选中） | `#C0453D`（小红帽红） |
| 页面底色 | `#F5EBDC`（奶油白） |
| 插画卡 / 人格卡深绿渐变 | `#1E3A2A` → `#2E5A42` |
| 墨绿强调（标题 / 副标题 / 进度条填充） | `#2E5A42` |
| 点缀金（卡片副称文字） | `#D9A852` |
| 次要文字·灰绿 | `#8A9A85` |
| 浅棕描边（量表圆钮 / 次要按钮） | `#D8C9B4` |
| 卡片圆角 | `24rpx`~`32rpx`（原型为大圆角） |
| 按钮 | 胶囊全圆角；主按钮红底白字，次按钮白底红字红描边 |
| 量表 | 横排 5 圆钮（数字 1-5），选中红底白色对勾，下标文案加深 |
| 标题字号 / 字重 | `48rpx` / 700；副标题 `32rpx` / 600；正文 `28rpx` / 400 |
| 字体 | PingFang SC（系统默认）；人格名在原型中近似宋体，一期沿用系统字重模拟 |
| 首页插画 | 扁平几何（月亮圆 + 三角松树 + 红衣小红帽 + 深灰狼），采用 **CSS 绘制**替代整幅背景图 |

---

## 附录 B：图片生成批次（M2.5）

| 批次 | 内容 | 键控背景 |
|---|---|---|
| A | 小红帽型（F 阵营）8 型人格形象 | `#FF00FF` |
| B | 大灰狼型（T 阵营）8 型人格形象 | `#FF00FF` |
| C | WOLF 隐藏结局 + 答题插画 + 加载态 + 空状态 + 徽章底纹 | `#FF00FF` |

统一风格：扁平几何矢量插画、无描边、森林夜色、配色限定 `#1E3A32 / #30A46E / #E5484D / #F5C451 / #FFF7F0`、
3×3 九宫格、每格独立不跨格、无文字无水印。产出后由 `tools/split-grid.js` 九等分 + 色键抠图。
