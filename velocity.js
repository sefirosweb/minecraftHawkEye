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


    botChecker.on('physicTick', function() {
        if (!entity || entity.isValid === false) {
            entity = getEntity(botChecker);
            timeStart = Date.now();
            maxY = 0;
            timeMaxY = 0;
        }

        if (entity) {

            if (lastY === entity.position.y) {
                if (countLastY === 0) {
                    timeEnd = Date.now();
                }
                countLastY++;

                if (countLastY === 10) {
                    console.log("Total Time:", (timeEnd - timeStart) / 1000);
                    console.log("MaxY", Math.round(maxY * 100) / 100, "Time to max to end:", (timeEnd - timeMaxY) / 1000);
                }
            } else {
                console.clear();
                console.log(entity.position, entity.velocity.y);
                countLastY = 0;
                lastY = entity.position.y;

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