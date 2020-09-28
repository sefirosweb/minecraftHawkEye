var frameRate = 1 / 40; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

var ball = {
    position: { x: width / 2, y: 0 },
    velocity: { x: 10, y: 0 },
    mass: 0.1, //kg
    radius: 15, // 1px = 1cm
    restitution: -0.7
};

var Cd = 0.47; // Dimensionless
var rho = 1.22; // kg / m^3
var A = Math.PI * ball.radius * ball.radius / (10000);
var ag = 9.81;

var setup = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.onmousemove = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;

    ctx.fillStyle = 'red';
    ctx.strokeStyle = '#000000';
    loopTimer = setInterval(loop, frameDelay);
}