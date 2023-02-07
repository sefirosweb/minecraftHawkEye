import { bot } from '../hooks'

describe('01_basic', function () {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY + 10
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 256`)
    bot.chat(`/setblock 0 ${Y - 1} 0 minecraft:stone_bricks`)
    bot.chat(`/setblock 50 ${Y - 1} 0 minecraft:stone_bricks`)
    bot.chat(`/setblock 75 ${Y - 1} 0 minecraft:stone_bricks`)
  })

  it('Short distance', async (): Promise<void> => {
    bot.chat(`/teleport 0.5 ${Y} 0.5`)
    bot.chat(`/summon minecraft:creeper 50.5 ${Y} 0.5`)
    await bot.test.wait(1000)
    const entities = Object.values(bot.entities)
    const target = entities.find((entity) => entity.name === 'creeper')
    if (target === undefined) {
      throw new Error('Target not found')
    }

    bot.hawkEye.autoAttack(target, 'bow')

    return new Promise((resolve) => {

      const internal = setInterval(() => {
        if (target?.isValid === false) {
          clearInterval(internal)
          resolve()
        }
      }, 400)
    })
  })

  it('Long distance', async (): Promise<void> => {
    bot.chat(`/teleport 0.5 ${Y} 0.5`)
    bot.chat(`/summon minecraft:creeper 75.5 ${Y} 0.5`)
    await bot.test.wait(3000)
    const entities = Object.values(bot.entities)
    const target = entities.find((entity) => entity.name === 'creeper')
    if (target === undefined) {
      throw new Error('Target not found')
    }

    bot.hawkEye.autoAttack(target, 'bow')

    return new Promise((resolve) => {

      const internal = setInterval(() => {
        if (target?.isValid === false) {
          clearInterval(internal)
          resolve()
        }
      }, 400)
    })
  })

  after(() => {
    bot.chat(`/setblock 0 ${Y - 1} 0 minecraft:air`)
    bot.chat(`/setblock 50 ${Y - 1} 0 minecraft:air`)
    bot.chat(`/setblock 75 ${Y - 1} 0 minecraft:air`)
  })

})
