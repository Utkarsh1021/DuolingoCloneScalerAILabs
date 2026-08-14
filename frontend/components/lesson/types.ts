import type { Exercise } from "@/lib/types";

/** Shared props for all exercise renderers. */
export interface ExerciseProps {
  exercise: Exercise;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  reveal?: { correct: boolean } | null;
}

/** Serialized answer payload (safe to hand off as a string). */
export function buildAnswerPayload(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data == null) return null;
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}