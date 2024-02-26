import { DimensionLocation, world } from "@minecraft/server";
import { Node } from "../classes/node";
import { NodeState } from "../types/node-state";

export const makeNode = ({
    dimension,
    ...location
}: DimensionLocation) => {

    return new Node({
        dimension,
        ...location
    });
}