const { autoAttack, stop, load } = require('./src/hawkEye')
const { getPlayer, simplyShot } = require('./src/botFunctions')
const getMasterGrade = require('./src/hawkEyeEquations')

function inject (bot) {
  load(bot)

  bot.hawkEye = {}
  bot.hawkEye.getPlayer = function (playername = null) {
    return getPlayer(bot, playername)
  }
  bot.hawkEye.autoAttack = function (targetToAttack) {
    return autoAttack(targetToAttack, false)
  }
  bot.hawkEye.oneShot = function (targetToAttack) {
    return autoAttack(targetToAttack, true)
  }
  bot.hawkEye.getMasterGrade = function (targetToAttack, speed) {
    return getMasterGrade(bot, targetToAttack, speed)
  }
  bot.hawkEye.simplyShot = function (yaw = null, grade = null) {
    return simplyShot(bot, yaw, grade)
  }
  bot.hawkEye.stop = stop
}

module.exports = inject
