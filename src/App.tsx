import React, { useEffect, useRef, useState } from "react";
import {
    GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_WIDTH, PLAYER_HEIGHT,
    PLAYER_Y_OFFSET, PLAYER_SPEED, GRAVITY, JUMP_SPEED, SPRING_JUMP_SPEED,
    WATER_SLOWDOWN, FLOOR_3D_OFFSET, LEVEL_LENGTHS
} from "./config/globalConfig";
import {
    LEVEL1_BG_PATHS, LEVEL1_BG_PLACEMENTS, LEVEL1_OBSTACLES, LEVEL1_ENEMY, LEVEL1_OBSTACLE_SPRITES
} from "./config/level1Config";
import {
    LEVEL2_BG_PATHS, LEVEL2_BG_PLACEMENTS, LEVEL2_OBSTACLES, LEVEL2_ENEMY, LEVEL2_OBSTACLE_SPRITES
} from "./config/level2Config";
import {
    LEVEL3_BG_PATHS, LEVEL3_BG_PLACEMENTS, LEVEL3_OBSTACLES, LEVEL3_BG_COLOR,
    LEVEL3_FLOOR_COLOR, LEVEL3_OBSTACLE_SPRITES
} from "./config/level3Config";

// === ENEMY CONFIG FOR LEVEL 3 ===
const LEVEL3_ENEMIES = [
    {
        x: 1400,
        y: GROUND_Y - 90 + FLOOR_3D_OFFSET,
        w: 100,
        h: 110,
        imgPath: "sprites/enemies/level3/enemy1.png",
        id: "enemy1"
    },
    {
        x: 2200,
        y: GROUND_Y - 90 + FLOOR_3D_OFFSET,
        w: 100,
        h: 110,
        imgPath: "sprites/enemies/level3/enemy2.png",
        id: "enemy2"
    }
];

const PLAYER_WALK_PATHS = [
    "sprites/player/walk/walk1.png",
    "sprites/player/walk/walk2.png",
    "sprites/player/walk/walk3.png",
    "sprites/player/walk/walk4.png",
    "sprites/player/walk/walk5.png",
    "sprites/player/walk/walk6.png",
];
const PLAYER_JUMP_PATHS = [
    "sprites/player/jump/jump1.png",
    "sprites/player/jump/jump2.png",
    "sprites/player/jump/jump3.png",
    "sprites/player/jump/jump4.png",
    "sprites/player/jump/jump5.png",
    "sprites/player/jump/jump6.png",
];
const PLAYER_CROUCH_PATHS = [
    "sprites/player/crouch/crouch1.png",
];
const FIGHT_PATHS = [
    "sprites/fight/fight1.png",
    "sprites/fight/fight2.png",
    "sprites/fight/fight3.png"
];

