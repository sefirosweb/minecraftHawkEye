const equations = require('./hawkEyeEquations');

function getPlayer(bot, playername = null) {
    for (const entity of Object.values(bot.entities)) {
        if (entity.type === 'player') {
            if (playername === null)
                return entity;
            if (entity.username === playername)
                return entity;
        }
    }
    return false;
}

function getEntityArrow(bot) {
    for (const entity of Object.values(bot.entities)) {
        //if (entity.type === 'player') {
        if (entity.type === 'object' && entity.objectType === 'Arrow') {
            return entity;
        }
    }
    return false;
}


function shotBow(bot, yaw = null, grade = null) {
    if (yaw === null) {
        yaw = bot.player.entity.yaw;
    }
    if (grade === null) {
        grade = bot.player.entity.grade;
    }

    bot.look(yaw, grade, true, () => {
        bot.activateItem();
        setTimeout(() => {
            bot.deactivateItem();
        }, 1200);
    });
}

module.exports = {
    getPlayer,
    getEntityArrow,
    shotBow
}