import { Bot } from "mineflayer"
import { autoAttack, stop, detectProjectiles } from './hawkEye'
import { getPlayer, simplyShot } from './botFunctions'
import getMasterGrade from './hawkEyeEquations'
import { Weapons } from "./types"
import loadBot from "./loadBot"
import { startRadar, stopRadar, detectAim } from './projectilRadar'
import { calculateArrowTrayectory } from "./calculateArrowTrayectory"

const inject = (bot: Bot) => {
  loadBot(bot)

  bot.hawkEye = {
    oneShot: (from, weapon = Weapons.bow) => autoAttack(from, weapon, true),
    autoAttack: (from, weapon = Weapons.bow) => autoAttack(from, weapon, false),
    getMasterGrade,
    simplyShot,
    stop,
    getPlayer,
    calculateArrowTrayectory,
    detectProjectiles,
    detectAim,
    startRadar,
    stopRadar
  }
}

export { HawkEye, HawkEyeEvents } from './types'

export default inject
