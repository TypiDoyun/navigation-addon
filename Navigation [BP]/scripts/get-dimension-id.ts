import { Dimension } from "@minecraft/server";
import { DimensionId } from "./types/dimension-id";

export const getDimensionId = (dimension: Dimension) => {
    return dimension.id.replace("minecraft:", "") as DimensionId;
}