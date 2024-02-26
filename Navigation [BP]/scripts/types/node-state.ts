import { Vector3 } from "@minecraft/server"
import { Node } from "../classes/node"
import { DimensionId } from "./dimension-id"

export type NodeState = {
    dimensionId: DimensionId,
    location: Vector3,
    connections?: Node[]
}