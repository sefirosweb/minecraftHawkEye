const Vec3 = require('vec3');

// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
const gravity = 0.05;
const factor = 0.000125; // No son correctas
const factorH = 0.00125; // No son correctas
const Vo = 3;

// No va..
function getMaxZ(Vox, startZ, ticks) {
    return (Vox - (ticks * factorH)) * ticks + startZ;
}

// No va.. 
function getTicks(Voy, startY, endY, first = false) {
    // Voy => Start velocity of Y
    let tick = 0;

    let foundBoth = false;

    let near = 1;

    while (foundBoth === false) {
        let currentY = getY(Voy, tick, startY)

        if ((currentY - endY) > (-near) && (currentY - endY) < near)
            foundBoth = true;

        tick++;

        if (tick >= 200) {
            console.log("Error en el calculo get ticks, demasiado tiempo");
            return process.exit(0);
        }

    }

    console.log(tick);
    return tick;
}

function getY(Voy, tick, startY) {
    return Voy * tick - ((gravity) / 2 + (factor * tick)) * Math.pow(tick, 2) + startY;
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

function getVox(Vo, Alfa) {
    return Vo * Math.cos((Alfa))
}

function getVoy(Vo, Alfa) {
    return Vo * Math.sin((Alfa))
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



// No va..
function calcPreviewArrow(arrow, ticks) {
    // Gravedad y su derivada
    const derivadaGravedad = -0.000125;
    let gravedadBase = gravity

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


module.exports = {
    getTicks,
    degrees_to_radians,
    radians_to_degrees,
    round,
    getVox,
    getVoy,
    getMaxZ
}