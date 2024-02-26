import { ChatSendBeforeEvent, Player, PlayerBreakBlockBeforeEvent } from "@minecraft/server";
import { Node } from "../classes/node";
import { Navigator } from "../navigator";
import { sendMessage } from "../utils/send-message";
import { navigate } from "../utils/navigate";

const fromMap = new Map<Player, Node>();
const toMap = new Map<Player, Node>();

export const setFrom = (eventData: PlayerBreakBlockBeforeEvent) => {
    const { player, block, dimension } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:deny") return;
    if (!player.isOp()) return;
    if (!player.isSneaking) return;

    eventData.cancel = true;

    const dimensionLocation = {
        dimension,
        ...block.location
    };

    const node = Navigator.getNode(dimensionLocation);

    if (!node) return sendMessage(player, "해당 위치에는 노드가 없습니다.", "c");

    fromMap.set(player, node);
    sendMessage(player, "출발 지점을 설정했습니다.");
}

export const setTo = (eventData: PlayerBreakBlockBeforeEvent) => {
    const { player, block, dimension } = eventData;

    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);

    if (!inventory || !container || !mainHand) return;
    if (mainHand.typeId !== "minecraft:allow") return;
    if (!player.isOp()) return;
    if (!player.isSneaking) return;

    eventData.cancel = true;

    const dimensionLocation = {
        dimension,
        ...block.location
    };

    const node = Navigator.getNode(dimensionLocation);

    if (!node) return sendMessage(player, "해당 위치에는 노드가 없습니다.", "c");

    toMap.set(player, node);
    sendMessage(player, "도착 지점을 설정했습니다.");
}

export const findWay = (eventData: ChatSendBeforeEvent) => {
    const { sender: player, message } = eventData;

    if (!player.isOp()) return;
    if (message !== ".find") return;

    eventData.cancel = true;

    const from = fromMap.get(player);
    const to = toMap.get(player);

    if (!from || !to) return sendMessage(player, "출발 지점과 도착 지점을 설정해주세요", "c");

    navigate(player, to);
}