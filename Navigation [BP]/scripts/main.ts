import { world } from "@minecraft/server";
import { cancelRemove, removeEdge } from "./handlers/remove-edge";
import { addEdge, cancelAdd } from "./handlers/add-edge";
import { findWay, setFrom, setTo } from "./handlers/find-way";

world.beforeEvents.playerBreakBlock.subscribe(addEdge);
world.beforeEvents.playerBreakBlock.subscribe(removeEdge);

world.beforeEvents.playerPlaceBlock.subscribe(cancelAdd);
world.beforeEvents.playerPlaceBlock.subscribe(cancelRemove);

world.beforeEvents.playerBreakBlock.subscribe(setFrom);
world.beforeEvents.playerBreakBlock.subscribe(setTo);

world.beforeEvents.chatSend.subscribe(findWay);

// const findHistory = new Map<Player, [ Node?, Node? ]>();

// world.beforeEvents.playerPlaceBlock.subscribe(eventData => {
//     const { player, block, dimension } = eventData;

//     const inventory = player.getComponent("inventory");
//     const container = inventory?.container;
//     const mainHand = container?.getItem(player.selectedSlot);

//     if (!inventory || !container || !mainHand) return;

//     const nodeState = {
//         dimension: dimension,
//         ...block.location
//     };

//     if (mainHand.typeId == "minecraft:redstone_block") {
        
    
//         player.sendMessage("노드가 추가되었습니다.");
    
//         if (Navigator.getNode(nodeState)) return;
    
//         Navigator.addNodes(
//             makeNode(nodeState)
//         );
//     }
//     else if (mainHand.typeId == "minecraft:emerald_block") {
//         eventData.cancel = true;
//         Navigator.iterate((first, second) => {
//             drawEdge(player, first.location, second.location);
//         })
//     }
// });

// const history = new Map<Player, Node>();

// world.beforeEvents.playerBreakBlock.subscribe(eventData => {
//     const { player, block, dimension } = eventData;
//     const inventory = player.getComponent("inventory");
//     const container = inventory?.container;
//     const mainHand = container?.getItem(player.selectedSlot);

//     if (!inventory || !container || !mainHand) return;
//     const nodeState = {
//         dimension: dimension,
//         ...block.location
//     };

//     if (mainHand.typeId === "minecraft:redstone_block") {
//         eventData.cancel = true;
//         let node = Navigator.getNode(nodeState);
//         if (!node) {
//             Navigator.addNodes(
//                 makeNode(nodeState)
//             );
//             node = Navigator.getNode(nodeState)!;
//         }
//         if (history.has(player)) {
//             const firstNode = history.get(player)!;
//             if (node === firstNode) return player.sendMessage("첫번째 노드와 다른 노드를 선택해주세요");
//             history.delete(player);
            
//             if (firstNode.connections.includes(node) || node.connections.includes(firstNode)) return player.sendMessage("이미 연결된 노드입니다.");

//             drawEdge(player, firstNode.location, node.location);

//             firstNode.connections.push(node);
//             node.connections.push(firstNode);

//             player.sendMessage("두 노드가 성공적으로 연결되었습니다!");
//         } else {
//             history.set(player, node);
//             player.sendMessage("첫번째 노드를 선택했습니다.");
//         }
//     }
//     else if (mainHand.typeId === "minecraft:emerald_block") {
//         eventData.cancel = true;

//         let node = Navigator.getNode(nodeState);
//         if (!node) {
//             Navigator.addNodes(
//                 makeNode(nodeState)
//             );
//             node = Navigator.getNode(nodeState)!;
//         }

//         if (history.has(player)) {
//             const firstNode = history.get(player)!;
//             if (node === firstNode) return player.sendMessage("첫번째 노드와 다른 노드를 선택해주세요");
//             history.delete(player);
            
//             if (!firstNode.connections.includes(node) || !node.connections.includes(firstNode)) return player.sendMessage("연결되지 않은 노드입니다.");

//             drawEdge(player, firstNode.location, node.location);

//             firstNode.connections.splice(firstNode.connections.indexOf(node), 1);
//             node.connections.splice(node.connections.indexOf(firstNode), 1);

//             player.sendMessage("두 노드의 연결을 끊었습니다!");
//         } else {
//             history.set(player, node);
//             player.sendMessage("첫번째 노드를 선택했습니다.");
//         }
//     }
//     else if (mainHand.typeId == "minecraft:lapis_block") {
//         eventData.cancel = true;
//         const node = Navigator.getNode(nodeState);
//         if (!node) return player.sendMessage("해당 블록에는 노드가 존재하지 않습니다.");
        
