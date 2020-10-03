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

    let lastTime = Date.now();

    bot.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 1200) {
            lastTime = currentTime;
            shot(bot);
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


function shot(bot) {
    const player = getPlayer(bot, "Looker");
    if (!player)
        return false;

    const infoShot = equations.getMasterGrade(bot, player);
    if (infoShot) {
        shotBow(bot, infoShot.yaw, equations.degrees_to_radians(infoShot.pitch));
    } else {
        console.log('Cant reach target');
    }
}