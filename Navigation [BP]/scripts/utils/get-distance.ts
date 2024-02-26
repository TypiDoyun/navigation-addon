import { Vector3 } from "@minecraft/server";

export const getDistanceSquared = (first: Vector3, second: Vector3): number => {
    return (first.x - second.x) ** 2 +
           (first.y - second.y) ** 2 +
           (first.z - second.z) ** 2;
}

export const getDistance = (first: Vector3, second: Vector3): number => {
    return getDistanceSquared(first, second) ** 0.5;
}

export const getSegmentDistance = (line: [ Vector3, Vector3 ], vertex: Vector3): number => {
    return getSegmentDistanceSquare(line, vertex) ** 0.5;
}

export const getSegmentDistanceSquare = (line: [ Vector3, Vector3 ], vertex: Vector3, lineCut: number = 0): number => {
    const lineDirection = {
        x: line[1].x - line[0].x,
        y: line[1].y - line[0].y,
        z: line[1].z - line[0].z,
    };
    const lineLength = (lineDirection.x ** 2 + lineDirection.y ** 2 + lineDirection.z ** 2) ** 0.5 - lineCut;
    const lineRatio = lineLength / (lineLength + lineCut);
    lineDirection.x *= lineRatio;
    lineDirection.y *= lineRatio;
    lineDirection.z *= lineRatio;
    line[1] = {
        x: line[0].x + lineDirection.x,
        y: line[0].y + lineDirection.y,
        z: line[0].z + lineDirection.z,
    };

    if (lineLength === 0) return getDistanceSquared(line[0], vertex);
    
    const projection = ((vertex.x - line[0].x) * (line[1].x - line[0].x) + (vertex.y - line[0].y) * (line[1].y - line[0].y) + (vertex.z - line[0].z) * (line[1].z - line[0].z)) / lineLength;

    if (projection < 0) return getDistanceSquared(line[0], vertex);
    else if (projection > lineLength) return getDistanceSquared(line[1], vertex);
    else {
        lineDirection.x *= projection / lineLength;
        lineDirection.y *= projection / lineLength;
        lineDirection.z *= projection / lineLength;

        lineDirection.x += line[0].x;
        lineDirection.y += line[0].y;
        lineDirection.z += line[0].z;

        return getDistanceSquared(lineDirection, vertex);
    }
}