"use client";

import type { ExerciseProps } from "./types";

export default function MultipleChoice({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const options = (exercise.data?.options as string[]) ?? [];
  return (
    <div className="grid gap-3 max-w-xl mx-auto">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          disabled={disabled}
          className={`w-full text-left rounded-2xl border-2 bg-white px-5 py-3.5 font-bold text-lg text-duo-ink transition-all ${
            value === opt
              ? "border-duo-blue bg-duo-blue/5"
              : "border-duo-mist hover:bg-duo-faint"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}