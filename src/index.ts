import { Bot } from "mineflayer"
import { autoAttack, stop, detectProjectiles } from './hawkEye'
import { getPlayer, simplyShot } from './botFunctions'
import getMasterGrade, { calculateArrowTrayectory } from './hawkEyeEquations'
import { Weapons } from "./types"
import loadBot from "./loadBot"
import { start_radar, stop_radar, detectAim } from './projectilRadar'

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
    start_radar,
    stop_radar
  }
}

export default inject
