import { Bot } from 'mineflayer'
import { isEntity, OptionsMasterGrade, Weapons } from './types'
import { Vec3 } from 'vec3'
import getMasterGrade from './hawkEyeEquations'
import { Entity } from 'prismarine-entity'

let target: Entity | OptionsMasterGrade
let bot: Bot
let preparingShot: boolean
let preparingShotTime: number
let prevPlayerPositions: Array<Vec3> = []
let oneShot: boolean
let chargingArrow: boolean
let weapon: Weapons = Weapons.bow
let infoShot: ReturnType<typeof getMasterGrade>

export const load = (botToLoad: Bot) => {
  bot = botToLoad
}

export const autoAttack = (targetToAttack: Entity | OptionsMasterGrade, inputWeapon = Weapons.bow, isOneShot = false) => {
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

export const stop = () => {
  bot.deactivateItem()
  bot.removeListener('physicTick', getGrades)
  bot.removeListener('physicTick', autoCalc)
}

const getGrades = () => {
  if (target === undefined || (isEntity(target) && !target.isValid)) {
    stop()
    return
  }

  if (prevPlayerPositions.length > 10) { prevPlayerPositions.shift() }

  const position = target.position.clone()

  prevPlayerPositions.push(position)

  const speed = new Vec3(0, 0, 0)

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

const autoCalc = async () => {
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
    bot.look(infoShot.yaw, infoShot.pitch, true)

    if (preparingShot) {
      if (['bow', 'trident'].includes(weapon) && Date.now() - preparingShotTime > waitTime) {
        bot.deactivateItem()
        preparingShot = false
        if (oneShot) {
          stop()
        }
      }

      if (['snowball', 'ender_pearl', 'egg', 'splash_potion'].includes(weapon) && Date.now() - preparingShotTime > waitTime) {
        bot.swingArm('left')
        bot.activateItem()
        bot.deactivateItem()
        preparingShot = false
        if (oneShot) {
          stop()
        }
      }

      if (weapon === 'crossbow') {
        shotCrossbow()
      }
    }
  }
}

const shotCrossbow = () => {
  if (chargingArrow) {
    bot.activateItem()
    bot.deactivateItem()
    chargingArrow = false
    preparingShot = false
    if (oneShot) {
      stop()
    }
    return
  }

  if (bot.heldItem === null) {
    stop()
    return
  }

  // @ts-ignore pending to fix types from core
  const isEnchanted = bot.heldItem.nbt.value.Enchantments ? bot.heldItem.nbt.value.Enchantments.value.value.find(enchant => enchant.id.value === 'quick_charge') : undefined
  const shotIn = 1250 - ((isEnchanted ? isEnchanted.lvl.value : 0) * 250)

  if (weapon === 'crossbow' && !chargingArrow && Date.now() - preparingShotTime > shotIn) {
    bot.deactivateItem()
    chargingArrow = true
  }
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  load,
  autoAttack,
  stop
}
