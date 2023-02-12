import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Entity } from 'prismarine-entity'
import { Block } from 'prismarine-block'
import { detectAim, detectProjectiles } from '../hawkEye'

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
            getMasterGrade: (from: Entity | OptionsMasterGrade, speed: Vec3, weapon: Weapons) => GetMasterGrade | false,
            stop: () => void,
            getPlayer: (name?: string) => Entity | undefined,
            detectProjectiles: (projectile?: string) => ReturnType<typeof detectProjectiles>
            detectAim: () => ReturnType<typeof detectAim>
            calculateArrowTrayectory: (currentPos: Vec3, itemSpeed: number, pitch: number, yaw: number, ammunitionType?: Weapons) => {
                nearestDistance: number | undefined;
                totalTicks: number;
                blockInTrayect: Block;
                arrowTrajectoryPoints: Array<Vec3>;
            }
        }
    }
    interface BotEvents {
        auto_shop_stopped: (target: Entity | OptionsMasterGrade) => void
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