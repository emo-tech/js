//生成Excel依赖包
const xlsx = require('node-xlsx')
//写入文件依赖包
var fs = require('fs')

const list = [
  {
    name: 'sheet',
    data: [
      ['data1', 'data2', 'data3'],
      ['data1', 'data2', 'data3'],
      ['data1', 'data2', 'data3']
    ]
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
