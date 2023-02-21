import { Projectil } from '../../src/types'
import { bot } from '../hooks'

describe('05_arrow_detection', () => {
  let Y = 4
  before(async () => {
    Y = bot.test.groundY
    await bot.test.resetState()
    bot.chat(`/give ${bot.username} shield{Enchantments:[{id:unbreaking,lvl:3}]} 1`)
  })


  it('Skeleton', async (): Promise<void> => {
    bot.hawkEye.startRadar()
    bot.on('target_aiming_at_you', (entity) => {
      console.log('Detected aim', entity.type === 'player' ? entity.username : entity.name)
    })

    return new Promise(async (resolve) => {


      bot.once('incoming_projectil', (projectil: Projectil) => {
        console.log('Arrow detected!')
        bot.lookAt(projectil.entity.position, true)
        bot.activateItem()

        setTimeout(() => {
          bot.deactivateItem()

          bot.removeAllListeners('target_aiming_at_you')

          bot.chat('/kill @e[type=minecraft:skeleton]')
          resolve()
        }, 1000)
      })

      await bot.test.wait(1000)
      bot.chat(`/summon skeleton -14.5 ${Y} 0.5`)
    })
  })

})
