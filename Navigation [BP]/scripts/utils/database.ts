import { world } from "@minecraft/server"

export namespace Database {
    const identifier = "typi-database";
    const MAX_LENGTH = 32_767;

    export const write = (id: string, value: string) => {
        let index = 0;
        
        while (true) {
            const propertyId = `${identifier}:${id}-${index}`;
            if (index < value.length / MAX_LENGTH) {
                world.setDynamicProperty(propertyId, value.slice(MAX_LENGTH * index, MAX_LENGTH * (index + 1)));
            }
            else {
                const cache = world.getDynamicProperty(propertyId);

                if (cache === undefined) break;

                world.setDynamicProperty(propertyId);
            }
            index += 1;
        }
        for (let index = 0; index < value.length / MAX_LENGTH; index++) {
        }
    }
    
    export const read = (id: string) => {
        let result = "";
        let index = 0;

        while (true) {
            const part = world.getDynamicProperty(`${identifier}:${id}-${index}`);

            if (part === undefined || typeof part !== "string") {
                if (index === 0) return;
                break;
            }
            
            result += part;
            index += 1;
        }

        return result;
    }
}
