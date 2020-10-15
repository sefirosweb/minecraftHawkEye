const config = require('../config');
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { GoalNear } = require('mineflayer-pathfinder').goals;
const Vec3 = require('vec3');

// Need 2 bots first one is too far away for get entitys can check
const bot = mineflayer.createBot({
    username: config.usernameA,
    port: config.port,
    host: config.host
})
bot.loadPlugin(pathfinder)
const botChecker = mineflayer.createBot({
    username: config.usernameB,
    port: config.port,
    host: config.host
})
botChecker.loadPlugin(pathfinder)

/* Notes 
Please give to bot a bow:
/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1

And arrows
/give Archer minecraft:arrow 6000
*/

// Go to Start Point (center of map)
botChecker.once("spawn", () => {
    botChecker.chat('/kill @e[type=minecraft:arrow]'); // clear arrows
    const mcData = require('minecraft-data')(botChecker.version)
    const defaultMove = new Movements(botChecker, mcData)
    botChecker.pathfinder.setMovements(defaultMove)
    botChecker.pathfinder.setGoal(new GoalNear(10, 4, 60, 1)); // Go to Start point
});

// Go to Start Point
bot.once("spawn", () => {
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(0, 3, 0, 1)); // Go to Start point
});

let grades = 0;
let reportedArrow = false;
let arrowSave = {};
let parabollicArrowData = [];

let factorGrades = 0.2;

let preview = 0;

// This bot Fires arrow
bot.on('goal_reached', () => {
    bot.chat('Rdy!');
    let chargeBowTimer = Date.now();
    let bowIsCharged = false;
    bot.deactivateItem();

    bot.on('physicTick', function () {
        // bot.lookAt(headTo); <-- don't use this no have enough accuracy
        // Look by Yaw & Pitch /* Pitch == Radians */ 
        // 3.1385715147451663 => default look to Z
        bot.look(degrees_to_radians(180), degrees_to_radians(grades / factorGrades));

        const currentTime = Date.now();

        if (bowIsCharged === false) {
            chargeBowTimer = Date.now();
            bot.activateItem();
            bowIsCharged = true;
        }
        // Fire arrow every x sec
        if (currentTime - chargeBowTimer > 1000 && reportedArrow || currentTime - chargeBowTimer > 8000) {
            reportedArrow = false;
            bot.deactivateItem();
            arrowSave.time = Date.now();
            bowIsCharged = false;
            parabollicArrowData = [];
            grades++;
            if (grades > 90 * factorGrades) {
                grades = 0;
            }
        }
    });
});

