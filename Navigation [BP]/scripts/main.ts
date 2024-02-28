import { world } from "@minecraft/server";
import { cancelRemove, removeEdge } from "./handlers/remove-edge";
import { addEdge, cancelAdd } from "./handlers/add-edge";
import { findWay, setTo } from "./handlers/find-way";
import { Navigator } from "./navigator";

world.afterEvents.worldInitialize.subscribe(Navigator.initialize);

world.beforeEvents.playerBreakBlock.subscribe(addEdge);
world.beforeEvents.playerBreakBlock.subscribe(removeEdge);

world.beforeEvents.playerPlaceBlock.subscribe(cancelAdd);
world.beforeEvents.playerPlaceBlock.subscribe(cancelRemove);

world.beforeEvents.playerBreakBlock.subscribe(setTo);

world.beforeEvents.chatSend.subscribe(findWay);