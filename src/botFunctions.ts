import { bot } from "./loadBot"

export const getPlayer = (playername?: string) => {
  const playerEntity = Object.keys(bot.entities)
    .map(id => bot.entities[id])
    .find((entity) => {
      if (entity.type === 'player') {
        if (playername === undefined) { return true }
        if (entity.username === playername) { return true }
      }
      return false
    })
  return playerEntity
}

export const simplyShot = (yaw: number, pitch: number): Promise<void> => {
  return new Promise((resolve) => {
    bot.look(yaw, pitch, true)
      .then(() => {
        bot.activateItem()
        setTimeout(() => {
          bot.deactivateItem()
          resolve()
        }, 1200)
      })
  })
}
