import { Vec3 } from 'vec3'
// @ts-ignore
import { iterators } from 'prismarine-world'
import { Block } from 'prismarine-block'
import { bot } from './loadBot'
const { RaycastIterator } = iterators

export const check = (from: Vec3, to: Vec3) => {
  const range = from.distanceTo(to)
  const direction = to.minus(from)
  return raycast(from, direction.normalize(), range)
}

export const checkMultiplePositions = (positions: Array<Vec3>) => {
  let iterations: Array<Vec3> = []
  if (positions.length < 2) {
    return false
  }

  let to: Vec3
  let from: Vec3
  let checkIterations: ReturnType<typeof check>

  from = positions[0].clone()

  for (let i = 1; i <= positions.length; i++) {
    to = positions[i].clone()
    checkIterations = check(from, to)
    if (checkIterations.block === undefined) {
      iterations = iterations.concat(checkIterations.iterations)
    }
    from = to.clone()
  }

  return iterations
}

const raycast = (from: Vec3, direction: Vec3, range: number): {
  block: Block | null,
  iterations: Array<Vec3>
} => {
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
    block: null,
    iterations
  }
}