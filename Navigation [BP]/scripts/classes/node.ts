import { DimensionLocation } from "@minecraft/server";
import { NodeState } from "../types/node-state";
import { Navigator } from "../navigator";

export class Node {
    public connections: Node[] = [];
    public nodeClass: number = -1;

    public constructor(
        public location: DimensionLocation
    ) {
        
    }

    public addConnections(...connections: Node[]) {
        this.connections.push(...connections);

        return this;
    }

    public addEdges(...dimensionLocations: DimensionLocation[]) {
        for (const dimensionLocation of dimensionLocations) {
            const node = Navigator.getNode(dimensionLocation);

            if (!node) continue;

            this.addConnections(node);
            node.addConnections(this);
        }
    }

    public getDistance(node: Node): number {
        if (this.location.dimension.id !== node.location.dimension.id) return Infinity;
        else return ((this.location.x - node.location.x) ** 2 + 
                    (this.location.y - node.location.y) ** 2 +
                    (this.location.z - node.location.z) ** 2) ** 0.5;
    }
}