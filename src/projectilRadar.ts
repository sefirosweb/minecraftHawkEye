
import { detectAim } from "./hawkEye"
import { bot } from "./loadBot"

let listening = false

const radar = () => {
    const entities = detectAim()

    Object.values(entities).forEach(entity => {
        entity.prevTrajectory.forEach(arrowTrajectory => {
            if (bot.entity.position.distanceTo(arrowTrajectory) < 2) {
                bot.emit('target_aiming_at_you', entity.uuid)
            }
        })
    })

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