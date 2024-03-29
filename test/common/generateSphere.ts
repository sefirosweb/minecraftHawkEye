import { Vec3 } from "vec3";

export const generateSphere = (distance = 30, pointsA = 360, pointsB = 90): Array<Vec3> => {

    const sphere: Array<Vec3> = []

    for (var i = 0; i < pointsA; i += 10) {
        for (let j = (pointsB * -1); j < pointsB; j += 10) {
            const theta = i * (Math.PI / 180);
            const phi = j * (Math.PI / 180);
            const x = Math.round(Math.cos(theta) * Math.cos(phi) * distance);
            const y = Math.round(Math.sin(theta) * Math.cos(phi) * distance);
            const z = Math.round(distance * Math.sin(phi));

            sphere.push(new Vec3(x, y, z))
        }
    }

    return sphere
}