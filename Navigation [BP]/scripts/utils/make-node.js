import { Node } from "../classes/node";
export const makeNode = ({ dimension, ...location }) => {
    return new Node({
        dimension,
        ...location
    });
};
