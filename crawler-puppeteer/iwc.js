import puppeteer from 'puppeteer'
import xlsx from 'node-xlsx'
import fs from 'fs'

const url = 'https://www.iwencai.com/'

let resultHead = []
let stockHead = []
let resultArray = []
const doLogin = false

const loginForm = {
  loginBtnElement: '#topbarCon .login',
  loginPageElement: 'iframe#login_iframe',
  mobile: '15800524027',
  timeout: 50000
}

const searchResult = {
  staticTableHead: 'ul.static_thead_table li.sort',
  scrollTableHead: 'ul.scroll_thead_table li.sort',
  staticTable: 'table.static_tbody_table',
  scrollTable: 'table.scroll_tbody_table',
  nextPage: '#next',
  currentPage: 'div.pagination a.current',
  totalPage: 'div.pagination a'
}

const searchTime = '2021.10.01-2022.02.01'
const searchWord = `股权转让 ${searchTime}`
const searchInputElement = '#auto'
const searchSubmitElement = '#qs-enter'
const resultListSelector = '#tableWrap'

function filterException(str) {
  str = str.replaceAll(',', '')
  return str
}

// Main function
async function run() {
  // Open browser and access URL
  const browser = await puppeteer.launch({
    headless: false,
    // defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  })

  const page = await browser.newPage()

  // Wait until it is loaded
  await page.goto(url, { waitUntil: 'networkidle2' })

  if (doLogin) {
    // 点击登录
    await page.waitForSelector(loginForm.loginBtnElement)
    await page.click(loginForm.loginBtnElement)

    // 等待登录iframe页面加载
    await page.waitForTimeout(2000)
    await page.waitForSelector(loginForm.loginPageElement)

    const targetFrameUrl =
      'https://upass.iwencai.com/login?act=loginByIframe&isframe=1&view=public&source=iwc_zfnews&main=7&detail=3&redir=https%3A%2F%2Fwww.iwencai.com%2Fuser%2Fredir-logined'
    //找到要定位的iframe页面
    const frame = await page.frames().find((frame) => frame.url().includes(targetFrameUrl))
    //在定位的iframe页面内操作
    const mobile = await frame.waitForSelector(`#mobile`)
    mobile.type(loginForm.mobile)
    await frame.waitForSelector(`#signcode`)

    // 点击完登录
    await page.waitForTimeout(loginForm.timeout)
  }

  // 搜索内容
  await page.waitForSelector(searchInputElement)
  await page.type(searchInputElement, searchWord, { delay: 60 })

  // 点击搜索
  await page.waitForSelector(searchSubmitElement)
  await page.click(searchSubmitElement)

  // 等待结果
  await page.waitForSelector(resultListSelector)

  // 数据头
  const staticTableHead = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('ul.static_thead_table li.sort'))
    return elements.map((element) => element.innerText.trim())
  })
  const scrollTableHead = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('ul.scroll_thead_table li.sort'))
    return elements.map((element) => element.innerText.trim())
  })
  resultHead = staticTableHead.concat(
    scrollTableHead.map((item) => {
      if (item.indexOf(searchTime) > 0) {
        item = item.substring(0, item.indexOf(searchTime))
      }
      return item
    })
  )
  console.log(`resultHead.size: [[${resultHead.length}], resultHead: [${resultHead}]`)

  // 分页的总页数, 以及当前页数
  // const rows = await page.$$eval('div.pagination a', (row) => row)
  const rowsData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('div.pagination a'))
    return elements.map((element) => element.innerText.trim())
  })
  let totalPage = rowsData[rowsData.length - 2]
  console.log(`totalPage: ${totalPage}`)

  for (let i = 0; i < totalPage; i++) {
    if (i > 0) {
      const currentPage = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('div.pagination a.current'))
        return elements.map((element) => element.innerText)
      })
      if (i < totalPage) {
        await page.waitForSelector(searchResult.nextPage)
        await page.click(searchResult.nextPage)
        await page.waitForTimeout(30000)
      }
    }
    // 处理一页的数据
    await getOnePage(page)
  }

  // 查询所有年报
  await searchForDetail()

  // 倒出文件
  await saveAsExcel()

  // Close browsers
  // browser.close();
}

async function getElementInnerText(page, selectors) {
  return await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll(selectors))
    return elements.map((element) => element.innerText.trim())
  })
}

