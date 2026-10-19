/**
 * 引用自检：校验页面文件是否齐全、代码里引用的本地资源是否存在
 * 用法：node tools/check-refs.js
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

console.log('主包页面: ' + app.pages.length + ' · 分包: ' + (app.subPackages || []).length)
console.log('引用资源: ' + refs.size + ' 个')
console.log(missing.length ? missing.join('\n') : '✅ 页面与资源引用校验全部通过')
