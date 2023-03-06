import { Bot } from "mineflayer"
import { Entity } from 'prismarine-entity';
import { Vec3 } from "vec3";
import { autoAttack, stop, detectProjectiles } from './hawkEye'
import { getPlayer, simplyShot } from './botFunctions'
import getMasterGrade from './hawkEyeEquations'
import loadBot from "./loadBot"
import { startRadar, stopRadar, detectAim } from './projectilRadar'
import { calculateArrowTrayectory } from "./calculateArrowTrayectory"
import { HawkEye, HawkEyeEvents, OptionsMasterGrade, Projectil, Weapons } from "./types";
export * from "./types"

declare module 'mineflayer' {
  interface Bot {
    hawkEye: HawkEye;
  }
  interface BotEvents extends HawkEyeEvents {
    auto_shot_stopped: (target: Entity | OptionsMasterGrade) => void;
    target_aiming_at_you: (entity: Entity, arrowTrajectory: Array<Vec3>) => void;
    incoming_projectil: (projectil: Projectil, arrowTrajectory: Array<Vec3>) => void;
  }
}


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


export default inject
