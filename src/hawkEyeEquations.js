const Vec3 = require('vec3');
let bot;
let target;
let speed;

Number.prototype.countDecimals = function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}

function getTargetDistance(origin, destination) {
    const x_distance = Math.pow(origin.x - destination.x, 2)
    const z_distance = Math.pow(origin.z - destination.z, 2)
    const h_distance = Math.sqrt(x_distance + z_distance);

    const y_distance = destination.y - origin.y;

    const distance = Math.sqrt(Math.pow(y_distance, 2) + x_distance + z_distance)

    return {
        distance,
        h_distance,
        y_distance,
    }
}

function getTargetYaw(origin, destination) {
    const x_distance = destination.x - origin.x;
    const z_distance = destination.z - origin.z;
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
function incercetp_block(position) {
    block = bot.blockAt(position);
    if (!block)
        return false
    if (block.boundingBox !== 'empty') { // OLD check  block.name !== 'air'
        return false
    }
    return true;
}

// Physics factors 
const gravity = 0.05; // Arrow Gravity // Only for arrow for other entities have different gravity
const factorY = 0.01; // Arrow "Air resistance" // In water must be changed
const factorH = 0.01; // Arrow "Air resistance" // In water must be changed

// Simulate Arrow Trayectory
function tryGrade(grade, x_destination, y_destination, Vo, tryIntercetpBlock = false) {
    // Vo => Vector total velocity (X,Y,Z)
    // For arrow trayectory only need the horizontal discante (X,Z) and verticla (Y)
    let Voy = getVoy(Vo, degrees_to_radians(grade)); // Vector Y
    let Vox = getVox(Vo, degrees_to_radians(grade)); // Vector X
    let Vy = Voy;
    let Vx = Vox;
    let ProjectileGrade;

    let nearestDistance = false;
    let totalTicks = 0;

    let blockInTrayect = false;
    let previusArrowPositionIntercept = false;

    const maxSteps = 20;


    while (true) {
        totalTicks++;
        const firstDistance = Math.sqrt(Math.pow(Vy - y_destination, 2) + Math.pow(Vx - x_destination, 2));

        if (nearestDistance === false) {
            nearestDistance = firstDistance;
            nearestGrade = grade;
        }

        if (firstDistance < nearestDistance) {
            nearestDistance = firstDistance;
            nearestGrade = grade;
        }

        Vo = getVo(Vox, Voy, gravity);
        ProjectileGrade = getGrades(Vo, Voy, gravity);

        Voy = getVoy(Vo, degrees_to_radians(ProjectileGrade), Voy * factorY);
        Vox = getVox(Vo, degrees_to_radians(ProjectileGrade), Vox * factorH);

        // Some times the arrow is too fast (3 block per tick) this cause a wrong calculate
        // Calculate trayectory between each tick when is very near
        /*
        if (firstDistance < 4) {
            const Vx_steps = Vox / maxSteps;
            const Vy_steps = Voy / maxSteps;

            let Vx_newpos = Vx;
            let Vy_newpos = Vy

            for (let i = 0; i < maxSteps; i++) {
                const distance = Math.sqrt(Math.pow(Vy_newpos - y_destination, 2) + Math.pow(Vx_newpos - x_destination, 2));

                if (distance < nearestDistance) {
                    nearestDistance = firstDistance;
                    nearestGrade = grade;
                }

                Vx_newpos += Vx_steps;
                Vy_newpos += Vy_steps
            }
        }*/

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

        if (tryIntercetpBlock) {
            const calcBlockInTrayect = calculateBlockInTrayectory(previusArrowPositionIntercept, Vy, Vx);
            blockInTrayect = calcBlockInTrayect.intercept;
            previusArrowPositionIntercept = calcBlockInTrayect.arrowPosition;
        }
    }
}

function calculateBlockInTrayectory(previusArrowPosition, Vy, Vx) {
    const maxSteps = 20;

    // Calculate Arrow XYZ position based on YAW and BOT position
    const yaw = getTargetYaw(bot.player.entity.position, target.position);

    // Vx = Hipotenusa
    let arrow_current_x = bot.player.entity.position.x;
    let arrow_current_z = bot.player.entity.position.z;
    let arrow_current_y = bot.player.entity.position.y + 1.4;
    if (previusArrowPosition === false) {
        previusArrowPosition = new Vec3(bot.player.entity.position.x, bot.player.entity.position.y + 1.4, bot.player.entity.position.z);
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

    const distVector = new Vec3(distX / maxSteps, distY / maxSteps, distZ / maxSteps)

    let incercetp;

    // Arrow Speed is to high, calculate prevArrow with current position for detect block in midle of tick position
    for (let i = 0; i < maxSteps; i++) {
        previusArrowPosition.add(distVector);
        incercetp = !incercetp_block(previusArrowPosition);

        // console.log(previusArrowPosition);

        if (incercetp) {
            return {
                arrowPosition,
                intercept: true
            }
        }
    }

    return {
        arrowPosition,
        intercept: false
    }
}



//Get more precision on shot
function getPrecisionShot(grade, x_destination, y_destination, decimals) {
    let nearestDistance = false;
    let nearestGrade = false;
    decimals = Math.pow(10, decimals);

    for (let i_grade = (grade * 10) - 10; i_grade <= (grade * 10) + 10; i_grade += 1) {
        distance = tryGrade(i_grade / decimals, x_destination, y_destination, BaseVo);
        if ((distance.nearestDistance < nearestDistance) || nearestDistance === false) {
            nearestDistance = distance.nearestDistance;
            nearestGrade = i_grade;
            nearestTicks = distance.totalTicks;
        }
    }

    return {
        nearestGrade,
        nearestDistance
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

function getMasterGrade(botIn, targetIn, speedIn) {
    bot = botIn;
    target = targetIn;
    speed = speedIn;

    // Check the first best trayectory
    let distances = getTargetDistance(bot.entity.position, target.position);
    let shotCalculation = geBaseCalculation(distances.h_distance, distances.y_distance);
    if (!shotCalculation)
        return false;

    // Recalculate the new target based on speed + first trayectory
    const premonition = getPremonition(shotCalculation.totalTicks, speed);
    distances = premonition.distances;
    const newTarget = premonition.newTarget;

    // Recalculate the trayectory based on new target location
    shotCalculation = geBaseCalculation(distances.h_distance, distances.y_distance);
    if (!shotCalculation)
        return false;

    // Get more precision on shot
    precisionShot = getPrecisionShot(gradeShot.grade, distances.h_distance, distances.y_distance, 1);

    // Calculate yaw
    const yaw = getTargetYaw(bot.entity.position, newTarget);

    if (precisionShot.nearestDistance > 4) // Too far
        return false;

    return {
        pitch: degrees_to_radians(precisionShot.nearestGrade / 10),
        yaw: yaw,
        grade: precisionShot.nearestGrade / 10,
        nearestDistance: precisionShot.nearestDistance,
        target: newTarget,
    }
}

function getPremonition(totalTicks, speed) {
    totalTicks = totalTicks + Math.ceil(totalTicks / 10)
    const velocity = new Vec3(speed);
    let newTarget = new Vec3(target.position);
    for (let i = 1; i <= totalTicks; i++) {
        newTarget.add(velocity);
    }
    const distances = getTargetDistance(bot.entity.position, newTarget);

    return {
        distances,
        newTarget
    };
}

// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
function geBaseCalculation(x_destination, y_destination) {
    const grade = getFirstGradeAproax(x_destination, y_destination);

    if (!grade.nearestGrade_first)
        return false; // No aviable trayectory

    // Check blocks in trayectory
    let check = tryGrade(grade.nearestGrade_first.grade, x_destination, y_destination, BaseVo, true);

    if (!check.blockInTrayect && check.nearestDistance < 4) {
        gradeShot = grade.nearestGrade_first;
    } else {
        if (!grade.nearestGrade_second) {
            return false; // No aviable trayectory
        }
        check = tryGrade(grade.nearestGrade_second.grade, x_destination, y_destination, BaseVo, true);
        if (check.blockInTrayect) {
            return false; // No aviable trayectory
        }
        gradeShot = grade.nearestGrade_second;
    }

    return gradeShot;
}

module.exports = getMasterGrade