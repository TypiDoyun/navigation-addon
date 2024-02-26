import { Player, system } from "@minecraft/server";
import { Node } from "../classes/node";
import { Navigator } from "../navigator";
import { getDistanceSquared, getSegmentDistanceSquare } from "./get-distance";
import { sendMessage } from "./send-message";
import { drawEdge } from "./draw";

const angleRange = (angle: number) => {
    return angle < 0 ? 360 + angle : (angle >= 360 ? angle - 360 : angle);
}

export const navigate = async (player: Player, to: Node, reach: number = 1.5): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        const allNodes = Navigator.getAllNodes().filter(node => node.connections.length !== 0);
        let arrowAngle = 0;
        let destinationNode: Node | undefined;

        const interval = system.runInterval(() => {
            
            let minDistance = Infinity;
            
            const fail = (reason: string) => {
                resolve(false);
                sendMessage(player, reason);
                system.clearRun(interval);
            }
            if (!player) fail("플레이어 사라짐");
            
            const success = () => {
                resolve(true);
                sendMessage(player, "찾음!");
                system.clearRun(interval);
            }

            let firstNode: Node | undefined;
            let secondNode: Node | undefined;

            const { ways, distance } = Navigator.dijkstra(to);

            if (!ways || !distance) return fail("길 없음");

            Navigator.iterate((first, second) => {
                if (!distance.has(first)) return;
                if (!distance.has(second)) return;
                const distanceSquare = getSegmentDistanceSquare([ first, second ].sort((a, b) => distance.get(b)! - distance.get(a)!).map(node => node.location) as any, player.location, 0.5);
                
                if (distanceSquare >= minDistance) return;
                
                minDistance = distanceSquare;
                firstNode = first;
                secondNode = second;
            });

            if (!firstNode || !secondNode) return fail("엥");

            drawEdge(player, firstNode.location, secondNode.location);

            const firstNodeDistance = distance.get(firstNode) ?? Infinity;
            const secondNodeDistance = distance.get(secondNode) ?? Infinity;

            if (firstNodeDistance <= secondNodeDistance) {
                destinationNode = firstNode;
            }
            else if (firstNodeDistance > secondNodeDistance) {
                destinationNode = secondNode;
            }
            else return fail("길 없음!");
            
            if (!ways || !distance) return fail("길이 없음");
            if (!destinationNode) return fail("길 없음!");

            if (destinationNode === to) {
                const distanceSquared = getDistanceSquared(player.location, to.location);
                
                if (distanceSquared <= 2) return success();
            }
            
            const location = player.location;
            const playerRadian = player.getRotation().y * Math.PI / 180;
            const viewVector = {
                x: -Math.sin(playerRadian) * reach,
                y: 0,
                z: Math.cos(playerRadian) * reach
            }
            const arrowLocation = {
                x: location.x + viewVector.x,
                y: location.y + 0.5,
                z: location.z + viewVector.z
            };
    
            const dx = destinationNode.location.x - location.x;
            const dz = destinationNode.location.z - location.z;
    
            let destinationAngle = Math.round(Math.atan2(-dx, dz) / Math.PI * 180);
            destinationAngle = angleRange(destinationAngle);
    
            let angleDiff = destinationAngle - arrowAngle;
    
            const ratio = 4;
            const value = angleDiff > 180 ? (360 - angleDiff) / ratio * -1 : (angleDiff < -180 ? (360 + angleDiff) / ratio : angleDiff / ratio);
    
            arrowAngle += value;
            arrowAngle = angleRange(Math.round(arrowAngle));
    
            player.dimension.spawnParticle(`typi:arrow_${Math.round(arrowAngle)}`, arrowLocation);
        }, 1);
    });
}