// This bot register the arrows
botChecker.on('goal_reached', () => {
    botChecker.chat('Rdy!');

    let currentArrows = [];
    let currentArrow = null;
    let lastPositionArrow = {};
    let counPosition = 0;
    let timeToImpact = 0;

    botChecker.on('physicTick', function () {
        let allArrows = getAllArrows(botChecker);
        allArrows.forEach(arrow => {
            if (!currentArrows.includes(arrow.id)) {
                preview = previewCalc(arrow);

                currentArrows.push(arrow.id);
                currentArrow = arrow;

                arrowSave.x = currentArrow.position.x;
                arrowSave.y = currentArrow.position.y;
                arrowSave.z = currentArrow.position.z;

                lastPositionArrow.x = currentArrow.position.x;
                lastPositionArrow.y = currentArrow.position.y;
                lastPositionArrow.z = currentArrow.position.z;

                reportedArrow = false;
                return true;
            }
        });

        if (currentArrow !== null) {

            if (
                lastPositionArrow.x == currentArrow.position.x &&
                lastPositionArrow.y == currentArrow.position.y &&
                lastPositionArrow.z == currentArrow.position.z
            ) {
                if (counPosition >= 20 && !reportedArrow) {
                    const distance = getDistance(currentArrow.position, arrowSave);
                    const data = {
                        id: currentArrow.id,
                        grade: grades - 1,
                        x_origin: arrowSave.x,
                        y_origin: arrowSave.y,
                        z_origin: arrowSave.z,
                        x_destination: currentArrow.position.x,
                        y_destination: currentArrow.position.y,
                        z_destination: currentArrow.position.z,
                        timeToImpact: timeToImpact,
                        distance_origin_to_target: distance,
                        rate_speed: distance / timeToImpact * 1000 // block per second
                    };

                    // console.log("Arrow Impacted! Arrow:", data.id, "Grade:", data.grade / factorGrades, "Time to impact:", data.timeToImpact, "Distance:", Math.round(data.distance_origin_to_target * 100) / 100, "m/s:", Math.round(data.rate_speed * 100) / 100);
                    let zEnd = Math.round(currentArrow.position.z * 100) / 100;
                    let rate = Math.round((zEnd - preview) * 100) / 100;
                    console.log("Arrow impacted", "Grade:", data.grade / factorGrades, "Z", zEnd, "-", preview, "=>", rate);


                    counPosition = 0;
                    reportedArrow = true;
                }
                if (counPosition === 0) {
                    timeToImpact = Date.now() - arrowSave.time;
                }
                counPosition++;
            } else {

                let previusParabolic = null;
                let currentParabolicLenght = parabollicArrowData.length;
                if (currentParabolicLenght === 0) {
                    previusParabolic = arrowSave;
                } else {
                    currentParabolicLenght--;
                    previusParabolic = parabollicArrowData[currentParabolicLenght];
                    previusParabolic = {
                        x: previusParabolic.x_destination,
                        y: previusParabolic.y_destination,
                        z: previusParabolic.z_destination,
                    }
                }

                counPosition = 0;
            }

            lastPositionArrow.x = currentArrow.position.x;
            lastPositionArrow.y = currentArrow.position.y;
            lastPositionArrow.z = currentArrow.position.z;
        }
    });
})

function formatNumber(data) {
    Object.keys(data).forEach(keyI => {
        Object.keys(data[keyI]).forEach(key => {
            data[keyI][key] = data[keyI][key].toString().replace(/\./, ',');
        });
    });
    return data
}


function getDistance(a, b) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2) +
        Math.pow(a.z - b.z, 2)
    )
}

function getVelocity(a) {
    return Math.sqrt(
        Math.pow(a.x, 2) +
        Math.pow(a.y, 2) +
        Math.pow(a.z, 2)
    )
}



function getAllArrows(bot) {
    let arrows = [];
    for (const entity of Object.values(bot.entities)) {
        if (entity.type === 'object' && entity.objectType === 'Arrow') {
            arrows.push(entity);
        }
    }
    return arrows;
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function save(data, file) {
    data = formatNumber(data);

    const { Parser } = require('json2csv');
    const fs = require('fs');
    var newLine = "\r\n";


    try {
        if (fs.existsSync(file)) {
            const json2csvParser = new Parser({ delimiter: ';', header: false });
            const csv = json2csvParser.parse(data) + newLine;

            fs.appendFile(file, csv, function (err) {
                if (err) throw err;
            });


        } else {
            const json2csvParser = new Parser({ delimiter: ';', header: true });
            const csv = json2csvParser.parse(data) + newLine;

            fs.writeFile(file, csv, function (err) {
                if (err) throw err;
            });
        }
    } catch (err) {
        console.error(err)
    }



}


function previewCalc(arPrev) {
    // drag = 30;

    base = new Vec3(arPrev.position);
    velocity = arPrev.velocity;
    console.log("velocity", velocity);
    downwardAccel = new Vec3(0, -0.05, 0);
    // itr = new BlockIterator(base.getWorld(), base.toVector(), base.getDirection(), 0, 3);

    tick = 0;
    let intercepts = true
    while (intercepts) {
        velocity.add(downwardAccel);
        base.add(velocity);
        block = botChecker.blockAt(base).name;
        // console.log(base, block);
        if (block !== 'air') {
            intercepts = false
        }
        tick++;
    }
    tick--;
    // console.log(tick, Math.round(base.z * 100) / 100);
    console.log(tick)
    return Math.round(base.z * 100) / 100

}