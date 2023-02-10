import { Weapons } from '../../src/types'
import { bot } from '../hooks'

describe('04_all_weapons', () => {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} snowball 64`)
    bot.chat(`/give ${bot.username} trident 4`)
    bot.chat(`/give ${bot.username} egg 16`)
    bot.chat(`/give ${bot.username} splash_potion{Potion:strong_harming} 10`)
    bot.chat(`/give ${bot.username} arrow 256`)
    bot.chat(`/setblock 0 ${Y + 4} 0 stone_bricks`)
    bot.chat(`/setblock 6 ${Y + 4} 0 stone_bricks`)
    bot.chat(`/setblock 50 ${Y + 4} 0 stone_bricks`)
    bot.chat(`/setblock 75 ${Y + 4} 0 stone_bricks`)
    bot.chat(`/fill 60 ${Y - 1} 5 1 ${Y - 2} -5 lava`)

  })

  Object.values(Weapons).forEach((weapon) => {
    if (weapon === Weapons.ender_pearl) return
    it(`Test: ${weapon}`, async (): Promise<void> => {
      bot.chat(`/teleport 0.5 ${Y + 5} 0.5`)

      if (weapon === Weapons.splash_potion) {
        bot.chat(`/summon creeper 6.5 ${Y + 5} 0.5`)
      } else {
        bot.chat(`/summon creeper 50.5 ${Y + 5} 0.5`)
      }

      await bot.test.wait(1000)
      const entities = Object.values(bot.entities)
      const target = entities.find((entity) => entity.name === 'creeper')
      if (target === undefined) {
        throw new Error('Target not found')
      }

      bot.hawkEye.autoAttack(target, weapon)

      return new Promise((resolve) => {
        bot.on('auto_shop_stopped', async () => {
          await bot.test.wait(4000)
          resolve()
        })
      })
    })

  })


  after(() => {
    bot.chat(`/setblock 0 ${Y + 4} 0 air`)
    bot.chat(`/setblock 6 ${Y + 4} 0 air`)
    bot.chat(`/setblock 50 ${Y + 4} 0 air`)
    bot.chat(`/setblock 75 ${Y + 4} 0 air`)
    bot.chat(`/fill 60 ${Y - 1} 5 1 ${Y - 2} -5 dirt`)
  })

})
