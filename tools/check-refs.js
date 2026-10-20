/**
 * 引用自检：校验页面文件是否齐全、代码里引用的本地资源与 require 相对路径是否存在
 * 用法：node tools/check-refs.js
 *
 * 说明：曾出现「页面移入分包后 require 相对路径未同步修改，导致 JS 加载失败、页面空白」的问题，
 * 因此这里增加 require 路径校验（把分包页面挪位置后能立刻发现）。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const IGNORE_DIRS = ['node_modules', '.git', 'design', 'UIref', 'generated-images', 'tools']

const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'))
const missing = []

function checkPage(rootDir, page) {
  ['js', 'json', 'wxml', 'wxss'].forEach(ext => {
    const f = path.join(rootDir, page + '.' + ext)
    if (!fs.existsSync(f)) missing.push('缺页面文件: ' + path.relative(ROOT, f))
  })
}

app.pages.forEach(pg => checkPage(ROOT, pg))
;(app.subPackages || []).forEach(sp => {
  sp.pages.forEach(pg => checkPage(path.join(ROOT, sp.root), pg))
})

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((acc, e) => {
    if (IGNORE_DIRS.includes(e.name)) return acc
    const fp = path.join(dir, e.name)
    if (e.isDirectory()) return acc.concat(walk(fp))
    return acc.concat([fp])
  }, [])
}

const files = walk(ROOT).filter(f => /\.(wxml|js|json)$/.test(f))
const refs = new Set()
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8')
  const re = /['"](\/(?:assets|pkg-result)\/[A-Za-z0-9_\-./]+\.(?:png|jpe?g|gif|webp))['"]/g
  let m
  while ((m = re.exec(content))) refs.add(m[1])
})

Array.from(refs)
  .sort()
  .forEach(r => {
    if (!fs.existsSync(path.join(ROOT, r))) missing.push('缺资源: ' + r)
  })

// 校验 JS 里的相对 require 路径（含 .js 后缀省略的情况）
const jsFiles = walk(ROOT).filter(f => /\.js$/.test(f))
let requireCount = 0
jsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8')
  const re = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g
  let m
  while ((m = re.exec(content))) {
    requireCount++
    const base = path.resolve(path.dirname(f), m[1])
    const candidates = [base, base + '.js', path.join(base, 'index.js')]
    if (!candidates.some(c => fs.existsSync(c) && fs.statSync(c).isFile())) {
      missing.push('require 路径不存在: ' + path.relative(ROOT, f) + ' → ' + m[1])
    }
  }
})

console.log('主包页面: ' + app.pages.length + ' · 分包: ' + (app.subPackages || []).length)
console.log('引用资源: ' + refs.size + ' 个 · require 路径: ' + requireCount + ' 处')
console.log(missing.length ? missing.join('\n') : '✅ 页面与资源引用校验全部通过')
