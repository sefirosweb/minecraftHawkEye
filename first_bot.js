const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const { getPlayer, shotBow } = require('./botFunctions');
const equations = require('./hawkEyeEquations');
const { radians_to_degrees, degrees_to_radians, getTargetDistance } = require('./hawkEyeEquations');
const Vec3 = require('vec3');

/*
const botB = mineflayer.createBot({
    username: config.usernameB,
    port: config.port,
    host: config.host
})


botB.on('spawn', function() {
    botB.chat('Ready!');
    let lastTime = Date.now();

    bot.chat('/give Looker bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Looker minecraft:arrow 600');


    botB.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 1200) {
            lastTime = currentTime;
            shot(botB);
        }
    });
});
*/

const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})

bot.on('spawn', function() {
    bot.chat('Ready!');

    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 60');
    bot.chat('/time set day');

    let lastTime = Date.now();

    bot.on('physicTick', function() {
        const currentTime = Date.now();
        if (currentTime - lastTime > 1200) {
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


    const infoShot = getMasterGrade(bot, player);
    if (infoShot) {
        shotBow(bot, infoShot.yaw, degrees_to_radians(infoShot.pitch));
    } else {
        console.log('Cant reach target');
    }
}

Number.prototype.countDecimals = function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}

// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factorY = 0.01; // Factores de resistencia
const factorH = 0.01; // Factores de resistencia
const BaseVo = 3;


function getMasterGrade(bot, target) {
    console.clear();
    const yaw = equations.getTargetYaw(bot, target);
    const distances = getTargetDistance(bot, target);
    const x_destination = distances.h_distance;
    const y_destination = distances.y_distance;

    const grade = getFirstGradeAproax(x_destination, y_destination, yaw);

    if (!grade.nearestGrade_first)
        return false; // No aviable trayectory

    // Check blocks in trayectory
    let check = tryGrade(grade.nearestGrade_first.grade, x_destination, y_destination, BaseVo, bot, target);

    if (!check.blockInTrayect && check.nearestDistance < 4) {
        gradeShot = grade.nearestGrade_first.grade;
    } else {
        if (!grade.nearestGrade_second) {
            return false; // No aviable trayectory
        }
        check = tryGrade(grade.nearestGrade_second, x_destination, y_destination, BaseVo, bot, target);
        if (check.blockInTrayect === true) {
            return false; // No aviable trayectory
        }
        gradeShot = grade.nearestGrade_second.grade;
    }

    precisionShot = getPrecisionShot(gradeShot, x_destination, y_destination, 1);

    if (precisionShot.nearestDistance > 4) // Too far
        return false;

    console.log(precisionShot);
    return {
        pitch: precisionShot.nearestGrade / 10,
        yaw: yaw
    }
}


//Get more precision on shot
function getPrecisionShot(grade, x_destination, y_destination, decimals) {
    let nearestDistance = false;
    let nearestGrade = false;
    let nearestVo = false;
    decimals = Math.pow(10, decimals);

    // for (let i = Vo; i >= 1; i--) {
    for (let iGrade = (grade * 10) - 10; iGrade <= (grade * 10) + 10; iGrade += 1) {

        distance = tryGrade(iGrade / decimals, x_destination, y_destination, BaseVo);

        if ((distance.nearestDistance < nearestDistance) || nearestDistance === false) {
            nearestDistance = distance.nearestDistance;
            nearestGrade = iGrade;
            nearestTicks = distance.totalTicks;
        }

    }
    // }

    return {
        nearestGrade,
        nearestDistance,
        nearestVo
    };
}


// Calculate all 180º first grades
// Calculate the 2 most aproax shots 
// https://es.qwe.wiki/wiki/Trajectory
function getFirstGradeAproax(x_destination, y_destination) {
    let nearestDistance = false;

    let first_found = false;
    let nearestGrade_first = false;
    let nearestGrade_second = false;

    let nearGrades = [];

    for (let grade = -89; grade < 90; grade++) {
        const tryGradeShot = tryGrade(grade, x_destination, y_destination, BaseVo);

        tryGradeShot.grade = grade;
        if (tryGradeShot.nearestDistance > 4)
            continue;

        nearGrades.push(tryGradeShot);

        if (!nearestGrade_first)
            nearestGrade_first = tryGradeShot;

        if (tryGradeShot.grade - nearestGrade_first.grade > 10 && first_found === false) {
            first_found = true;
            nearestGrade_second = tryGradeShot;
        }

        if (nearestGrade_first.nearestDistance > tryGradeShot.nearestDistance && first_found === false)
            nearestGrade_first = tryGradeShot;

        if (nearestGrade_second.nearestDistance > tryGradeShot.nearestDistance && first_found)
            nearestGrade_second = tryGradeShot;



    }

    return {
        nearestGrade_first,
        nearestGrade_second
    };
}

// Calculate Arrow Trayectory
function tryGrade(grade, x_destination, y_destination, Vo, bot = false, target = false) {
    let Voy = equations.getVoy(Vo, equations.degrees_to_radians(grade));
    let Vox = equations.getVox(Vo, equations.degrees_to_radians(grade));
    let Vy = Voy;
    let Vx = Vox;
    let ProjectileGrade;

    let nearestDistance = false;
    let totalTicks = 0;

    let blockInTrayect = false;
    let previusArrowPosition = false;

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
        if (Vx > x_destination || (Voy < 0 && y_destination > Vy) || blockInTrayect) {
            return {
                nearestDistance: nearestDistance,
                totalTicks: totalTicks,
                blockInTrayect: blockInTrayect
            };
        }

        // Check if arrow from previos position to current position can impact to block
        if (bot && target) {

            // Calculate Arrow XYZ position based on YAW and BOT position
            const yaw = equations.getTargetYaw(bot, target);

            // Vx = Hipotenusa
            let arrow_current_x = bot.player.entity.position.x;
            let arrow_current_z = bot.player.entity.position.z;
            let arrow_current_y = bot.player.entity.position.y;
            if (previusArrowPosition === false) {
                previusArrowPosition = new Vec3(bot.player.entity.position.x, bot.player.entity.position.y + 1.5, bot.player.entity.position.z);
            }

            arrow_current_y += Vy;

            // Cateto Opuesto
            const x_extra = Math.sin(yaw) * Vx;
            arrow_current_x -= x_extra;

            // Cateto Adjacente
            const z_extra = x_extra / Math.tan(yaw)
            arrow_current_z -= z_extra;

            const arrowPosition = new Vec3(arrow_current_x, arrow_current_y, arrow_current_z);

            const distX = arrowPosition.x - previusArrowPosition.x;
            const distY = arrowPosition.y - previusArrowPosition.y;
            const distZ = arrowPosition.z - previusArrowPosition.z;

            const maxSteps = 20; // Math.ceil(Math.max(Math.abs(distX), Math.abs(distY), Math.abs(distZ))) * 20;
            const distVector = new Vec3(distX / maxSteps, distY / maxSteps, distZ / maxSteps)

            let incercetp;

            // Arrow Speed is to high, calculate prevArrow with current position for detect block in midle of tick position
            for (let i = 0; i < maxSteps; i++) {
                previusArrowPosition.add(distVector);
                incercetp = !equations.incercetp_block(bot, previusArrowPosition);

                // console.log(previusArrowPosition);

                if (incercetp) {
                    blockInTrayect = true;
                }
            }

            previusArrowPosition = arrowPosition;
        }

    }

}