//引入
const puppeteer = require('puppeteer')
getFocus(); 
async function getFocus() {
    //打开浏览器 这里要找到你安装的Chromium.app
    const browser = await puppeteer.launch({
        // executablePath: 'chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        headless: false,
        devtools: true
    })
    //浏览器新开页面
    const page = await browser.newPage();
    //前往目标页面
    await page.goto('https://baidu.com')
    //等待1秒
    await page.waitFor(1000)
	//找到dom 方便后续点击，绑定一个id 具体要点击的什么修改index
    await page.evaluate(async()=>{
        let list = document.getElementById('u1').getElementsByTagName('a')
        for(let i=0 ; i<list.length; i ++ ){
            list[1].setAttribute('id','clickTarget')
        }
    })
    await page.waitFor(1000)
    await page.click('#clickTarget')
    await page.waitFor(1000)
	// 写你的核心爬虫逻辑
    var arr = await page.evaluate(async()=>{
        let list = document.getElementById('pane-news').getElementsByClassName('hotnews')[0].getElementsByTagName('li')
        let arr = []
        for(let item of list){
            arr.push(item.innerText)
        }
        return arr
    })
    console.log(arr)
    // await browser.close()
}
