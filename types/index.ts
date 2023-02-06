import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Entity } from 'prismarine-entity'

declare module 'mineflayer' {
    interface Bot {
        hawkEye: {
            autoAttack: (target: Entity, weapon: string) => void
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