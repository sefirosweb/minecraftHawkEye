const getMasterGrade = require('./hawkEyeEquations');

let target;
let bot;
let prevTime;
let preparingShot
let prevPlayerPositions = [];

function load(botToLoad) {
    bot = botToLoad;
}

function attack(targetToAttack) {
    target = targetToAttack;
    prevTime = Date.now();
    preparingShot = false;
    prevPlayerPositions = [];

    bot.on('physicTick', autoCalc);
}

function stop() {
    bot.deactivateItem();
    bot.removeListener('physicTick', autoCalc);
}

function autoCalc() {
    if (target === undefined || target === false || !target.isValid) {
        stop();
        return false;
    }

    if (prevPlayerPositions.length > 10)
        prevPlayerPositions.shift();

    const position = {
        x: target.position.x,
        y: target.position.y,
        z: target.position.z
    }

    prevPlayerPositions.push(position);

    let speed = {
        x: 0,
        y: 0,
        z: 0
    };

    for (let i = 1; i < prevPlayerPositions.length; i++) {
        const pos = prevPlayerPositions[i];
        const prevPos = prevPlayerPositions[i - 1];
        speed.x += pos.x - prevPos.x;
        speed.y += pos.y - prevPos.y;
        speed.z += pos.z - prevPos.z;
    }

    speed.x = speed.x / prevPlayerPositions.length;
    speed.y = speed.y / prevPlayerPositions.length;
    speed.z = speed.z / prevPlayerPositions.length;

    if (!preparingShot) {
        bot.activateItem();
        preparingShot = true;
    }

    const infoShot = getMasterGrade(bot, target, speed);

    if (infoShot) {
        bot.look(infoShot.yaw, infoShot.pitch);

        const currentTime = Date.now();
        if (preparingShot && currentTime - prevTime > 1200) {
            bot.deactivateItem();
            prevTime = currentTime;
            preparingShot = false;
        }
    }
}

module.exports = {
    load,
    attack,
    stop
}