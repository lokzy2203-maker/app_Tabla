"use client";

import { useEffect, useRef, useState } from "react";
import { TAAL_PRESETS, parseNotation, type NotationToken } from "@/lib/taal-presets";
import { getBolProfile, playBolSound } from "@/lib/tabla-sounds";

const PALETTE = [
  "Dha", "Dhin", "Ge", "Na", "Tin", "Ta", "Ka", "Ki", "Ti", "Ra",
  "Tu", "Dhage", "Tirakita", "Kat", "-", "|",
];

const SCHEDULE_AHEAD_SEC = 0.12;
const LOOKAHEAD_MS = 25;

type ScheduledNote = { time: number; index: number };

export function TablaPlayer() {
  const [notation, setNotation] = useState(TAAL_PRESETS[0].notation);
  const [bpm, setBpm] = useState(80);
  const [loop, setLoop] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const tokensRef = useRef<NotationToken[]>([]);
  const nextNoteTimeRef = useRef(0);
  const noteIndexRef = useRef(0);
  const schedulerHandleRef = useRef<number | null>(null);
  const rafHandleRef = useRef<number | null>(null);
  const notesInQueueRef = useRef<ScheduledNote[]>([]);

  useEffect(() => {
    tokensRef.current = parseNotation(notation);
  }, [notation]);

  useEffect(() => {
    return () => {
      if (schedulerHandleRef.current) clearInterval(schedulerHandleRef.current);
      if (rafHandleRef.current) cancelAnimationFrame(rafHandleRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.9;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = gain;
    }
    return audioCtxRef.current;
  };

  const secondsPerBeat = () => 60 / bpm;

  const scheduler = () => {
    const ctx = audioCtxRef.current;
    const gain = masterGainRef.current;
    const tokens = tokensRef.current;
    if (!ctx || !gain || tokens.length === 0) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      const idx = noteIndexRef.current;
      const token = tokens[idx];

      if (!token.isRest) {
        const profile = getBolProfile(token.raw);
        if (profile) playBolSound(ctx, nextNoteTimeRef.current, profile, gain);
      }

      notesInQueueRef.current.push({ time: nextNoteTimeRef.current, index: idx });

      nextNoteTimeRef.current += secondsPerBeat();
      noteIndexRef.current += 1;

      if (noteIndexRef.current >= tokens.length) {
        if (loop) {
          noteIndexRef.current = 0;
        } else {
          stop();
          return;
        }
      }
    }
  };

  const drawLoop = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    let current: number | null = null;
    while (
      notesInQueueRef.current.length > 0 &&
      notesInQueueRef.current[0].time <= now
    ) {
      current = notesInQueueRef.current.shift()!.index;
    }
    if (current !== null) setActiveIndex(current);

    rafHandleRef.current = requestAnimationFrame(drawLoop);
  };

  const play = () => {
    const ctx = ensureAudio();
    if (ctx.state === "suspended") ctx.resume();

    tokensRef.current = parseNotation(notation);
    if (tokensRef.current.length === 0) return;

    noteIndexRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.1;
    notesInQueueRef.current = [];

    schedulerHandleRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
    rafHandleRef.current = requestAnimationFrame(drawLoop);
    setIsPlaying(true);
  };

  const stop = () => {
    if (schedulerHandleRef.current) {
      clearInterval(schedulerHandleRef.current);
      schedulerHandleRef.current = null;
    }
    if (rafHandleRef.current) {
      cancelAnimationFrame(rafHandleRef.current);
      rafHandleRef.current = null;
    }
    notesInQueueRef.current = [];
    setIsPlaying(false);
    setActiveIndex(null);
  };

  const handlePlayStop = () => {
    if (isPlaying) stop();
    else play();
  };

  const insertToken = (token: string) => {
    setNotation((prev) => (prev.trim().length === 0 ? token : `${prev.trim()} ${token}`));
  };

  const tokens = parseNotation(notation);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Taal preset</label>
        <select
          onChange={(e) => {
            const preset = TAAL_PRESETS.find((p) => p.name === e.target.value);
            if (preset) {
              stop();
              setNotation(preset.notation);
            }
          }}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          defaultValue={TAAL_PRESETS[0].name}
        >
          {TAAL_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Bol notation{" "}
          <span className="text-neutral-400 font-normal">
            (space-separated bols, &quot;|&quot; for vibhag, &quot;-&quot; for rest)
          </span>
        </label>
        <textarea
          rows={3}
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PALETTE.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => insertToken(b)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tempo: {bpm} BPM</label>
          <input
            type="range"
            min={30}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-48"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Loop
        </label>

        <button
          onClick={handlePlayStop}
          className={`rounded-md px-5 py-2.5 text-sm font-medium text-white ${
            isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Beat visualizer</p>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center min-w-[3.2rem] h-12 rounded-md border text-xs font-medium px-1 ${
                t.isBarStart ? "border-l-2 border-l-orange-500" : ""
              } ${
                activeIndex === i
                  ? "bg-orange-600 text-white border-orange-600"
                  : t.isRest
                  ? "bg-neutral-50 text-neutral-400 border-neutral-200"
                  : "bg-white text-neutral-700 border-neutral-300"
              }`}
            >
              {t.isRest ? "–" : t.raw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
