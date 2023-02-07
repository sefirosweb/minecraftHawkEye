import { OptionsMasterGrade } from 'types'
import { Vec3 } from 'vec3'
import { generateSphere } from '../common/generateSphere'
import { bot } from '../hooks'

describe('03_very_long_shot', function () {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY + 10
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} bow{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
    bot.chat(`/give ${bot.username} minecraft:arrow 256`)

    bot.chat(`/fill 119 4 4 4 4 4 minecraft:redstone_wire`)
    bot.chat(`/setblock 115 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 115 4 5 minecraft:repeater[facing=west,delay=4]`)
    bot.chat(`/setblock 114 4 5 minecraft:redstone_wire`)
    bot.chat(`/setblock 116 4 5 minecraft:redstone_wire`)
    bot.chat(`/setblock 99 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 83 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 67 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 51 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 35 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 19 4 4 minecraft:repeater[facing=east,delay=4]`)
    bot.chat(`/setblock 3 4 4 minecraft:redstone_lamp`)

    bot.chat(`/fill 119 4 -2 119 5 -2 minecraft:dirt`)
    bot.chat(`/fill 120 4 0 120 5 0 minecraft:dirt`)
    bot.chat(`/fill 119 4 2 119 5 2 minecraft:dirt`)
    bot.chat(`/setblock 119 4 3 minecraft:dirt`)
    bot.chat(`/fill 118 4 2 118 4 3 minecraft:redstone_wire`)
    bot.chat(`/setblock 119 5 3 minecraft:redstone_wire`)
    bot.chat(`/setblock 119 4 0 minecraft:tripwire[attached=true]`)
    bot.chat(`/setblock 119 5 0 minecraft:tripwire[attached=true]`)
    bot.chat(`/setblock 119 4 -1 minecraft:tripwire_hook[facing=south,attached=true]`)
    bot.chat(`/setblock 119 5 -1 minecraft:tripwire_hook[facing=south,attached=true]`)
    bot.chat(`/setblock 119 4 1 minecraft:tripwire_hook[facing=north,attached=true]`)
    bot.chat(`/setblock 119 5 1 minecraft:tripwire_hook[facing=north,attached=true]`)
  })

  it('Very long shot distance', async (): Promise<void> => {

    const block: OptionsMasterGrade = {
      position: new Vec3(121, 5, 0.5)
    }

    const result = bot.hawkEye.getMasterGrade(block, new Vec3(0, 0, 0), 'bow')

    return new Promise((resolve) => {
      const internal = setInterval(() => {
        bot.hawkEye.simplyShot(result.yaw, result.pitch)
        const block = bot.blockAt(new Vec3(3, 4, 4))
        //@ts-ignore
        if (block?.getProperties().lit === true) {
          clearInterval(internal)
          resolve()
        }
      }, 2000)
    })
  })



  after(() => {
    bot.chat(`/fill 119 4 4 4 4 4 minecraft:air`)
    bot.chat(`/setblock 115 4 4 minecraft:air`)
    bot.chat(`/setblock 115 4 5 minecraft:air`)
    bot.chat(`/setblock 114 4 5 minecraft:air`)
    bot.chat(`/setblock 116 4 5 minecraft:air`)
    bot.chat(`/setblock 99 4 4 minecraft:air`)
    bot.chat(`/setblock 83 4 4 minecraft:air`)
    bot.chat(`/setblock 67 4 4 minecraft:air`)
    bot.chat(`/setblock 51 4 4 minecraft:air`)
    bot.chat(`/setblock 35 4 4 minecraft:air`)
    bot.chat(`/setblock 19 4 4 minecraft:air`)
    bot.chat(`/setblock 3 4 4 minecraft:air`)

    bot.chat(`/fill 119 4 -2 119 5 -2 minecraft:air`)
    bot.chat(`/fill 120 4 0 120 5 0 minecraft:air`)
    bot.chat(`/fill 119 4 2 119 5 2 minecraft:air`)
    bot.chat(`/setblock 119 4 3 minecraft:air`)
    bot.chat(`/fill 118 4 2 118 4 3 minecraft:air`)
    bot.chat(`/setblock 119 5 3 minecraft:air`)
    bot.chat(`/setblock 119 4 0 minecraft:air`)
    bot.chat(`/setblock 119 5 0 minecraft:air`)
    bot.chat(`/setblock 119 4 -1 minecraft:air`)
    bot.chat(`/setblock 119 5 -1 minecraft:air`)
    bot.chat(`/setblock 119 4 1 minecraft:air`)
    bot.chat(`/setblock 119 5 1 minecraft:air`)
  })

})
