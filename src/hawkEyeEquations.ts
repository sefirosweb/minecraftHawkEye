import { Bot } from 'mineflayer'
import { GetMasterGrade, isEntity, OptionsMasterGrade, PropsOfWeapons, Weapons, weaponsProps } from './types'
import { Entity } from 'prismarine-entity'
import { Block } from 'prismarine-block'
import { Vec3 } from 'vec3'
import interceptLoader from './intercept'
import { bot } from './loadBot'

let target: Entity | OptionsMasterGrade
let speed: Vec3
let startPosition: Vec3
let targetPosition: Vec3
let intercept: ReturnType<typeof interceptLoader>

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

export const calculateYaw = (origin: Vec3, destination: Vec3) => {
  const xDistance = destination.x - origin.x
  const zDistance = destination.z - origin.z
  const yaw = Math.atan2(xDistance, zDistance) + Math.PI
  return yaw
}

export const calculayePitch = (origin: Vec3, destination: Vec3) => {
  const { hDistance, yDistance } = getTargetDistance(origin, destination)
  const pitch = Math.atan2(yDistance, hDistance)
  return pitch
}

const degreesToRadians = (degrees: number) => {
  const pi = Math.PI
  return degrees * (pi / 180)
}

const radiansToDegrees = (radians: number) => {
  const pi = Math.PI
  return radians * (180 / pi)
}

const getVox = (Vo: number, Alfa: number, Resistance = 0) => {
  return Vo * Math.cos(Alfa) - Resistance
}

const getVoy = (Vo: number, Alfa: number, Resistance = 0) => {
  return Vo * Math.sin(Alfa) - Resistance
}

const getVo = (Vox: number, Voy: number, G: number) => {
  return Math.sqrt(Math.pow(Vox, 2) + Math.pow(Voy - G, 2)) // New Total Velocity - Gravity
}

const applyGravityToVoy = (Vo: number, Voy: number, Gravity: number) => { // radians
  return Math.asin((Voy - Gravity) / Vo)
}

// Simulate Arrow Trayectory
const tryGrade = (grade: number, xDestination: number, yDestination: number, VoIn: number, tryIntercetpBlock = false) => {
  let precisionFactor = 1 // !Danger More precision increse the calc! =>  !More Slower!

  let Vo = VoIn
  let gravity = GRAVITY / precisionFactor
  let factorY = FACTOR_Y / precisionFactor
  let factorH = FACTOR_H / precisionFactor

  // Vo => Vector total velocity (X,Y,Z)
  // For arrow trayectory only need the horizontal discante (X,Z) and verticla (Y)
  let Voy = getVoy(Vo, degreesToRadians(grade)) // Vector Y
  let Vox = getVox(Vo, degreesToRadians(grade)) // Vector X
  let Vy = Voy / precisionFactor
  let Vx = Vox / precisionFactor
  let Alfa

  let nearestDistance: number | undefined
  let totalTicks = 0

  let blockInTrayect: Block | null = null
  const arrowTrajectoryPoints = []
  const yaw = calculateYaw(startPosition, targetPosition)

  while (true) {
    const firstDistance = Math.sqrt(Math.pow(Vy - yDestination, 2) + Math.pow(Vx - xDestination, 2))

    if (nearestDistance === undefined) {
      nearestDistance = firstDistance
    }

    if (firstDistance < nearestDistance) {
      nearestDistance = firstDistance
    }

    // Increse precission when arrow is near over target,
    // Dynamic Precission, when arrow is near target increse * the precission !Danger with this number
    if (nearestDistance < 4) {
      precisionFactor = 5
    }
    if (nearestDistance > 4) {
      precisionFactor = 1
    }

    totalTicks += (1 / precisionFactor)
    gravity = GRAVITY / precisionFactor
    factorY = FACTOR_Y / precisionFactor
    factorH = FACTOR_H / precisionFactor

    Vo = getVo(Vox, Voy, gravity)
    Alfa = applyGravityToVoy(Vo, Voy, gravity)

    Voy = getVoy(Vo, Alfa, Voy * factorY)
    Vox = getVox(Vo, Alfa, Vox * factorH)

    Vy += Voy / precisionFactor
    Vx += Vox / precisionFactor

    const x = startPosition.x - (Math.sin(yaw) * Vx)
    const z = yaw === 0 ? startPosition.z : startPosition.z - (Math.sin(yaw) * Vx / Math.tan(yaw))
    const y = startPosition.y + Vy

    const currentArrowPosition = new Vec3(x, y, z)
    arrowTrajectoryPoints.push(currentArrowPosition)
    const previusArrowPositionIntercept = arrowTrajectoryPoints[arrowTrajectoryPoints.length === 1 ? 0 : arrowTrajectoryPoints.length - 2]
    if (tryIntercetpBlock) {
      blockInTrayect = intercept.check(previusArrowPositionIntercept, currentArrowPosition).block
    }

    // Arrow passed player || Voy (arrow is going down and passed player) || Detected solid block
    if (Vx > xDestination || (Voy < 0 && yDestination > Vy) || blockInTrayect !== null) {
      return {
        nearestDistance,
        totalTicks,
        blockInTrayect,
        arrowTrajectoryPoints
      }
    }
  }
}

