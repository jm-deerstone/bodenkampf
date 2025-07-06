import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL2_BG_PATHS = [
    "sprites/background/level2/fenster1.png",
    "sprites/background/level2/fenster2.png",
    "sprites/background/level2/fenster3.png",
    "sprites/background/level2/fenster4.png",
    "sprites/background/level2/fenster5.png",
    "sprites/background/level2/fenster6.png",
    "sprites/background/level2/fenster1.png",
    "sprites/background/level2/fenster2.png",
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
    [400, 280, 90, 120],
    [510, 280, 90, 120],
    [700, 280, 90, 120],
    [810, 280, 90, 120],
    [1000, 280, 90, 120],
    [1110, 280, 90, 120],
    [300, 350, 75, 80],
    [600, 350, 75, 80],
    [900, 350, 75, 80],
    [1200, 350, 75, 80],
    [1400, 350, 75, 80],
    [1600, 350, 75, 80],
    [1760, 290, 150, 150],
];

export const LEVEL2_OBSTACLES = [
    { type: "spike",    x: 100,  y: GROUND_Y - 25 + FLOOR_3D_OFFSET,   w: 75, h: 55 },
    { type: "spike",    x: 610,  y: GROUND_Y - 25 + FLOOR_3D_OFFSET,   w: 75, h: 55 },
    { type: "spike",    x: 900,  y: GROUND_Y - 25 + FLOOR_3D_OFFSET,   w: 75, h: 55 },
    { type: "spike",    x: 1480,  y: GROUND_Y - 25 + FLOOR_3D_OFFSET,   w: 75, h: 55 },
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
    y: GROUND_Y - 70 + FLOOR_3D_OFFSET,
    w: 65,
    h: 90,
    imgPath: "sprites/enemies/level2/enemy1.png"  // Make sure this exists!
};



export const LEVEL2_BG_COLOR = "#eeeeee";       // light grey
export const LEVEL2_FLOOR_COLOR = "#333333";    // dark grey