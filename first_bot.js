const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const { getPlayer, shotBow } = require('./botFunctions');
const equations = require('./hawkEyeEquations');
const { radians_to_degrees, degrees_to_radians } = require('./hawkEyeEquations');


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


// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factorY = 0.008;; // No son correctas
const factorH = 0.005; // No son correctas
const Vo = 3;

bot.on('spawn', function() {
    bot.chat('Ready!');
    let lastTime = Date.now();
    bot.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 3000) {
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

            shotToTarget(bot, msg[1]);
        }
    });
});


function shot(bot) {
    const player = getPlayer(bot);
    if (!player)
        return false;

    const distances = equations.getTargetDistance(bot, player);
    const yaw = equations.getTargetYaw(bot, player);

    let dregrees = 0;

    shotBow(bot, yaw, degrees_to_radians(dregrees));
}