import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

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

export default function TodoList({ accent = 'indigo-500' }) {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [text, setText] = useState('');

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos([{ id: Date.now(), text: t, done: false }, ...todos]);
    setText('');
  };

  const toggle = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));

  return (
    <div className="rounded-2xl p-5 border bg-white/70 dark:bg-white/5 backdrop-blur">
      <div className="font-medium mb-3">Quick To‑Do</div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border bg-white/60 dark:bg-white/10"
          placeholder="Add a task and press Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90">
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
        {todos.length === 0 && (
          <div className="text-sm text-slate-500">No tasks yet. Stay intentional ✨</div>
        )}
        {todos.map((t) => (
          <div
            key={t.id}
            className={`group flex items-center gap-3 p-2 rounded-xl border ${
              t.done ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => toggle(t.id)}
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                t.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
              }`}
            >
              {t.done && <Check size={14} />}
            </button>
            <div className={`flex-1 text-sm ${t.done ? 'line-through' : ''}`}>{t.text}</div>
            <button
              onClick={() => remove(t.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
