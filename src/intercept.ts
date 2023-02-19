import { Vec3 } from 'vec3'
import { bot } from './loadBot'
import { Block } from 'prismarine-block'

export const check = (from: Vec3, to: Vec3): Block | null => {
  const range = from.distanceTo(to)
  const direction = to.minus(from)
  return bot.world.raycast(from, direction.normalize(), range)
}
