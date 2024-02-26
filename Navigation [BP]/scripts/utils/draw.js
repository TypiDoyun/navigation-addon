import { system } from "@minecraft/server";
import { getDistanceSquared } from "./get-distance";
const particleIdentifier = "minecraft:redstone_repeater_dust_particle";
export const drawEdge = (player, first, second, renderLimit = 20) => {
    system.run(() => {
        const diff = {
            x: first.x - second.x,
            y: first.y - second.y,
            z: first.z - second.z,
        };
        const diffLength = (diff.x ** 2 + diff.y ** 2 + diff.z ** 2) ** 0.5;
        for (let distance = 0; distance <= diffLength; distance += 0.5) {
            const location = {
                x: diff.x * distance / diffLength + second.x,
                y: diff.y * distance / diffLength + second.y + 0.7,
                z: diff.z * distance / diffLength + second.z,
            };
            const distanceSquared = getDistanceSquared(player.location, location);
            if (distanceSquared > renderLimit * renderLimit)
                continue;
            player.spawnParticle(particleIdentifier, location);
        }
    });
};
export const drawOutline = (player, blockLocation, renderLimit = 20) => {
    const drawDot = (x, y, z) => {
        const vector = { x, y, z };
        const distanceSquared = getDistanceSquared(player.location, vector);
        if (distanceSquared > renderLimit * renderLimit)
            return;
        player.spawnParticle(particleIdentifier, vector);
    };
    blockLocation = {
        x: blockLocation.x - 0.5,
        y: blockLocation.y - 0.5,
        z: blockLocation.z - 0.5,
    };
    drawDot(blockLocation.x, blockLocation.y, blockLocation.z);
    drawDot(blockLocation.x + 1, blockLocation.y, blockLocation.z);
    drawDot(blockLocation.x, blockLocation.y, blockLocation.z + 1);
    drawDot(blockLocation.x + 1, blockLocation.y, blockLocation.z + 1);
    drawDot(blockLocation.x, blockLocation.y + 1, blockLocation.z);
    drawDot(blockLocation.x + 1, blockLocation.y + 1, blockLocation.z);
    drawDot(blockLocation.x, blockLocation.y + 1, blockLocation.z + 1);
    drawDot(blockLocation.x + 1, blockLocation.y + 1, blockLocation.z + 1);
};
