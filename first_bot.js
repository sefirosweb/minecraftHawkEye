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

    bot.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 3000) {
            lastTime = currentTime;
            shot(bot);
        }
    });

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
            console.log("Target can reach!", distances);
        }
    }

}


// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factorY = 0.01; // Factores de resistencia
const factorH = 0.01; // Factores de resistencia
const BaseVo = 3;

function getMasterGrade(bot, target) {
    let grade = -90;
    let nearestDistance = false;
    let nearestGrade = false;

    const distances = getTargetDistance(bot, target);
    const x_destination = distances.h_distance;
    const y_destination = distances.y_distance;

    while (true) {
        distance = tryGrade(grade, x_destination, y_destination)

        if (nearestDistance > distance) {
            nearestDistance = distance;
            nearestGrade = grade;
        }

        if (nearestDistance === false) {
            nearestDistance = distance;
            nearestGrade = grade;
        }

        grade++;

        if (grade >= 90) {
            console.log(nearestGrade, nearestDistance);
            return nearestGrade;
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

    let nearestDistance = false;

    while (true) {
        const distance = Math.sqrt(Math.pow(Vy - y_destination, 2) + Math.pow(Vx - x_destination, 2));

        if (nearestDistance > distance) {
            nearestDistance = distance;
        }

        if (nearestDistance === false) {
            nearestDistance = distance;
        }

        Vo = equations.getVo(Vox, Voy, gravity);
        ProjectileGrade = equations.getGrades(Vo, Voy, gravity);

        Voy = equations.getVoy(Vo, equations.degrees_to_radians(ProjectileGrade), Voy * factorY);
        Vox = equations.getVox(Vo, equations.degrees_to_radians(ProjectileGrade), Vox * factorH);

        Vy += Voy;
        Vx += Vox;

        // Arrow passed player OR Voy (arrow is going down and passed player)
        if (Vx > x_destination || (Voy < 0 && y_destination > Vy)) {
            return nearestDistance;
        }
    }
}