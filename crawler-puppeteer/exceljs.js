var Excel = require('exceljs')
var workbook = new Excel.Workbook()
var ws1 = workbook.addWorksheet('表名')
ws1.addRow('数据')

workbook.xlsx.writeFile('文件路径及文件名').then(function () {
  rh.setHeader('Content-Type', 'application/vnd.openxmlformats')
  rh.setHeader('Content-Disposition', "attachment; filename='文件名'")
  var exlBuf = fs.readFileSync(filepath + filename)
  rh.setBody(exlBuf)
  setTimeout(function () {
    fs.unlink('文件路径及文件名', function (err) {})
  }, 1000)
  callback(null, rh)
})
