import { GROUND_Y, FLOOR_3D_OFFSET, LEVEL_LENGTHS } from "./globalConfig";

// ==== GROUP 1 ====
export const LEVEL3_GROUP1_PATHS = [
    // Trees (back to front)
    "sprites/background/level3/baumback1.png",
    "sprites/background/level3/baummid1.png",
    "sprites/background/level3/baummid1.png",
    "sprites/background/level3/baumfront1.png",
    "sprites/background/level3/baumfront1.png",

    // Bushes (back to front)
    "sprites/background/level3/buschback1.png",
    "sprites/background/level3/buschmid1.png",
    "sprites/background/level3/buschmid1.png",
    "sprites/background/level3/buschfront1.png",
    "sprites/background/level3/buschfront2.png",
] as const;

export const LEVEL3_GROUP1_PLACEMENTS: [number, number, number, number][] = [
    [150, 345, 50, 80],   // baumback1.png
    [150, 322, 100, 100],    // baummid1.png
    [270, 300, 90, 120],   // baumfront1.png
    [200, 305, 90, 120],   // baumfront1.png
    [250, 305, 90, 120],   // baumfront1.png


    [600, 3950, 30, 30],    // buschback1.png
    [620, 385, 40, 40],    // buschback1.png
    [700, 375, 50, 40],   // buschmid1.png
    [640, 375, 60, 50],    // buschfront1.png
    [660, 380, 70, 45],   // buschfront2.png
];

// ==== GROUP 2 ====
export const LEVEL3_GROUP2_PATHS = [
    // Trees (back to front)
    "sprites/background/level3/baummid2.png",
    "sprites/background/level3/baumfront2.png",
    "sprites/background/level3/baumfront3.png",
    // Bushes (back to front)
    "sprites/background/level3/buschback2.png",
    "sprites/background/level3/buschmid2.png",
    "sprites/background/level3/buschfront3.png",
    "sprites/background/level3/buschfront4.png",
] as const;

export const LEVEL3_GROUP2_PLACEMENTS: [number, number, number, number][] = [
    [1000, 310, 90, 120],   // baummid2.png
    [1000, 340, 80, 80],    // baumfront2.png
    [1000, 310, 90, 120],   // baumfront3.png

    [1000, 310, 90, 120],   // buschback2.png
    [1000, 340, 80, 80],    // buschmid2.png
    [1000, 340, 80, 80],    // buschfront3.png
    [1000, 320, 90, 120],   // buschfront4.png
];

// ==== GROUP 3 ====
export const LEVEL3_GROUP3_PATHS = [
    // Trees (back to front)
    "sprites/background/level3/baummid3.png",
    "sprites/background/level3/baumfront4.png",
    // Bushes (back to front)
    "sprites/background/level3/buschfront5.png",
    "sprites/background/level3/buschfront6.png",
] as const;

export const LEVEL3_GROUP3_PLACEMENTS: [number, number, number, number][] = [
    [1000, 340, 80, 80],    // baummid3.png
    [1000, 340, 80, 80],    // baumfront4.png

    [1000, 340, 80, 80],    // buschfront5.png
    [1000, 340, 80, 80],    // buschfront6.png
];

// ---- GROUP 3: OTHERS (background, character, animals, etc) ----
export const LEVEL3_OTHER_PATHS = [
    "sprites/background/level3/bankfront.png", // background building/bank
    "sprites/background/level3/buben.png",     // kids/characters
    "sprites/background/level3/buben.png",
    "sprites/background/level3/dogfront.png",  // dog
] as const;
export const LEVEL3_OTHER_PLACEMENTS: [number, number, number, number][] = [
    [20, 360, 90, 65],      // bankfront.png
    [2500, 320, 90, 120],   // buben.png
    [2500, 320, 90, 120],   // buben.png
    [1050, 340, 80, 80],    // dogfront.png
];

// ---- LEGACY FLAT ARRAYS ----
export const LEVEL3_BG_PATHS: string[] = [
    ...LEVEL3_GROUP1_PATHS,
    ...LEVEL3_GROUP2_PATHS,
    ...LEVEL3_GROUP3_PATHS,
    ...LEVEL3_OTHER_PATHS,
];

export const LEVEL3_BG_PLACEMENTS: [number, number, number, number][] = [
    ...LEVEL3_GROUP1_PLACEMENTS,
    ...LEVEL3_GROUP2_PLACEMENTS,
    ...LEVEL3_GROUP3_PLACEMENTS,
    ...LEVEL3_OTHER_PLACEMENTS,
];

export const LEVEL3_OBSTACLES = [
    { type: "spike",    x: 200,  y: GROUND_Y - 60 + FLOOR_3D_OFFSET, w: 45,  h: 80 },
    { type: "spike",    x: 500,  y: GROUND_Y - 60 + FLOOR_3D_OFFSET, w: 45,  h: 80 },
    { type: "spike",    x: 650,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET, w: 55,  h: 100 },
    { type: "spike",    x: 1000,  y: GROUND_Y - 50 + FLOOR_3D_OFFSET, w: 55,  h: 100 },
];

export const LEVEL3_OBSTACLE_SPRITES: Record<string, string[]> = {
    spike: [
        "sprites/obstacles/level3/müll1.png",
        "sprites/obstacles/level3/müll2.png",
        "sprites/obstacles/level3/müll3.png",
    ],
};

export const LEVEL3_ENEMY = {
    x: LEVEL_LENGTHS[3] - 150,
    y: GROUND_Y - 70 + FLOOR_3D_OFFSET,
    w: 120,
    h: 130,
    imgPath: "sprites/enemies/level3/enemy1.png"
};


export const LEVEL3_BG_COLOR = "#3498db";     // blue background
export const LEVEL3_FLOOR_COLOR = "#8b4513";  // brown floor