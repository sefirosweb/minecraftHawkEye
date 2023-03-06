import  "mineflayer";
import { HawkEye, HawkEyeEvents, OptionsMasterGrade, Projectil } from "./index";
import { Entity } from 'prismarine-entity'
import { Vec3 } from "vec3";

declare module 'mineflayer' {
    interface Bot {
        hawkEye: HawkEye
    }

    interface BotEvents extends HawkEyeEvents {
        auto_shot_stopped: (target: Entity | OptionsMasterGrade) => void
        target_aiming_at_you: (entity: Entity, arrowTrajectory: Array<Vec3>) => void
        incoming_projectil: (projectil: Projectil, arrowTrajectory: Array<Vec3>) => void
    }
}