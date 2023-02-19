
import { Vec3 } from 'vec3'
import { getTargetDistance } from '../../src/mathHelper'
import { Weapons } from '../../src/types'
import { generateSphere } from '../common/generateSphere'
import { bot } from '../hooks'

describe('99_dyson_sphere', () => {
  const yConst = 50
  let Y = -11
  before(async () => {
    Y = bot.test.groundY + yConst

    reset()

    await bot.test.resetState()
    bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:quick_charge,lvl:5},{id:unbreaking,lvl:5}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 1280`)
    bot.chat(`/setblock 0 ${Y - 1} 0 minecraft:glass_pane`)
    bot.chat(`/teleport 0.5 ${Y} 0.5`)
  })

  const reset = () => {
    generateSphere(45).forEach(({ x, y, z }) => bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:air`))
    bot.chat(`/setblock 0 ${Y - 1} 0 minecraft:air`)
  }

  after(() => reset())

  const randomly = () => Math.random() - 0.5;
  const vec: Array<Vec3> = []

  const spherePos = vec.concat(generateSphere(45)).sort(randomly)
  // When is to near to center can't shot them
  const validPositions = spherePos.filter((creeperPos) => getTargetDistance(new Vec3(0.5, Y - 1, 0.5), creeperPos).hDistance > 9)

  validPositions
    .forEach(({ x, y, z }) => {
      it(`POS: ${x} ${y + Y} ${z}`, async (): Promise<void> => {

        bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:stone_bricks`)
        bot.chat(`/summon minecraft:creeper ${x + 0.5} ${y + Y} ${z + 0.5}`)

        await bot.test.wait(1000)
        const entities = Object.values(bot.entities)
        const target = entities.find((entity) => entity.name === 'creeper')
        if (target === undefined) {
          throw new Error('Target not found')
        }

        bot.hawkEye.autoAttack(target, Weapons.crossbow)

        return new Promise((resolve) => {
          bot.once('auto_shop_stopped', () => {
            if (bot.inventory.count(719, null) < 64) {
              bot.chat(`/give ${bot.username} minecraft:arrow 1280`)
            }

            bot.chat(`/setblock ${x} ${y + Y - 1} ${z} minecraft:cobweb`)
            resolve()
          })
        })
      })
    })
})
