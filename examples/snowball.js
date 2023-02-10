const mineflayer = require('mineflayer')
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)
const ball = 'snowball' // snowball / egg / splash_potion

bot.on('spawn', () => {
  bot.chat(`/give ${bot.username} minecraft:${ball} 300`)
  // bot.chat(`/give ${bot.username} splash_potion{Potion:"minecraft:strong_regeneration"} 30`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  fire()
})

bot.on('die', () => {
  bot.hawkEye.stop()
})

const fire = async () => {
  const target = bot.hawkEye.getPlayer()
  if (target) {
    bot.hawkEye.autoAttack(target, ball)
    console.log('shooting')
  } else {
    setTimeout(() => {
      fire()
    }, 500)
  }
}
