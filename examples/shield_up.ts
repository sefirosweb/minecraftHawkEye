import { Box, RaycastHit } from 'detect-collisions'
import mineflayer, { Bot } from 'mineflayer'
import mineflayerViewer from 'prismarine-viewer'
import { Vec3 } from 'vec3'
import { calculateAngle, calculateRayCast } from '../src/hawkEyeEquations'
import minecraftHawkEye from '../src/index'
import { system } from '../src/loadBot'

type ModdedBot = Bot & { viewer }

type RaycastHitAngle = RaycastHit & {
    angle: number
}

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
const boxSize = 2

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
        const botPos = bot.entity.position.clone()

        const entity = Object.values(bot.entities)
            .find(e => e.username === 'Lordvivi')
        if (!entity) return

        const eyePosition = entity.position.offset(0, 1.6, 0)

        const lookingAt = calculateRayCast(eyePosition, entity.pitch, entity.yaw + Math.PI, DISTANCE_VISION)
        bot.viewer.drawLine('entitySee', [eyePosition, lookingAt], 'orange')

        writingPost.push(lookingAt)
        // bot.viewer.drawPoints('entitySeePos', writingPost, 'red')

        // if (entity.position.x === lookingAt.x && entity.position.z === lookingAt.z) return



        const lookingAtXZ =
        {
            from: {
                x: eyePosition.x,
                y: eyePosition.z
            },
            to: {
                x: lookingAt.x,
                y: lookingAt.z
            }
        }

        const lookingAtXY =
        {
            from: {
                x: eyePosition.x,
                y: eyePosition.y
            },
            to:
            {
                x: lookingAt.x,
                y: lookingAt.y
            }
        }

        const lookingAtZY =
        {
            from: {
                x: eyePosition.z,
                y: eyePosition.y
            },
            to:
            {
                x: lookingAt.z,
                y: lookingAt.y
            }
        }




        const botBoxXZ = new Box({ x: botPos.x - boxSize / 2, y: botPos.z - boxSize / 2 }, boxSize, boxSize, { isCentered: true });
        const botBoxXY = new Box({ x: botPos.x - boxSize / 2, y: botPos.y - boxSize / 2 }, boxSize, boxSize, { isCentered: true });
        const botBoxZY = new Box({ x: botPos.z - boxSize / 2, y: botPos.y - boxSize / 2 }, boxSize, boxSize, { isCentered: true });

        console.clear()

        system.insert(botBoxXZ)
        const colisionXZ = system.raycast(lookingAtXZ.from, lookingAtXZ.to) as RaycastHitAngle
        if (colisionXZ) {
            bot.viewer.drawPoints('drawPointXZ', [new Vec3(colisionXZ.point.x, botPos.y, colisionXZ.point.y)], 'blue')
            const angle = calculateAngle(lookingAtXZ.from, lookingAtXZ.to)
            colisionXZ.angle = angle

        } else {
            bot.viewer.erase('drawPointXZ')
        }
        system.remove(botBoxXZ)


        system.insert(botBoxXY)
        const colisionXY = system.raycast(lookingAtXY.from, lookingAtXY.to) as RaycastHitAngle
        if (colisionXY) {
            bot.viewer.drawPoints('drawPointXY', [new Vec3(colisionXY.point.x, colisionXY.point.y, botPos.z)], 'gray')
            const angle = calculateAngle(lookingAtXY.from, lookingAtXY.to)
            colisionXY.angle = angle
        } else {
            bot.viewer.erase('drawPointXY')
        }
        system.remove(botBoxXY)


        system.insert(botBoxZY)
        const colisionZY = system.raycast(lookingAtZY.from, lookingAtZY.to) as RaycastHitAngle
        if (colisionZY) {
            bot.viewer.drawPoints('drawPointZY', [new Vec3(botPos.x, colisionZY.point.y, colisionZY.point.x)], 'green')
            const angle = calculateAngle(lookingAtZY.from, lookingAtZY.to)
            colisionZY.angle = angle
        } else {
            bot.viewer.erase('drawPointZY')
        }
        system.remove(botBoxZY)


        console.log(colisionXZ?.angle)

        const back = colisionXZ?.angle > Math.PI / 2 && colisionXZ?.angle < (Math.PI / 2 + Math.PI)
        const front = !back

        const right = colisionXZ?.angle > Math.PI
        const left = !right

        // console.log({ front })
        // console.log({ back })
        // console.log({ right })
        // console.log({ left })

        let colission = 'aqua'
        if (
            colisionXZ
            && colisionXY
            && colisionZY
        ) {

            console.log('colisionXZ', colisionXZ.point)
            console.log('colisionXY', colisionXY.point)
            console.log('colisionZY', colisionZY.point)



            const front =
                botBoxXZ.maxY === colisionXZ.point.y && botBoxXY.maxY === colisionXY.point.y && botBoxZY.maxX === colisionZY.point.x ||
                botBoxXZ.maxY === colisionXZ.point.y && botBoxXY.minX === colisionXY.point.x && botBoxZY.maxX === colisionZY.point.x

            console.log({ front })


            colission = danger ? 'red' : 'yellow'
            const backFront = new Vec3(colisionXZ.point.x, colisionZY.point.y, colisionZY.point.x)
            bot.viewer.drawPoints('hitPlayer', [backFront], 'red')
        } else {
            bot.viewer.erase('hitPlayer')
        }

        bot.viewer.drawBoxGrid('selfBox', botPos.clone().offset(-(boxSize / 2), -(boxSize / 2), -(boxSize / 2)), botPos.clone().offset(boxSize / 2, (boxSize / 2), boxSize / 2), colission)
    })
})

bot.once('spawn', () => {
    mineflayerViewer.mineflayer(bot, { port: 3000 })
})