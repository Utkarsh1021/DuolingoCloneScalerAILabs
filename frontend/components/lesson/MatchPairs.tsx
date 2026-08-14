"use client";

import { useState } from "react";
import type { ExerciseProps } from "./types";

export default function MatchPairs({
  exercise,
  onChange,
  disabled,
}: ExerciseProps) {
  const pairs = (exercise.data?.pairs as [string, string][]) ?? [];
  const left = pairs.map(([l]) => l);
  const right = pairs.map(([, r]) => r);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  // Once every pair has been matched, submit the exercise as complete.
  const done = matched.size === pairs.length;

  const handleLeft = (l: string) => {
    if (disabled || done) return;
    setLeftPick(l);
  };

  const handleRight = (r: string) => {
    if (disabled || done || !leftPick) return;
    const pair = pairs.find(([l, rr]) => l === leftPick && rr === r);
    if (pair) {
      const next = new Set(matched);
      next.add(r);
      setMatched(next);
      setLeftPick(null);
      if (next.size === pairs.length) {
        onChange("matched");
      }
    } else {
      setWrongRight(r);
      setLeftPick(null);
      setTimeout(() => setWrongRight(null), 450);
    }
  };

  const isLeftMatched = (l: string) =>
    pairs.some(([ll, rr]) => ll === l && matched.has(rr));

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        {left.map((l) => (
          <button
            key={l}
            onClick={() => handleLeft(l)}
            disabled={disabled || done || isLeftMatched(l)}
            className={`rounded-2xl border-2 bg-white px-4 py-3 font-bold text-lg text-left transition-all ${
              isLeftMatched(l)
                ? "border-duo-green bg-duo-green/5 opacity-60"
                : leftPick === l
                ? "border-duo-blue bg-duo-blue/5"
                : "border-duo-mist hover:bg-duo-faint"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {right.map((r) => {
          const rMatched = matched.has(r);
          return (
            <button
              key={r}
              onClick={() => handleRight(r)}
              disabled={disabled || done || rMatched}
              className={`rounded-2xl border-2 bg-white px-4 py-3 font-bold text-lg text-left transition-all ${
                rMatched
                  ? "border-duo-green bg-duo-green/5 opacity-60"
                  : wrongRight === r
                  ? "border-duo-red bg-duo-red/5 animate-shake"
                  : "border-duo-mist hover:bg-duo-faint"
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}