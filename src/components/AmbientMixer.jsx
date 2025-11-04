import React, { useEffect, useRef, useState } from 'react';
import { Music } from 'lucide-react';

const TRACKS = [
  {
    id: 'rain',
    name: 'Rain',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_19a2a97156.mp3',
  },
  {
    id: 'cafe',
    name: 'Café',
    url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_0f2a62eb82.mp3',
  },
  {
    id: 'fire',
    name: 'Fire',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/16/audio_f2f7b0c9f6.mp3?filename=fireplace-ambient-110241.mp3',
  },
  {
    id: 'forest',
    name: 'Forest',
    url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_10aee66bd0.mp3',
  },
  {
    id: 'keys',
    name: 'ASMR Keys',
    url: 'https://cdn.pixabay.com/audio/2022/10/12/audio_1c29a987a1.mp3',
  },
];

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

export default function AmbientMixer() {
  const [volumes, setVolumes] = useLocalStorage(
    'ambient_volumes',
    Object.fromEntries(TRACKS.map((t) => [t.id, 0]))
  );

  const audioRefs = useRef({});

  useEffect(() => {
    // Auto-play any track with volume > 0
    TRACKS.forEach((t) => {
      const el = audioRefs.current[t.id];
      if (!el) return;
      el.loop = true;
      el.volume = Math.min(1, Math.max(0, volumes[t.id] / 100));
      if (volumes[t.id] > 0) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [volumes]);

  return (
    <div className="rounded-2xl p-5 border bg-white/70 dark:bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-2"><Music size={18}/> Ambient Mixer</div>
        <button
          className="text-sm text-slate-500 hover:underline"
          onClick={() => setVolumes(Object.fromEntries(TRACKS.map((t) => [t.id, 0])))}
        >
          Mute All
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {TRACKS.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <audio ref={(el) => (audioRefs.current[t.id] = el)} src={t.url} preload="auto" />
            <div className="w-24 shrink-0 text-sm text-slate-600 dark:text-slate-300">{t.name}</div>
            <input
              type="range"
              min={0}
              max={100}
              value={volumes[t.id]}
              onChange={(e) => setVolumes({ ...volumes, [t.id]: Number(e.target.value) })}
              className="w-full"
            />
            <div className="w-12 text-right text-sm text-slate-500">{volumes[t.id]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
