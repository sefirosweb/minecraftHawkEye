const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const minecraftHawkEye = require('../index')

// first install the dependency
// npm i mineflayer prismarine-viewer minecrafthawkeye

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'host.docker.internal',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Archer',
    password: process.argv[5]
})

bot.loadPlugin(minecraftHawkEye)
let intervalShot, intervalPreview, target

bot.on('spawn', () => {
    bot.chat('/kill @e[type=minecraft:arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 300`)
    bot.chat('/time set day')
    bot.chat('Ready!')
    target = bot.hawkEye.getPlayer()
    intervalShot = setInterval(fire, 5000)
    intervalPreview = setInterval(shotPreview, 200)
})

bot.on('die', () => {
    clearInterval(intervalShot)
    clearInterval(intervalPreview)
})

bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3000 })
})

const shotPreview = () => {
    bot.viewer.erase('arrowTrajectoryPoints')
    if (target) {
        const arrowTrajectoryPoints = bot.hawkEye.getMasterGrade(target, null, 'bow').arrowTrajectoryPoints // Returns array of Vec3 positions
        if (arrowTrajectoryPoints) {
            bot.viewer.drawPoints('arrowTrajectoryPoints', arrowTrajectoryPoints, 0xff0000, 5)
        }
    }
}

const fire = () => {
    if (target) {
        bot.hawkEye.oneShot(target, 'bow')
    }
}