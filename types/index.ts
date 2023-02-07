import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Entity } from 'prismarine-entity'
import { Block } from 'prismarine-block'

export type OptionsMasterGrade = {
    position: Vec3,
}

declare module 'mineflayer' {
    interface Bot {
        hawkEye: {
            simplyShot: (yaw: number, pitch: number) => void
            autoAttack: (target: Entity, weapon: string) => void
            getMasterGrade: (target: Entity | OptionsMasterGrade, speed: Vec3, weapon: string) => {
                pitch: number,
                yaw: number,
                grade: number,
                nearestDistance: number,
                target: Vec3,
                arrowTrajectoryPoints: Array<Vec3>,
                blockInTrayect?: Block
            }
        }
    }
}

export interface Bot extends MineflayerBot {
    test: {
        groundY: number,
        sayEverywhere: (msg: string) => void
        clearInventory: () => void
        becomeSurvival: () => void
        becomeCreative: () => void
        fly: (delta: Vec3) => Promise<void>
        resetState: () => Promise<void>
        placeBlock: (slot: number, position: Vec3) => void

        wait: (ms: number) => Promise<void>
    }
}