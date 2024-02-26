import { Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, system, world } from "@minecraft/server";
import { makeNode } from "../utils/make-node";
import { Navigator } from "../navigator";
import { sendMessage } from "../utils/send-message";
import { Node } from "../classes/node";
import { drawEdge, drawOutline } from "../utils/draw";

const firstNodes = new Map<Player, Node>();

export const addEdge = (eventData: PlayerBreakBlockBeforeEvent) => {
    const { player, block, dimension } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:allow") return;
    if (player.isSneaking) return;
    if (!player.isOp()) return;

    eventData.cancel = true;

    const dimensionLocation = {
        dimension,
        ...block.location
    };

    const firstNode = firstNodes.get(player);
    let node = Navigator.getNode(dimensionLocation);

    if (!node) {
        node = makeNode(dimensionLocation);
        Navigator.addNodes(node);
    }

    if (firstNode) {
        if (node === firstNode) return sendMessage(player, "간선의 첫 번째 지점과 동일한 지점을 선택할 수 없습니다.", "c");
        firstNodes.delete(player);

        if (firstNode.connections.includes(node) || node.connections.includes(firstNode)) return sendMessage(player, "이미 간선이 연결되어 있습니다.", "c");

        firstNode.connections.push(node);
        node.connections.push(firstNode);

        drawEdge(player, firstNode.location, node.location);
        return sendMessage(player, "간선을 생성했습니다.");
    }
    else {
        firstNodes.set(player, node);
        sendMessage(player, "간선의 첫 번째 지점을 설정했습니다.");
    }
}

export const cancelAdd = (eventData: PlayerPlaceBlockBeforeEvent) => {
    const { player } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:allow") return;
    if (!player.isOp()) return;
    if (!firstNodes.has(player)) return;

    eventData.cancel = true;

    firstNodes.delete(player);

    sendMessage(player, "선택된 노드를 취소했습니다.");
}

system.runInterval(() => {
    const players = world.getAllPlayers();

    for (const player of players) {
        const inventory = player.getComponent("inventory");
        const container = inventory?.container;
        const mainHand = container?.getItem(player.selectedSlot);

        if (!inventory || !container || !mainHand) continue;
        if (mainHand.typeId !== "minecraft:allow") continue;

        const firstNode = firstNodes.get(player);

        if (firstNode) {
            drawOutline(player, firstNode.location);
        }

        Navigator.getAllNodes().forEach(node => {
            drawOutline(player, node.location);
        })
        
        Navigator.iterate((first, second) => {
            drawEdge(player, first.location, second.location);
        }); 
    }
}, 10);