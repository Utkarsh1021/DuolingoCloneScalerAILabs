"use client";

import type { ExerciseProps } from "./types";

export default function WordBank({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const words = (exercise.data?.words as string[]) ?? [];
  const picks = value ? value.split(" ") : [];

  if (words.length === 0) {
    return (
      <p className="text-center font-bold text-duo-slate">
        No words available for this exercise.
      </p>
    );
  }

  const toggle = (word: string) => {
    if (disabled) return;
    const next = picks.includes(word)
      ? picks.filter((w) => w !== word)
      : [...picks, word];
    onChange(next.join(" "));
  };

  return (
    <div>
      {/* Answer slot */}
      <div className="min-h-14 rounded-2xl border-2 border-duo-mist bg-white px-4 py-3 mb-6 flex flex-wrap items-center gap-2">
        {picks.length === 0 && (
          <span className="text-duo-slate font-bold">
            Tap the words in the correct order
          </span>
        )}
        {picks.map((w, i) => (
          <button
            key={`${w}-${i}`}
            onClick={() => toggle(w)}
            disabled={disabled}
            className="rounded-lg bg-duo-blue/10 border-2 border-duo-blue px-3 py-1 font-bold text-duo-blue text-lg"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Word bank chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {words.map((w) => {
          const used = picks.includes(w);
          return (
            <button
              key={w}
              onClick={() => toggle(w)}
              disabled={disabled || used}
              className={`rounded-xl border-2 bg-white px-4 py-2 font-bold text-lg transition-all ${
                used
                  ? "border-duo-mist text-duo-slate opacity-50"
                  : "border-duo-slate/40 text-duo-ink hover:bg-duo-faint"
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}