const { autoAttack, stop, load } = require('./src/hawkEye');
const { getPlayer, simplyShot } = require('./src/botFunctions');
const getMasterGrade = require('./src/hawkEyeEquations');

function inject(bot) {
    load(bot);

    bot.hawkEye = {};
    bot.hawkEye.getPlayer = function(playername = null) {
        return getPlayer(bot, playername);
    };
    bot.hawkEye.autoAttack = function(targetToAttack) {
        return autoAttack(targetToAttack, false);
    };
    bot.hawkEye.oneShot = function(targetToAttack) {
        return autoAttack(targetToAttack, true);
    };
    bot.hawkEye.getMasterGrade = getMasterGrade;
    bot.hawkEye.stop = stop;
    bot.hawkEye.simplyShot = simplyShot;
}

module.exports = inject;