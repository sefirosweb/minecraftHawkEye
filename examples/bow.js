const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const minecraftHawkEye = require('../index')
const Vec3 = require('vec3')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

const intercept = require('../src/intercept')(bot)

bot.loadPlugin(minecraftHawkEye)
let intervalShot, intervalTrajectory
bot.on('spawn', () => {
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
  bot.chat(`/give ${bot.username} minecraft:arrow 300`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  intervalShot = setInterval(fire, 1300)
  intervalTrajectory = setInterval(arrowTrajectory, 5000)
})

bot.on('die', () => {
  clearInterval(intervalShot)
  clearInterval(intervalTrajectory)
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 4001 })
})

let totalIds = 0
const arrowTrajectory = () => {
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.viewer.erase('arrowTrajectoryPoints')
  for (let i = 0; i <= totalIds; i++) {
    bot.viewer.erase(`raycastChecks_${i}`)
  }
  const target = bot.hawkEye.getPlayer()
  if (target) {
    const data = bot.hawkEye.getMasterGrade(target, null, 'bow')
    const { arrowTrajectoryPoints } = data
    if (arrowTrajectoryPoints) {
      bot.viewer.drawPoints('arrowTrajectoryPoints', arrowTrajectoryPoints, 0xff0000, 5)
      const raycastChecks = intercept.checkMultiplePositions(arrowTrajectoryPoints)
      totalIds = raycastChecks.length
      for (let i = 0; i <= raycastChecks.length; i++) {
        const drawBox = new Vec3(raycastChecks[i])
        bot.viewer.drawBoxGrid(`raycastChecks_${i}`, drawBox, drawBox.offset(1, 1, 1))
      }

      // bot.viewer.drawPoints('raycastChecks', raycastChecks, 0xffff00, 5)
    }
  }
}

const fire = () => {
  const target = bot.hawkEye.getPlayer()
  if (target) {
    bot.hawkEye.oneShot(target, 'bow')
  }
}