type PlayerState = "idle" | "walk" | "jump" | "crouch";
interface Player {
    x: number;
    y: number;
    vy: number;
    state: PlayerState;
    facing: "left" | "right";
    frame: number;
    animTimer: number;
    jumpFrame: number;
    jumpAnimTimer: number;
}
interface ObstacleConfig {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
interface Obstacle extends ObstacleConfig {
    img: HTMLImageElement;
    data?: ImageData;
}
interface EnemyConfig {
    x: number;
    y: number;
    w: number;
    h: number;
    imgPath?: string;
    id?: string;
}
interface Enemy extends EnemyConfig {
    img: HTMLImageElement;
}
interface Assets {
    bgObjs: HTMLImageElement[];
    walk: HTMLImageElement[];
    jump: HTMLImageElement[];
    crouch: HTMLImageElement[];
    obstacleSprites: Record<string, HTMLImageElement[]>;
    enemyImgs?: HTMLImageElement[]; // For multi-enemy
    enemy?: HTMLImageElement;
    fight: HTMLImageElement[];
}
interface LevelConfig {
    bgPaths: string[];
    bgPlacements: [number, number, number, number][];
    obstacles: ObstacleConfig[];
    enemies?: EnemyConfig[]; // For level 3+
    enemy?: EnemyConfig | null; // For legacy levels 1,2
    bgColor: string;
    floorColor: string;
    obstacleSprites: Record<string, string[]>;
    transitionVideo?: string;
}

function getLevelConfig(level: number): LevelConfig {
    if (level === 1) {
        return {
            bgPaths: LEVEL1_BG_PATHS,
            bgPlacements: LEVEL1_BG_PLACEMENTS,
            obstacles: LEVEL1_OBSTACLES,
            enemy: { ...LEVEL1_ENEMY, imgPath: "sprites/enemies/level1/enemy1.png" },
            bgColor: "#e8d2b0",
            floorColor: "#643200",
            obstacleSprites: LEVEL1_OBSTACLE_SPRITES,
            transitionVideo: "/level1to2.mp4"
        };
    }
    if (level === 2) {
        return {
            bgPaths: LEVEL2_BG_PATHS,
            bgPlacements: LEVEL2_BG_PLACEMENTS,
            obstacles: LEVEL2_OBSTACLES,
            enemy: LEVEL2_ENEMY, // should have imgPath!
            bgColor: "#eeeeee",
            floorColor: "#333333",
            obstacleSprites: LEVEL2_OBSTACLE_SPRITES,
            transitionVideo: "/level2to3.mp4"
        };
    }
    // Level 3 with multiple enemies
    return {
        bgPaths: LEVEL3_BG_PATHS,
        bgPlacements: LEVEL3_BG_PLACEMENTS,
        obstacles: LEVEL3_OBSTACLES,
        enemies: LEVEL3_ENEMIES,
        bgColor: LEVEL3_BG_COLOR || "#3498db",
        floorColor: LEVEL3_FLOOR_COLOR || "#8b4513",
        obstacleSprites: LEVEL3_OBSTACLE_SPRITES,
        transitionVideo: undefined
    };
}

async function loadImages(paths: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(
        paths.map(
            (path) =>
                new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new window.Image();
                    img.src = process.env.PUBLIC_URL + "/" + path;
                    img.onload = () => resolve(img);
                    img.onerror = (e) => {
                        console.error("Failed to load image: " + img.src, e);
                        reject(e);
                    };
                })
        )
    );
}
async function loadObstacleSprites(
    registry: Record<string, string[]>
): Promise<Record<string, HTMLImageElement[]>> {
    const loaded: Record<string, HTMLImageElement[]> = {};
    for (const typ in registry) {
        loaded[typ] = await loadImages(registry[typ]);
    }
    return loaded;
}
function getImageData(img: HTMLImageElement, w: number, h: number): ImageData {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
}
function pixelCollision(
    spriteA: { img: HTMLImageElement, x: number, y: number, w: number, h: number, data?: ImageData },
    spriteB: { img: HTMLImageElement, x: number, y: number, w: number, h: number, data?: ImageData },
    alphaThreshold = 10
): boolean {
    const xMin = Math.max(spriteA.x, spriteB.x);
    const yMin = Math.max(spriteA.y, spriteB.y);
    const xMax = Math.min(spriteA.x + spriteA.w, spriteB.x + spriteB.w);
    const yMax = Math.min(spriteA.y + spriteA.h, spriteB.y + spriteB.h);
    if (xMin >= xMax || yMin >= yMax) return false;
    if (!spriteA.data) spriteA.data = getImageData(spriteA.img, spriteA.w, spriteA.h);
    if (!spriteB.data) spriteB.data = getImageData(spriteB.img, spriteB.w, spriteB.h);
    for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
            const ax = Math.floor(x - spriteA.x);
            const ay = Math.floor(y - spriteA.y);
            const bx = Math.floor(x - spriteB.x);
            const by = Math.floor(y - spriteB.y);
            const aIdx = (ay * spriteA.w + ax) * 4 + 3;
            const bIdx = (by * spriteB.w + bx) * 4 + 3;
            const aAlpha = spriteA.data.data[aIdx];
            const bAlpha = spriteB.data.data[bIdx];
            if (aAlpha > alphaThreshold && bAlpha > alphaThreshold) {
                return true;
            }
        }
    }
    return false;
}

