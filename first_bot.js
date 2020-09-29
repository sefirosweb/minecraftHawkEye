const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const { getPlayer, getEntityArrow, shotBow } = require('./botFunctions');


const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})
bot.loadPlugin(pathfinder)

const botChecker = mineflayer.createBot({
    username: config.usernameB,
    port: config.port,
    host: config.host
})

botChecker.loadPlugin(pathfinder)


bot.on('spawn', function() {
    bot.chat('Ready!');
    bot.on("chat", (username, message) => {
        if (message.match(/shot.*/)) {
            var msg = message.split(" ");
            bot.chat("Shotting " + msg[1]);
            shotBow(bot, msg[1], msg[2]);
        }

        if (message.match(/go.*/)) {
            var msg = message.split(" ");
            multiShot(bot)
            bot.on('physicTick', multiShot);
        }

        if (message.match(/kill.*/)) {
            var msg = message.split(" ");
            bot.chat("Attack on " + msg[1]);
            shotToTarget(bot, msg[1]);
        }
    });
});

function shotToTarget(playername = null) {
    const player = getPlayer(playername);
    console.log(player);
}