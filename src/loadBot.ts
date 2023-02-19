import { System } from "detect-collisions";
import { Bot } from "mineflayer";

export let bot: Bot
export const system = new System();

export default (botIn: Bot) => {
    bot = botIn
}