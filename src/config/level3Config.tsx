import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL3_BG_PATHS = [
    "sprites/background/level3/tree.png",
    "sprites/background/level3/sofa.png",
];

export const LEVEL3_BG_PLACEMENTS: [number, number, number, number][] = [
    [120, 340, 80, 80],
    [500, 320, 90, 120],
];

export const LEVEL3_OBSTACLES = [
    { type: "rotating", x: 320,  y: GROUND_Y - 60 + FLOOR_3D_OFFSET, w: 120, h: 110 },
    { type: "spike",    x: 650,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET, w: 80,  h: 60 },
    { type: "water",    x: 1100, y: GROUND_Y - 90 + FLOOR_3D_OFFSET, w: 180, h: 120 },
    { type: "spring",   x: 1400, y: GROUND_Y - 22 + FLOOR_3D_OFFSET, w: 40,  h: 28 }
];

export const LEVEL3_ENEMY = {
    x: LEVEL_LENGTHS[3] - 150,
    y: GROUND_Y - 110 + FLOOR_3D_OFFSET,
    w: 120,
    h: 130
};
