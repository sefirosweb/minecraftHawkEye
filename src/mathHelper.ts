import { Vec3 } from "vec3"
import { Vec2 } from "./types"

export const getTargetDistance = (origin: Vec3, destination: Vec3) => {
    const xDistance = Math.pow(origin.x - destination.x, 2)
    const zDistance = Math.pow(origin.z - destination.z, 2)
    const hDistance = Math.sqrt(xDistance + zDistance)

    const yDistance = destination.y - origin.y

    const distance = Math.sqrt(Math.pow(yDistance, 2) + xDistance + zDistance)

    return {
        distance,
        hDistance,
        yDistance
    }
}

export const calculateAngle = (from: Vec2, to: Vec2) => {
    const xDistance = to.x - from.x
    const yDistance = to.y - from.y
    const yaw = Math.atan2(xDistance, yDistance) + Math.PI
    return yaw
}

export const calculateYaw = (from: Vec3, to: Vec3) => {

    const yaw = calculateAngle({
        x: from.x,
        y: from.z
    }, {
        x: to.x,
        y: to.z
    })

    return yaw
}

export const calculateDestinationByYaw = (origin: Vec3, yaw: number, distance: number) => {
    const x = distance * Math.sin(yaw)
    const z = distance * Math.cos(yaw)
    return origin.offset(x, 0, z)
}

export const calculateDestinationByPitch = (origin: Vec3, pitch: number, distance: number) => {
    const y = distance * Math.sin(pitch)
    return origin.offset(0, y, 0)
}

export const calculateRayCast = (origin: Vec3, pitch: number, yaw: number, distance: number) => {
    const x = distance * Math.sin(yaw) * Math.cos(pitch);
    const y = distance * Math.sin(pitch);
    const z = distance * Math.cos(yaw) * Math.cos(pitch);
    return origin.offset(x, y, z)
}

export const calculayePitch = (origin: Vec3, destination: Vec3) => {
    const { hDistance, yDistance } = getTargetDistance(origin, destination)
    const pitch = Math.atan2(yDistance, hDistance)
    return pitch
}

export const degreesToRadians = (degrees: number) => {
    return degrees * Math.PI / 180
}

export const radiansToDegrees = (radians: number) => {
    return radians * (180 / Math.PI)
}

export const getVox = (Vo: number, Alfa: number, Resistance = 0) => {
    return Vo * Math.cos(Alfa) - Resistance
}

export const getVoy = (Vo: number, Alfa: number, Resistance = 0) => {
    return Vo * Math.sin(Alfa) - Resistance
}

export const getVo = (Vox: number, Voy: number, G: number) => {
    return Math.sqrt(Math.pow(Vox, 2) + Math.pow(Voy - G, 2)) // New Total Velocity - Gravity
}

export const applyGravityToVoy = (Vo: number, Voy: number, Gravity: number) => { // radians
    return Math.asin((Voy - Gravity) / Vo)
}
