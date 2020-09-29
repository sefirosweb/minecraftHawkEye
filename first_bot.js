const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const { getPlayer, shotBow } = require('./botFunctions');
const equations = require('./hawkEyeEquations');
const { radians_to_degrees, degrees_to_radians, getTargetDistance } = require('./hawkEyeEquations');


const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})

bot.on('spawn', function() {
    bot.chat('Ready!');
    let lastTime = Date.now();
    /*
    bot.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 3000) {
            lastTime = currentTime;
            shot(bot);
        }
    });*/

    bot.on("chat", (username, message) => {
        if (message.match(/shot.*/)) {
            var msg = message.split(" ");
            bot.chat("Shotting " + msg[1]);
            shotBow(bot, msg[1], msg[2]);
        }


        if (message.match(/kill.*/)) {
            var msg = message.split(" ");
            bot.chat("Attack on " + msg[1]);

            shot(bot);
        }
    });
});


function shot(bot) {
    const player = getPlayer(bot);
    if (!player)
        return false;

    const distances = equations.getTargetDistance(bot, player);
    const yaw = equations.getTargetYaw(bot, player);

    // Pitch / Degrees
    let degrees = 0;

    if (distances.distance <= 20) {
        degrees = equations.getTargetPitch(bot, player);
        degrees = radians_to_degrees(degrees);
        shotBow(bot, yaw, degrees_to_radians(degrees));
    } else {
        degrees = getMasterGrade(bot, player);
        if (degrees) {
            shotBow(bot, yaw, degrees_to_radians(degrees));
        } else {
            console.log("Target can reach!");
        }
    }

}


// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factorY = 0.01;; // No son correctas
const factorH = 0.01; // No son correctas
const BaseVo = 3;

function getMasterGrade(bot, target) {
    let grade = 2;
    let ticks = 0;

    const distances = getTargetDistance(bot, target);
    const x_destination = distances.h_distance;
    const y_destination = distances.y_distance;

    while (true) {
        tryG = tryGrade(grade, x_destination, y_destination)
        if (tryG)
            return grade;
        grade = grade + 1;
        console.log(grade);
        if (grade > 9) {
            return false;
        }
    }

}

function tryGrade(grade, x_destination, y_destination) {
    let Vo = BaseVo;
    let Voy = equations.getVoy(Vo, equations.degrees_to_radians(grade));
    let Vox = equations.getVox(Vo, equations.degrees_to_radians(grade));
    let Vy = Voy;
    let Vx = Vox;
    let ProjectileGrade;

    while (true) {
        if (
            (Vy - y_destination) > -1 &&
            (Vy - y_destination) < 1 &&
            (Vx - x_destination) > -1 &&
            (Vx - x_destination) < 1
        ) { // +- 1 aproach
            console.log("Found grade", grade);
            return grade;
        }

        Vo = equations.getVo(Vox, Voy, gravity);
        ProjectileGrade = equations.getGrades(Vo, Voy, gravity);

        Voy = equations.getVoy(Vo, equations.degrees_to_radians(ProjectileGrade), Voy * factorY);
        Vox = equations.getVox(Vo, equations.degrees_to_radians(ProjectileGrade), Vox * factorH);

        Vy += Voy;
        Vx += Vox;

        if (Vx > x_destination) {
            return false;
        }
    }
}