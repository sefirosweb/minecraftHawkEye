const config = require('./config');
const mineflayer = require('mineflayer');
const Vec3 = require('vec3');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const saveToFile = require('./saveToFile').save;

const botChecker = mineflayer.createBot({
    username: config.usernameB,
    port: config.port,
    host: config.host
})
botChecker.loadPlugin(pathfinder)


function getEntity(bot) {
    for (const entity of Object.values(bot.entities)) {
        //if (entity.type === 'player') {
        if (entity.type === 'object' && entity.objectType === 'Arrow') {
            return entity;
        }
    }

    return false;
}

botChecker.on('spawn', function() {
    botChecker.chat('/kill @e[type=minecraft:arrow]');
    let Vy = 0;

    let timeStart = 0;
    let timeEnd = 0;
    let tickStart = 0;
    let tickEnd = 0;
    let tick = 0;

    let lastY = 0;
    let countLastY = 0;
    let entity = false;

    let maxY = 0;
    let timeMaxY = 0;
    let maxVelocityY = 0;
    let maxVelocity = 0;

    let dataArray = [];


    botChecker.chat('Ready!');


    botChecker.on('physicTick', function() {
        if (!entity || entity.isValid === false) {
            entity = getEntity(botChecker);
            timeStart = Date.now();
            tickStart = 0;


            maxY = 0;
            timeMaxY = 0;
            maxVelocityY = 0;
            maxVelocity = 0;

            dataArray = [];

            if (entity) {
                previewArrow = calcPreviewArrow(entity);
            }
        }

        tickStart++;

        if (entity) {

            if (lastY === entity.position.y) {
                if (countLastY === 0) {
                    timeEnd = Date.now();
                    tickEnd = tickStart;
                }
                countLastY++;
                if (countLastY === 10) {
                    console.log('************************ Resume ************************');
                    console.log("Total Time:", (timeEnd - timeStart) / 1000);
                    console.log("MaxY", Math.round(maxY * 100) / 100, "Second from MaxY to finish", (timeEnd - timeMaxY) / 1000);
                    console.log("Max Velocity Y", Math.round(maxVelocityY * 100) / 100);
                    console.log("Max Velocity", Math.round(maxVelocity * 100) / 100);

                    console.log('************************ Preview ************************');
                    console.log("Ticks", previewArrow.tick, "MaxZ", previewArrow.position.z);
                    console.log("physicTick", tickEnd);


                    botChecker.chat('/kill @e[type=minecraft:arrow]');

                    saveToFile(dataArray, './files/real_velocity.csv');
                }
            } else {
                /*
                console.clear();
                console.log(entity.position);
                console.log("Velocity per tick of Y", entity.velocity.y);*/

                const velocity = getVelocity(entity.velocity);

                /*
                console.log("Velocity", velocity);
                console.log(botChecker.time.age);*/

                countLastY = 0;
                lastY = entity.position.y;

                dataArray.push({
                    tick: tickStart,
                    position_x: entity.position.x,
                    position_y: entity.position.y,
                    position_z: entity.position.z,
                    velocity_x: entity.velocity.x,
                    velocity_y: entity.velocity.y,
                    velocity_z: entity.velocity.z,
                });


                if (maxVelocityY <= entity.velocity.y) {
                    maxVelocityY = entity.velocity.y;
                }

                if (maxVelocity <= velocity) {
                    maxVelocity = velocity;
                }

                if (maxY <= entity.position.y) {
                    maxY = entity.position.y;
                    timeMaxY = Date.now();
                }
            }
        }

        // .toString().replace(/\./, ','))
    });
});


function getVelocity(a) {
    return Math.sqrt(
        Math.pow(a.x, 2) +
        Math.pow(a.y, 2) +
        Math.pow(a.z, 2)
    )
}


function calcPreviewArrow(arrow) {
    // Gravedad y su derivada
    const derivadaGravedad = -0.000125;
    let gravedadBase = -0.05;

    // Efecto de relentización dle aire y su derivada
    const derivadaEfectoDelAire = -0.00012; // TODO ARREGLAR SEGUN ORIENTACION NO FUNCIONA
    let efectoDelAire = -0.02; // TODO ARREGLAR SEGUN ORIENTACION NO FUNCIONA

    let downwardAccel = new Vec3(0, gravedadBase, 0 /*efectoDelAire*/ );

    let dataArray = [];

    let tick = 0;
    let position = new Vec3(arrow.position);
    let velocity = new Vec3(arrow.velocity);

    dataArray.push({
        tick: tick,
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        velocity_x: velocity.x,
        velocity_y: velocity.y,
        velocity_z: velocity.z,
    });

    while (incercetp_block(botChecker, position)) {
        tick++;
        velocity.add(downwardAccel);
        if (velocity.y < -3.9) {
            velocity.y = -3.9;
        }

        position.add(velocity);
        gravedadBase = gravedadBase - derivadaGravedad;
        efectoDelAire = efectoDelAire - derivadaEfectoDelAire;
        downwardAccel = new Vec3(0, gravedadBase, 0 /* efectoDelAire*/ );

        dataArray.push({
            tick: tick,
            position_x: position.x,
            position_y: position.y,
            position_z: position.z,
            velocity_x: velocity.x,
            velocity_y: velocity.y,
            velocity_z: velocity.z,
        });
    }

    saveToFile(dataArray, './files/velocity.csv');

    return {
        tick: tick,
        position: position,
        velocity: velocity
    };
}


function incercetp_block(bot, position) {
    block = bot.blockAt(position);
    if (!block)
        return false

    if (block.name !== 'air') {
        return false
    }

    return true;
}