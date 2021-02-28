const mineflayer = require('mineflayer')
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)

bot.on('spawn', function () {
  bot.chat(`/give ${bot.username} minecraft:ender_pearl 300`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  fire()
})

bot.on('die', () => {
  bot.hawkEye.stop()
})

async function fire () {
  const target = bot.hawkEye.getPlayer()
  let sleep = 5000
  if (target) {
    const infoShot = bot.hawkEye.getMasterGrade(target, null, 'ender_pearl')
    if (infoShot) {
      await bot.look(infoShot.yaw, infoShot.pitch)
      bot.hawkEye.oneShot(target, 'ender_pearl')
      console.log('Shunpo!')
    } else {
      sleep = 200
    }
  }
  setTimeout(() => {
    fire()
  }, sleep)
}