// Get more precision on shot
const getPrecisionShot = (grade: number, xDestination: number, yDestination: number, decimals: number) => {
  let nearestDistance: number | undefined
  let nearestGrade: number | undefined
  let arrowTrajectoryPoints: Array<Vec3> | undefined
  let blockInTrayect: Block | null = null

  decimals = Math.pow(10, decimals)

  for (let iGrade = (grade * 10) - 10; iGrade <= (grade * 10) + 10; iGrade += 1) {
    const distance = tryGrade(iGrade / decimals, xDestination, yDestination, BaseVo, true)
    if (nearestDistance === undefined || (distance.nearestDistance < nearestDistance)) {
      nearestDistance = distance.nearestDistance
      nearestGrade = iGrade
      arrowTrajectoryPoints = distance.arrowTrajectoryPoints
      blockInTrayect = distance.blockInTrayect
    }
  }

  if (nearestDistance === undefined || nearestGrade === undefined || arrowTrajectoryPoints === undefined) {
    throw Error('Error con calc getPrecisionShot')
  }

  return {
    nearestGrade,
    nearestDistance,
    arrowTrajectoryPoints,
    blockInTrayect
  }
}

// Calculate all 180º first grades
// Calculate the 2 most aproax shots
// https://es.qwe.wiki/wiki/Trajectory

type TryGrade = ReturnType<typeof tryGrade> & { grade: number }
const getFirstGradeAproax = (xDestination: number, yDestination: number) => {
  let firstFound = false
  let nearestGradeFirst: TryGrade | undefined
  let nearestGradeSecond: TryGrade | undefined

  for (let grade = -89; grade < 90; grade++) {
    const calculatedTryGrade = tryGrade(grade, xDestination, yDestination, BaseVo)

    const tryGradeShot: TryGrade = {
      ...calculatedTryGrade,
      grade
    }

    if (tryGradeShot.nearestDistance > 4) {
      continue
    }

    if (nearestGradeFirst === undefined) {
      nearestGradeFirst = tryGradeShot
    }

    if (nearestGradeSecond === undefined) {
      nearestGradeSecond = tryGradeShot
    }

    if (tryGradeShot.grade - nearestGradeFirst.grade > 10 && firstFound === false) {
      firstFound = true
      nearestGradeSecond = tryGradeShot
    }

    if (nearestGradeFirst.nearestDistance > tryGradeShot.nearestDistance && firstFound === false) {
      nearestGradeFirst = tryGradeShot
    }

    if (nearestGradeSecond.nearestDistance > tryGradeShot.nearestDistance && firstFound) {
      nearestGradeSecond = tryGradeShot
    }
  }

  if (nearestGradeFirst === undefined && nearestGradeSecond === undefined) {
    return false
  }

  if (nearestGradeFirst === undefined || nearestGradeSecond === undefined) {
    throw Error('Error on calculate getFirstGradeAproax')
  }

  return {
    nearestGradeFirst,
    nearestGradeSecond
  }
}

