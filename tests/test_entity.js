const mineflayer = require('mineflayer')
// const hawkEyePlugin = require('minecrafthawkeye');
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)

bot.on('spawn', function () {
  bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1')
  bot.chat('/give Archer minecraft:arrow 300')
  bot.chat('/time set day')
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.chat('Ready!')
  fire()
})

function fire () {
  const target = Object.keys(bot.entities)
    .map(id => bot.entities[id])
    .find(function (e) {
      return e.type === 'mob' && bot.entity.position.distanceTo(e.position) < 14
    })
  console.log(target)
  // console.log(target);
  if (target) {
    bot.hawkEye.oneShot(target)
  }

  setTimeout(() => {
    fire()
  }, 2000)
}
