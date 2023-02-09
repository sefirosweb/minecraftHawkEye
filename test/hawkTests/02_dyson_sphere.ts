
import { Vec3 } from 'vec3'
import { generateSphere } from '../common/generateSphere'
import { bot } from '../hooks'

describe('02_dyson_sphere', function () {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY + 50

    generateSphere(45).forEach(({ x, y, z }) => bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:air`))

    await bot.test.resetState()
    bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:quick_charge,lvl:5},{id:unbreaking,lvl:5}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 1280`)
    bot.chat(`/setblock 0 ${Y - 1} 0 minecraft:glass_pane`)
    bot.chat(`/teleport 0.5 ${Y} 0.5`)
  })

  after(() => {
    generateSphere(45).forEach(({ x, y, z }) => bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:air`))
  })

  const randomly = () => Math.random() - 0.5;
  const vec: Array<Vec3> = []
  vec.concat(generateSphere(45)).sort(randomly)
    .forEach(({ x, y, z }) => {
      it(`POS: ${x} ${y} ${z}`, async (): Promise<void> => {

        bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:stone_bricks`)
        bot.chat(`/summon minecraft:creeper ${x + 0.5} ${y + Y} ${z + 0.5}`)

        await bot.test.wait(1000)
        const entities = Object.values(bot.entities)
        const target = entities.find((entity) => entity.name === 'creeper')
        if (target === undefined) {
          throw new Error('Target not found')
        }

        bot.hawkEye.autoAttack(target, 'crossbow')

        return new Promise((resolve) => {

          const internal = setInterval(() => {
            if (target?.isValid === false) {

              if (bot.inventory.count(719, null) < 64) {
                bot.chat(`/give ${bot.username} minecraft:arrow 1280`)
              }

              bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:cobweb`)
              clearInterval(internal)
              resolve()
            }
          }, 400)
        })

      })
    })
})
