
// import { bot } from '../hooks'

describe('01_basic', function () {

  it('Spawned', (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 20000);
    })
  })

})
