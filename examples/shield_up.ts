import { Box, Line } from 'detect-collisions'
import mineflayer, { Bot } from 'mineflayer'
import mineflayerViewer from 'prismarine-viewer'
import { Vec3 } from 'vec3'
import { calculateDestinationByPitch, calculateDestinationByYaw, calculateRayCast } from '../src/hawkEyeEquations'
import minecraftHawkEye from '../src/index'
import { physics } from '../src/loadBot'

type ModdedBot = Bot & { viewer }

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'localhost',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Guard',
    password: process.argv[5],
    viewDistance: 'far'
}) as ModdedBot

const DISTANCE_VISION = 15

bot.loadPlugin(minecraftHawkEye)


let danger: number | undefined

let writingPost: Array<Vec3> = []

bot.on('spawn', () => {
    bot.chat('/kill @e[type=arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} shield 1`)
    bot.chat('/time set day')
    bot.chat('Ready!')

    // bot.hawkEye.start_radar()

    // const registry = bot.registry

    bot.on('target_aiming_at_you', (entity) => {
        console.log('detected!', entity.username ?? entity.name, Date.now())
        danger = Date.now()

        bot.lookAt(entity.position, true)
        bot.activateItem()
    })

    setInterval(() => {
        if (danger && Date.now() - danger > 4000) {
            danger = undefined
            bot.deactivateItem()
        }
    }, 400)

    bot.on('physicTick', () => {
        const botPos = bot.entity.position

        const entity = Object.values(bot.entities)
            .find(e => e.username === 'Lordvivi')
        if (!entity) return

        const eyePosition = entity.position.offset(0, 1.6, 0)

        const lookingAtHorizontal = calculateDestinationByYaw(eyePosition, entity.yaw + Math.PI, DISTANCE_VISION);
        const lookingAtVertical = calculateDestinationByPitch(eyePosition, entity.pitch, DISTANCE_VISION);
        const lookingAt = calculateRayCast(eyePosition, entity.pitch, entity.yaw + Math.PI, DISTANCE_VISION)

        bot.viewer.drawLine('entitySeeHorizontal', [eyePosition, lookingAtHorizontal], 'red')
        bot.viewer.drawLine('entitySeeVertical', [eyePosition, lookingAtVertical], 'purple')
        bot.viewer.drawLine('entitySee', [eyePosition, lookingAt], 'orange')

        writingPost.push(lookingAt)
        bot.viewer.drawPoints('entitySeePos', writingPost, 'red')

        const lookingAtHorizontalLine = new Line(
            {
                x: entity.position.x,
                y: entity.position.z
            },
            {
                x: lookingAtHorizontal.x,
                y: lookingAtHorizontal.z
            })

        const botBox = new Box({ x: botPos.x - 1, y: botPos.z - 1, }, 2, 2);
        const colission = physics.checkCollision(lookingAtHorizontalLine, botBox) ? (danger ? 'red' : 'yellow') : 'aqua'

        bot.viewer.drawBoxGrid('selfBox', botPos.clone().offset(-1, 0, -1), botPos.clone().offset(1, 2, 1), colission)
    })
})

bot.once('spawn', () => {
    mineflayerViewer.mineflayer(bot, { port: 3000 })
})