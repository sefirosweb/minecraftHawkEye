import { Vec3 } from 'vec3'
import { Weapons, OptionsMasterGrade } from '../../src/types'
import { bot } from '../hooks'

describe('03_very_long_shot', function () {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 256`)

    bot.chat(`/fill 119 ${Y} 4 4 ${Y} 4 minecraft:redstone_wire`)
    bot.chat(`/setblock 115 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 115 ${Y} 5 minecraft:repeater[facing=west,delay=4]`)
    bot.chat(`/setblock 114 ${Y} 5 minecraft:redstone_wire`)
    bot.chat(`/setblock 116 ${Y} 5 minecraft:redstone_wire`)
    bot.chat(`/setblock 99 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 83 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 67 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 51 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 35 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 19 ${Y} 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 3 ${Y} 4 minecraft:redstone_lamp`)

    bot.chat(`/fill 119 ${Y} -2 119 ${Y + 1} -2 minecraft:dirt`)
    bot.chat(`/fill 120 ${Y} 0 120 ${Y + 1} 0 minecraft:dirt`)
    bot.chat(`/fill 119 ${Y} 2 119 ${Y + 1} 2 minecraft:dirt`)
    bot.chat(`/setblock 119 ${Y} 3 minecraft:dirt`)
    bot.chat(`/fill 118 ${Y} 2 118 ${Y} 3 minecraft:redstone_wire`)
    bot.chat(`/setblock 119 ${Y + 1} 3 minecraft:redstone_wire`)
    bot.chat(`/setblock 119 ${Y} 0 minecraft:tripwire[attached=true]`)
    bot.chat(`/setblock 119 ${Y + 1} 0 minecraft:tripwire[attached=true]`)
    bot.chat(`/setblock 119 ${Y} -1 minecraft:tripwire_hook[facing=south,attached=true]`)
    bot.chat(`/setblock 119 ${Y + 1} -1 minecraft:tripwire_hook[facing=south,attached=true]`)
    bot.chat(`/setblock 119 ${Y} 1 minecraft:tripwire_hook[facing=north,attached=true]`)
    bot.chat(`/setblock 119 ${Y + 1} 1 minecraft:tripwire_hook[facing=north,attached=true]`)
  })

  it('Very long shot distance', async (): Promise<void> => {

    const block: OptionsMasterGrade = {
      position: new Vec3(120, Y + 1, 0.5)
    }

    const result = bot.hawkEye.getMasterGrade(block, new Vec3(0, 0, 0), Weapons.bow)
    if (!result) {
      throw Error('Error on calculate the pitch and yaw')
    }

    return new Promise((resolve) => {
      const internal = setInterval(() => {
        bot.hawkEye.simplyShot(result.yaw, result.pitch)
        const block = bot.blockAt(new Vec3(3, Y, 4))
        //@ts-ignore
        if (block?.getProperties().lit === true) {
          clearInterval(internal)
          resolve()
        }
      }, 2000)
    })
  })



  after(() => {
    bot.chat(`/fill 119 ${Y} 4 4 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 115 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 115 ${Y} 5 minecraft:air`)
    bot.chat(`/setblock 114 ${Y} 5 minecraft:air`)
    bot.chat(`/setblock 116 ${Y} 5 minecraft:air`)
    bot.chat(`/setblock 99 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 83 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 67 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 51 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 35 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 19 ${Y} 4 minecraft:air`)
    bot.chat(`/setblock 3 ${Y} 4 minecraft:air`)

    bot.chat(`/fill 119 ${Y} -2 119 ${Y + 1} -2 minecraft:air`)
    bot.chat(`/fill 120 ${Y} 0 120 ${Y + 1} 0 minecraft:air`)
    bot.chat(`/fill 119 ${Y} 2 119 ${Y + 1} 2 minecraft:air`)
    bot.chat(`/setblock 119 ${Y} 3 minecraft:air`)
    bot.chat(`/fill 118 ${Y} 2 118 ${Y} 3 minecraft:air`)
    bot.chat(`/setblock 119 ${Y + 1} 3 minecraft:air`)
    bot.chat(`/setblock 119 ${Y} 0 minecraft:air`)
    bot.chat(`/setblock 119 ${Y + 1} 0 minecraft:air`)
    bot.chat(`/setblock 119 ${Y} -1 minecraft:air`)
    bot.chat(`/setblock 119 ${Y + 1} -1 minecraft:air`)
    bot.chat(`/setblock 119 ${Y} 1 minecraft:air`)
    bot.chat(`/setblock 119 ${Y + 1} 1 minecraft:air`)
  })

})
