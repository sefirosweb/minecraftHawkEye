const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const saveToFile = require('./saveToFile').save;

const { getPlayer, getEntityArrow } = require('./botFunctions');

const { getTicks, degrees_to_radians, radians_to_degrees, round, getVox, getVoy, getMaxZ } = require('./hawkEyeEquations');

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

botChecker.on('spawn', function() {
    const logs = true;
    botChecker.chat('/kill @e[type=minecraft:arrow]');

    let Vox = 0;
    let Voy = 0;

    let timeStart = 0;
    let timeEnd = 0;
    let tickStart = 0;
    let tickEnd = 0;
    let ticks = 0;

    let lastY = 0;
    let countLastY = 0;
    let entity = false;

    let maxY = 0;
    let timeMaxY = 0;
    let maxVelocityY = 0;
    let maxVelocity = 0;

    let dataArray = [];

    let yaw = 0;
    let pitch = 0;

    botChecker.chat('Ready!');

    botChecker.on('physicTick', function() {
        if (!entity || entity.isValid === false) {
            entity = getEntityArrow(botChecker);
            if (entity) {

                player = getPlayer(botChecker, config.usernameA);
                pitch = player.pitch;
                yaw = player.yaw;
                Vox = getVox(3, pitch);
                Voy = getVoy(3, pitch);

                // No va
                // ticks = getTicks(Voy, player.position.y, 4);
                // maxZ_preview = getMaxZ(Vox, player.position.z, ticks);
                // previewArrow = calcPreviewArrow(entity, ticks);


                timeStart = Date.now();
                tickStart = 0;


                maxY = 0;
                maxZ = 0;
                timeMaxY = 0;
                maxVelocityY = 0;
                maxVelocity = 0;

                dataArray = [];
            }
        }

        tickStart++;

        if (entity) {

            if (lastY === entity.position.y) {
                if (countLastY === 0) {
                    timeEnd = Date.now();
                    tickEnd = tickStart;
                }
                countLastY++;
                if (countLastY === 10) {
                    // console.clear();
                    console.log('************************ Resume ************************');
                    console.log("Total Time:", (timeEnd - timeStart) / 1000);
                    console.log("Max Z:", round(maxZ), "Max Y", round(maxY), "Second from MaxY to finish", (timeEnd - timeMaxY) / 1000);
                    console.log("Max Velocity Y", round(maxVelocityY));
                    console.log("Max Velocity", round(maxVelocity));

                    console.log('************************ Player ************************');
                    console.log("Yaw", round(180 - radians_to_degrees(yaw)), "Pitch (y)", round(-radians_to_degrees(pitch)));
                    console.log("Vo", 3, "Vox", round(Vox), "Voy", round(Voy));
                    console.log("Grade", grade);

                    console.log('************************ Preview ************************');
                    // console.log("Ticks", ticks, "Max Z:", maxZ_preview);

                    // console.log("Ticks", previewArrow.tick, "MaxZ", round(previewArrow.position.z));
                    // console.log("physicTick", tickEnd);

                    botChecker.chat('/kill @e[type=minecraft:arrow]');

                    saveToFile(dataArray, './files/real_velocity.csv');

                    nextShotReady = true;
                }
            } else {

                if (logs) {
                    console.clear();
                    console.log(entity.position);
                    console.log("Velocity per tick of Y", round(entity.velocity.y));
                }

                const velocity = getVelocity(entity.velocity);

                if (logs) {
                    console.log("Velocity", round(velocity));
                }

                countLastY = 0;
                lastY = entity.position.y;

                dataArray.push({
                    grade: grade,
                    playerGrade: radians_to_degrees(pitch),
                    tick: tickStart,
                    position_x: entity.position.x,
                    position_y: entity.position.y,
                    position_z: entity.position.z,
                    velocity_x: entity.velocity.x,
                    velocity_y: entity.velocity.y,
                    velocity_z: entity.velocity.z,
                });


                if (maxVelocityY <= entity.velocity.y) {
                    maxVelocityY = entity.velocity.y;
                }

                if (maxVelocity <= velocity) {
                    maxVelocity = velocity;
                }

                if (maxY <= entity.position.y) {
                    maxY = entity.position.y;
                    timeMaxY = Date.now();
                }

                if (maxZ <= entity.position.z) {
                    maxZ = entity.position.z;
                }
            }
        }

        // .toString().replace(/\./, ','))
    });
});


function getVelocity(a) {
    return Math.sqrt(
        Math.pow(a.x, 2) +
        Math.pow(a.y, 2) +
        Math.pow(a.z, 2)
    )
}




bot.on('spawn', function() {
    bot.chat('Ready!');
    bot.on("chat", (username, message) => {
        if (message.match(/shot.*/)) {
            var msg = message.split(" ");
            bot.chat("Shotting! " + msg[1]);
            shotBow(bot, msg[1], msg[2]);
        }

        if (message.match(/go.*/)) {
            var msg = message.split(" ");
            multiShot(bot)
            bot.on('physicTick', multiShot);
        }
    });
});

let nextShotReady = true;
let grade = -1;

function multiShot() {
    if (nextShotReady) {
        grade++;
        nextShotReady = false;
        setTimeout(() => {
            bot.chat("Grade => " + grade);
            shotBow(bot, grade, 180);
        }, 2000);

    }
    if (grade >= 90) {
        bot.removeListener('physicTick', multiShot)
    }

}

function shotBow(bot, grade, yaw = null) {
    if (yaw === null) {
        yaw = bot.player.entity.yaw;
    } else {
        yaw = degrees_to_radians(yaw);
    }
    bot.look(yaw, degrees_to_radians(grade));
    bot.activateItem();
    setTimeout(() => {
        bot.deactivateItem();
    }, 1200);
}