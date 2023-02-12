import mineflayer from 'mineflayer'
//@ts-ignore
import mineflayerViewer from 'prismarine-viewer'
import { Vec3 } from 'vec3'
import minecraftHawkEye from '../src/index'
import { Weapons } from '../src/types'
import { Entity } from 'prismarine-entity'
import { calculateYaw, calculayePitch } from '../src/hawkEyeEquations'
import { detectAim } from '../src/hawkEye'

// first install the dependency
// npm i mineflayer prismarine-viewer minecrafthawkeye

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'host.docker.internal',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Archer',
    password: process.argv[5],
    viewDistance: 'far'
})


let intervalShot: ReturnType<typeof setInterval>
let intervalPreview: ReturnType<typeof setInterval>
let target: Entity | undefined

bot.on('spawn', () => {
    bot.chat('/kill @e[type=minecraft:arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 300`)
    bot.chat('/time set day')
    bot.chat('Ready!')

    setTimeout(() => {
        target = bot.hawkEye.getPlayer()
        intervalShot = setInterval(fire, 5000)
        intervalPreview = setInterval(shotPreview, 4000)
    }, 4000)

    setTimeout(() => {
        bot.on('physicTick', () => {

            const projectiles = bot.hawkEye.detectProjectiles()
            if (projectiles.length > 0) {
                projectiles.forEach((p) => {
                    if (p.previusPositions.length < 2) return

                    const lastItem = p.previusPositions[p.previusPositions.length - 1]
                    const lastItem2 = p.previusPositions[p.previusPositions.length - 2]

                    if (lastItem.pos.equals(lastItem2.pos)) {
                        return '';
                    }

                    const yaw = calculateYaw(lastItem2.pos, lastItem.pos)
                    const pitch = calculayePitch(lastItem2.pos, lastItem.pos)

                    const res = bot.hawkEye.calculateArrowTrayectory(lastItem.pos, p.currentSpeed, pitch, yaw, Weapons.bow)

                    //@ts-ignore
                    bot.viewer.drawPoints(`arrowPremonition_${p.uuid}`, p.previusPositions.map(prev => prev.pos).concat(res.arrowTrajectoryPoints), 0xffff00, 5)

                    setTimeout(() => {
                        //@ts-ignore
                        bot.viewer.erase(`arrowPremonition_${p.uuid}`)
                    }, 10000);

                })
            }

            const detectedAim = bot.hawkEye.detectAim()
            Object.values(detectedAim).forEach(e =>{
                  //@ts-ignore
                  bot.viewer.drawPoints(`arrowPremonition_${e.uuid}`, e.prevTrajectory, 0xffffff, 5)
            })

        })
    }, 4000)
})

bot.on('death', () => {
    clearInterval(intervalShot)
    clearInterval(intervalPreview)
})

bot.once('spawn', () => {
    bot.loadPlugin(() => minecraftHawkEye(bot))
    mineflayerViewer.mineflayer(bot, { port: 3000 })
})

const shotPreview = () => {
    //@ts-ignore
    bot.viewer.erase('arrowTrajectoryPoints')
    if (target) {
        const masterGrade = bot.hawkEye.getMasterGrade(target, new Vec3(0, 0, 0), Weapons.bow)
        // const res = bot.hawkEye.calculateArrowTrayectory(bot.entity.position.clone(), new Vec3(1, 0, 0))

        if (masterGrade) {
            //@ts-ignore
            bot.viewer.drawPoints('arrowTrajectoryPoints', masterGrade.arrowTrajectoryPoints, 0xff0000, 5)
        }
    }
}

const fire = () => {
    if (target) {
        bot.hawkEye.oneShot(target, Weapons.bow)
    }
}