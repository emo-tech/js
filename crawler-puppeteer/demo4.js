const puppeteer = require('puppeteer');
const { join, dirname } = require('path');
const { existsSync, mkdirSync, writeFileSync } = require('fs');

const appleUrl = 'https://www.apple.com.cn';
// const appleUrl = 'http://localhost:8080/userCenter.html#/account-number/base-info';

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(appleUrl, { waitUntil: 'networkidle2' });
  const content = await page.content();
  page.on('request', res => {
    console.log('on request', res);
  });
  writeContent(content);
  page.pdf({ path: 'deploys/apple.pdf', format: 'A4' }).then((res) => {
    // browser.close();
  })
})();


function writeContent(html) {
  const file = join(__dirname, 'dist/apple', 'index.html');

  // Test if the directory exist, if not create the directory
  const dir = dirname(file);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(file, html);
}
