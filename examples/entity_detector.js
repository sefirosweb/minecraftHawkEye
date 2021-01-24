const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'EntityDetecter',
  password: process.argv[5]
})

// Used for calculate AVG max speed
const calculateAvgMaxSpeed = true
const arrayVo = []
let prevVo = 0
let maxVo = 0
let minVo = 0
let totalelocity

const getCurrentArrowSpeed = false

bot.once('spawn', () => {
  bot.on('physicTick', () => {
    const target = Object.keys(bot.entities)
      .map(id => bot.entities[id])
      .find(function (e) {
        return e.name === 'arrow'
      })

    if (target) {
      totalelocity = Math.sqrt(Math.pow(target.velocity.x, 2) + Math.pow(target.velocity.y, 2) + Math.pow(target.velocity.z, 2))
      totalelocity = Math.round(totalelocity * 100) / 100

      if (getCurrentArrowSpeed) {
        console.log(totalelocity, target.velocity)
      }

      // Used for calculate AVG max speed
      if (calculateAvgMaxSpeed) {
        if (totalelocity > prevVo) {
          maxVo = totalelocity
        } else {
          minVo = totalelocity
        }

        if (minVo < totalelocity) {
          arrayVo.push(maxVo)
          let media = arrayVo.reduce((a, b) => a + b, 0) / arrayVo.length
          media = Math.round(media * 100) / 100
          console.log(maxVo, media)
          if (arrayVo.length > 20) {
            arrayVo.shift()
          }
          minVo = 0
        }

        prevVo = totalelocity
      }
    }
  })
})
