import mineflayer, { Bot } from 'mineflayer'
import mineflayerViewer from 'prismarine-viewer'
import { Vec3 } from 'vec3'
import minecraftHawkEye from '../src/index'
import { calculateRayCast, calculateDestinationByYaw, calculateImpactToBoundingBox } from '../src/mathHelper'
import { Entity } from 'prismarine-entity'
import { getBotBoxes } from '../src/projectilRadar'
import { Projectil } from '../src/types'

type ModdedBot = Bot & { viewer }

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'localhost',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Guard',
    password: process.argv[5],
    viewDistance: 'far'
}) as ModdedBot

bot.loadPlugin(minecraftHawkEye)

const DISTANCE_VISION = 100
let danger: number | undefined

bot.once('spawn', () => {
    mineflayerViewer.mineflayer(bot, { port: 3000 })
})

bot.on('spawn', () => {
    bot.chat('/kill @e[type=arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} shield 1`)
    bot.chat('/time set day')
    bot.chat('Ready!')

    bot.hawkEye.startRadar()

    setInterval(() => {
        if (danger && Date.now() - danger > 4000) {
            danger = undefined
            bot.viewer.erase('detectedPlayerAim')
            bot.deactivateItem()
        }
    }, 400)

    bot.on('physicTick', startRadarViewer)
    bot.on('target_aiming_at_you', targetAimingAtYou)
    bot.on('incoming_projectil', detectedIncomingArrow)

    bot.on('death', () => {
        bot.removeListener('physicTick', startRadarViewer)
        bot.removeListener('target_aiming_at_you', targetAimingAtYou)
        bot.removeListener('incoming_projectil', detectedIncomingArrow)
    })
})

const upShield = (entity: Entity) => {
    danger = Date.now()
    bot.lookAt(entity.position, true)
    bot.activateItem()
}

const detectedIncomingArrow = (projectil: Projectil, arrowTrajectory: Array<Vec3>) => {
    console.log('detected arrow!', Date.now())
    bot.viewer.drawPoints('incomingArrows', arrowTrajectory, 'orange')
    upShield(projectil.entity)
}

const targetAimingAtYou = (entity: Entity, arrowTrajectory: Array<Vec3>) => {
    console.log('detected!', entity.username ?? entity.name, Date.now())
    danger = Date.now()
    upShield(entity)
    bot.viewer.drawPoints('detectedPlayerAim', arrowTrajectory, 'red')
}

// Visible function to see what "see" the bot
const startRadarViewer = () => {
    const entity = Object.values(bot.entities)
        .find(e => e.username === 'Lordvivi')
    if (!entity) return

    const eyePosition = entity.position.offset(0, 1.6, 0)

    const lookingAtHorizontal = calculateDestinationByYaw(eyePosition, entity.yaw + Math.PI, DISTANCE_VISION)
    const lookingAt = calculateRayCast(eyePosition, entity.pitch, entity.yaw + Math.PI, DISTANCE_VISION)
    bot.viewer.drawLine('entitySee', [eyePosition, lookingAt], 'orange')
    bot.viewer.drawLine('entitySeeH', [eyePosition, lookingAtHorizontal], 'yellow')

    const botBoxes = getBotBoxes()
    const colission = calculateImpactToBoundingBox(eyePosition, lookingAt, botBoxes)
    const boxColor = colission ? (danger ? 'red' : 'yellow') : 'aqua'

    bot.viewer.drawBoxGrid('selfBox1', botBoxes.start, botBoxes.end, boxColor)
}
