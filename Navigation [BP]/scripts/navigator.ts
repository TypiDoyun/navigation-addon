import { Node } from "./classes/node";
import { Graph } from "./types/graph";
import { NodeState } from "./types/node-state";
import { getDimensionId } from "./get-dimension-id";
import { Edge } from "./types/edge";
import { DimensionLocation, world } from "@minecraft/server";

export namespace Navigator {
    const graph: Graph = new Map();

    export const addNodes = (...nodes: Node[]) => {
        for (const node of nodes) {
            const { location } = node;

            node.location.x += 0.5;
            node.location.y += 0.5;
            node.location.z += 0.5;

            graph.set(
                `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`,
                node
            );
        }
    }

    export const deleteNode = (location: DimensionLocation) => {
        const node = getNode(location);

        if (!node) return false;

        for (const connection of node.connections) {
            connection.connections.splice(connection.connections.indexOf(node), 1);
        }

        return graph.delete(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`);
    }

    export const getNode = (location: DimensionLocation) => {
        return graph.get(`${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)},${getDimensionId(location.dimension)}`);
    }

    export const getAllNodes = (): Node[] => {
        return Array.from(graph.values());
    }

    export const addEdges = (...edges: Edge[]) => {
        for (const edge of edges) {
            const [ firstNodeLocation, secondNodeLocation ] = edge;
    
            const firstNode = getNode(firstNodeLocation);
            const secondNode = getNode(secondNodeLocation);

            if (!firstNode || !secondNode) continue;

            firstNode.addConnections(secondNode);
            secondNode.addConnections(firstNode);
        }
    }

    export const dijkstra = (fromNode: Node) => {

        if (!fromNode) return { ways: undefined, distance: undefined };

        const visited: Node[] = [];
        const distances = new Map<Node, number>();
        const ways = new Map<Node, Node[]>();
        const allNodes = Array.from(graph.values());

        distances.set(fromNode, 0);
        ways.set(fromNode, [ fromNode ]);

        for (let i = 0; i < allNodes.length; i++) {
            const result = Array.from(distances.entries()).filter(([ node ]) => !visited.includes(node)).sort((a, b) => a[1] - b[1])[0];

            if (!result) break;

            const [ node, currentDistance ] = result;

            for (const connection of node.connections) {
                const distance = currentDistance + node.getDistance(connection);
                
                const prevDistance = distances.get(connection);

                if (prevDistance === undefined || prevDistance > distance) {
                    ways.set(connection, [ ...ways.get(node)!, connection ]);
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
    }

    export const iterate = (callback: (first: Node, second: Node) => void) => {
        const nodes = Array.from(graph.values());
        for (const node of nodes) {
            const nodeIndex = nodes.indexOf(node);
            for (const connection of node.connections) {
                const connectionIndex = nodes.indexOf(connection);
                if (connectionIndex < nodeIndex) continue;

                callback(node, connection);
            }
        }
    }
}