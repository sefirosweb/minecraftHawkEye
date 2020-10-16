const getMasterGrade = require('./hawkEyeEquations')

let target
let bot
let preparingShot
let preparingShotTime
let prevPlayerPositions = []
let oneShot

function load (botToLoad) {
  bot = botToLoad
}

function autoAttack (targetToAttack, isOneShot = false) {
  if (!targetToAttack) {
    return false
  }
  oneShot = isOneShot

  target = targetToAttack
  preparingShot = false
  prevPlayerPositions = []

  bot.on('physicTick', autoCalc)
  return true
}

function stop () {
  bot.deactivateItem()
  bot.removeListener('physicTick', autoCalc)
}

function autoCalc () {
  if (target === undefined || target === false || !target.isValid) {
    stop()
    return false
  }

  if (prevPlayerPositions.length > 10) { prevPlayerPositions.shift() }

  const position = {
    x: target.position.x,
    y: target.position.y,
    z: target.position.z
  }

  prevPlayerPositions.push(position)

  const speed = {
    x: 0,
    y: 0,
    z: 0
  }

  for (let i = 1; i < prevPlayerPositions.length; i++) {
    const pos = prevPlayerPositions[i]
    const prevPos = prevPlayerPositions[i - 1]
    speed.x += pos.x - prevPos.x
    speed.y += pos.y - prevPos.y
    speed.z += pos.z - prevPos.z
  }

  speed.x = speed.x / prevPlayerPositions.length
  speed.y = speed.y / prevPlayerPositions.length
  speed.z = speed.z / prevPlayerPositions.length

  if (!preparingShot) {
    bot.activateItem()
    preparingShot = true
    preparingShotTime = Date.now()
  }

  // console.time("getMasterGrade");
  const infoShot = getMasterGrade(bot, target, speed)
  // console.timeEnd("getMasterGrade");

  if (infoShot) {
    bot.look(infoShot.yaw, infoShot.pitch)

    const currentTime = Date.now()
    if (preparingShot && currentTime - preparingShotTime > 1200) {
      bot.deactivateItem()
      preparingShot = false
      if (oneShot) {
        stop()
      }
    }
  }
}

module.exports = {
  load,
  autoAttack,
  stop
}
