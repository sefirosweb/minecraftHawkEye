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
  bot.chat('/kill @e[type=minecraft:arrow]')
  // bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
  bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:quick_charge,lvl:3},{id:unbreaking,lvl:3}]} 1`)
  bot.chat(`/give ${bot.username} minecraft:arrow 300`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  fire()
})

bot.on('die', () => {
  bot.hawkEye.stop()
})

async function fire () {
  bot.chat('/kill @e[type=minecraft:arrow]')

  const target = bot.hawkEye.getPlayer() // Fire to nearest player
  if (target) {
    // bot.hawkEye.oneShot(target, 'crossbow')
    bot.hawkEye.autoAttack(target, 'crossbow')
    console.log('shooting')
  } else {
    setTimeout(() => {
      fire()
    }, 500)
  }
}
