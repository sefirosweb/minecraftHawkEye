const config = require('./config');
const mineflayer = require('mineflayer');
const { getPlayer, shotBow } = require('./botFunctions');
const equations = require('./hawkEyeEquations');
const botB = require('./bot_helper').start();

const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})

bot.on('spawn', function() {
    bot.chat('Ready!');

    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 60');
    bot.chat('/time set day');
    bot.chat('/kill @e[type=minecraft:arrow]');

    // Shot every 1,2 secs
    let prevTime = Date.now();
    let preparingShot = null;
    bot.on('physicTick', function() {
        console.clear();

        const currentTime = Date.now();
        const player = getPlayer(bot, "Looker");

        console.log(player)

        if (!player)
            return false;
        if (!preparingShot || preparingShot === null) {
            bot.activateItem();
            preparingShot = true;
        }
        const infoShot = equations.getMasterGrade(bot, player);
        if (!infoShot)
            return false;
        bot.look(infoShot.yaw, infoShot.pitch);
        if (preparingShot && currentTime - prevTime > 1200) {
            bot.deactivateItem();
            prevTime = currentTime;
            preparingShot = false;
        }
    });

    bot.on("chat", (username, message) => {
        if (message.match(/shot.*/)) {
            var msg = message.split(" ");
            bot.chat("Shotting " + msg[1]);
            shotBow(bot, msg[1], msg[2]);
        }


        if (message.match(/kill.*/)) {
            var msg = message.split(" ");
            bot.chat("Attack on " + msg[1]);

            shot(bot);
        }
    });
});