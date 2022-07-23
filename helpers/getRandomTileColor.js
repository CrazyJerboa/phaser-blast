import {tileColor} from "../enum/tile";

export const getRandomTileColor = () => {
    const keys = Object.keys(tileColor);
    return tileColor[keys[keys.length * Math.random() << 0]];
}