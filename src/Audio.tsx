import {useEffect, useRef, useState} from "react";

export const AudioPlayer = () => {
    const [musicVolume, setMusicVolume] = useState(0.5);
    const [musicMuted, setMusicMuted] = useState(false);
    const [started, setStarted] = useState(false); // <-- Track if user has started music
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicMuted ? 0 : musicVolume;
        }
    }, [musicVolume, musicMuted]);

    // Play music after user interaction
    const startMusic = () => {
        if (audioRef.current) {
            audioRef.current.volume = musicMuted ? 0 : musicVolume;
            audioRef.current.play().catch(() => {});
            setStarted(true);
        }
    };

    return (
        <div style={{position: "absolute"}}>
            <audio
                ref={audioRef}
                src={process.env.PUBLIC_URL + "/music.mp3"}
                loop
                preload="auto"

            />
            {!started ? (
                <button
                    onClick={startMusic}
                    style={{
                        fontWeight: "bold",
                        borderRadius: 8,
                        padding: "6px 24px",
                        marginBottom: 10,
                        fontSize: 18
                    }}
                >Start Music</button>
            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <button
                        onClick={() => setMusicMuted(m => !m)}
                        style={{ fontWeight: "bold", borderRadius: 8, padding: "2px 10px" }}
                    >
                        {musicMuted ? "Unmute" : "Mute"}
                    </button>
                    <button
                        onClick={() => setMusicVolume(v => Math.max(0, Math.round((v - 0.1) * 10) / 10))}
                        disabled={musicMuted}
                        style={{ borderRadius: 8, padding: "2px 10px" }}
                    >-</button>
                    <span style={{ color: "#fff" }}>🔉 {Math.round(musicVolume * 100)}%</span>
                    <button
                        onClick={() => setMusicVolume(v => Math.min(1, Math.round((v + 0.1) * 10) / 10))}
                        disabled={musicMuted}
                        style={{ borderRadius: 8, padding: "2px 10px" }}
                    >+</button>
                </div>
            )}
        </div>
    )
}