const config = require('./config');
const mineflayer = require('mineflayer');
const { getPlayer, shotBow } = require('./botFunctions');
const equations = require('./hawkEyeEquations');
// const botB = require('./bot_helper').start();

const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})


bot.on('entity_velocity', (packet) => {
    // entity velocity
    const entity = fetchEntity(packet.entityId)
    const notchVel = new Vec3(packet.velocityX, packet.velocityY, packet.velocityZ)
    entity.velocity.update(conv.fromNotchVelocity(notchVel))
})

bot.on('spawn', function() {



    bot.chat('Ready!');

    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 300');
    bot.chat('/time set day');
    bot.chat('/kill @e[type=minecraft:arrow]');

    // Shot every 1,2 secs
    let prevTime = Date.now();
    let preparingShot = null;
    let prevPlayerPositions = [];

    bot.on('physicTick', function() {
        let player = getPlayer(bot, "Looker");
        if (!player)
            return false;

        if (prevPlayerPositions.length > 10)
            prevPlayerPositions.shift();

        const position = {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        }

        prevPlayerPositions.push(position);

        let speed = {
            x: 0,
            y: 0,
            z: 0
        };
        for (let i = 1; i < prevPlayerPositions.length; i++) {
            const pos = prevPlayerPositions[i];
            const prevPos = prevPlayerPositions[i - 1];
            speed.x += pos.x - prevPos.x;
            speed.y += pos.y - prevPos.y;
            speed.z += pos.z - prevPos.z;
        }

        speed.x = speed.x / prevPlayerPositions.length;
        speed.y = speed.y / prevPlayerPositions.length;
        speed.z = speed.z / prevPlayerPositions.length;

        const currentTime = Date.now();

        if (!preparingShot || preparingShot === null) {
            bot.activateItem();
            preparingShot = true;
        }
        const infoShot = equations.getMasterGrade(bot, player, speed);
        if (!infoShot)
            return false;
        bot.look(infoShot.yaw, infoShot.pitch);
        if (preparingShot && currentTime - prevTime > 1200) {
            console.log(infoShot.target)
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