
import { createBot } from 'mineflayer';
import { Bot } from 'types';
// import injectCommonTest from './common/testCommon'

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

                function begin() {
                    bot = createBot({
                        username: 'Archer',
                        host: 'host.docker.internal',
                        port: 25565
                    }) as Bot

                    bot.once('spawn', () => {
                        // injectCommonTest(bot)
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