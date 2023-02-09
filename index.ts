import { Bot } from "mineflayer"

import { autoAttack, stop, load } from './src/hawkEye'
import { getPlayer, simplyShot } from './src/botFunctions'
import getMasterGrade from './src/hawkEyeEquations'
import { Weapons } from "./types"

const inject = (bot: Bot) => {
  load(bot)

  bot.hawkEye = {
    oneShot: (from, weapon = Weapons.bow) => autoAttack(from, weapon, true),
    autoAttack: (from, weapon = Weapons.bow) => autoAttack(from, weapon, false),
    getMasterGrade: (from, speed, weapon) => getMasterGrade(bot, from, speed, weapon),
    simplyShot: (yaw, grade) => simplyShot(bot, yaw, grade),
    stop: () => stop(),
    getPlayer: (name?: string) => getPlayer(bot, name)
  }

}

export default inject
