const mineflayer = require('mineflayer')
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)

bot.on('spawn', () => {
  bot.chat(`/give ${bot.username} trident{Enchantments:[{id:loyalty,lvl:3}]} 1`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  fire()
})

bot.on('die', () => {
  bot.hawkEye.stop()
})

const fire = async () => {
  const target = bot.hawkEye.getPlayer()
  let sleep = 3000
  if (target) {
    const infoShot = bot.hawkEye.getMasterGrade(target, null, 'trident')
    console.log(infoShot)
    if (infoShot) {
      await bot.look(infoShot.yaw, infoShot.pitch)
      bot.hawkEye.oneShot(target, 'trident')
      console.log('Poseidon!')
    } else {
      sleep = 200
    }
  }
  setTimeout(() => {
    fire()
  }, sleep)
}
