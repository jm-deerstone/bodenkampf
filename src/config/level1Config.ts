import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

export const LEVEL1_BG_PATHS = [
    "sprites/background/level1/1plant.png",
    "sprites/background/level1/2schrankgroß.png",
    "sprites/background/level1/3guitar.png",
    "sprites/background/level1/4drawing.png",
    "sprites/background/level1/5lamp.png",
    "sprites/background/level1/6window.png",
    "sprites/background/level1/7schrank.png",
    "sprites/background/level1/8vinyl.png"
];

export const LEVEL1_BG_PLACEMENTS: [number, number, number, number][] = [
    [80, 355, 45, 65],
    [230, 300, 110, 120],
    [370, 350, 40, 70],
    [520, 280, 70, 70],
    [600, 360, 45, 60],
    [680, 250, 140, 140],
    [870, 350, 50, 70],
    [955, 360, 60, 60],
];

export const LEVEL1_OBSTACLES = [
    { type: "spike",    x: 340,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET,   w: 100, h: 80 },
    { type: "spring",   x: 720,  y: GROUND_Y - 22 + FLOOR_3D_OFFSET,   w: 40,  h: 28 },
    { type: "rotating", x: 1000, y: GROUND_Y - 70 + FLOOR_3D_OFFSET,   w: 100, h: 100 },
    { type: "water",    x: 770,  y: GROUND_Y - 80 + FLOOR_3D_OFFSET,   w: 120, h: 120 }
];

export const LEVEL1_OBSTACLE_SPRITES: Record<string, string[]> = {
    spike: [
        "sprites/obstacles/level1/spikes/spike1.png",
    ],
    spring: [
        "sprites/obstacles/level1/spring/spring1.png",
    ],
    rotating: [
        "sprites/obstacles/level1/rotating/rotating1.png"
    ],
    water: [
        "sprites/obstacles/level1/water/water1.png"
    ]
};
export const LEVEL1_ENEMY = {
    x: LEVEL_LENGTHS[1] - 120,
    y: GROUND_Y - 90 + FLOOR_3D_OFFSET,
    w: 90,
    h: 115
};
