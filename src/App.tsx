import React, { useEffect, useRef, useState } from "react";

// --- constants and utils (unchanged) ---
const WIDTH = 800;
const HEIGHT = 480;
const GROUND_Y = HEIGHT - 60;
const PLAYER_WIDTH = Math.floor(40 * 1.3);
const PLAYER_HEIGHT = Math.floor(60 * 1.4);
const PLAYER_Y_OFFSET = 20;
const PLAYER_SPEED = 5;
const GRAVITY = 0.5;
const JUMP_SPEED = -11;
const SPRING_JUMP_SPEED = -18;
const WATER_SLOWDOWN = 2;
const FLOOR_3D_OFFSET = 25;
const LEVEL_LENGTH = WIDTH * 2;

const LEVEL1_BG_PATHS = [
    "sprites/background/level1/1plant.png",
    "sprites/background/level1/2schrankgroß.png",
    "sprites/background/level1/3guitar.png",
    "sprites/background/level1/4drawing.png",
    "sprites/background/level1/5lamp.png",
    "sprites/background/level1/6window.png",
    "sprites/background/level1/7schrank.png",
    "sprites/background/level1/8vinyl.png"
];
const LEVEL1_BG_PLACEMENTS: [number, number, number, number][] = [
    [80, 340, 80, 80],
    [190, 300, 120, 120],
    [350, 350, 40, 70],
    [420, 280, 70, 70],
    [550, 360, 60, 60],
    [650, 260, 130, 130],
    [750, 350, 50, 70],
    [840, 360, 60, 60],
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
const ENEMY_PATH = "sprites/enemies/level1/enemy1.png";
const FIGHT_PATHS = [
    "sprites/fight/fight1.png",
    "sprites/fight/fight2.png",
    "sprites/fight/fight3.png"
];
const LEVEL1_OBSTACLE_SPRITES: Record<string, string[]> = {
    spikes: [
        "sprites/obstacles/level1/spikes/spike1.png",
    ],
    springs: [
        "sprites/obstacles/level1/spring/spring1.png",
    ],
    rotating: [
        "sprites/obstacles/level1/rotating/rotating1.png"
    ],
    water: [
        "sprites/obstacles/level1/water/water1.png"
    ]
};

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
interface Obstacle {
    x: number;
    y: number;
    w: number;
    h: number;
    type: string;
    img: HTMLImageElement;
    data?: ImageData;
}
interface Enemy {
    x: number;
    y: number;
    w: number;
    h: number;
    img: HTMLImageElement;
}
interface Assets {
    bgObjs: HTMLImageElement[];
    walk: HTMLImageElement[];
    jump: HTMLImageElement[];
    crouch: HTMLImageElement[];
    obstacleSprites: Record<string, HTMLImageElement[]>;
    enemy: HTMLImageElement;
    fight: HTMLImageElement[];
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
const MarioLevel1: React.FC = () => {
    const [showIntro, setShowIntro] = useState(true);
    const [showLevelTransition, setShowLevelTransition] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [assets, setAssets] = useState<Assets | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Level control
    const [level, setLevel] = useState<number>(1);
    const [levelComplete, setLevelComplete] = useState<boolean>(false);

    // Game state refs
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
    const enemy = useRef<Enemy | null>(null);

    const [enemyDefeated, setEnemyDefeated] = useState<boolean>(false);
    const [fightState, setFightState] = useState<{
        inBattle: boolean,
        fighting: boolean,
        startTime: number,
        frame: number
    }>({ inBattle: false, fighting: false, startTime: 0, frame: 0 });

    // --- RESET GAME STATE WHEN SHOWINTRO TURNS FALSE ---
    useEffect(() => {
        if (!showIntro) {
            setLevel(1);
            setLevelComplete(false);
            setEnemyDefeated(false);
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

    // --- LOAD ASSETS ---
    useEffect(() => {
        (async () => {
            const bgObjs = await loadImages(LEVEL1_BG_PATHS);
            const walk = await loadImages(PLAYER_WALK_PATHS);
            const jump = await loadImages(PLAYER_JUMP_PATHS);
            const crouch = await loadImages(PLAYER_CROUCH_PATHS);
            const obstacleSprites = await loadObstacleSprites(LEVEL1_OBSTACLE_SPRITES);
            const [enemyImg] = await loadImages([ENEMY_PATH]);
            const fight = await loadImages(FIGHT_PATHS);
            setAssets({ bgObjs, walk, jump, crouch, obstacleSprites, enemy: enemyImg, fight });
            setLoaded(true);
        })();
    }, []);

    // --- OBSTACLES/ENEMY PLACEMENT ---
    useEffect(() => {
        if (!loaded || !assets || level !== 1) return;
        const obs: Obstacle[] = [];
        if (assets.obstacleSprites.spikes?.length) {
            obs.push({
                x: 340,
                y: GROUND_Y - 50 + FLOOR_3D_OFFSET,
                w: 100,
                h: 80,
                type: "spike",
                img: assets.obstacleSprites.spikes[0],
            });
        }
        if (assets.obstacleSprites.springs?.length) {
            obs.push({
                x: 720,
                y: GROUND_Y - 22 + FLOOR_3D_OFFSET,
                w: 40,
                h: 28,
                type: "spring",
                img: assets.obstacleSprites.springs[0],
            });
        }
        if (assets.obstacleSprites.rotating?.length) {
            obs.push({
                x: 1000,
                y: GROUND_Y - 70 + FLOOR_3D_OFFSET,
                w: 100,
                h: 100,
                type: "rotating",
                img: assets.obstacleSprites.rotating[0],
            });
        }
        if (assets.obstacleSprites.water?.length) {
            obs.push({
                x: 770,
                y: GROUND_Y - 80 + FLOOR_3D_OFFSET,
                w: 120,
                h: 120,
                type: "water",
                img: assets.obstacleSprites.water[0],
            });
        }
        obstacles.current = obs;
        if (!enemyDefeated) {
            enemy.current = {
                x: LEVEL_LENGTH - 120,
                y: GROUND_Y - 90 + FLOOR_3D_OFFSET,
                w: 90,
                h: 115,
                img: assets.enemy
            };
        } else {
            enemy.current = null;
        }
    }, [loaded, assets, enemyDefeated, level]);

    // --- KEYBOARD HANDLERS ---
    useEffect(() => {
        if (showIntro || showLevelTransition) return;
        const down = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
        };
        const up = (e: KeyboardEvent) => {
            keys.current[e.code] = false;
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, [showIntro, showLevelTransition]);

    // --- FIGHT KEY HANDLER ---
    useEffect(() => {
        if (showIntro || showLevelTransition) return;
        if (!fightState.inBattle || fightState.fighting) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyF") {
                setFightState({
                    inBattle: true,
                    fighting: true,
                    startTime: performance.now(),
                    frame: 0
                });
            }
            if (e.code === "KeyR") {
                player.current.x = 50;
                player.current.y = GROUND_Y - PLAYER_HEIGHT + FLOOR_3D_OFFSET + PLAYER_Y_OFFSET;
                player.current.vy = 0;
                setFightState({ inBattle: false, fighting: false, startTime: 0, frame: 0 });
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fightState.inBattle, fightState.fighting, showIntro, showLevelTransition]);

    // --- GAME LOOP ---
    useEffect(() => {
        if (!loaded || !assets || showIntro || showLevelTransition) return;
        const { bgObjs, walk, jump, crouch, fight } = assets;
        let running = true;
        obstacles.current.forEach(obs => {
            if (!obs.data) {
                obs.data = getImageData(obs.img, obs.w, obs.h);
            }
        });

        function frameLoop(now: number) {
            if (!running || !canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d")!;

            // --- LEVEL 2 ---
            if (level === 2) {
                ctx.fillStyle = "#b8eaff";
                ctx.fillRect(0, 0, WIDTH, HEIGHT);
                ctx.fillStyle = "#3e6939";
                ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
                ctx.fillStyle = "#222";
                ctx.font = "48px Arial";
                ctx.fillText("Level 2!", WIDTH / 2 - 110, 130);
                requestAnimationFrame(frameLoop);
                return;
            }

            // --- LEVEL 1 ---
            ctx.fillStyle = "#e8d2b0";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            const p = player.current;
            let camX = Math.max(0, Math.min(p.x - WIDTH / 2 + PLAYER_WIDTH / 2, LEVEL_LENGTH - WIDTH));

            bgObjs.forEach((img, i) => {
                if (i < LEVEL1_BG_PLACEMENTS.length) {
                    const [x, y, w, h] = LEVEL1_BG_PLACEMENTS[i];
                    const objX = x - camX * 0.7;
                    ctx.drawImage(img, objX, y, w, h);
                }
            });

            ctx.fillStyle = "#643200";
            ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

            for (const obs of obstacles.current) {
                ctx.drawImage(obs.img, obs.x - camX, obs.y, obs.w, obs.h);
            }

            if (enemy.current && !fightState.fighting) {
                ctx.drawImage(
                    enemy.current.img,
                    enemy.current.x - camX,
                    enemy.current.y,
                    enemy.current.w,
                    enemy.current.h
                );
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
                    setEnemyDefeated(true);
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
                        // SPRING COLLISION
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

            // ENEMY COLLISION (start fight) -- only if not defeated
            if (
                enemy.current && !enemyDefeated && !fightState.inBattle && !fightState.fighting &&
                p.x + PLAYER_WIDTH > enemy.current.x &&
                p.x < enemy.current.x + enemy.current.w &&
                p.y + PLAYER_HEIGHT > enemy.current.y &&
                p.y < enemy.current.y + enemy.current.h
            ) {
                setFightState((s) => ({ ...s, inBattle: true }));
            }

            // --- LEVEL COMPLETE & TRANSITION VIDEO ---
            if (!levelComplete && p.x + PLAYER_WIDTH >= LEVEL_LENGTH - 10) {
                setLevelComplete(true);
                setTimeout(() => {
                    setShowLevelTransition(true);
                }, 1000); // short pause before transition video
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
                ctx.fillRect(0, 0, WIDTH, HEIGHT);
                ctx.fillStyle = "#222";
                ctx.font = "48px Arial";
                ctx.fillText("LEVEL COMPLETE!", WIDTH / 2 - 200, HEIGHT / 2);
            } else if (fightState.inBattle && !fightState.fighting) {
                ctx.fillText(
                    "Elmar blockiert! [F] Kämpfen  [R] Fliehen",
                    WIDTH / 2 - 140,
                    HEIGHT / 2 - 10
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
    }, [loaded, assets, fightState, enemyDefeated, level, levelComplete, showIntro, showLevelTransition]);

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

    // --- LEVEL TRANSITION VIDEO (after Level 1, before Level 2) ---
    if (showLevelTransition) {
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
                    src={process.env.PUBLIC_URL + "/level1to2.mp4"}
                    width={"100%"}
                    height={"100%"}
                    autoPlay
                    onEnded={() => {
                        setShowLevelTransition(false);
                        setLevel(2);
                        setLevelComplete(false);
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
                        setLevel(2);
                        setLevelComplete(false);
                    }}
                >
                    Skip
                </button>
            </div>
        );
    }

    // --- GAME ---
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
                <h2 style={{ color: "white" }}>Mario Level 1 – Apartment Obstacles, 3D, Enemy & Fight!</h2>
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    style={{ border: "3px solid #222", background: "#e8d2b0" }}
                    tabIndex={0}
                />
                <p style={{ color: "white" }}>
                    ← → to move, ↓ to crouch, Space to jump.<br />
                    Touch spring to jump high, touch water to slow, spikes/rotating = restart.<br />
                    Elmar: [F] to fight, [R] to run.
                </p>
                {!loaded && <div>Loading sprites...</div>}
            </div>
        </div>
    );
};

export default MarioLevel1;