async function getOnePage(page) {
  const staticTableRow = await page.$$eval(`${resultListSelector} ${searchResult.staticTable} tr`, (row) => row)
  const scrollTableRow = await page.$$eval(`${resultListSelector} ${searchResult.scrollTable} tr`, (row) => row)

  console.log(`result search: ${staticTableRow.length} && ${scrollTableRow.length}`)

  const staticTableData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll(`table.static_tbody_table tr td`))
    return elements.map((element) => element.innerText.trim())
  })
  const scrollTableData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll(`table.scroll_tbody_table tr td`))
    console.log(elements)
    return elements.map((element) => element.innerText.trim())
  })
  console.log(staticTableData.length, scrollTableData.length)
  console.log('staticTableData:' + JSON.stringify(staticTableData))
  console.log('scrollTableData:' + JSON.stringify(scrollTableData))

  const staticTableArrayModule = staticTableData.length / staticTableRow.length
  const scrollTableArrayModule = scrollTableData.length / scrollTableRow.length
  const staticTableArray = []
  const scrollTableArray = []
  let tempArray = []
  for (let i = 0; i < staticTableData.length; i++) {
    //循环遍历
    if (i % staticTableArrayModule == 0) {
      //每当余数为1时，就重新建立数组，
      tempArray = []
      staticTableArray.push(tempArray) //将数组存到外面的数组中
    } else if (i % staticTableArrayModule === 2 || i % staticTableArrayModule === 3) {
      tempArray.push(staticTableData[i])
    }
  }
  for (let i = 0; i < scrollTableData.length; i++) {
    //循环遍历
    if (i % scrollTableArrayModule == 0) {
      //每当余数为1时，就重新建立数组，
      tempArray = []
      scrollTableArray.push(tempArray) //将数组存到外面的数组中
    }
    if (i % scrollTableArrayModule != scrollTableArrayModule - 1) {
      tempArray.push(filterException(scrollTableData[i]))
    }
  }

  console.log('scrollTableArray: ' + JSON.stringify(scrollTableArray))

  staticTableArray.forEach((array, index) => {
    resultArray.push(array.concat(scrollTableArray[index]))
  })
}

/**
 * 查询单支的报告
 * @returns {Promise<void>}
 */
async function searchForDetail() {
  const browser = await puppeteer.launch({
    headless: false,
    // defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  })

  for (let i = 0; i < resultArray.length; i++) {
    // const stockUrl = `http://stockpage.10jqka.com.cn/${resultArray[i][0]}/finance.html#stockpage`
    const stockUrl = `http://basic.10jqka.com.cn/${resultArray[i][0]}/finance.html#stockpage`
    console.log(`stockUrl: [${stockUrl}]`)

    const page = await browser.newPage()
    // Wait until it is loaded
    await page.goto(stockUrl, { waitUntil: 'networkidle2' })

    // 点击按年度
    await page.waitForSelector('.tabDataTab')
    const element = await page.$$(`.tabDataTab a`)
    await element[1].click()
    await page.waitForTimeout(2000)

    if (stockHead.length == 0) {
      stockHead = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('div.left_thead table.tbody th'))
        return elements.map((element) => element.innerText.trim())
      })
    }

    const yeahHead = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div.data_tbody>table.top_thead th'))
      return elements.map((element) => element.innerText.trim())
    })

    const dataArr = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div.data_tbody>table.tbody td'))
      return elements.map((element) => element.innerText.trim())
    })

    console.log(`stockHead.size: [${stockHead.length}], stockHead: [${stockHead}]`)
    console.log(`yeahHead.size: [${yeahHead.length}], yeahHead: [${yeahHead}]`)
    console.log(`dataArr.size: [${dataArr.length}], dataArr: [${dataArr}]`)

    const data2021Json = {}
    const data2021 = []
    for (let i = 0; i < dataArr.length; i++) {
      if (i % yeahHead.length === 0) {
        data2021.push(dataArr[i])
      }
    }
    // stockHead.forEach((head, index) => {
    //   data2021Json[head] = data2021[index]
    // })
    // console.log(data2021Json)

    resultArray[i] = resultArray[i].concat(data2021)

    await page.close()
  }
}

/**
 * 导出excel
 */
async function saveAsExcel() {
  resultArray.unshift([...resultHead, ...stockHead])

  console.log(`resultArray:`)
  console.log(JSON.stringify(resultArray))

  const list = [
    {
      name: 'sheet',
      data: resultArray
    }
  ]

  const buffer = xlsx.build(list)
  fs.writeFile(`${__dirname}/dist/myFile.xlsx`, buffer, function (err) {
    if (err) {
      console.log(err, '保存excel出错')
    } else {
      console.log('写入excel成功!!!')
    }
  })
}

// Run the function
run().then((res) => {
  console.log(res)
})
