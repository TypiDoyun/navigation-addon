import { Navigator } from "../navigator";
export class Node {
    location;
    connections = [];
    nodeClass = -1;
    constructor(location) {
        this.location = location;
    }
    addConnections(...connections) {
        this.connections.push(...connections);
        return this;
    }
    addEdges(...dimensionLocations) {
        for (const dimensionLocation of dimensionLocations) {
            const node = Navigator.getNode(dimensionLocation);
            if (!node)
                continue;
            this.addConnections(node);
            node.addConnections(this);
        }
    }
    getDistance(node) {
        if (this.location.dimension.id !== node.location.dimension.id)
            return Infinity;
        else
            return ((this.location.x - node.location.x) ** 2 +
                (this.location.y - node.location.y) ** 2 +
                (this.location.z - node.location.z) ** 2) ** 0.5;
    }
}
