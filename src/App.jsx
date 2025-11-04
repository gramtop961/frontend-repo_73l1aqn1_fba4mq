import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, Sun, Moon, Palette, Timer as TimerIcon } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Timer from './components/Timer';
import AmbientMixer from './components/AmbientMixer';
import TodoList from './components/TodoList';
import StatsHeatmap from './components/StatsHeatmap';

const THEMES = {
  'Pastel Pink': {
    bg: 'from-rose-50 via-rose-100 to-white',
    card: 'bg-white/70 backdrop-blur',
    accent: 'rose-500',
  },
  'Olive Forest': {
    bg: 'from-emerald-50 via-lime-50 to-white',
    card: 'bg-white/70 backdrop-blur',
    accent: 'emerald-600',
  },
  'Midnight Blue': {
    bg: 'from-slate-900 via-indigo-950 to-slate-900',
    card: 'bg-slate-900/60 backdrop-blur',
    accent: 'indigo-400',
  },
  'Beige Minimal': {
    bg: 'from-stone-50 via-amber-50 to-white',
    card: 'bg-white/70 backdrop-blur',
    accent: 'amber-600',
  },
  Dynamic: {
    bg: 'from-slate-900 via-indigo-950 to-slate-900',
    card: 'bg-slate-900/60 backdrop-blur',
    accent: 'indigo-400',
  },
};

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

export default function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'Dynamic');
  const [focusMode, setFocusMode] = useLocalStorage('focusMode', false);
  const [stats, setStats] = useLocalStorage('pomodoro_stats', {});

  const activeTheme = useMemo(() => {
    if (theme !== 'Dynamic') return THEMES[theme];
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return THEMES['Beige Minimal'];
    if (hour >= 12 && hour < 18) return THEMES['Olive Forest'];
    if (hour >= 18 && hour < 22) return THEMES['Pastel Pink'];
    return THEMES['Midnight Blue'];
  }, [theme]);

  const onSessionComplete = () => {
    const d = new Date();
    const key = d.toISOString().slice(0, 10);
    const next = { ...stats, [key]: (stats[key] || 0) + 1 };
    setStats(next);
  };

  return (
    <div className={`min-h-screen w-full relative text-slate-800 dark:text-slate-100`}>\n      {/* Hero with Spline background */}
      <section className="relative h-[42vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <Spline
            scene="https://prod.spline.design/qMOKV671Z1CM9yS7/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {/* Gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 backdrop-blur border border-white/20 mb-4">
              <TimerIcon size={16} /> Focus, Breathe, Create
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-white">
              Minimal Pomodoro for Deep Work
            </h1>
            <p className="text-white/80 mt-3">
              Gentle animations, ambient soundscapes, and a productivity heatmap to keep you consistent.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setFocusMode((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-900 hover:bg-white"
              >
                <Focus size={18} /> {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              </button>
              <ThemeSelect theme={theme} setTheme={setTheme} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* App body */}
      <main
        className={`relative -mt-12 md:-mt-16 z-[1]`}
      >
        <div className={`mx-auto max-w-6xl px-4 pb-24`}>
          <div
            className={`rounded-3xl border shadow-xl ${activeTheme.card} ${
              activeTheme.bg.includes('slate-900') ? 'text-slate-100' : 'text-slate-800'
            }`}
          >
            <div className={`rounded-t-3xl bg-gradient-to-r ${activeTheme.bg} p-6`}></div>

            <div className="p-6 md:p-10">
              {/* Layout */}
              <div className={`grid grid-cols-1 ${focusMode ? '' : 'lg:grid-cols-3'} gap-6`}>
                <div className={`${focusMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                  <Timer onComplete={onSessionComplete} focusMode={focusMode} accent={activeTheme.accent} />
                </div>

                {!focusMode && (
                  <div className="space-y-6">
                    <AmbientMixer />
                    <TodoList accent={activeTheme.accent} />
                  </div>
                )}
              </div>

              {!focusMode && (
                <div className="mt-10">
                  <StatsHeatmap stats={stats} accent={activeTheme.accent} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ThemeSelect({ theme, setTheme }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 text-slate-900">
      <Palette size={18} />
      <select
        className="bg-transparent focus:outline-none"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {Object.keys(THEMES).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
