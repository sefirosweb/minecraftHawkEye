
import { Box, Line } from "detect-collisions"
import { Vec3 } from "vec3"
import { calculateArrowTrayectory, calculateDestinationByYaw, getTargetDistance } from "./hawkEyeEquations"
import { bot, physics } from "./loadBot"
import { Weapons } from "./types"
import { Entity } from 'prismarine-entity'

let listening = false


const radar = () => {

    const detectedEntities = detectAim()
    const selfBox = botBox()
    const selfBoxTall = botBoxTall()
    let prevArrow: Vec3

    Object.values(detectedEntities).forEach(e => {
        e.prevTrajectory.forEach(arrowTrajectory => {

            if (!prevArrow) {
                prevArrow = arrowTrajectory
                return
            }

            const lookingAtLine = new Line(
                {
                    x: prevArrow.x,
                    y: prevArrow.z
                },
                {
                    x: arrowTrajectory.x,
                    y: arrowTrajectory.z
                })

            const distance = getTargetDistance(prevArrow, arrowTrajectory)

            const lookingAtTall = new Line(
                {
                    x: prevArrow.x,
                    y: prevArrow.y
                },
                {
                    x: arrowTrajectory.x,
                    y: arrowTrajectory.y
                })

            if (physics.checkCollision(lookingAtTall, selfBoxTall)) {
                console.clear()
                console.log(bot.entity.position)
                console.log(physics.response)

                // console.log(bot.entity.position)
                // console.log('prevArrow', prevArrow)
                // console.log('arrowTrajectory', arrowTrajectory)
                bot.emit('target_aiming_at_you', e.entity)
            }

            prevArrow = arrowTrajectory



            // if (bot.entity.position.distanceTo(arrowTrajectory) < 2) {
            //     bot.emit('target_aiming_at_you', e.entity)
            // }
        })
    })
}

export const detectAim = () => {
    const selfBox = botBox()
    const entities = Object.values(bot.entities)
        // @ts-ignore PR: https://github.com/PrismarineJS/prismarine-entity/pull/55
        .filter((e) => (e.type === "player" && e.metadata[8] === 1 /* Is loading bow */) || (e.type === 'hostile' && e.name === 'skeleton'))
        .filter(e => {
            const lookingAt = calculateDestinationByYaw(e.position, e.yaw + Math.PI, 100);

            const lookingAtLine = new Line(
                {
                    x: e.position.x,
                    y: e.position.z
                },
                {
                    x: lookingAt.x,
                    y: lookingAt.z
                })

            return physics.checkCollision(lookingAtLine, selfBox)
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
            const calc = calculateArrowTrayectory(e.position, 3, e.pitch, e.yaw, Weapons.bow)
            calculatedEntityTarget[e.uuid] = {
                uuid: e.uuid,
                entity: e,
                name: e.type === "player" ? e.username ?? '' : e.name ?? '',
                prevTrajectory: calc.arrowTrajectoryPoints
            }
        })

    return calculatedEntityTarget
}

export const botBox = () => {
    return new Box({
        x: bot.entity.position.x - 1,
        y: bot.entity.position.z - 1,

    }, 2, 2);
}

export const botBoxTall = () => {
    return new Box({
        x: bot.entity.position.x - 1,
        y: bot.entity.position.y - 1.6,

    }, 2, 2.4);
}

export const start_radar = () => {
    if (listening) return

    listening = true
    bot.on('physicTick', radar)
}

export const stop_radar = () => {
    if (!listening) return
    bot.removeListener('physicTick', radar)
    listening = false
}