const config = require('./config');
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { get } = require('http');
const { GoalNear } = require('mineflayer-pathfinder').goals;
const { degrees_to_radians } = require('./hawkEyeEquations');


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

let factorGrades = 100;

// This bot Fires arrow
bot.on('goal_reached', () => {
    bot.chat('Rdy!');
    let chargeBowTimer = Date.now();
    let = bowIsCharged = false;
    bot.deactivateItem();

    bot.on('physicTick', function() {
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

    botChecker.on('physicTick', function() {
        let allArrows = getAllArrows(botChecker);
        allArrows.forEach(arrow => {
            if (!currentArrows.includes(arrow.id)) {
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
                    let dataArray = [];
                    dataArray.push(data);

                    console.log("Arrow Impacted! Arrow:", data.id, "Grade:", data.grade / factorGrades, "Time to impact:", data.timeToImpact, "Distance:", Math.round(data.distance_origin_to_target * 100) / 100, "m/s:", Math.round(data.rate_speed * 100) / 100);

                    save(dataArray, './files/bigData.csv');
                    save(parabollicArrowData, './files/parabolicArrowData.csv');

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

                const distance = getDistance(currentArrow.position, previusParabolic);
                let velocity = getVelocity(currentArrow.velocity)

                let parabolicData = {
                    id: currentArrow.id,
                    grade: grades - 1,
                    x_origin: previusParabolic.x,
                    y_origin: previusParabolic.y,
                    z_origin: previusParabolic.z,
                    x_destination: currentArrow.position.x,
                    y_destination: currentArrow.position.y,
                    z_destination: currentArrow.position.z,
                    timePosition: Date.now() - arrowSave.time,
                    distange_last_record: distance,
                    rate_speed: distance / timeToImpact * 1000, // block per second
                    velocity_x: currentArrow.velocity.x,
                    velocity_y: currentArrow.velocity.y,
                    velocity_z: currentArrow.velocity.z,
                    velocity: velocity,
                };

                parabollicArrowData.push(parabolicData);
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



function save(data, file) {
    data = formatNumber(data);

    const { Parser } = require('json2csv');
    const fs = require('fs');
    var newLine = "\r\n";


    try {
        if (fs.existsSync(file)) {
            const json2csvParser = new Parser({ delimiter: ';', header: false });
            const csv = json2csvParser.parse(data) + newLine;

            fs.appendFile(file, csv, function(err) {
                if (err) throw err;
            });


        } else {
            const json2csvParser = new Parser({ delimiter: ';', header: true });
            const csv = json2csvParser.parse(data) + newLine;

            fs.writeFile(file, csv, function(err) {
                if (err) throw err;
            });
        }
    } catch (err) {
        console.error(err)
    }



}