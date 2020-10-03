const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear } = require('mineflayer-pathfinder').goals;

function start() {
    const bot = mineflayer.createBot({
        username: config.usernameB,
        port: config.port,
        host: config.host
    })
    bot.loadPlugin(pathfinder)

    let point = 0;

    bot.on('spawn', function() {
        bot.chat('Ready!');
        bot.chat('/give Looker bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
        bot.chat('/give Looker minecraft:arrow 600');
        goNextPoint(bot, points[point]);
    });

    bot.on('goal_reached', () => {
        point++;
        if (point >= points.length)
            point = 0;
        setTimeout(() => {
            goNextPoint(bot, points[point]);
        }, 100);

    });


    const points = [];
    points.push({
        x: 40,
        y: 4,
        z: 40
    });
    points.push({
        x: -40,
        y: 4,
        z: 40
    });
    points.push({
        x: -40,
        y: 4,
        z: -40
    });
    points.push({
        x: 40,
        y: 4,
        z: -40
    });

    function goNextPoint(bot, goal) {
        const mcData = require('minecraft-data')(bot.version)
        const defaultMove = new Movements(bot, mcData)
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalNear(goal.x, goal.y, goal.z, 1));
    }



}

module.exports = {
    start
}