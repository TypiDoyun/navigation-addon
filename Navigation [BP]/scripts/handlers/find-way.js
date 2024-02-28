import { Navigator } from "../navigator";
import { sendMessage } from "../utils/send-message";
import { navigate } from "../utils/navigate";
const toMap = new Map();
export const setTo = (eventData) => {
    const { player, block, dimension } = eventData;
    const inventory = player.getComponent("inventory");
    const container = inventory?.container;
    const mainHand = container?.getItem(player.selectedSlot);
    if (!inventory || !container || !mainHand)
        return;
    if (mainHand.typeId !== "minecraft:allow")
        return;
    if (!player.isOp())
        return;
    if (!player.isSneaking)
        return;
    eventData.cancel = true;
    const dimensionLocation = {
        dimension,
        ...block.location
    };
    const node = Navigator.getNode(dimensionLocation);
    if (!node)
        return sendMessage(player, "해당 위치에는 노드가 없습니다.", "c");
    toMap.set(player, node);
    sendMessage(player, "도착 지점을 설정했습니다.");
};
export const findWay = (eventData) => {
    const { sender: player, message } = eventData;
    if (!player.isOp())
        return;
    if (message !== ".find")
        return;
    eventData.cancel = true;
    const to = toMap.get(player);
    if (!to)
        return sendMessage(player, "도착 지점을 설정해주세요", "c");
    navigate(player, to);
};
