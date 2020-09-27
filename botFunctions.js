function getPlayer(bot, playername) {
    for (const entity of Object.values(bot.entities)) {
        if (entity.type === 'player') {
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


module.exports = {
    getPlayer,
    getEntityArrow
}