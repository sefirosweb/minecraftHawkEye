const config = require('./config');
const mineflayer = require('mineflayer');
const Vec3 = require('vec3');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { get } = require('http');
const { time, count } = require('console');
const { exit } = require('process');
const { GoalNear } = require('mineflayer-pathfinder').goals;

const botChecker = mineflayer.createBot({
    username: config.usernameB,
    port: config.port,
    host: config.host
})
botChecker.loadPlugin(pathfinder)


function getEntity(bot) {
    for (const entity of Object.values(bot.entities)) {
        //if (entity.type === 'player') {
        if (entity.type === 'object' && entity.objectType === 'Arrow') {
            return entity;
        }
    }

    return false;
}

botChecker.on('spawn', function() {
    botChecker.chat('/kill @e[type=minecraft:arrow]');
    let Vy = 0;

    let timeStart = 0;
    let timeEnd = 0;
    let tickStart = 0;
    let tickEnd = 0;

    let lastY = 0;
    let countLastY = 0;
    let entity = false;

    let maxY = 0;
    let timeMaxY = 0;
    let maxVelocityY = 0;
    let maxVelocity = 0;



    botChecker.on('physicTick', function() {
        if (!entity || entity.isValid === false) {
            entity = getEntity(botChecker);
            timeStart = Date.now();
            tickStart = botChecker.time.timeOfDay;

            maxY = 0;
            timeMaxY = 0;
            maxVelocityY = 0;
            maxVelocity = 0;

            if (entity) {
                previewArrow = calcPreviewArrow(entity);
            }
        }

        if (entity) {

            if (lastY === entity.position.y) {
                if (countLastY === 0) {
                    timeEnd = Date.now();
                    tickEnd = botChecker.time.timeOfDay;
                }
                countLastY++;
                if (countLastY === 10) {
                    console.log('************************ Resume ************************');
                    console.log("Total Time:", (timeEnd - timeStart) / 1000);
                    console.log("MaxY", Math.round(maxY * 100) / 100, "Second from MaxY to finish", (timeEnd - timeMaxY) / 1000);
                    console.log("Max Velocity Y", Math.round(maxVelocityY * 100) / 100);
                    console.log("Max Velocity", Math.round(maxVelocity * 100) / 100);

                    console.log('************************ Preview ************************');
                    console.log("Ticks", previewArrow.tick, "MaxZ", previewArrow.position.z);
                    console.log(tickEnd - tickStart);


                    botChecker.chat('/kill @e[type=minecraft:arrow]');
                }
            } else {
                console.clear();
                console.log(entity.position);
                console.log("Velocity per tick of Y", entity.velocity.y);
                const velocity = getVelocity(entity.velocity);
                console.log("Velocity", velocity);
                console.log(botChecker.time.age);

                countLastY = 0;
                lastY = entity.position.y;

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

function calcPreviewArrow(arrow) {
    // drag = 30;
    base = new Vec3(arrow.position);
    velocity = new Vec3(arrow.velocity);
    downwardAccel = new Vec3(0, -0.05, 0);
    tick = 0;
    let intercepts = incercetp_block(botChecker);
    while (intercepts) {
        velocity.add(downwardAccel);
        base.add(velocity);
        intercepts = incercetp_block(botChecker);
        tick++;
    }
    tick--;

    return {
        tick: tick,
        position: base
    };
}


function incercetp_block(bot) {
    block = bot.blockAt(base).name;
    if (block !== 'air') {
        return false
    }
    return true;
}