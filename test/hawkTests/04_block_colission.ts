import { Weapons } from '../../src/types'
import { bot } from '../hooks'

describe('04_block_colission', () => {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} arrow 256`)
  })

  it('Oak Fance', async (): Promise<void> => {
    bot.chat(`/fill -16 ${Y} -1 -18 ${Y} 1 oak_fence`)
    bot.chat(`/setblock -17 ${Y} 0 air`)
    bot.chat(`/summon husk -16.5 ${Y} 0.5 {IsBaby:0}`)

    await bot.test.wait(1000)
    const entities = Object.values(bot.entities)
    const target = entities.find((entity) => entity.name === 'husk')
    if (target === undefined) {
      throw new Error('Target not found')
    }

    bot.hawkEye.autoAttack(target, Weapons.bow)

    return new Promise((resolve) => {
      bot.once('auto_shot_stopped', async () => {
        await bot.test.wait(2000)
        resolve()
      })
    })
  })

  it('Wall', async (): Promise<void> => {
    bot.chat(`/fill -7 ${Y - 1} -7 7 ${Y + 5} 7 stone hollow`)
    bot.chat(`/fill -7 ${Y + 5} -7 7 ${Y + 5} 7 air`)
    bot.chat(`/summon husk -16.5 ${Y} 0.5 {IsBaby:0}`)

    await bot.test.wait(1000)
    const entities = Object.values(bot.entities)
    const target = entities.find((entity) => entity.name === 'husk')
    if (target === undefined) {
      throw new Error('Target not found')
    }

    bot.hawkEye.autoAttack(target, Weapons.bow)

    return new Promise((resolve) => {
      bot.once('auto_shot_stopped', async () => {
        bot.chat(`/fill -7 ${Y} -7 7 ${Y + 5} 7 air hollow`)
        await bot.test.wait(2000)
        resolve()
      })
    })
  })

  it('Short Wall', async (): Promise<void> => {
    bot.chat(`/fill -1 ${Y} -7 -1 ${Y + 5} 7 stone`)
    bot.chat(`/summon husk -16.5 ${Y} 0.5 {IsBaby:0}`)

    await bot.test.wait(1000)
    const entities = Object.values(bot.entities)
    const target = entities.find((entity) => entity.name === 'husk')
    if (target === undefined) {
      throw new Error('Target not found')
    }

    bot.hawkEye.autoAttack(target, Weapons.bow)

    return new Promise((resolve) => {
      bot.once('auto_shot_stopped', async () => {
        await bot.test.wait(2000)
        resolve()
      })
    })
  })

})
