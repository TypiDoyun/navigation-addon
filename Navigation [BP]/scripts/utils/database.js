import { world } from "@minecraft/server";
export var Database;
(function (Database) {
    const identifier = "typi-database";
    const MAX_LENGTH = 32767;
    Database.write = (id, value) => {
        let index = 0;
        while (true) {
            const propertyId = `${identifier}:${id}-${index}`;
            if (index < value.length / MAX_LENGTH) {
                world.setDynamicProperty(propertyId, value.slice(MAX_LENGTH * index, MAX_LENGTH * (index + 1)));
            }
            else {
                const cache = world.getDynamicProperty(propertyId);
                if (cache === undefined)
                    break;
                world.setDynamicProperty(propertyId);
            }
            index += 1;
        }
        for (let index = 0; index < value.length / MAX_LENGTH; index++) {
        }
    };
    Database.read = (id) => {
        let result = "";
        let index = 0;
        while (true) {
            const part = world.getDynamicProperty(`${identifier}:${id}-${index}`);
            if (part === undefined || typeof part !== "string") {
                if (index === 0)
                    return;
                break;
            }
            result += part;
            index += 1;
        }
        return result;
    };
})(Database || (Database = {}));
