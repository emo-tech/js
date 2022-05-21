import puppeteer from 'puppeteer'

// const url = 'http://localhost:9040/EliteKM/'
const url = 'https://www.baidu.com/'
const doLoginBtn = '#s-top-loginbtn'

// Main function
async function run() {
  // Open browser and access URL
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  })

  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)

  // page.on('request', (req) => {
  //   console.log('--request--')
  //   console.log(req.headers())
  //   console.log('--request--')
  // })

  // // 监听返回
  // // 登录验证码
  // let bufferImg
  // await page.on('response', (response) => {
  //   console.log('response.url: ' + response.url())
  //   if (response.url().indexOf('getVerifyCode') > 0) {
  //     response.buffer().then(function (value) {
  //       bufferImg = value
  //     })
  //   }
  // })

  // Wait until it is loaded
  await page.goto(url, { waitUntil: 'networkidle2' })

  // 点击登录
  await page.waitForSelector(doLoginBtn)
  await page.click(doLoginBtn)

  await page.waitForSelector('#TANGRAM__PSP_11__submit')
  await page.waitForFunction(() => {
    const loginName = document.getElementById('TANGRAM__PSP_11__userName').value
    return loginName.length >= 11
  })

  await page.click('#TANGRAM__PSP_11__submit')

  // Close browsers
  // browser.close();
}

// Run the function
run().then((res) => {
  console.log(res)
})
