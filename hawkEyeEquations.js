const Vec3 = require('vec3');

Number.prototype.countDecimals = function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}

function getTargetDistance(bot, target) {
    const x_distance = Math.pow(bot.x - target.x, 2)
    const z_distance = Math.pow(bot.z - target.z, 2)
    const h_distance = Math.sqrt(x_distance + z_distance);

    const y_distance = target.y - bot.y;

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

function getVox(Vo, Alfa, Resistance = 0) {
    return Vo * Math.cos(Alfa) - Resistance;
}

function getVoy(Vo, Alfa, Resistance = 0) {
    return Vo * Math.sin(Alfa) - Resistance;
}

function getVo(Vox, Voy, G) {
    return Math.sqrt(Math.pow(Vox, 2) + Math.pow(Voy - G, 2)); // New Total Velocity - Gravity
}

function getGrades(Vo, Voy, Gravity) {
    return radians_to_degrees(Math.asin((Voy - Gravity) / Vo));
}

// Check block position impact
function incercetp_block(bot, position) {
    block = bot.blockAt(position);
    if (!block)
        return false
    if (block.name !== 'air') {
        return false
    }
    return true;
}

// Base Minecraft Factros for simulate Arrow
const gravity = 0.05;
const factorY = 0.01; // Factores de resistencia
const factorH = 0.01; // Factores de resistencia

// Simulate Arrow Trayectory
function tryGrade(grade, x_destination, y_destination, Vo, bot = false, target = false) {
    let Voy = getVoy(Vo, degrees_to_radians(grade));
    let Vox = getVox(Vo, degrees_to_radians(grade));
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

        Vo = getVo(Vox, Voy, gravity);
        ProjectileGrade = getGrades(Vo, Voy, gravity);

        Voy = getVoy(Vo, degrees_to_radians(ProjectileGrade), Voy * factorY);
        Vox = getVox(Vo, degrees_to_radians(ProjectileGrade), Vox * factorH);

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
            const yaw = getTargetYaw(bot, target);

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

            // Current arrow position
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
                incercetp = !incercetp_block(bot, previusArrowPosition);

                // console.log(previusArrowPosition);

                if (incercetp) {
                    blockInTrayect = true;
                }
            }

            previusArrowPosition = arrowPosition;
        }

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


// Base start force
const BaseVo = 3;

function getMasterGrade(bot, target) {
    // console.clear();
    const yaw = getTargetYaw(bot, target);

    let distances = getTargetDistance(bot.entity.position, target.position);
    let shotCalculation = geBaseCalculation(distances.h_distance, distances.y_distance, yaw, bot, target);
    if (!shotCalculation)
        return false;

    let gradeA = shotCalculation.grade;

    distances = getPremonition(shotCalculation.totalTicks, target, bot);
    shotCalculation = geBaseCalculation(distances.h_distance, distances.y_distance, yaw, bot, target);
    if (!shotCalculation)
        return false;

    let gradeB = shotCalculation.grade;

    // console.log(gradeA, gradeB);


    precisionShot = getPrecisionShot(gradeShot.grade, distances.h_distance, distances.y_distance, 1);

    if (precisionShot.nearestDistance > 4) // Too far
        return false;

    // console.log(precisionShot); 
    return {
        pitch: degrees_to_radians(precisionShot.nearestGrade / 10),
        yaw: yaw
    }
}

function getPremonition(totalTicks, target, bot) {
    const velocity = new Vec3(target.velocity);
    let position = new Vec3(target.position);
    for (let i = 1; i <= totalTicks; i++) {
        position.add(velocity);
    }
    const distances = getTargetDistance(bot.entity.position, position);
    // console.log(velocity);
    return distances;
}

// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
function geBaseCalculation(x_destination, y_destination, yaw, bot, target) {
    const grade = getFirstGradeAproax(x_destination, y_destination, yaw);

    if (!grade.nearestGrade_first)
        return false; // No aviable trayectory

    // Check blocks in trayectory
    let check = tryGrade(grade.nearestGrade_first.grade, x_destination, y_destination, BaseVo, bot, target);

    if (!check.blockInTrayect && check.nearestDistance < 4) {
        gradeShot = grade.nearestGrade_first;
    } else {
        if (!grade.nearestGrade_second) {
            return false; // No aviable trayectory
        }
        check = tryGrade(grade.nearestGrade_second.grade, x_destination, y_destination, BaseVo, bot, target);
        if (check.blockInTrayect) {
            return false; // No aviable trayectory
        }
        gradeShot = grade.nearestGrade_second;
    }

    return gradeShot;
}

module.exports = {
    degrees_to_radians,
    radians_to_degrees,
    getMasterGrade
}