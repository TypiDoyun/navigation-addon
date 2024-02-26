import { getDimensionId } from "./get-dimension-id";
export var Navigator;
(function (Navigator) {
    const graph = new Map();
    Navigator.addNodes = (...nodes) => {
        for (const node of nodes) {
            const { location } = node;
            node.location.x += 0.5;
            node.location.y += 0.5;
            node.location.z += 0.5;
            graph.set(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`, node);
        }
    };
    Navigator.deleteNode = (location) => {
        const node = Navigator.getNode(location);
        if (!node)
            return false;
        for (const connection of node.connections) {
            connection.connections.splice(connection.connections.indexOf(node), 1);
        }
        return graph.delete(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`);
    };
    Navigator.getNode = (location) => {
        return graph.get(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`);
    };
    Navigator.getAllNodes = () => {
        return Array.from(graph.values());
    };
    Navigator.addEdges = (...edges) => {
        for (const edge of edges) {
            const [firstNodeLocation, secondNodeLocation] = edge;
            const firstNode = Navigator.getNode(firstNodeLocation);
            const secondNode = Navigator.getNode(secondNodeLocation);
            if (!firstNode || !secondNode)
                continue;
            firstNode.addConnections(secondNode);
            secondNode.addConnections(firstNode);
        }
    };
    Navigator.dijkstra = (fromNode) => {
        if (!fromNode)
            return { ways: undefined, distance: undefined };
        const visited = [];
        const distances = new Map();
        const ways = new Map();
        const allNodes = Array.from(graph.values());
        distances.set(fromNode, 0);
        ways.set(fromNode, [fromNode]);
        for (let i = 0; i < allNodes.length; i++) {
            const result = Array.from(distances.entries()).filter(([node]) => !visited.includes(node)).sort((a, b) => a[1] - b[1])[0];
            if (!result)
                break;
            const [node, currentDistance] = result;
            for (const connection of node.connections) {
                const distance = currentDistance + node.getDistance(connection);
                const prevDistance = distances.get(connection);
                if (prevDistance === undefined || prevDistance > distance) {
                    ways.set(connection, [...ways.get(node), connection]);
                    distances.set(connection, distance);
                }
            }
            visited.push(node);
        }
        return {
            ways: ways,
            distance: distances
        };
        // world.sendMessage(`${ways.get(toNode)?.map(node => `{ ${node.location.x}, ${node.location.y}, ${node.location.z} }`).join(",\n")}`);
    };
    Navigator.iterate = (callback) => {
        const nodes = Array.from(graph.values());
        for (const node of nodes) {
            const nodeIndex = nodes.indexOf(node);
            for (const connection of node.connections) {
                const connectionIndex = nodes.indexOf(connection);
                if (connectionIndex < nodeIndex)
                    continue;
                callback(node, connection);
            }
        }
    };
})(Navigator || (Navigator = {}));
