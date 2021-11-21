const { autoAttack, stop, load } = require('./src/hawkEye')
const { getPlayer, simplyShot } = require('./src/botFunctions')
const getMasterGrade = require('./src/hawkEyeEquations')

function inject (bot) {
  load(bot)

  bot.hawkEye = {}
  bot.hawkEye.data = {}
  
  bot.hawkEye.getPlayer = function (playername = null) {
    return getPlayer(bot, playername)
  }
  bot.hawkEye.autoAttack = function (targetToAttack, $weapon = 'bow') {
    return autoAttack(bot, targetToAttack, $weapon, false)
  }
  bot.hawkEye.oneShot = function (targetToAttack, $weapon = 'bow') {
    return autoAttack(bot, targetToAttack, $weapon, true)
  }
  bot.hawkEye.getMasterGrade = function (targetToAttack, speed, $weapon) {
    return getMasterGrade(bot, targetToAttack, speed, $weapon)
  }
  bot.hawkEye.simplyShot = function (yaw = null, grade = null) {
    return simplyShot(bot, yaw, grade)
  }
  bot.hawkEye.stop = function(...args) {
    return stop(bot, ...args)
  }
}

module.exports = inject
