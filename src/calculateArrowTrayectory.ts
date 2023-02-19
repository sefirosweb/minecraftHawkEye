import { Vec3 } from 'vec3'
import { FACTOR_H, FACTOR_Y } from './constants'
import {applyGravityToVoy, getVo, getVox, getVoy} from './hawkEyeEquations'
import { Weapons, weaponsProps } from './types'
import { Block } from 'prismarine-block'
import { check } from './intercept'

export const calculateArrowTrayectory = (currentPos: Vec3, itemSpeed: number, pitch: number, yaw: number, ammunitionType?: Weapons) => {
    const weapon = ammunitionType ?? Weapons.bow

    if (!Object.keys(Weapons).includes(weapon)) {
        throw new Error(`${weapon} is not valid to calculate the trayectory!`)
    }
    const weaponGravity = weaponsProps[weapon].GRAVITY
    const res = staticCalc(currentPos, weaponGravity, pitch, yaw, itemSpeed)

    return res
}

const staticCalc = (initialArrowPosition: Vec3, gravityIn: number, pitch: number, yaw: number, VoIn: number, precision = 1) => {
    let Vo = VoIn
    const gravity = gravityIn / precision
    const factorY = FACTOR_Y / precision
    const factorH = FACTOR_H / precision

    let Voy = getVoy(Vo, pitch) // Vector Y
    let Vox = getVox(Vo, pitch) // Vector X
    let Vy = Voy / precision
    let Vx = Vox / precision
    let Alfa

    let totalTicks = 0

    let blockInTrayect: Block | null = null
    const arrowTrajectoryPoints = []
    arrowTrajectoryPoints.push(initialArrowPosition)

    while (true) {
        totalTicks += (1 / precision)

        Vo = getVo(Vox, Voy, gravity)
        Alfa = applyGravityToVoy(Vo, Voy, gravity)

        Voy = getVoy(Vo, Alfa, Voy * factorY)
        Vox = getVox(Vo, Alfa, Vox * factorH)

        Vy += Voy / precision
        Vx += Vox / precision

        const x = initialArrowPosition.x - (Math.sin(yaw) * Vx)
        const z = yaw === 0 ? initialArrowPosition.z : initialArrowPosition.z - (Math.sin(yaw) * Vx / Math.tan(yaw))
        const y = initialArrowPosition.y + Vy

        const currentArrowPosition = new Vec3(x, y, z)

        arrowTrajectoryPoints.push(currentArrowPosition)
        const previusArrowPositionIntercept = arrowTrajectoryPoints[arrowTrajectoryPoints.length === 1 ? 0 : arrowTrajectoryPoints.length - 2]

        blockInTrayect = check(previusArrowPositionIntercept, currentArrowPosition).block

        if (blockInTrayect !== null) {
            return {
                totalTicks,
                blockInTrayect,
                arrowTrajectoryPoints
            }
        }
    }
}