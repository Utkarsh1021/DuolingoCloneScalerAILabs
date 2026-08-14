"use client";

import type { ExerciseProps } from "./types";

/**
 * Fill-in-the-blank: renders the sentence with a visible gap. The gap is an
 * inline editable slot; words come from the exercise's word-bank data (or a
 * free text input when no bank is provided).
 */
export default function FillBlank({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const words = (exercise.data?.words as string[]) ?? [];
  const parts = (exercise.question ?? "").split("______");
  const hasBank = words.length > 0;

  return (
    <div>
      {/* Sentence with inline blank */}
      <div className="text-2xl font-extrabold text-duo-ink leading-relaxed mb-8 flex flex-wrap items-center gap-2 justify-center">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>{part}</span>
            {i < parts.length - 1 && (
              <span className="min-w-28 inline-block border-b-4 border-duo-blue-100 px-3 pb-1 text-center text-duo-blue">
                {value || <span className="text-duo-slate/50">…</span>}
              </span>
            )}
          </span>
        ))}
      </div>

      {hasBank ? (
        <div className="flex flex-wrap gap-2 justify-center">
          {words.map((w) => (
            <button
              key={w}
              onClick={() => onChange(disabled ? value : w)}
              disabled={disabled}
              className={`rounded-xl border-2 bg-white px-4 py-2 font-bold text-lg transition-all ${
                value === w
                  ? "border-duo-blue bg-duo-blue/5 text-duo-blue"
                  : "border-duo-slate/40 text-duo-ink hover:bg-duo-faint"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <input
            type="text"
            autoFocus
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer"
            className="w-full max-w-md rounded-2xl border-2 border-duo-mist bg-white px-5 py-4 font-bold text-lg text-duo-ink placeholder:font-medium placeholder:text-duo-slate focus:border-duo-blue outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
}