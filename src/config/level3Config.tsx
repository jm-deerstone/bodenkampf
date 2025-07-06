import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL3_BG_PATHS = [
    "sprites/background/level3/bankfront.png",
    "sprites/background/level3/baumback1.png",
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

export const LEVEL3_OBSTACLE_SPRITES: Record<string, string[]> = {
    spike: [
        "sprites/obstacles/level2/spikes/spikes1.png",
        "sprites/obstacles/level2/spikes/spikes2.png",
        "sprites/obstacles/level2/spikes/spikes3.png",
        "sprites/obstacles/level2/spikes/spikes4.png",
    ],
};

export const LEVEL3_ENEMY = {
    x: LEVEL_LENGTHS[3] - 150,
    y: GROUND_Y - 110 + FLOOR_3D_OFFSET,
    w: 120,
    h: 130
};


export const LEVEL3_BG_COLOR = "#3498db";     // blue background
export const LEVEL3_FLOOR_COLOR = "#8b4513";  // brown floor