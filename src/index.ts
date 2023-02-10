import { Bot } from "mineflayer"

import { autoAttack, stop, load } from './hawkEye'
import { getPlayer, simplyShot } from './botFunctions'
import getMasterGrade, { calculateArrowTrayectory } from './hawkEyeEquations'
import { Weapons } from "./types"

const inject = (bot: Bot) => {
  load(bot)

  bot.hawkEye = {
    oneShot: (from, weapon = Weapons.bow) => autoAttack(from, weapon, true),
    autoAttack: (from, weapon = Weapons.bow) => autoAttack(from, weapon, false),
    getMasterGrade: (from, speed, weapon) => getMasterGrade(bot, from, speed, weapon),
    simplyShot: (yaw, grade) => simplyShot(bot, yaw, grade),
    stop: () => stop(),
    getPlayer: (name?: string) => getPlayer(bot, name),
    calculateArrowTrayectory: calculateArrowTrayectory
  }
}

export default inject
