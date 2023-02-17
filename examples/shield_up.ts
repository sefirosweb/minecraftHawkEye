import { Box, Line } from 'detect-collisions'
import mineflayer from 'mineflayer'
//@ts-ignore
import mineflayerViewer from 'prismarine-viewer'
import { calculateDestinationByYaw } from '../src/hawkEyeEquations'
import minecraftHawkEye from '../src/index'
import { physics } from '../src/loadBot'
import THREE, { Box3 } from 'three'

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'localhost',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
    username: process.argv[4] ? process.argv[4] : 'Guard',
    password: process.argv[5],
    viewDistance: 'far'
})
bot.loadPlugin(minecraftHawkEye)

let danger: number | undefined

bot.on('spawn', () => {
    bot.chat('/kill @e[type=arrow]')
    bot.chat('/clear')
    bot.chat(`/give ${bot.username} shield 1`)
    bot.chat('/time set day')
    bot.chat('Ready!')

    // bot.hawkEye.start_radar()
    console.log(bot.registry)
    
    const registry = bot.registry

    bot.on('target_aiming_at_you', (entity) => {
        console.log('detected!', entity.username ?? entity.name, Date.now())
        danger = Date.now()

        bot.lookAt(entity.position, true)
        bot.activateItem()

        // console.clear()
        // console.log(entity.metadata)
        // console.log(entity.metadata[8])
    })

    setInterval(() => {
        if (danger && Date.now() - danger > 4000) {
            danger = undefined
            bot.deactivateItem()
        }
    }, 400)

    bot.on('physicTick', () => {

        const botPos = bot.entity.position

        const start = new THREE.Vector3(botPos.x, botPos.y, botPos.z)

        const entity = Object.values(bot.entities)
            .find(e => e.username === 'Lordvivi')
        if (!entity) return

        const lookingAt = calculateDestinationByYaw(entity.position, entity.yaw + Math.PI, 100);
        const lookingAtThree = new THREE.Vector3(lookingAt.x, lookingAt.y, lookingAt.z)

        const rayBox3 = new THREE.Raycaster(new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z), new THREE.Vector3(lookingAt.x, lookingAt.y, lookingAt.z));
        const sceneMeshes: THREE.Object3D[] = []
        
        const botBox3 = new Box3(new THREE.Vector3(botPos.x - 1, botPos.y, botPos.z - 1), new THREE.Vector3(botPos.x + 1, botPos.y + 2, botPos.z + 1));

        const obb = new THREE.Object3D()
        
        // sceneMeshes.push(botBox)
        // console.log(rayBox3.intersectObjects();




        //@ts-ignore
        bot.viewer.drawLine('entitySee', [entity.position.offset(0, 1.6, 0), lookingAt.offset(0, 1.6, 0)], 'red')

        const botBox = new Box({
            x: botPos.x - 1,
            y: botPos.z - 1,

        }, 2, 2);

        const lookingAtLine = new Line(
            {
                x: entity.position.x,
                y: entity.position.z
            },
            {
                x: lookingAt.x,
                y: lookingAt.z
            })

        const colission = physics.checkCollision(lookingAtLine, botBox) ? (danger ? 'red' : 'yellow') : 'aqua'

        //@ts-ignore
        bot.viewer.drawBoxGrid('selfBox', botPos.clone().offset(-1, 0, -1), botPos.clone().offset(1, 2, 1), colission)
    })
})

bot.once('spawn', () => {
    mineflayerViewer.mineflayer(bot, { port: 3000 })
})


// bot.on('death', () => {
// })