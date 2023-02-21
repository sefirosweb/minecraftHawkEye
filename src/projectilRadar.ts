
import { Box, Line, System, Vector } from "detect-collisions"
import { Vec3 } from "vec3"
import { bot } from "./loadBot"
import { BoxColission, Weapons } from "./types"
import { Entity } from 'prismarine-entity'
import { calculateArrowTrayectory } from "./calculateArrowTrayectory"
import { calculateDestinationByYaw, calculateImpactToBoundingBox, calculateYaw, calculayePitch, getBoxes } from "./mathHelper"
import { detectProjectiles } from './hawkEye'

let listening = false
const DISTANCE_VISION = 100

const radar = () => {
    const detectedEntities = detectAim()
    const botBoxes = getBotBoxes()
    let prevArrow: Vec3 | undefined

    Object.values(detectedEntities).forEach(e => {
        prevArrow = undefined

        e.prevTrajectory.forEach((arrowTrajectory) => {

            if (!prevArrow) {
                prevArrow = arrowTrajectory
                return
            }

            const colission = calculateImpactToBoundingBox(prevArrow, arrowTrajectory, botBoxes)

            if (colission) {
                bot.emit('target_aiming_at_you', e.entity, e.prevTrajectory)
            }

            prevArrow = arrowTrajectory
        })
    })

    const projectiles = detectProjectiles()
    projectiles.forEach(p => {
        if (p.previusPositions.length < 2) return

        const lastItem = p.previusPositions[p.previusPositions.length - 1]
        const lastItem2 = p.previusPositions[p.previusPositions.length - 2]

        if (lastItem.pos.equals(lastItem2.pos)) {
            return
        }

        const yaw = calculateYaw(lastItem2.pos, lastItem.pos)
        const pitch = calculayePitch(lastItem2.pos, lastItem.pos)

        const arrowTrajectoryPoints = bot.hawkEye.calculateArrowTrayectory(lastItem.pos, p.currentSpeed, pitch, yaw, Weapons.bow).arrowTrajectoryPoints
        if (arrowTrajectoryPoints.length < 2) return

        for (let pi = 1; pi < arrowTrajectoryPoints.length; pi++) {
            const prevousArrow = arrowTrajectoryPoints[pi - 1]
            const currentArrow = arrowTrajectoryPoints[pi]

            const colission = calculateImpactToBoundingBox(prevousArrow, currentArrow, botBoxes)

            if (colission) {
                // @ts-ignore
                bot.emit('incoming_projectil', p, arrowTrajectoryPoints)
                return
            }

        }

        // console.log(p)
    })
}

export const detectAim = () => {
    const system = new System();
    const { boxXZ } = getBoxes(getBotBoxes())
    const entities = Object.values(bot.entities)
        // @ts-ignore PR: https://github.com/PrismarineJS/prismarine-entity/pull/55
        .filter((e) => (e.type === "player" && (e.metadata[8] === 1 || e.metadata[8] === 3) /* Is loading bow */) || (e.type === 'mob' && e.name === 'skeleton'))
        .filter(e => {
            if (e.name === 'skeleton' && e.position.distanceTo(bot.entity.position) > 16) return false
            if (e.name === 'skeleton' && e.position.distanceTo(bot.entity.position) <= 16) return true


            const eyePosition = e.position.offset(0, 1.6, 0)
            const lookingAt = calculateDestinationByYaw(eyePosition, e.yaw + Math.PI, DISTANCE_VISION)

            const rayXZStart: Vector = { x: eyePosition.x, y: eyePosition.z }
            const rayXZEnd: Vector = { x: lookingAt.x, y: lookingAt.z }

            const ray = new Line(rayXZStart, rayXZEnd)
            const colisionXZ = system.checkCollision(ray, boxXZ)
            return colisionXZ
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