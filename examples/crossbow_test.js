const mineflayer = require('mineflayer')
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)
let shooting = false

bot.on('spawn', function () {
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:unbreaking,lvl:100}]} 1`)
  bot.chat(`/give ${bot.username} minecraft:arrow 300`)
  bot.chat('/time set day')
  bot.chat('Ready!')
  if (!shooting) {
    shooting = true
    fire()
  }
})

function fire () {
  // bot.chat('/kill @e[type=minecraft:arrow]')

  // const target = Object.keys(bot.entities) // Fire to mob
  //   .map(id => bot.entities[id])
  //   .find(function (e) {
  //     return e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 14
  //   })

  const target = bot.hawkEye.getPlayer() // Fire to nearest player
  if (target) {
    // console.log(bot.entity.position.distanceTo(target.position))
    bot.hawkEye.oneShot(target, 'crossbow')
  }

  setTimeout(fire, 4000)
}
