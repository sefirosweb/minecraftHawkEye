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
    let degrees = getMasterGrade(bot, player);
    shotBow(bot, yaw, degrees_to_radians(degrees));
}


// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factorY = 0.01; // Factores de resistencia
const factorH = 0.01; // Factores de resistencia
const BaseVo = 3;


function getMasterGrade(bot, target) {
    const distances = getTargetDistance(bot, target);
    const x_destination = distances.h_distance;
    const y_destination = distances.y_distance;

    grade = getFirstGradeAproax(x_destination, y_destination);

    let nearestDistance = false;
    let nearestGrade = false;
    console.clear();

    for (let iGrade = (grade - 10) * 10; iGrade <= (grade + 10) * 10; iGrade += 1) {

        distance = tryGrade(iGrade / 10, x_destination, y_destination).nearestDistance
        console.log(iGrade);

        if (nearestDistance > distance || nearestDistance === false) {
            nearestDistance = distance;
            nearestGrade = iGrade / 10;
        }
    }

    console.log("Grados inicio:", grade);
    console.log("Mas cercano:", nearestGrade, nearestDistance);
    console.log(distances)
    return nearestGrade;
}


// Calculate the 2 most aproax shots
// https://es.qwe.wiki/wiki/Trajectory
function getFirstGradeAproax(x_destination, y_destination) {
    let grade = -90;
    let nearestDistance = false;

    let nearestGrade_first = false;
    let nearestGrade_second = false;

    while (true) {
        distance = tryGrade(grade, x_destination, y_destination).nearestDistance

        if (nearestDistance > distance || nearestDistance === false) {
            if (grade)
                nearestDistance = distance;
            nearestGrade_first = grade;
        }

        grade++;

        if (grade >= 90) {
            return nearestGrade_first;
        }
    }
}

// Calculate Arrow Trayectory
function tryGrade(grade, x_destination, y_destination) {
    let Vo = BaseVo;
    let Voy = equations.getVoy(Vo, equations.degrees_to_radians(grade));
    let Vox = equations.getVox(Vo, equations.degrees_to_radians(grade));
    let Vy = Voy;
    let Vx = Vox;
    let ProjectileGrade;

    let nearestDistance = false;
    let totalTicks = 0;

    while (true) {
        totalTicks++;
        const distance = Math.sqrt(Math.pow(Vy - y_destination, 2) + Math.pow(Vx - x_destination, 2));

        if (nearestDistance > distance || nearestDistance === false) {
            nearestDistance = distance;
            nearestGrade = grade;
        }

        Vo = equations.getVo(Vox, Voy, gravity);
        ProjectileGrade = equations.getGrades(Vo, Voy, gravity);

        Voy = equations.getVoy(Vo, equations.degrees_to_radians(ProjectileGrade), Voy * factorY);
        Vox = equations.getVox(Vo, equations.degrees_to_radians(ProjectileGrade), Vox * factorH);

        Vy += Voy;
        Vx += Vox;

        // Arrow passed player OR Voy (arrow is going down and passed player)
        if (Vx > x_destination || (Voy < 0 && y_destination > Vy)) {
            return {
                nearestDistance: nearestDistance,
                totalTicks: totalTicks
            };
        }
    }
}