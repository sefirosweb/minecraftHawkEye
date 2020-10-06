const config = require('./config');
const mineflayer = require('mineflayer');
const { getPlayer } = require('./botFunctions');
const hawkEye = require('./hawkEye');

const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})
hawkEye.load(bot);

bot.on('spawn', function() {
    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 300');
    bot.chat('/time set day');
    bot.chat('/kill @e[type=minecraft:arrow]');

    bot.chat('Ready!');

    let target = getPlayer(bot, "Looker");
    if (!target)
        return false;

    hawkEye.attack(target);
});