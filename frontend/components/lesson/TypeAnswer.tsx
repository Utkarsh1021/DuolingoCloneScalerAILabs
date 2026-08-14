"use client";

import { useState } from "react";
import { SpeakerIcon } from "@/components/icon";
import type { ExerciseProps } from "./types";

/** Type-the-answer: free text input with a Spanish TTS listen button. */
export default function TypeAnswer({ exercise, value, onChange, disabled }: ExerciseProps) {
  const [speak] = useState<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <p className="text-xl font-extrabold text-duo-ink">{exercise.question}</p>
        <button
          onClick={() => {
            const u = new SpeechSynthesisUtterance(exercise.question);
            u.lang = "es";
            speak?.speak(u);
          }}
          className="w-10 h-10 rounded-full bg-duo-blue/10 text-duo-blue flex items-center justify-center hover:bg-duo-blue/20 transition-colors shrink-0"
          aria-label="Listen"
        >
          <SpeakerIcon className="w-6 h-6" />
        </button>
      </div>
      <input
        type="text"
        autoFocus
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer"
        className="w-full rounded-2xl border-2 border-duo-mist bg-white px-5 py-4 font-bold text-lg text-duo-ink placeholder:font-medium placeholder:text-duo-slate focus:border-duo-blue outline-none transition-colors"
      />
    </div>
  );
}