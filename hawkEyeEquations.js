/*
// Calculate how many ticks need from shot to Y = 0 or target Y
// For parabola of Y you have 2 times for found the Y position if Y original are downside of Y destination
function getTicks(Voy, Tick, Gravity, Factor, Y, first = false) {
    // Voy => Start velocity of Y
    let tick = 0;

    let foundBoth = false;
    while (foundBoth === false) {
        let currentY = getY(Voy, Tick, Gravity, Factor);

        if ()
    }


}

function getY(Voy, Tick, Gravity, Factor) {
    return Voy * Tick - ((Gravity) / 2 + (Factor * Tick)) * Math.pow(Tick, 2);
}
*/

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

module.exports = {
    degrees_to_radians,
    radians_to_degrees,
    round,
    getVox,
    getVoy
}