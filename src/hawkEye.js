const getMasterGrade = require('./hawkEyeEquations')

function load (botToLoad) {
  let bot = botToLoad
  bot.hawkEye.data.target = null
  bot.hawkEye.data.preparingShot = null
  bot.hawkEye.data.preparingShotTime = null
  bot.hawkEye.data.prevPlayerPositions = []
  bot.hawkEye.data.oneShot = null
  bot.hawkEye.data.chargingArrow = null
  bot.hawkEye.data.weapon = 'bow'
  bot.hawkEye.data.infoShot = null
}

function autoAttack (bot, targetToAttack, inputWeapon = 'bow', isOneShot = false) {
  if (!targetToAttack) {
    return false
  }
  bot.hawkEye.data.oneShot = isOneShot

  bot.hawkEye.data.target = targetToAttack
  bot.hawkEye.data.preparingShot = false
  bot.hawkEye.data.prevPlayerPositions = []
  bot.hawkEye.data.weapon = inputWeapon

  bot.on('physicTick', getGrades)
  bot.on('physicTick', autoCalc)
  return true
}

function stop (bot) {
  bot.deactivateItem()
  bot.removeListener('physicTick', getGrades)
  bot.removeListener('physicTick', autoCalc)
}

function getGrades (bot) {
  if (bot.hawkEye.data.target === undefined || bot.hawkEye.data.target === false || !bot.hawkEye.data.target.isValid) {
    stop(bot)
    return false
  }

  if (bot.hawkEye.data.prevPlayerPositions.length > 10) { bot.hawkEye.data.prevPlayerPositions.shift() }

  const position = bot.hawkEye.data.target.position.clone()

  bot.hawkEye.data.prevPlayerPositions.push(position)

  const speed = {
    x: 0,
    y: 0,
    z: 0
  }

  for (let i = 1; i < bot.hawkEye.data.prevPlayerPositions.length; i++) {
    const pos = bot.hawkEye.data.prevPlayerPositions[i]
    const prevPos = bot.hawkEye.data.prevPlayerPositions[i - 1]
    speed.x += pos.x - prevPos.x
    speed.y += pos.y - prevPos.y
    speed.z += pos.z - prevPos.z
  }

  speed.x = speed.x / bot.hawkEye.data.prevPlayerPositions.length
  speed.y = speed.y / bot.hawkEye.data.prevPlayerPositions.length
  speed.z = speed.z / bot.hawkEye.data.prevPlayerPositions.length

  bot.hawkEye.data.infoShot = getMasterGrade(bot, bot.hawkEye.data.target, speed, bot.hawkEye.data.weapon)
}

async function autoCalc (bot) {
  let waitTime
  switch (bot.hawkEye.data.weapon) {
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
  if (bot.inventory.slots[slotID] === null || bot.inventory.slots[slotID].name !== bot.hawkEye.data.weapon) {
    const weaponFound = bot.inventory.items().find(item => item.name === bot.hawkEye.data.weapon)
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
      stop(bot)
      return
    }
  }

  if (!bot.hawkEye.data.preparingShot) {
    if (['bow', 'crossbow', 'trident'].includes(bot.hawkEye.data.weapon)) {
      bot.activateItem()
    }
    bot.hawkEye.data.preparingShot = true
    bot.hawkEye.data.preparingShotTime = Date.now()
  }

  if (bot.hawkEye.data.infoShot) {
    bot.look(bot.hawkEye.data.infoShot.yaw, bot.hawkEye.data.infoShot.pitch)

    if (bot.hawkEye.data.preparingShot) {
      if (['bow', 'trident'].includes(bot.hawkEye.data.weapon) && Date.now() - bot.hawkEye.data.preparingShotTime > waitTime) {
        bot.deactivateItem()
        bot.hawkEye.data.preparingShot = false
        if (bot.hawkEye.data.oneShot) { stop(bot) }
      }

      if (['snowball', 'ender_pearl', 'egg', 'splash_potion'].includes(bot.hawkEye.data.weapon) && Date.now() - bot.hawkEye.data.preparingShotTime > waitTime) {
        bot.swingArm()
        bot.activateItem()
        bot.deactivateItem()
        bot.hawkEye.data.preparingShot = false
        if (bot.hawkEye.data.oneShot) { stop(bot) }
      }

      if (weapon === 'crossbow') {
        shotCrossbow(bot)
      }
    }
  }
}

function shotCrossbow (bot) {
  if (bot.hawkEye.data.chargingArrow) {
    bot.activateItem()
    bot.deactivateItem()
    bot.hawkEye.data.chargingArrow = false
    bot.hawkEye.data.preparingShot = false
    if (bot.hawkEye.data.oneShot) { stop(bot) }
    return
  }

  if (bot.heldItem === null) {
    stop(bot)
    return
  }

  const isEnchanted = bot.heldItem.nbt.value.Enchantments ? bot.heldItem.nbt.value.Enchantments.value.value.find(enchant => enchant.id.value === 'quick_charge') : undefined
  const shotIn = 1250 - ((isEnchanted ? isEnchanted.lvl.value : 0) * 250)

  if (bot.hawkEye.data.weapon === 'crossbow' && !bot.hawkEye.data.chargingArrow && Date.now() - bot.hawkEye.data.preparingShotTime > shotIn) {
    bot.deactivateItem()
    bot.hawkEye.data.chargingArrow = true
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
