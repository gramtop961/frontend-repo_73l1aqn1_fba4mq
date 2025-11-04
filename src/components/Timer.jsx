import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const defaultSettings = {
  focus: 25,
  short: 5,
  long: 15,
  sound: 'chime',
};

const sounds = {
  chime: 'https://cdn.pixabay.com/audio/2022/03/15/audio_3fd7ef2f3d.mp3',
  bell: 'https://cdn.pixabay.com/audio/2021/09/07/audio_3f8470ca42.mp3',
  soft: 'https://cdn.pixabay.com/audio/2022/10/30/audio_31a86c46c5.mp3',
};

export default function Timer({ onComplete, focusMode, accent = 'indigo-500' }) {
  const [settings, setSettings] = useLocalStorage('pomodoro_settings', defaultSettings);
  const [mode, setMode] = useLocalStorage('pomodoro_mode', 'focus'); // focus | short | long
  const [secondsLeft, setSecondsLeft] = useState(settings[mode] * 60);
  const [running, setRunning] = useState(false);
  const [warming, setWarming] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(settings[mode] * 60);
  }, [mode, settings]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          playSound();
          onComplete && onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  const startWithWarmup = () => {
    if (running || warming) return;
    setWarming(true);
    setTimeout(() => {
      setWarming(false);
      setRunning(true);
    }, 5000);
  };

  const reset = () => {
    setRunning(false);
    setWarming(false);
    setSecondsLeft(settings[mode] * 60);
  };

  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const percent = useMemo(() => {
    const total = settings[mode] * 60;
    return 100 - Math.round((secondsLeft / total) * 100);
  }, [secondsLeft, settings, mode]);

  return (
    <div className="rounded-2xl p-6 border bg-white/70 dark:bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full border bg-white/60 dark:bg-white/10 backdrop-blur px-2 py-1">
          {['focus', 'short', 'long'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setRunning(false);
                setWarming(false);
              }}
              className={`px-3 py-1 rounded-full text-sm transition ${
                mode === m
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              {m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        <Settings settings={settings} setSettings={setSettings} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/40 dark:to-slate-800/20 border overflow-hidden">
            {/* Progress ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-[75%] md:w-[60%]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="fill-none stroke-slate-200/50" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`fill-none stroke-slate-900 dark:stroke-white`}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * percent) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>

            {/* Timer */}
            <div className="relative text-center">
              <div className="text-5xl md:text-7xl font-semibold tracking-tight">
                {minutes}:{seconds}
              </div>
              <div className="mt-2 text-slate-500 dark:text-slate-300 text-sm">
                {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={running ? () => setRunning(false) : startWithWarmup}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white hover:opacity-90`}
                >
                  {running ? <Pause size={18} /> : <Play size={18} />} {running ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border hover:bg-white/70 dark:hover:bg-white/10"
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </div>

            {/* Breathing warm-up overlay */}
            <AnimatePresence>
              {warming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <BreathOverlay />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border dark:from-emerald-900/20 dark:to-slate-900/20">
            <div className="font-medium">Tip</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Use Focus Mode from the header to hide side tools.</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border dark:from-indigo-900/20 dark:to-slate-900/20">
            <div className="font-medium">Breathing</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">A 5s inhale/exhale warm-up plays before each session.</div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={sounds[settings.sound]} preload="auto" />
    </div>
  );
}

function BreathOverlay() {
  const [count, setCount] = useState(5);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center text-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-40 h-40 rounded-full bg-white/10 border border-white/30 mx-auto"
      />
      <div className="mt-4 text-xl">Breathe… {count}s</div>
      <div className="text-sm text-white/80">Inhale and exhale slowly</div>
    </div>
  );
}

function Settings({ settings, setSettings }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="hidden md:flex items-center gap-2">
        <span className="text-slate-500">Focus</span>
        <input
          type="number"
          min={1}
          value={settings.focus}
          onChange={(e) => setSettings({ ...settings, focus: Number(e.target.value) })}
          className="w-16 px-2 py-1 rounded-md border bg-white/60 dark:bg-white/10"
        />
        <span className="text-slate-500">Short</span>
        <input
          type="number"
          min={1}
          value={settings.short}
          onChange={(e) => setSettings({ ...settings, short: Number(e.target.value) })}
          className="w-16 px-2 py-1 rounded-md border bg-white/60 dark:bg-white/10"
        />
        <span className="text-slate-500">Long</span>
        <input
          type="number"
          min={1}
          value={settings.long}
          onChange={(e) => setSettings({ ...settings, long: Number(e.target.value) })}
          className="w-16 px-2 py-1 rounded-md border bg-white/60 dark:bg-white/10"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Sound</span>
        <select
          value={settings.sound}
          onChange={(e) => setSettings({ ...settings, sound: e.target.value })}
          className="px-2 py-1 rounded-md border bg-white/60 dark:bg-white/10"
        >
          {Object.keys(sounds).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

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
