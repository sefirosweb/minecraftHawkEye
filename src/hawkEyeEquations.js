const Vec3 = require('vec3')
let mcData

let bot
let target
let speed
let startPosition
let targetPosition

function getTargetDistance (origin, destination) {
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

function getTargetYaw (origin, destination) {
  const xDistance = destination.x - origin.x
  const zDistance = destination.z - origin.z
  const yaw = Math.atan2(xDistance, zDistance) + Math.PI
  return yaw
}

function degreesToRadians (degrees) {
  var pi = Math.PI
  return degrees * (pi / 180)
}

function radiansToDegrees (radians) {
  var pi = Math.PI
  return radians * (180 / pi)
}

function getVox (Vo, Alfa, Resistance = 0) {
  return Vo * Math.cos(Alfa) - Resistance
}

function getVoy (Vo, Alfa, Resistance = 0) {
  return Vo * Math.sin(Alfa) - Resistance
}

function getVo (Vox, Voy, G) {
  return Math.sqrt(Math.pow(Vox, 2) + Math.pow(Voy - G, 2)) // New Total Velocity - Gravity
}

function getGrades (Vo, Voy, Gravity) {
  return radiansToDegrees(Math.asin((Voy - Gravity) / Vo))
}

// Check block position impact
function incercetpBlock (position) {
  const block = bot.blockAt(position)
  if (!block) { return false }
  if (block.boundingBox !== 'empty') { // OLD check  block.name !== 'air'
    return false
  }
  return true
}

// Physics factors
const GRAVITY = 0.05 // Arrow Gravity // Only for arrow for other entities have different gravity
const FACTOR_Y = 0.01 // Arrow "Air resistance" // In water must be changed
const FACTOR_H = 0.01 // Arrow "Air resistance" // In water must be changed

// Simulate Arrow Trayectory
function tryGrade (grade, xDestination, yDestination, VoIn, tryIntercetpBlock = false) {
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
  let ProjectileGrade

  let nearestDistance = false
  let totalTicks = 0

  let blockInTrayect = false
  let previusArrowPositionIntercept = false

  while (true) {
    const firstDistance = Math.sqrt(Math.pow(Vy - yDestination, 2) + Math.pow(Vx - xDestination, 2))

    if (nearestDistance === false) {
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
    ProjectileGrade = getGrades(Vo, Voy, gravity)

    Voy = getVoy(Vo, degreesToRadians(ProjectileGrade), Voy * factorY)
    Vox = getVox(Vo, degreesToRadians(ProjectileGrade), Vox * factorH)

    Vy += Voy / precisionFactor
    Vx += Vox / precisionFactor

    // Arrow passed player OR Voy (arrow is going down and passed player)
    if (Vx > xDestination || (Voy < 0 && yDestination > Vy) || blockInTrayect) {
      return {
        nearestDistance: nearestDistance,
        totalTicks: totalTicks,
        blockInTrayect: blockInTrayect
      }
    }

    if (tryIntercetpBlock) {
      const calcBlockInTrayect = calculateBlockInTrayectory(previusArrowPositionIntercept, Vy, Vx)
      blockInTrayect = calcBlockInTrayect.intercept
      previusArrowPositionIntercept = calcBlockInTrayect.arrowPosition
    }
  }
}

function calculateBlockInTrayectory (previusArrowPosition, Vy, Vx) {
  const maxSteps = 10 // Used fo calc block between tick & tick

  // Calculate Arrow XYZ position based on YAW and BOT position
  const yaw = getTargetYaw(startPosition, targetPosition)

  // Vx = Hipotenusa
  let arrowCurrentX = startPosition.x
  let arrowCurrentZ = startPosition.z
  let arrowCurrentY = startPosition.y
  if (previusArrowPosition === false) {
    previusArrowPosition = new Vec3(startPosition.x, startPosition.y, startPosition.z)
  }

  arrowCurrentY += Vy

  // Cateto Opuesto
  const xExtra = Math.sin(yaw) * Vx
  arrowCurrentX -= xExtra

  // Cateto Adjacente
  const zExtra = xExtra / Math.tan(yaw)
  arrowCurrentZ -= zExtra

  // Current arrow position
  const arrowPosition = new Vec3(arrowCurrentX, arrowCurrentY, arrowCurrentZ)

  const distX = arrowPosition.x - previusArrowPosition.x
  const distY = arrowPosition.y - previusArrowPosition.y
  const distZ = arrowPosition.z - previusArrowPosition.z

  const distVector = new Vec3(distX / maxSteps, distY / maxSteps, distZ / maxSteps)

  let incercetp

  // Arrow Speed is to high, calculate prevArrow with current position for detect block in midle of tick position
  for (let i = 0; i < maxSteps; i++) {
    previusArrowPosition.add(distVector)
    incercetp = !incercetpBlock(previusArrowPosition)
    if (incercetp) {
      return {
        arrowPosition,
        intercept: true
      }
    }
  }

  return {
    arrowPosition,
    intercept: false
  }
}

// Get more precision on shot
function getPrecisionShot (grade, xDestination, yDestination, decimals) {
  let nearestDistance = false
  let nearestGrade = false
  decimals = Math.pow(10, decimals)

  for (let iGrade = (grade * 10) - 10; iGrade <= (grade * 10) + 10; iGrade += 1) {
    const distance = tryGrade(iGrade / decimals, xDestination, yDestination, BaseVo)
    if ((distance.nearestDistance < nearestDistance) || nearestDistance === false) {
      nearestDistance = distance.nearestDistance
      nearestGrade = iGrade
    }
  }

  return {
    nearestGrade,
    nearestDistance
  }
}

// Calculate all 180º first grades
// Calculate the 2 most aproax shots
// https://es.qwe.wiki/wiki/Trajectory
function getFirstGradeAproax (xDestination, yDestination) {
  let firstFound = false
  let nearestGradeFirst = false
  let nearestGradeSecond = false

  // const nearGrades = []

  for (let grade = -89; grade < 90; grade++) {
    const tryGradeShot = tryGrade(grade, xDestination, yDestination, BaseVo)

    tryGradeShot.grade = grade
    if (tryGradeShot.nearestDistance > 4) { continue }

    // nearGrades.push(tryGradeShot)

    if (!nearestGradeFirst) { nearestGradeFirst = tryGradeShot }

    if (tryGradeShot.grade - nearestGradeFirst.grade > 10 && firstFound === false) {
      firstFound = true
      nearestGradeSecond = tryGradeShot
    }

    if (nearestGradeFirst.nearestDistance > tryGradeShot.nearestDistance && firstFound === false) { nearestGradeFirst = tryGradeShot }

    if (nearestGradeSecond.nearestDistance > tryGradeShot.nearestDistance && firstFound) { nearestGradeSecond = tryGradeShot }
  }

  /* Test best grades calc

    console.clear();
    console.log(nearestGradeFirst.grade, nearestGradeFirst.nearestDistance)
    console.log(nearestGradeSecond.grade, nearestGradeSecond.nearestDistance)
    console.log(nearGrades[6])
    nearGrades.sort((a, b) => a.nearestDistance - b.nearestDistance)

    const nearestGrades = nearGrades.slice(0, 3);
    console.log(nearestGrades)

  */

  return {
    nearestGradeFirst,
    nearestGradeSecond
  }
}

// Base start force
const BaseVo = 3

function getMasterGrade (botIn, targetIn, speedIn) {
  bot = botIn
  target = targetIn
  speed = speedIn
  mcData = require('minecraft-data')(bot.version)

  startPosition = bot.entity.position.offset(0, 1.6, 0) // Bow offset position

  // Calculate target Height, for shot in the heart  =P
  let targetHeight = 0
  if (target.type === 'player') {
    targetHeight = 1.6
  }
  if (target.type === 'mob') {
    targetHeight = mcData.mobs[target.entityType].height
  }
  targetPosition = new Vec3(target.position).offset(0, targetHeight, 0)

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

  // Calculate yaw
  const yaw = getTargetYaw(startPosition, newTarget)

  if (precisionShot.nearestDistance > 4) { return false } // Too far

  return {
    pitch: degreesToRadians(precisionShot.nearestGrade / 10),
    yaw: yaw,
    grade: precisionShot.nearestGrade / 10,
    nearestDistance: precisionShot.nearestDistance,
    target: newTarget
  }
}

function getPremonition (totalTicks, speed) {
  totalTicks = totalTicks + Math.ceil(totalTicks / 10)
  const velocity = new Vec3(speed)
  const newTarget = new Vec3(targetPosition)
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
function geBaseCalculation (xDestination, yDestination) {
  const grade = getFirstGradeAproax(xDestination, yDestination)
  let gradeShot

  if (!grade.nearestGradeFirst) { return false } // No aviable trayectory

  // Check blocks in trayectory
  let check = tryGrade(grade.nearestGradeFirst.grade, xDestination, yDestination, BaseVo, true)

  if (!check.blockInTrayect && check.nearestDistance < 4) {
    gradeShot = grade.nearestGradeFirst
  } else {
    if (!grade.nearestGradeSecond) {
      return false // No aviable trayectory
    }
    check = tryGrade(grade.nearestGradeSecond.grade, xDestination, yDestination, BaseVo, true)
    if (check.blockInTrayect) {
      return false // No aviable trayectory
    }
    gradeShot = grade.nearestGradeSecond
  }

  return gradeShot
}

module.exports = getMasterGrade
