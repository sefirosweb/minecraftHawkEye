import mineflayer from 'mineflayer'
import minecraftHawkEye from '../src/index'

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'host.docker.internal',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Guard',
    password: process.argv[5],
    viewDistance: 'far'
})
bot.loadPlugin(minecraftHawkEye)


bot.on('spawn', () => {
    bot.chat('/kill @e[type=arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} shield 1`)
    bot.chat('/time set day')
    bot.chat('Ready!')

    bot.hawkEye.start_radar()

    bot.on('target_aiming_at_you',(uuid) => {
        console.log('detected!' , uuid , Date.now())
    })
})



// bot.on('death', () => {
// })