const mineflayer = require('mineflayer')
const minecraftHawkEye = require('../index')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Archer',
  password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)
let shooting = false;

bot.on('spawn', function () {
  bot.chat('/give ' + bot.username + ' bow{Enchantments:[{id:unbreaking,lvl:100}]} 1')
  bot.chat('/give ' + bot.username + ' minecraft:arrow 300')
  bot.chat('/time set day')
  bot.chat('/kill @e[type=minecraft:arrow]')
  bot.chat('Ready!')
  if (!shooting) {
    shooting = true
    fire()
  }
})

function fire() {
  const target = bot.hawkEye.getPlayer()
  if (!target) {
    return false
  }

  bot.hawkEye.oneShot(target)

  setTimeout(() => {
    fire();
  }, 2000);
}
