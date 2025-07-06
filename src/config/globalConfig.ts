export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;
export const GROUND_Y = GAME_HEIGHT - 60;

export const PLAYER_WIDTH = Math.floor(40 * 1.3);
export const PLAYER_HEIGHT = Math.floor(60 * 1.4);
export const PLAYER_Y_OFFSET = 20;

export const PLAYER_SPEED = 5;
export const GRAVITY = 0.5;
export const JUMP_SPEED = -11;
export const SPRING_JUMP_SPEED = -18;
export const WATER_SLOWDOWN = 2;
export const FLOOR_3D_OFFSET = 25;

// Level length per level, indexed by number
export const LEVEL_LENGTHS: Record<number, number> = {
    1: GAME_WIDTH * 2,
    2: GAME_WIDTH * 3,
    3: GAME_WIDTH * 4,
};
