import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Entity } from 'prismarine-entity'
import { Block } from 'prismarine-block'
import { detectProjectiles } from '../hawkEye'
import getMasterGrade from 'src/hawkEyeEquations'
import { getPlayer } from 'src/botFunctions'
import { detectAim } from 'src/projectilRadar'
import { calculateArrowTrayectory } from 'src/calculateArrowTrayectory'

export type OptionsMasterGrade = {
    position: Vec3,
    isValid: boolean
}

export enum Weapons {
    bow = 'bow',
    crossbow = 'crossbow',
    trident = 'trident',
    ender_pearl = 'ender_pearl',
    snowball = 'snowball',
    egg = 'egg',
    splash_potion = 'splash_potion',
}

export type PropsOfWeapons = {
    GRAVITY: number
    BaseVo: number
    waitTime: number
}

export const weaponsProps: Record<Weapons, PropsOfWeapons> = {
    bow: {
        BaseVo: 3,
        GRAVITY: 0.05,
        waitTime: 1200,
    },
    crossbow: {
        BaseVo: 3.15,
        GRAVITY: 0.05,
        waitTime: 1200,
    },
    trident: {
        BaseVo: 2.5,
        GRAVITY: 0.05,
        waitTime: 1200,
    },
    ender_pearl: {
        BaseVo: 1.5,
        GRAVITY: 0.03,
        waitTime: 150,
    },
    snowball: {
        BaseVo: 1.5,
        GRAVITY: 0.03,
        waitTime: 150,
    },
    egg: {
        BaseVo: 1.5,
        GRAVITY: 0.03,
        waitTime: 150,
    },
    splash_potion: {
        BaseVo: 0.4,
        GRAVITY: 0.03,
        waitTime: 150,
    },
}

export type GetMasterGrade = {
    pitch: number,
    yaw: number,
    grade: number,
    nearestDistance: number,
    target: Vec3,
    arrowTrajectoryPoints: Array<Vec3>,
    blockInTrayect?: Block | null
}

declare module 'mineflayer' {
    interface Bot {
        hawkEye: {
            simplyShot: (yaw: number, pitch: number) => void
            oneShot: (target: Entity, weapon: Weapons) => void
            autoAttack: (target: Entity, weapon: Weapons) => void
            getMasterGrade: (from: Entity | OptionsMasterGrade, speed: Vec3, weapon: Weapons) => ReturnType<typeof getMasterGrade>
            stop: () => void,
            getPlayer: (name?: string) => ReturnType<typeof getPlayer>
            detectProjectiles: (projectile?: string) => ReturnType<typeof detectProjectiles>
            calculateArrowTrayectory: (currentPos: Vec3, itemSpeed: number, pitch: number, yaw: number, ammunitionType?: Weapons) => ReturnType<typeof calculateArrowTrayectory>
        }
    }
    interface BotEvents {
        auto_shop_stopped: (target: Entity | OptionsMasterGrade) => void
        target_aiming_at_you: (target: Entity) => void
        incoming_arrow: (target: Entity) => void
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

export const isEntity = (e: Entity | OptionsMasterGrade): e is Entity => {
    return "type" in e
}

export type Projectil = {
    uuid: string,
    enabled: boolean,
    currentSpeed: number // Vo,
    currentSpeedTime: number
    previusPositions: Array<{
        at: number,
        pos: Vec3
    }>,
    updatedAt: number
}