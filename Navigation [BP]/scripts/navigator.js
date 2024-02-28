import { getDimensionId } from "./get-dimension-id";
import { Database } from "./utils/database";
import { makeNode } from "./utils/make-node";
export var Navigator;
(function (Navigator) {
    const graph = new Map();
    const databaseId = "typi-navigator:node";
    let initialized = false;
    Navigator.initialize = () => {
        if (initialized)
            return;
        initialized = true;
        const nodeData = Database.read(databaseId);
        const savedNodes = JSON.parse(nodeData ?? "[]");
        const nodes = [];
        for (const nodeState of savedNodes) {
            const node = makeNode({
                ...nodeState.location
            });
            nodes.push([node, nodeState]);
        }
        for (const [node, savedNode] of nodes) {
            for (const connection of savedNode.connections) {
                for (const [otherNode, _] of nodes) {
                    if (connection.dimension.id !== otherNode.location.dimension.id)
                        continue;
                    if (connection.x !== otherNode.location.x)
                        continue;
                    if (connection.y !== otherNode.location.y)
                        continue;
                    if (connection.z !== otherNode.location.z)
                        continue;
                    node.addConnections(otherNode);
                    break;
                }
            }
            const location = node.location;
            const nodeKey = `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`;
            graph.set(nodeKey, node);
        }
    };
    Navigator.save = () => {
        const nodeTuples = Array.from(graph.entries());
        const convertedData = nodeTuples.map(([_, node]) => {
            return {
                location: {
                    ...node.location
                },
                connections: node.connections.map(connection => connection.location)
            };
        });
        // world.sendMessage(JSON.stringify(convertedData, null, 4));
        Database.write(databaseId, JSON.stringify(convertedData, null, 4));
    };
    Navigator.addNodes = (...nodes) => {
        for (const node of nodes) {
            const { location } = node;
            node.location.x += 0.5;
            node.location.y += 0.5;
            node.location.z += 0.5;
            const nodeKey = `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`;
            graph.set(nodeKey, node);
        }
        Navigator.save();
    };
    Navigator.deleteNode = (location) => {
        const node = Navigator.getNode(location);
        if (!node)
            return false;
        for (const connection of node.connections) {
            connection.connections.splice(connection.connections.indexOf(node), 1);
        }
        const result = graph.delete(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`);
        Navigator.save();
        return result;
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
        Navigator.save();
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
