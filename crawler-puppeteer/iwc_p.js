// 此处使用 chrome 来进行相关代码操作
const { chromium } = require('playwright')

const main = async () => {
  const browser = await chromium.launch()

  const page = await browser.newPage()

  // 进入百度的网页
  await page.goto('https://www.baidu.com')

  // path 为相对路径下的文件，保存的文件对应目录为 playwright/image.png
  page.screenshot({ path: 'image.png' })

  browser.close()
}

main()
