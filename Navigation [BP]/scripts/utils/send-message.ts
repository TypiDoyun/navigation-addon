import { Player } from "@minecraft/server";

export const sendMessage = (player: Player, message: string | number | boolean, color: string = "a") => {
    player.sendMessage(`§l§${color} > §r§f${message}`);
}