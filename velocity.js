const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { get } = require('http');
const { time, count } = require('console');
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
    let Vy = 0;
    let timeStart = 0;
    let timeEnd = 0;
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
            maxY = 0;
            timeMaxY = 0;
            maxVelocityY = 0;
            maxVelocity = 0;
        }

        if (entity) {

            if (lastY === entity.position.y) {
                if (countLastY === 0) {
                    timeEnd = Date.now();
                }
                countLastY++;

                if (countLastY === 10) {
                    console.log("Total Time:", (timeEnd - timeStart) / 1000);
                    console.log("MaxY", Math.round(maxY * 100) / 100, "Second from MaxY to finish", (timeEnd - timeMaxY) / 1000);
                    console.log("Max Velocity Y", Math.round(maxVelocityY * 100) / 100);
                    console.log("Max Velocity", Math.round(maxVelocity * 100) / 100);
                }
            } else {
                console.clear();
                console.log(entity.position);
                console.log("Velocity per tick of Y", entity.velocity.y);
                const velocity = getVelocity(entity.velocity);
                console.log("Velocity", velocity);

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
        /*else {
            arrow = false;
            Vy = 0;
            if (finished === false) {
                console.log('Total Time arrow', timeStart - Date.now());
                finished = true;
            }
        }*/

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