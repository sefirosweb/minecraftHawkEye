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

function simplyShot (bot, yaw = null, pitch = null) {
  if (yaw === null) {
    yaw = bot.player.entity.yaw
  }
  if (pitch === null) {
    pitch = bot.player.entity.grade
  }

  bot.look(yaw, pitch, false, () => {
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
