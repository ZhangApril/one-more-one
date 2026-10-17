# 项目设计说明（design.md）

> 用途：沉淀本项目的目录结构与技术要点，作为后续需求讨论与代码修改的共同上下文。
> 生成日期：2026-10-16
> 项目位置：`y:/xiaochengxu/xiaochengxu-onemoreone`

---

## 一、项目定位

这是一个 **微信「多端应用」小程序模板**（由微信开发者工具创建的官方 template 改造而来），
具备一次开发、同时发布到 **微信小程序 / Android App / iOS App / 鸿蒙（HarmonyOS）元服务** 的能力。

- AppID：`wx7aec1d0de2af82b4`
- 项目名：`one-more-one`
- 架构标识：`projectArchitecture: "multiPlatform"`、`miniVersion: "v2"`
- 当前业务内容仅为模板示例：**首页填写头像/昵称/性别 + 启动日志页**

---

## 二、目录结构

```
xiaochengxu-onemoreone/
├─ app.js                        小程序入口逻辑（onLaunch + globalData）
├─ app.json                      全局配置：页面路由、window、组件框架
├─ app.wxss                      全局样式（仅 .container 一个公共类）
├─ app.miniapp.json              多端应用适配配置（绑定原始小程序 userName）
│
├─ project.config.json           开发者工具项目配置（appid、编译选项）
├─ project.miniapp.json          多端应用主配置（android / ios / ohos 三端 SDK 与资源）
├─ project.private.config.json   个人本地配置，优先级高于 project.config.json
├─ sitemap.json                  微信索引配置（allow 全部页面）
│
├─ .gitignore                    忽略 node_modules / miniprogram_npm / project.private.config.json
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
│  ├─ index/                     首页
│  │  ├─ index.js                头像选择 / 昵称输入 / 版本兼容判断 / 跳转 logs
│  │  ├─ index.json              页面配置（usingComponents 为空）
│  │  ├─ index.wxml              三分支条件渲染：填写态 / 低版本兜底 / 已填写态
│  │  └─ index.wxss              页面样式
│  └─ logs/                      启动日志页
│     ├─ logs.js                 读取 storage 中的 logs 并格式化时间
│     ├─ logs.json               页面配置
│     ├─ logs.wxml               scroll-view + wx:for 列表
│     └─ logs.wxss               列表样式（含安全区适配）
│
└─ utils/
   └─ util.js                    工具函数：formatTime / formatNumber（CommonJS 导出）
```

**说明**：项目当前**没有** `components/` 目录、**没有** `package.json` / `node_modules` / `miniprogram_npm`。

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
