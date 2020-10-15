function getPlayer (bot, playername = null) {
  const playerEntity = Object.keys(bot.entities)
    .map(id => bot.entities[id])
    .find(function (entity) {
      if (entity.type === 'player') {
        if (playername === null) { return true }
        if (entity.username === playername) { return true }
      }
      return false
    })
  return playerEntity
}

function simplyShot (bot, yaw = null, grade = null) {
  if (yaw === null) {
    yaw = bot.player.entity.yaw
  }
  if (grade === null) {
    grade = bot.player.entity.grade
  }

  bot.look(yaw, grade, true, () => {
    bot.activateItem()
    setTimeout(() => {
      bot.deactivateItem()
    }, 1200)
  })
}

module.exports = {
  getPlayer,
  simplyShot
}