// ------------------- MAIN COMPONENT -------------------
const MarioGame: React.FC = () => {
    const [showIntro, setShowIntro] = useState(true);
    const [showLevelTransition, setShowLevelTransition] = useState(false);
    const [pendingTransition, setPendingTransition] = useState<string | null>(null);
    const [showLost, setShowLost] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [assets, setAssets] = useState<Assets | null>(null);
    const [loaded, setLoaded] = useState(false);

    const [level, setLevel] = useState<number>(1);
    const [levelComplete, setLevelComplete] = useState<boolean>(false);

    const player = useRef<Player>({
        x: 50,
        y: GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET,
        vy: 0,
        state: "idle",
        facing: "right",
        frame: 0,
        animTimer: 0,
        jumpFrame: 0,
        jumpAnimTimer: 0,
    });
    const keys = useRef<{ [key: string]: boolean }>({});
    const obstacles = useRef<Obstacle[]>([]);
    // Track enemies for level 3
    const [enemyStates, setEnemyStates] = useState<{ [id: string]: "alive" | "defeated" | "escaped" }>({});
    // Track legacy enemy defeated state for level 1/2
    const [legacyEnemyDefeated, setLegacyEnemyDefeated] = useState(false); // <<<

    const [fightState, setFightState] = useState<{
        inBattle: boolean,
        fighting: boolean,
        startTime: number,
        frame: number,
        enemyId?: string,
        enemyIdx?: number
    }>({ inBattle: false, fighting: false, startTime: 0, frame: 0 });

    // --- RESET GAME STATE WHEN SHOWINTRO TURNS FALSE ---
    useEffect(() => {
        if (!showIntro) {
            setLevelComplete(false);
            setShowLost(false);
            setFightState({ inBattle: false, fighting: false, startTime: 0, frame: 0 });
            player.current = {
                x: 50,
                y: GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET,
                vy: 0,
                state: "idle",
                facing: "right",
                frame: 0,
                animTimer: 0,
                jumpFrame: 0,
                jumpAnimTimer: 0,
            };
            keys.current = {};
        }
    }, [showIntro]);

    // --- RESET LEGACY ENEMY ON LEVEL CHANGE/INTRO ---
    useEffect(() => {
        setLegacyEnemyDefeated(false); // <<<
    }, [level, showIntro]);

    // --- LOAD ASSETS ---
    useEffect(() => {
        player.current = {
            x: 50,
            y: GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET,
            vy: 0,
            state: "idle",
            facing: "right",
            frame: 0,
            animTimer: 0,
            jumpFrame: 0,
            jumpAnimTimer: 0,
        };
        keys.current = {};
        (async () => {
            setLoaded(false);
            const levelConfig = getLevelConfig(level);
            const bgObjs = await loadImages(levelConfig.bgPaths);
            const walk = await loadImages(PLAYER_WALK_PATHS);
            const jump = await loadImages(PLAYER_JUMP_PATHS);
            const crouch = await loadImages(PLAYER_CROUCH_PATHS);
            const obstacleSprites = await loadObstacleSprites(levelConfig.obstacleSprites);

            let enemyImgs: HTMLImageElement[] = [];
            if (levelConfig.enemies && levelConfig.enemies.length) {
                enemyImgs = await loadImages(levelConfig.enemies.map(e => e.imgPath!));
            }
            let enemyImg: HTMLImageElement | undefined;
            if (levelConfig.enemy && levelConfig.enemy.imgPath) {
                [enemyImg] = await loadImages([levelConfig.enemy.imgPath]);
            }
            const fight = await loadImages(FIGHT_PATHS);
            setAssets({ bgObjs, walk, jump, crouch, obstacleSprites, enemyImgs, enemy: enemyImg, fight });
            setLoaded(true);
        })();
    }, [level]);

    // --- INIT ENEMY STATES FOR LEVEL 3 ---
    useEffect(() => {
        if (level === 3) {
            setEnemyStates({
                enemy1: "alive",
                enemy2: "alive"
            });
        }
    }, [level]);

    // --- OBSTACLES/ENEMY PLACEMENT ---
    useEffect(() => {
        if (!loaded || !assets) return;
        const { obstacles: obsCfg } = getLevelConfig(level);
        const obs: Obstacle[] = [];
        for (const o of obsCfg) {
            const spriteArr = assets.obstacleSprites[o.type];
            if (spriteArr?.length) {
                obs.push({
                    ...o,
                    img: spriteArr[0],
                });
            }
        }
        obstacles.current = obs;
    }, [loaded, assets, level]);

    // --- KEYBOARD HANDLERS ---
    useEffect(() => {
        if (showIntro || showLevelTransition || showLost) return;
        const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
        const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, [showIntro, showLevelTransition, showLost]);

    // --- FIGHT KEY HANDLER ---
    useEffect(() => {
        if (showIntro || showLevelTransition || showLost) return;
        if (!fightState.inBattle || fightState.fighting) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyR") {
                // For enemy2: escaping is the only way to win
                if (fightState.enemyId === "enemy2") {
                    setEnemyStates(prev => ({ ...prev, enemy2: "escaped" }));
                } else if (fightState.enemyId) {
                    // @ts-ignore
                    setEnemyStates(prev => ({ ...prev, [fightState.enemyId]: "escaped" }));
                }
                setFightState({ inBattle: false, fighting: false, startTime: 0, frame: 0 });
            }
            if (e.code === "KeyF") {
                if (fightState.enemyId === "enemy2") {
                    setShowLost(true);
                } else {
                    setFightState({
                        ...fightState,
                        fighting: true,
                        startTime: performance.now(),
                        frame: 0
                    });
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fightState.inBattle, fightState.fighting, fightState.enemyId, showIntro, showLevelTransition, showLost]);

    // --- GAME LOOP ---
    useEffect(() => {
        if (!loaded || !assets || showIntro || showLevelTransition || showLost) return;
        const { bgObjs, walk, jump, crouch, fight, enemyImgs, enemy } = assets;
        const { bgPlacements, bgColor, floorColor, enemies } = getLevelConfig(level);
        const LEVEL_LENGTH = LEVEL_LENGTHS[level];

        let running = true;
        obstacles.current.forEach(obs => {
            if (!obs.data) {
                obs.data = getImageData(obs.img, obs.w, obs.h);
            }
        });

        function frameLoop(now: number) {
            if (!running || !canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d")!;

            // Background and floor
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = floorColor;
            ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

            const p = player.current;
            let camX = Math.max(0, Math.min(p.x - GAME_WIDTH / 2 + PLAYER_WIDTH / 2, LEVEL_LENGTH - GAME_WIDTH));

            bgObjs.forEach((img, i) => {
                if (i < bgPlacements.length) {
                    const [x, y, w, h] = bgPlacements[i];
                    const objX = x - camX * 0.7;
                    ctx.drawImage(img, objX, y, w, h);
                }
            });

            for (const obs of obstacles.current) {
                ctx.drawImage(obs.img, obs.x - camX, obs.y, obs.w, obs.h);
            }

            // MULTIPLE ENEMIES FOR LEVEL 3
            if (level === 3 && enemies && enemyImgs) {
                enemies.forEach((enemyCfg, idx) => {
                    if (enemyStates[enemyCfg.id!] === "alive") {
                        ctx.drawImage(
                            enemyImgs[idx],
                            enemyCfg.x - camX,
                            enemyCfg.y,
                            enemyCfg.w,
                            enemyCfg.h
                        );
                    }
                });
            }
            // LEGACY SINGLE ENEMY (ONLY DRAW IF NOT DEFEATED) <<<
            else if (level < 3 && enemy && !fightState.fighting && enemy && !legacyEnemyDefeated) {
                const enemyCfg = getLevelConfig(level).enemy;
                if (enemyCfg) {
                    ctx.drawImage(
                        enemy,
                        enemyCfg.x - camX,
                        enemyCfg.y,
                        enemyCfg.w,
                        enemyCfg.h
                    );
                }
            }

            // --- Fight Animation: Centered above player ---
            if (fightState.fighting) {
                const FIGHT_DURATION = 2000;
                const elapsed = now - fightState.startTime;
                const framesCount = fight.length;
                const frame = Math.floor((elapsed / FIGHT_DURATION) * (framesCount * 4)) % framesCount;
                ctx.drawImage(
                    fight[frame],
                    (p.x - camX) - 40,
                    p.y - 80,
                    180,
                    140
                );
                if (elapsed > FIGHT_DURATION) {
                    setFightState({
                        inBattle: false,
                        fighting: false,
                        startTime: 0,
                        frame: 0
                    });
                    if (fightState.enemyId) {
                        // If legacy, set as defeated
                        if (fightState.enemyId === "legacy") {
                            setLegacyEnemyDefeated(true);
                        } else {
                            setEnemyStates(prev => ({
                                ...prev,
                                [fightState.enemyId!]: "defeated"
                            }));
                        }
                    }
                }
                requestAnimationFrame(frameLoop);
                return;
            }

            let effectiveSpeed = PLAYER_SPEED;
            let onWater = false;

            if (!fightState.inBattle && !fightState.fighting) {
                let playerImg: HTMLImageElement;
                if (p.state === "walk") playerImg = walk[p.frame];
                else if (p.state === "jump") playerImg = jump[p.jumpFrame];
                else if (p.state === "crouch") playerImg = crouch[0];
                else playerImg = walk[0];
                const playerSprite = {
                    img: playerImg,
                    x: p.x,
                    y: p.y,
                    w: PLAYER_WIDTH,
                    h: (p.state === "crouch") ? PLAYER_HEIGHT * 0.5 : PLAYER_HEIGHT,
                    data: undefined as ImageData | undefined
                };
                if (p.state === "crouch") {
                    playerSprite.y = p.y + PLAYER_HEIGHT * 0.5;
                }

                for (const obs of obstacles.current) {
                    if (
                        playerSprite.x + playerSprite.w > obs.x &&
                        playerSprite.x < obs.x + obs.w &&
                        playerSprite.y + playerSprite.h > obs.y &&
                        playerSprite.y < obs.y + obs.h
                    ) {
                        if (obs.type === "spring") {
                            const playerFeetY = p.y + PLAYER_HEIGHT;
                            const prevPlayerFeetY = p.y + PLAYER_HEIGHT - p.vy;
                            if (p.vy >= 0 && prevPlayerFeetY <= obs.y && playerFeetY >= obs.y) {
                                p.y = obs.y - PLAYER_HEIGHT;
                                p.vy = SPRING_JUMP_SPEED;
                                p.state = "jump";
                                break;
                            }
                        }
                        if (pixelCollision(playerSprite, obs, 10)) {
                            if (obs.type === "spike" || obs.type === "rotating") {
                                p.x = 50;
                                p.y = GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET;
                                p.vy = 0;
                                break;
                            }
                            if (obs.type === "water") {
                                onWater = true;
                            }
                        }
                    }
                }
            }

            if (onWater) effectiveSpeed = Math.max(1, PLAYER_SPEED / WATER_SLOWDOWN);

            if (!fightState.inBattle && !fightState.fighting) {
                if (keys.current["ArrowLeft"]) {
                    p.x = Math.max(0, p.x - effectiveSpeed);
                    p.facing = "left";
                    if (p.state !== "jump") p.state = "walk";
                } else if (keys.current["ArrowRight"]) {
                    p.x = Math.min(LEVEL_LENGTH - PLAYER_WIDTH, p.x + effectiveSpeed);
                    p.facing = "right";
                    if (p.state !== "jump") p.state = "walk";
                } else if (p.state !== "jump") {
                    p.state = "idle";
                }
                if (keys.current["ArrowDown"] && p.state !== "jump") {
                    p.state = "crouch";
                }
                if (keys.current["Space"] && p.state !== "jump" && p.y >= GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET) {
                    p.vy = JUMP_SPEED;
                    p.state = "jump";
                }
            }

            if (!fightState.inBattle && !fightState.fighting) {
                p.y += p.vy;
                p.vy += GRAVITY;
            }

            if (p.y >= GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET) {
                p.y = GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET;
                p.vy = 0;
                if (p.state === "jump") {
                    p.state = keys.current["ArrowLeft"] || keys.current["ArrowRight"] ? "walk" : "idle";
                }
            }

            // MULTI-ENEMY COLLISION FOR LEVEL 3
            if (level === 3 && enemies && enemyImgs) {
                for (let i = 0; i < enemies.length; ++i) {
                    const enemyCfg = enemies[i];
                    if (enemyStates[enemyCfg.id!] === "alive" &&
                        p.x + PLAYER_WIDTH > enemyCfg.x &&
                        p.x < enemyCfg.x + enemyCfg.w &&
                        p.y + PLAYER_HEIGHT > enemyCfg.y &&
                        p.y < enemyCfg.y + enemyCfg.h
                    ) {
                        setFightState((s) => ({
                            ...s,
                            inBattle: true,
                            enemyId: enemyCfg.id,
                            enemyIdx: i
                        }));
                    }
                }
            }
            // LEGACY ENEMY COLLISION (ONLY IF NOT DEFEATED) <<<
            else if (level < 3 && !legacyEnemyDefeated) {
                const enemyCfg = getLevelConfig(level).enemy;
                if (enemyCfg && enemy) {
                    if (
                        p.x + PLAYER_WIDTH > enemyCfg.x &&
                        p.x < enemyCfg.x + enemyCfg.w &&
                        p.y + PLAYER_HEIGHT > enemyCfg.y &&
                        p.y < enemyCfg.y + enemyCfg.h
                    ) {
                        setFightState((s) => ({
                            ...s,
                            inBattle: true,
                            enemyId: "legacy",
                            enemyIdx: 0
                        }));
                    }
                }
            }

            // --- LEVEL COMPLETE ---
            let level3Done = level !== 3 || (enemyStates["enemy1"] !== "alive" && enemyStates["enemy2"] !== "alive");
            if (!levelComplete && p.x + PLAYER_WIDTH >= LEVEL_LENGTH - 10 && level3Done) {
                setLevelComplete(true);
                const transition = getLevelConfig(level).transitionVideo;
                if (transition) setPendingTransition(transition);
                setTimeout(() => setShowLevelTransition(true), 500);
                return;
            }

            // --- Animation
            let img: HTMLImageElement = walk[0];
            if (p.state === "walk") {
                if (now - p.animTimer > 120) {
                    p.frame = (p.frame + 1) % walk.length;
                    p.animTimer = now;
                }
                img = walk[p.frame];
            } else if (p.state === "jump") {
                if (now - p.jumpAnimTimer > 80) {
                    p.jumpFrame = (p.jumpFrame + 1) % jump.length;
                    p.jumpAnimTimer = now;
                }
                img = jump[p.jumpFrame];
            } else if (p.state === "crouch") {
                img = crouch[0];
            } else {
                img = walk[0];
            }

            const drawX = p.x - camX;
            if (p.state === "crouch") {
                ctx.save();
                ctx.scale(p.facing === "left" ? -1 : 1, 1);
                ctx.drawImage(
                    img,
                    (p.facing === "left" ? -drawX - PLAYER_WIDTH : drawX),
                    p.y + PLAYER_HEIGHT * 0.5,
                    PLAYER_WIDTH,
                    PLAYER_HEIGHT * 0.5
                );
                ctx.restore();
            } else if (p.facing === "left") {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(
                    img,
                    -drawX - PLAYER_WIDTH,
                    p.y,
                    PLAYER_WIDTH,
                    PLAYER_HEIGHT
                );
                ctx.restore();
            } else {
                ctx.drawImage(img, drawX, p.y, PLAYER_WIDTH, PLAYER_HEIGHT);
            }

            // Debug/instructions & Level complete
            ctx.fillStyle = "#fff";
            ctx.font = "20px Arial";
            if (levelComplete) {
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                ctx.fillStyle = "#222";
                ctx.font = "48px Arial";
                ctx.fillText("LEVEL COMPLETE!", GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2);
            } else if (fightState.inBattle && !fightState.fighting) {
                ctx.fillText(
                    "Gegner blockiert! [F] Kämpfen  [R] Fliehen",
                    GAME_WIDTH / 2 - 140,
                    GAME_HEIGHT / 2 - 10
                );
            } else {
                ctx.fillText(
                    `State: ${p.state}  |  X: ${Math.round(p.x)}  Y: ${Math.round(p.y)}`,
                    20,
                    40
                );
            }

            requestAnimationFrame(frameLoop);
        }

        requestAnimationFrame(frameLoop);
        return () => { running = false; };
    }, [loaded, assets, fightState, enemyStates, legacyEnemyDefeated, level, levelComplete, showIntro, showLevelTransition, showLost]);

    // --- TRANSITION VIDEO ---
    if (showLevelTransition && pendingTransition) {
        return (
            <div style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 2000
            }}>
                <video
                    src={process.env.PUBLIC_URL + pendingTransition}
                    width="100%"
                    height="100%"
                    autoPlay
                    onEnded={() => {
                        setShowLevelTransition(false);
                        setLevel(level + 1);
                        setLevelComplete(false);
                        setEnemyStates({});
                        setLegacyEnemyDefeated(false);
                        setPendingTransition(null);
                    }}
                    style={{
                        borderRadius: 12,
                        background: "#000",
                        maxWidth: 900,
                        maxHeight: 540,
                    }}
                />
                <button
                    style={{
                        position: "absolute",
                        bottom: "50px",
                        padding: "8px 32px",
                        fontSize: 22,
                        borderRadius: 12,
                        marginTop: 12,
                        background: "#e8d2b0",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={() => {
                        setShowLevelTransition(false);
                        setLevel(level + 1);
                        setLevelComplete(false);
                        setEnemyStates({});
                        setLegacyEnemyDefeated(false);
                        setPendingTransition(null);
                    }}
                >
                    Skip
                </button>
            </div>
        );
    }

    // --- LOST SCREEN ---
    if (showLost) {
        return (
            <div style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#222"
            }}>
                <div style={{ color: "red", fontSize: 48, marginBottom: 24 }}>YOU LOST!</div>
                <button
                    style={{
                        padding: "12px 36px",
                        fontSize: 32,
                        borderRadius: 16,
                        background: "#e8d2b0",
                        fontWeight: "bold",
                        border: "none"
                    }}
                    onClick={() => {
                        setShowLost(false);
                        setLevel(1);
                        setLevelComplete(false);
                        setEnemyStates({});
                        setLegacyEnemyDefeated(false);
                        setFightState({ inBattle: false, fighting: false, startTime: 0, frame: 0 });
                    }}
                >Restart at Level 1</button>
            </div>
        );
    }

    // --- INTRO VIDEO ---
    if (showIntro) {
        return (
            <div style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#111"
            }}>
                <video
                    src={process.env.PUBLIC_URL + "/intro.mp4"}
                    width={"100%"}
                    height={"100%"}
                    autoPlay
                    loop={true}
                    style={{ borderRadius: 12, marginBottom: 16, background: "#000" }}
                />
                <button
                    style={{
                        position: "absolute",
                        bottom: "50px",
                        padding: "8px 32px",
                        fontSize: 22,
                        borderRadius: 12,
                        marginTop: 12,
                        background: "#e8d2b0",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={() => setShowIntro(false)}
                >
                    Play
                </button>
            </div>
        );
    }

    // --- GAME UI ---
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgb(0,0,0)"
        }}>
            <div>
                <h2 style={{ color: "white" }}>Mario Level {level} – Configurable!</h2>
                <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    style={{ border: "3px solid #222", background: "#e8d2b0" }}
                    tabIndex={0}
                />
                <p style={{ color: "white" }}>
                    ← → to move, ↓ to crouch, Space to jump.<br />
                    Touch spring to jump high, touch water to slow, spikes/rotating = restart.<br />
                    Gegner: [F] to fight, [R] to run.
                </p>
                {!loaded && <div>Loading sprites...</div>}
            </div>
        </div>
    );
};

export default MarioGame;