// Physics factors
let BaseVo: number // Power of shot
let GRAVITY = 0.05 // Arrow Gravity // Only for arrow for other entities have different gravity
const FACTOR_Y = 0.01 // Arrow "Air resistance" // In water must be changed
const FACTOR_H = 0.01 // Arrow "Air resistance" // In water must be changed

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

    blockInTrayect = intercept?.check(previusArrowPositionIntercept, currentArrowPosition).block

    if (blockInTrayect !== null) {
      return {
        totalTicks,
        blockInTrayect,
        arrowTrajectoryPoints
      }
    }
  }
}


const getMasterGrade = (targetIn: OptionsMasterGrade | Entity, speedIn: Vec3, weapon: Weapons): GetMasterGrade | false => {
  if (!Object.keys(Weapons).includes(weapon)) {
    throw new Error(`${weapon} is not valid weapon for calculate the grade!`)
  }

  const weaponProp = weaponsProps[weapon]
  BaseVo = weaponProp.BaseVo
  GRAVITY = weaponProp.GRAVITY

  intercept = interceptLoader(bot)
  target = targetIn
  speed = speedIn

  startPosition = bot.entity.position.offset(0, 1.6, 0) // Bow offset position

  // Calculate target Height, for shot in the heart  =P
  const targetHeight: number = !isEntity(target) ? 0 : (target.type === 'player' ? 1.16 : (target.height ?? 0))
  targetPosition = target.position.offset(0, targetHeight, 0)

  // Check the first best trayectory
  let distances = getTargetDistance(startPosition, targetPosition)
  let shotCalculation = geBaseCalculation(distances.hDistance, distances.yDistance)
  if (!shotCalculation) { return false }

  // Recalculate the new target based on speed + first trayectory
  const premonition = getPremonition(shotCalculation.totalTicks, speed)
  distances = premonition.distances
  const newTarget = premonition.newTarget

  // Recalculate the trayectory based on new target location
  shotCalculation = geBaseCalculation(distances.hDistance, distances.yDistance)
  if (!shotCalculation) { return false }

  // Get more precision on shot
  const precisionShot = getPrecisionShot(shotCalculation.grade, distances.hDistance, distances.yDistance, 1)
  const { arrowTrajectoryPoints, blockInTrayect, nearestDistance, nearestGrade } = precisionShot

  // Calculate yaw
  const yaw = calculateYaw(startPosition, newTarget)

  if (nearestDistance > 4) { return false } // Too far

  return {
    pitch: degreesToRadians(nearestGrade / 10),
    yaw,
    grade: nearestGrade / 10,
    nearestDistance,
    target: newTarget,
    arrowTrajectoryPoints,
    blockInTrayect
  }
}

const getPremonition = (totalTicks: number, targetSpeed: Vec3) => {
  totalTicks = totalTicks + Math.ceil(totalTicks / 10)
  const velocity = targetSpeed.clone()
  const newTarget = targetPosition.clone()
  for (let i = 1; i <= totalTicks; i++) {
    newTarget.add(velocity)
  }
  const distances = getTargetDistance(startPosition, newTarget)

  return {
    distances,
    newTarget
  }
}

// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const geBaseCalculation = (xDestination: number, yDestination: number) => {
  const grade = getFirstGradeAproax(xDestination, yDestination)
  let gradeShot

  if (!grade) { return false } // No aviable trayectory

  // Check blocks in trayectory
  const checkFirst = tryGrade(grade.nearestGradeFirst.grade, xDestination, yDestination, BaseVo, true)

  if (!checkFirst.blockInTrayect && checkFirst.nearestDistance < 4) {
    gradeShot = grade.nearestGradeFirst
  } else {
    if (!grade.nearestGradeSecond) {
      return false // No aviable trayectory
    }

    const checkSecond = tryGrade(grade.nearestGradeSecond.grade, xDestination, yDestination, BaseVo, true)
    if (checkSecond.blockInTrayect) {
      return false // No aviable trayectory
    }
    gradeShot = grade.nearestGradeSecond
  }

  return gradeShot
}

export default getMasterGrade