//         if (findHistory.has(player)) {
//             const find = findHistory.get(player)!;
//             find[0] = node;
//         }
//         else {
//             findHistory.set(player, [ node, undefined ]);
//         }

//         world.sendMessage("시작 지점을 설정했습니다.");
//     }
//     else if (mainHand.typeId == "minecraft:diamond_block") {
//         eventData.cancel = true;
//         const node = Navigator.getNode(nodeState);
//         if (!node) return player.sendMessage("해당 블록에는 노드가 존재하지 않습니다.");
        
//         if (findHistory.has(player)) {
//             const find = findHistory.get(player)!;
//             find[1] = node;
//         }
//         else {
//             findHistory.set(player, [ undefined, node ]);
//         }
//         world.sendMessage("도착 지점을 설정했습니다.");
//     }
// });

// const navigatorEntities = new Map<Player, Entity>();

// const angleRange = (angle: number) => {
//     return angle < 0 ? 360 + angle : (angle >= 360 ? angle - 360 : angle);
// }

// world.beforeEvents.chatSend.subscribe(eventData => {
//     const { sender, message } = eventData;

//     if (message !== "!테스트") return;

//     eventData.cancel = true;

//     // world.setDynamicProperty("angle", "a".repeat(32767));
//     // world.setDynamicProperty("b", "a".repeat(32767));

// });

// world.beforeEvents.chatSend.subscribe(eventData => {
//     const { sender, message } = eventData;

//     if (message !== "!길찾기") return;

//     eventData.cancel = true;

//     const find = findHistory.get(sender);

//     if (!find) return;
//     if (!find[0] || !find[1]) return;

//     const from = Navigator.getNode(find[0].location);
//     const to = Navigator.getNode(find[1].location);

//     if (!from || !to) return;

//     const { ways, distance } = Navigator.findWay(from, to);

//     world.sendMessage(`${distance}`);

//     if (!ways) return;
//     if (navigatorEntities.has(sender)) return;

//     let current = 0;
//     let arrowAngle = 0;

//     let interval = system.runInterval(() => {
//         const location = sender.location;
//         const reach = 1.4;
//         const playerRadian = sender.getRotation().y * Math.PI / 180;
//         const viewVector = {
//             x: -Math.sin(playerRadian) * reach,
//             y: 0,
//             z: Math.cos(playerRadian) * reach
//         }
//         const arrowLocation = {
//             x: location.x + viewVector.x,
//             y: location.y + 0.5,
//             z: location.z + viewVector.z
//         };
//         const detectedIndice = [];

//         for (const _ in ways) {
//             const i = +_;
//             const way = ways[i];

//             const distanceSquared = (location.x - way.location.x - 0.5) ** 2 +
//                              (location.y - way.location.y - 0.5) ** 2 +
//                              (location.z - way.location.z - 0.5) ** 2;
            
//             if (distanceSquared < 1.5 ** 2) detectedIndice.push(i);
//         }

        
//         for (const _ in detectedIndice) {
//             const index = +_;
//             const detectedIndex = detectedIndice[index];
            
//             if (index === 0) current = detectedIndex;
//             else {
//                 if (detectedIndex - current === 1) current = detectedIndex;
//                 else break;
//             }
//         }
//         sender.onScreenDisplay.setActionBar(`${detectedIndice.join(", ")}\ncurrent: ${current}`);
        
//         if (current === ways.length - 1) {
//             // sender.onScreenDisplay.setActionBar("도착뿡~!");
//             navigatorEntities.delete(sender);
//             return system.clearRun(interval);
//         }

//         const way = ways[current + 1];

//         const dx = way.location.x - arrowLocation.x + 0.5;
//         const dz = way.location.z - arrowLocation.z + 0.5;

//         let angle = Math.round(Math.atan2(-dx, dz) / Math.PI * 180);
//         angle = angleRange(angle);
//         let angleDiff = (angle - arrowAngle);
//         const ratio = 4;
//         const value = angleDiff > 180 ? (360 - angleDiff) / ratio * -1 : (angleDiff < -180 ? (360 + angleDiff) / ratio : angleDiff / ratio);

//         arrowAngle += value;
//         arrowAngle = angleRange(Math.round(arrowAngle));

//         // sender.onScreenDisplay.setActionBar(`${angleDiff.toFixed(0).padStart(4, "0")}\n${angle.toFixed(0).padStart(4, "0")}\n${arrowAngle.toFixed(0).padStart(4, "0")}`);

//         sender.spawnParticle(`typi:arrow_${Math.round(arrowAngle)}`, arrowLocation);
//     }, 1);
// })