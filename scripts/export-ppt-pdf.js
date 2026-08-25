// 导出 PPT PDF：打开打印版 HTML，逐页截图合成 PDF（每屏一页 1920×1080）
const path = require('path')

const OUT = path.join(__dirname, '..', 'outputs', 'AI自学提分平台-路演PPT.pdf')

async function main() {
  const { chromium } = require('/Users/lzx/.workbuddy/binaries/node/workspace/node_modules/playwright-core')
  const EXE = '/Users/lzx/Library/Caches/ms-playwright/chromium-1232/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  const browser = await chromium.launch({ executablePath: EXE })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5 })

  const url = 'file://' + path.join(__dirname, '..', 'outputs', 'intro-demo-print.html')
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // 逐个 .page 截图
  const pages = await page.$$('.page')
  console.log('检测到页面数:', pages.length)
  const shots = []
  for (let i = 0; i < pages.length; i++) {
    const shot = path.join(__dirname, '..', 'outputs', `_ppt_${i + 1}.png`)
    await pages[i].screenshot({ path: shot })
    shots.push(shot)
    console.log('已截图第', i + 1, '页')
  }

  await browser.close()

  // 用 sharp/PIL 合成 PDF？这里用纯 Node：拼 PDF 需要库。
  // 简单方案：用 playwright 的 page.pdf() 对打印版直接导出（@page size 已设置）
  console.log('截图完成，改用 page.pdf() 方式重新导出高保真 PDF')
  const b2 = await chromium.launch({ executablePath: EXE })
  const p2 = await b2.newPage({ viewport: { width: 1920, height: 1080 } })
  await p2.goto(url, { waitUntil: 'networkidle' })
  await p2.waitForTimeout(1200)
  await p2.pdf({ path: OUT, width: '1920px', height: '1080px', printBackground: true, pageRanges: '1-9' })
  await b2.close()
  console.log('PDF 已生成:', OUT)
}

main().catch(e => { console.error('失败:', e.message); process.exit(1) })
