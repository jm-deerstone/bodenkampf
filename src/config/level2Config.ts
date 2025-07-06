import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL2_BG_PATHS = [
    "sprites/background/level2/bg1.png",
    "sprites/background/level2/bg2.png"
];

export const LEVEL2_BG_PLACEMENTS: [number, number, number, number][] = [
    [100, 330, 80, 80],
    [500, 290, 110, 110],
];

export const LEVEL2_OBSTACLES = [
    { type: "spring",   x: 380,  y: GROUND_Y - 22 + FLOOR_3D_OFFSET,   w: 40,  h: 28 },
    { type: "water",    x: 600,  y: GROUND_Y - 80 + FLOOR_3D_OFFSET,   w: 120, h: 120 },
    { type: "spike",    x: 950,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
    { type: "rotating", x: 1250, y: GROUND_Y - 70 + FLOOR_3D_OFFSET,   w: 120, h: 100 }
];

export const LEVEL2_ENEMY = {
    x: LEVEL_LENGTHS[2] - 100,
    y: GROUND_Y - 100 + FLOOR_3D_OFFSET,
    w: 100,
    h: 120
};
