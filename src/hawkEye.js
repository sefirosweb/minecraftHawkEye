const getMasterGrade = require('./hawkEyeEquations')

let target
let bot
let preparingShot
let preparingShotTime
let prevPlayerPositions = []
let oneShot
let chargingArrow
let weapon = 'bow'
let infoShot

function load (botToLoad) {
  bot = botToLoad
}

function autoAttack (targetToAttack, inputWeapon = 'bow', isOneShot = false) {
  if (!targetToAttack) {
    return false
  }
  oneShot = isOneShot

  target = targetToAttack
  preparingShot = false
  prevPlayerPositions = []
  weapon = inputWeapon

  bot.on('physicTick', getGrades)
  bot.on('physicTick', autoCalc)
  return true
}

function stop () {
  bot.deactivateItem()
  bot.removeListener('physicTick', getGrades)
  bot.removeListener('physicTick', autoCalc)
}

function getGrades () {
  if (target === undefined || target === false || !target.isValid) {
    stop()
    return false
  }

  if (prevPlayerPositions.length > 10) { prevPlayerPositions.shift() }

  const position = target.position.clone()

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

  infoShot = getMasterGrade(bot, target, speed, weapon)
}

async function autoCalc () {
  let waitTime
  switch (weapon) {
    case 'bow':
    case 'trident':
      waitTime = 1200
      break
    case 'snowball':
    case 'ender_pearl':
    case 'egg':
    case 'splash_potion':
      waitTime = 150
      break
    default:
      waitTime = 1200
  }

  const slotID = bot.getEquipmentDestSlot('hand')
  if (bot.inventory.slots[slotID] === null || bot.inventory.slots[slotID].name !== weapon) {
    const weaponFound = bot.inventory.items().find(item => item.name === weapon)
    if (weaponFound) {
      try {
        await bot.equip(weaponFound, 'hand')
        return
      } catch (err) {
        await sleep(500)
        return
      }
    } else {
      console.log('No weapon in inventory')
      stop()
      return
    }
  }

  if (!preparingShot) {
    if (['bow', 'crossbow', 'trident'].includes(weapon)) {
      bot.activateItem()
    }
    preparingShot = true
    preparingShotTime = Date.now()
  }

  if (infoShot) {
    bot.look(infoShot.yaw, infoShot.pitch)

    if (preparingShot) {
      if (['bow', 'trident'].includes(weapon) && Date.now() - preparingShotTime > waitTime) {
        bot.deactivateItem()
        preparingShot = false
        if (oneShot) { stop() }
      }

      if (['snowball', 'ender_pearl', 'egg', 'splash_potion'].includes(weapon) && Date.now() - preparingShotTime > waitTime) {
        bot.swingArm()
        bot.activateItem()
        bot.deactivateItem()
        preparingShot = false
        if (oneShot) { stop() }
      }

      if (weapon === 'crossbow') {
        shotCrossbow()
      }
    }
  }
}

function shotCrossbow () {
  if (chargingArrow) {
    bot.activateItem()
    bot.deactivateItem()
    chargingArrow = false
    preparingShot = false
    if (oneShot) { stop() }
    return
  }

  if (bot.heldItem === null) {
    stop()
    return
  }

  const isEnchanted = bot.heldItem.nbt.value.Enchantments ? bot.heldItem.nbt.value.Enchantments.value.value.find(enchant => enchant.id.value === 'quick_charge') : undefined
  const shotIn = 1250 - ((isEnchanted ? isEnchanted.lvl.value : 0) * 250)

  if (weapon === 'crossbow' && !chargingArrow && Date.now() - preparingShotTime > shotIn) {
    bot.deactivateItem()
    chargingArrow = true
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  load,
  autoAttack,
  stop
}
