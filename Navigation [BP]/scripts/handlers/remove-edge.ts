import { Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, system, world } from "@minecraft/server";
import { Node } from "../classes/node";
import { Navigator } from "../navigator";
import { sendMessage } from "../utils/send-message";
import { drawEdge, drawOutline } from "../utils/draw";

const firstNodes = new Map<Player, Node>();

export const removeEdge = (eventData: PlayerBreakBlockBeforeEvent) => {
    

    const { player, block, dimension } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:deny") return;
    if (player.isSneaking) return;
    if (!player.isOp()) return;

    eventData.cancel = true;

    const dimensionLocation = {
        dimension,
        ...block.location
    };

    const firstNode = firstNodes.get(player);
    let node = Navigator.getNode(dimensionLocation);

    if (!node) return sendMessage(player, "해당 블록에는 노드가 존재하지 않습니다.", "c");

    if (firstNode) {
        firstNodes.delete(player);
        if (node === firstNode) {
            Navigator.deleteNode(firstNode.location);
            return sendMessage(player, "노드를 제거했습니다.");
        }

        if (!firstNode.connections.includes(node) || !node.connections.includes(firstNode)) return sendMessage(player, "두 노드를 잇는 간선이 없습니다.");

        if (firstNode.connections.includes(node)) firstNode.connections.splice(firstNode.connections.indexOf(node), 1);
        if (node.connections.includes(firstNode)) node.connections.splice(node.connections.indexOf(firstNode), 1);

        drawEdge(player, firstNode.location, node.location);
        return sendMessage(player, "간선을 제거했습니다.");
    }
    else {
        firstNodes.set(player, node);
        sendMessage(player, "간선의 첫 번째 지점을 설정했습니다.");
    }
}

export const cancelRemove = (eventData: PlayerPlaceBlockBeforeEvent) => {
    

    const { player } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:deny") return;
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
        if (mainHand.typeId !== "minecraft:deny") continue;

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