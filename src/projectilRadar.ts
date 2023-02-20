
import { Box } from "detect-collisions"
import { Vec3 } from "vec3"
import { bot, system } from "./loadBot"
import { BoxColission, Weapons } from "./types"
import { Entity } from 'prismarine-entity'
import { calculateArrowTrayectory } from "./calculateArrowTrayectory"
import { calculateDestinationByYaw, calculateImpactToBoundingBox, getBoxes } from "./mathHelper"

let listening = false
const DISTANCE_VISION = 100

const radar = () => {
    const detectedEntities = detectAim()
    const botBoxes = getBotBoxes()
    let prevArrow: Vec3 | undefined

    Object.values(detectedEntities).forEach(e => {
        prevArrow = undefined
        e.prevTrajectory.forEach((arrowTrajectory, i) => {

            if (!prevArrow) {
                prevArrow = arrowTrajectory
                return
            }


            const colission = calculateImpactToBoundingBox(prevArrow, arrowTrajectory, botBoxes)

            if (colission) {
                // calculateImpactToBoundingBox(prevArrow, arrowTrajectory, botBoxes)
                bot.emit('target_aiming_at_you', e.entity, e.prevTrajectory)
            }

            prevArrow = arrowTrajectory
        })
    })
}

export const detectAim = () => {
    const { boxXZ } = getBoxes(getBotBoxes())

    const entities = Object.values(bot.entities)
        // @ts-ignore PR: https://github.com/PrismarineJS/prismarine-entity/pull/55
        .filter((e) => (e.type === "player" && e.metadata[8] === 1 /* Is loading bow */) || (e.type === 'hostile' && e.name === 'skeleton'))
        .filter(e => {

            const eyePosition = e.position.offset(0, 1.6, 0)
            const lookingAt = calculateDestinationByYaw(eyePosition, e.yaw + Math.PI, DISTANCE_VISION)

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

            system.insert(boxXZ)
            const colisionXZ = system.raycast(lookingAtXZ.from, lookingAtXZ.to)
            system.remove(boxXZ)

            return colisionXZ !== null
        })

    const calculatedEntityTarget: Record<string, {
        uuid: string,
        entity: Entity,
        name: string,
        prevTrajectory: Array<Vec3>
    }> = {}

    entities
        .forEach((e) => {
            if (!e.uuid) return
            const calc = calculateArrowTrayectory(e.position.offset(0, 1.6, 0), 3, e.pitch, e.yaw, Weapons.bow)
            calculatedEntityTarget[e.uuid] = {
                uuid: e.uuid,
                entity: e,
                name: e.type === "player" ? e.username ?? '' : e.name ?? '',
                prevTrajectory: calc.arrowTrajectoryPoints
            }
        })

    return calculatedEntityTarget
}

export const getBotBoxes = (): BoxColission => {
    return {
        start: bot.entity.position.offset(-1, -0.5, -1),
        end: bot.entity.position.offset(1, 2.5, 1),
    }
}

export const botBoxTall = () => {
    return new Box({
        x: bot.entity.position.x - 1,
        y: bot.entity.position.y - 1.6,

    }, 2, 2.4);
}

export const startRadar = () => {
    if (listening) return

    listening = true
    bot.on('physicTick', radar)
}

export const stopRadar = () => {
    if (!listening) return
    bot.removeListener('physicTick', radar)
    listening = false
}