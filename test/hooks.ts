
import { createBot } from 'mineflayer';
import { Bot } from '../src/types';
import injectCommonTest from './common/testCommon'
import minecraftHawkEye from '../src/index'

export const TEST_TIMEOUT_MS = 180000
export let bot: Bot

export const mochaHooks = () => {
    return {
        beforeAll() {
            before((done) => {

                if (bot !== undefined) {
                    done()
                    return
                }

                const begin = () => {
                    bot = createBot({
                        username: 'Archer',
                        host: 'localhost',
                        port: 25565,
                        viewDistance: 'tiny'
                    }) as Bot

                    bot.once('spawn', () => {
                        injectCommonTest(bot)
                        bot.loadPlugin(minecraftHawkEye)
                        done()
                    })
                }

                begin()
            })
        },

        afterAll() {
            after((done) => {
                bot.quit()
                done()
            })
        }

    }
}