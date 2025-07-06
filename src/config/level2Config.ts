import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL2_BG_PATHS = [
    "sprites/background/level2/fenster1.png",
    "sprites/background/level2/fenster2.png",
    "sprites/background/level2/fenster3.png",
    "sprites/background/level2/fenster4.png",
    "sprites/background/level2/fenster5.png",
    "sprites/background/level2/fenster6.png",
    "sprites/background/level2/table1.png",
    "sprites/background/level2/table2.png",
    "sprites/background/level2/table3.png",
    "sprites/background/level2/table4.png",
    "sprites/background/level2/table5.png",
    "sprites/background/level2/table6.png",
    "sprites/background/level2/tafel1.png"
];

export const LEVEL2_BG_PLACEMENTS: [number, number, number, number][] = [
    [90, 280, 90, 120],
    [200, 280, 90, 120],
    [300, 280, 90, 120],
    [490, 280, 90, 120],
    [500, 290, 90, 120],
    [250, 290, 90, 120],
    [500, 290, 90, 120],
    [700, 290, 90, 120],
    [500, 290, 90, 120],
    [500, 290, 90, 120],
    [500, 290, 90, 120],
    [500, 290, 110, 110],
    [500, 290, 110, 110],
];

export const LEVEL2_OBSTACLES = [
    { type: "spike",    x: 100,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
    { type: "spike",    x: 300,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
    { type: "spike",    x: 500,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
    { type: "spike",    x: 700,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
];

export const LEVEL2_OBSTACLE_SPRITES: Record<string, string[]> = {
    spike: [
        "sprites/obstacles/level2/spikes/spikes1.png",
        "sprites/obstacles/level2/spikes/spikes2.png",
        "sprites/obstacles/level2/spikes/spikes3.png",
        "sprites/obstacles/level2/spikes/spikes4.png",
    ],
};

export const LEVEL2_ENEMY = {
    x: LEVEL_LENGTHS[2] - 100,
    y: GROUND_Y - 100 + FLOOR_3D_OFFSET,
    w: 100,
    h: 120,
    imgPath: "sprites/enemies/level2/enemy1.png"  // Make sure this exists!
};



export const LEVEL2_BG_COLOR = "#eeeeee";       // light grey
export const LEVEL2_FLOOR_COLOR = "#333333";    // dark grey