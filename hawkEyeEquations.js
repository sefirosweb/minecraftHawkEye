const Vec3 = require('vec3');


function getTargetDistance(bot, target) {
    const x_distance = Math.pow(bot.player.entity.position.x - target.position.x, 2)
    const z_distance = Math.pow(bot.player.entity.position.z - target.position.z, 2)
    const h_distance = Math.sqrt(x_distance + z_distance);

    const y_distance = bot.player.entity.position.y - target.position.y

    const distance = Math.sqrt(Math.pow(y_distance, 2) + x_distance + z_distance)

    return {
        distance,
        h_distance,
        y_distance,
    }
}

function getTargetYaw(bot, target) {
    const x_distance = target.position.x - bot.player.entity.position.x;
    const z_distance = target.position.z - bot.player.entity.position.z;
    const yaw = Math.atan2(x_distance, z_distance) + Math.PI;
    return yaw;
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function round(value) {
    return Math.round(value * 100) / 100;
}

function getVox(Vo, Alfa) {
    return Vo * Math.cos((Alfa))
}

function getVoy(Vo, Alfa) {
    return Vo * Math.sin((Alfa))
}


function incercetp_block(bot, position) {
    block = bot.blockAt(position);
    if (!block)
        return false
    if (block.name !== 'air') {
        return false
    }
    return true;
}

module.exports = {
    degrees_to_radians,
    radians_to_degrees,
    round,
    getTargetDistance,
    getTargetYaw
}