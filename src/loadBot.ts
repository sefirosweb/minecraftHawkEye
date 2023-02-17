import { System } from "detect-collisions";
import { Bot } from "mineflayer";

export let bot: Bot
export const physics = new System();

export default (botIn: Bot) => {
    bot = botIn
}