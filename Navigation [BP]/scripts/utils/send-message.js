export const sendMessage = (player, message, color = "a") => {
    player.sendMessage(`§l§${color} > §r§f${message}`);
};
