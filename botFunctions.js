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

function shotBow(bot, grade, yaw = null) {
    if (yaw === null) {
        yaw = bot.player.entity.yaw;
    } else {
        yaw = equations.degrees_to_radians(yaw);
    }

    bot.look(yaw, equations.degrees_to_radians(grade));
    bot.activateItem();
    setTimeout(() => {
        bot.deactivateItem();
    }, 1200);
}

module.exports = {
    getPlayer,
    getEntityArrow,
    shotBow
}