const Vec3 = require('vec3')
const { iterators } = require('prismarine-world')
const { RaycastIterator } = iterators

module.exports = (bot) => {
  const check = (from, to) => {
    const range = from.distanceTo(to)
    const direction = to.minus(from)
    return raycast(from, direction.normalize(), range)
  }

  const checkMultiplePositions = (positions) => {
    let iterations = []
    if (positions.length < 2) {
      return false
    }

    let to, from, checkIterations
    from = new Vec3(positions[0])

    for (let i = 1; i <= positions.length; i++) {
      to = new Vec3(positions[i])
      checkIterations = check(from, to)
      if (checkIterations.block === false) {
        iterations = iterations.concat(checkIterations.iterations)
      }
      from = to.clone()
    }

    return iterations
  }

  const raycast = (from, direction, range) => {
    const iterations = []
    const iter = new RaycastIterator(from, direction, range)
    let pos = iter.next()
    while (pos) {
      const position = new Vec3(pos.x, pos.y, pos.z)
      iterations.push(position.clone())
      const block = bot.blockAt(position)
      if (block) {
        const intersect = iter.intersect(block.shapes, position)
        if (intersect) {
          return {
            block,
            iterations
          }
        }
      }
      pos = iter.next()
    }

    return {
      block: false,
      iterations
    }
  }

  return {
    check,
    checkMultiplePositions
  }
}
