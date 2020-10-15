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

  // Get target for block position, use whatever you need
  // const target = bot.hawkEye.getPlayer()
  // console.log(target);
  /* if (!target) {
          return false
      } */

  // Auto attack every 1,2 secs until target is dead or is to far away
  // bot.hawkEye.autoAttack(target)
  // If you force stop attack use:
  // hawkEye.stop();

  // Use one shot time with calc:
  // bot.hawkEye.oneShot(target);

  // If you want to shot in XYZ position:

  const blockPosition = {
    position: {
      x: -10,
      y: 62,
      z: 0.5
    },
    isValid: true // Fake to is "alive"
  }
  // bot.hawkEye.oneShot(blockPosition);
  bot.hawkEye.autoAttack(blockPosition)

  searchSpiders()
})

function searchSpiders () {
  const entities = Object.keys(bot.entities)
    .map(id => bot.entities[id])
    .filter(function (entity) {
      return (entity.type === 'mob') && bot.entity.position.distanceTo(entity.position) < 16
    })

  console.clear()
  entities
    .map(function (entity) {
      console.log(entity.username ? entity.username : entity.name, entity)
    })

  setTimeout(() => {
    searchSpiders()
  }, 2000)
}
