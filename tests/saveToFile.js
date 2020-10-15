function save (data, file) {
  data = formatNumber(data, ',')
  const { Parser } = require('json2csv')
  const fs = require('fs')
  var newLine = '\r\n'
  try {
    if (fs.existsSync(file)) {
      const json2csvParser = new Parser({ delimiter: ';', header: false })
      const csv = json2csvParser.parse(data) + newLine
      fs.appendFile(file, csv, function (err) {
        if (err) throw err
      })
    } else {
      const json2csvParser = new Parser({ delimiter: ';', header: true })
      const csv = json2csvParser.parse(data) + newLine

      fs.writeFile(file, csv, function (err) {
        if (err) throw err
      })
    }
  } catch (err) {
    console.error(err)
  }
}

function formatNumber (data, separator) {
  Object.keys(data).forEach(keyI => {
    Object.keys(data[keyI]).forEach(key => {
      data[keyI][key] = data[keyI][key].toString().replace(/\./, separator)
    })
  })
  return data
}

module.exports = {
  save,
  formatNumber
}
