/** Hook for managing lesson state and exercise processing. */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  startLesson,
  answerExercise,
  completeLesson,
  refillHearts,
} from "@/lib/api";
import type { Exercise, LessonStart, AnswerResult, CompleteResult } from "@/lib/types";

export type Feedback = "correct" | "incorrect" | null;

interface LessonRuntime {
  lesson: LessonStart | null;
  index: number;
  hearts: number;
  xpEarned: number;
  status: "idle" | "active" | "completed" | "out_of_hearts";
  submitted: boolean;
  lastResult: AnswerResult | null;
  completeResult: CompleteResult | null;
  summary: {
    correct: number;
    total: number;
    heartsLost: number;
    perfect: boolean;
  };
}

const initialRuntime: LessonRuntime = {
  lesson: null,
  index: 0,
  hearts: 5,
  xpEarned: 0,
  status: "idle",
  submitted: false,
  lastResult: null,
  completeResult: null,
  summary: { correct: 0, total: 0, heartsLost: 0, perfect: true },
};

export function useLesson(lessonId: number) {
  const [runtime, setRuntime] = useState<LessonRuntime>(initialRuntime);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const lesson = await startLesson(lessonId);
        if (!active) return;
        setError(null);
        setRuntime({
          ...initialRuntime,
          lesson,
          index: lesson.current_exercise_index,
          hearts: lesson.hearts,
          status: lesson.status as LessonRuntime["status"],
          summary: {
            correct: 0,
            total: lesson.exercises.length,
            heartsLost: 0,
            perfect: true,
          },
        });
      } catch (err) {
        if (!active) return;
        setError("Couldn't load this lesson. Please try again.");
        console.error(err);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [lessonId, attempt]);

  const currentExercise: Exercise | null =
    runtime.lesson?.exercises[runtime.index] ?? null;

  const isLast =
    runtime.lesson != null &&
    runtime.index >= runtime.lesson.exercises.length - 1;

  const submit = useCallback(
    async (answer: string) => {
      if (!runtime.lesson || !currentExercise || runtime.submitted) return;

      setRuntime((r) => ({ ...r, submitted: true }));

      try {
        const result = await answerExercise(
          runtime.lesson.lesson_id,
          currentExercise.id,
          answer
        );

        setRuntime((r) => ({
          ...r,
          submitted: true,
          lastResult: result,
          hearts: result.hearts_remaining,
          xpEarned: r.xpEarned + result.xp_earned,
          summary: {
            ...r.summary,
            correct: r.summary.correct + (result.correct ? 1 : 0),
            heartsLost: r.summary.heartsLost + result.hearts_lost,
            perfect: r.summary.perfect && result.correct,
          },
          status:
            result.hearts_remaining <= 0 ? "out_of_hearts" : r.status,
        }));
      } catch (err) {
        console.error(err);
        setRuntime((r) => ({ ...r, submitted: false }));
      }
    },
    [runtime.lesson, currentExercise, runtime.submitted]
  );

  const advance = useCallback(() => {
    setRuntime((r) => {
      const nextIndex = r.index + 1;
      const finished =
        !r.lesson || nextIndex >= r.lesson.exercises.length;

      if (finished) {
        return {
          ...r,
          index: nextIndex,
          submitted: false,
          lastResult: null,
          status: "completed",
        };
      }

      return {
        ...r,
        index: nextIndex,
        submitted: false,
        lastResult: null,
      };
    });
  }, []);

  const complete = useCallback(async () => {
    if (!runtime.lesson) return null;
    try {
      const result = await completeLesson(runtime.lesson.lesson_id);
      setRuntime((r) => ({
        ...r,
        status: "completed",
        xpEarned: r.xpEarned + result.xp_earned,
        completeResult: result,
      }));
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [runtime.lesson]);

  const finish = useCallback(async () => {
    if (!runtime.lesson) return null;
    setRuntime((r) => ({ ...r, status: "completed" }));
    const result = await complete();
    return result;
  }, [runtime.lesson, complete]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const [refillError, setRefillError] = useState<string | null>(null);

  const refill = useCallback(async () => {
    try {
      const result = await refillHearts();
      setRefillError(null);
      setAttempt((a) => a + 1);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace(/^\d+: /, "") : "Refill failed";
      setRefillError(message);
      return null;
    }
  }, []);

  return {
    runtime,
    error,
    currentExercise,
    isLast,
    submit,
    advance,
    complete,
    finish,
    retry,
    refill,
    refillError,
  };
}