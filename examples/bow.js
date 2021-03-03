const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)
let intervalShot
bot.on('spawn', () => {
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
  bot.chat(`/give ${bot.username} minecraft:arrow 300`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  intervalShot = setInterval(fire, 1300)
})

bot.on('die', () => {
  clearInterval(intervalShot)
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 4001, viewDistance: 4 })
})

function fire () {
  // bot.chat('/kill @e[type=minecraft:arrow]')

  const target = bot.hawkEye.getPlayer()
  if (target) {
    bot.viewer.erase('arrowTrayectoryPoints')
    bot.hawkEye.oneShot(target, 'bow')
    const arrowTrayectoryPoints = bot.hawkEye.getMasterGrade(target, null, 'bow').arrowTrayectoryPoints
    bot.viewer.drawPoints('arrowTrayectoryPoints', arrowTrayectoryPoints, 0xff0000, 5)
  }
}
