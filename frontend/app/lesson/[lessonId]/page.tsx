"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLesson } from "@/hooks/useLesson";
import type { Exercise } from "@/lib/types";
import { XP_VALUES } from "@/lib/types";
import {
  DuoOwl,
  HeartIcon,
  XIcon,
  StarIcon,
  FlameIcon,
  CrystalIcon,
} from "@/components/icon";
import Modal from "@/components/ui/Modal";
import { useConfetti } from "@/components/ui/Confetti";
import { useToasts } from "@/components/ui/Toast";
import ExerciseRenderer from "@/components/lesson/ExerciseRenderer";
import { playCorrectSound, playWrongSound, initAudio } from "@/lib/sounds";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = Number(params.lessonId);
  const {
    runtime,
    currentExercise,
    isLast,
    submit,
    advance,
    finish,
    retry,
    refill,
    refillError,
    error,
  } = useLesson(lessonId);
  const { fire, node: confetti } = useConfetti();
  const { push: toast, node: toasts } = useToasts();

  const completed = runtime.status === "completed";
  const outOfHearts = runtime.status === "out_of_hearts";
  const total = runtime.lesson?.exercises.length ?? 0;
  const progress = total > 0 ? Math.min(1, runtime.index / total) : 0;

  useEffect(() => {
    if (completed) fire();
  }, [completed, fire]);

  useEffect(() => {
    initAudio();
  }, []);

  useEffect(() => {
    if (runtime.lastResult) {
      if (runtime.lastResult.correct) {
        toast(`+${runtime.lastResult.xp_earned} XP!`, "success");
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
  }, [runtime.lastResult, toast]);

  return (
    <div className="min-h-screen bg-duo-faint flex flex-col">
      {confetti}
      {toasts}

      {/* Header */}
      <header className="bg-white border-b border-duo-mist">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/learn"
            className="w-9 h-9 rounded-full flex items-center justify-center text-duo-slate hover:bg-duo-faint transition-colors"
            aria-label="Exit lesson"
          >
            <XIcon className="w-5 h-5" />
          </Link>

          {/* Progress bar */}
          <div className="flex-1 h-4 rounded-full bg-duo-mist overflow-hidden">
            <div
              className="h-full rounded-full bg-duo-green transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <HeartIcon
                key={i}
                broken={i > runtime.hearts}
                className={`w-6 h-6 transition-transform ${
                  runtime.hearts > 0 && i === runtime.hearts
                    ? "animate-wiggle"
                    : ""
                }`}
              />
            ))}
          </div>

          {/* XP */}
          <span className="flex items-center gap-1 text-duo-ink font-extrabold">
            <StarIcon className="w-5 h-5 text-duo-yellow" />
            {runtime.xpEarned}
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6">
            <DuoOwl className="w-20 h-20" />
            <p className="text-lg font-extrabold text-duo-ink">{error}</p>
            <button onClick={retry} data-variant="green" className="btn-duo px-8">
              Try again
            </button>
          </div>
        ) : !runtime.lesson ? (
          <div className="flex-1 flex items-center justify-center">
            <DuoOwl className="w-16 h-16 animate-float" />
          </div>
        ) : (
          <LessonBody
            key={currentExercise?.id ?? "none"}
            exercise={currentExercise}
            submitted={runtime.submitted}
            lastResult={runtime.lastResult}
            onSubmit={submit}
            onAdvance={advance}
            onFinish={finish}
            isLast={isLast}
            lessonTitle={runtime.lesson.title}
          />
        )}
      </main>

      {/* Lesson Complete Modal */}
      <Modal open={completed} tone="light" showClose={false}>
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-duo-green-light flex items-center justify-center animate-celebrate">
            <DuoOwl className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-extrabold text-duo-ink mb-2">
            Lesson complete!!
          </h2>
          <p className="text-duo-slate font-bold mb-6">
            You earned{" "}
            <span className="text-duo-yellow">{runtime.xpEarned} XP</span>
            {runtime.completeResult?.skill_completed && (
              <>
                {" "}— {runtime.completeResult.skill_progress}% skill mastered!
              </>
            )}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Stat icon={<StarIcon className="w-5 h-5 text-duo-yellow" />} value={`${runtime.completeResult?.total_xp ?? runtime.xpEarned}`} label="Total XP" />
            <Stat icon={<FlameIcon className="w-5 h-5 text-duo-red" />} value={`${runtime.summary.correct}/${runtime.summary.total}`} label="Correct" />
            <Stat icon={<CrystalIcon className="w-5 h-5 text-duo-teal" />} value={runtime.summary.perfect ? `${XP_VALUES.PERFECT_BONUS}` : "0"} label="Bonus" />
          </div>

          {runtime.completeResult?.unlocked_skill && (
            <p className="text-sm font-bold text-duo-green mb-4">
              🔓 New skill unlocked: {runtime.completeResult.unlocked_skill}
            </p>
          )}

          {runtime.completeResult?.earned_achievements?.length ? (
            <div className="mb-4">
              <p className="text-sm font-bold text-duo-slate mb-2">
                Achievement unlocked!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {runtime.completeResult.earned_achievements.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-duo-purple/10 border-2 border-duo-purple px-3 py-1.5 text-sm font-extrabold text-duo-purple animate-pop"
                  >
                    🏆 {name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <Link href="/learn" data-variant="green" className="btn-duo w-full py-4">
            Continue
          </Link>
        </div>
      </Modal>

      {/* Out of Hearts Modal */}
      <Modal open={outOfHearts} tone="red" showClose={false}>
        <div className="p-8 text-center text-white">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-duo-red-dark/60 flex items-center justify-center animate-wiggle">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">
            You&apos;re out of hearts!
          </h2>
          <p className="opacity-90 font-medium mb-6">
            Hissss. Practice to earn more, or come back in 30 minutes.
          </p>
          {refillError && (
            <p className="text-sm font-bold mb-4 text-duo-yellow">
              {refillError}
            </p>
          )}
          <button
            onClick={() => refill()}
            data-variant="white"
            className="btn-duo w-full py-4 text-duo-red"
          >
            Refill with gems (350)
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-duo-faint p-3 flex flex-col items-center gap-1">
      {icon}
      <span className="text-xl font-extrabold text-duo-ink">{value}</span>
      <span className="text-xs text-duo-slate font-bold">{label}</span>
    </div>
  );
}

/** Renders the current exercise card + the signature bottom feedback bar. */
function LessonBody({
  exercise,
  submitted,
  lastResult,
  onSubmit,
  onAdvance,
  onFinish,
  isLast,
  lessonTitle,
}: {
  exercise: Exercise | null;
  submitted: boolean;
  lastResult: { correct: boolean; correct_answer: string } | null;
  onSubmit: (answer: string) => void;
  onAdvance: () => void;
  onFinish: () => void;
  isLast: boolean;
  lessonTitle: string;
}) {
  const [answer, setAnswer] = useState<string>("");

  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <DuoOwl className="w-16 h-16 animate-float" />
      </div>
    );
  }

  const correct = lastResult?.correct === true;
  const incorrect = lastResult?.correct === false;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Prompt */}
          <div
            key={`prompt-${incorrect ? "bad" : "ok"}`}
            className={`flex items-start gap-4 mb-8 ${
              incorrect ? "animate-shake" : ""
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-duo-green-light/70 flex items-center justify-center shrink-0 animate-float">
              <DuoOwl className="w-10 h-10" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-duo-slate text-xs font-bold uppercase tracking-wider mb-1">
                {lessonTitle}
              </p>
              <h1 className="text-2xl font-extrabold text-duo-ink leading-snug">
                {exercise.question || "Match the pairs"}
              </h1>
            </div>
          </div>

          {/* Exercise */}
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            answer={answer}
            setAnswer={setAnswer}
            disabled={submitted}
            reveal={lastResult}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        className={`border-t px-4 py-4 transition-colors duration-300 ${
          correct
            ? "bg-duo-green border-duo-green"
            : incorrect
            ? "bg-duo-red border-duo-red"
            : "bg-white border-duo-mist"
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Right side message + button */}
          <div className="flex items-center gap-3">
            {correct && (
              <>
                <DuoOwl className="w-9 h-9 animate-celebrate" />
                <span className="text-white font-extrabold text-xl">
                  Excellent!
                </span>
              </>
            )}
            {incorrect && (
              <span className="text-white font-extrabold text-lg">
                Not quite — correct answer:{" "}
                <span className="underline">{lastResult?.correct_answer}</span>
              </span>
            )}
          </div>

          {submitted ? (
            <button
              onClick={isLast ? onFinish : onAdvance}
              data-variant={correct ? "white" : "white"}
              className="btn-duo px-8"
            >
              {isLast ? "Finish" : "Continue"}
            </button>
          ) : (
            <button
              onClick={() => onSubmit(answer)}
              disabled={!answer.trim()}
              data-variant="green"
              className="btn-duo px-8"
            >
              Check
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Renders an exercise by type, collecting the user's answer into `answer`. */
function ExerciseCard({
  exercise,
  answer,
  setAnswer,
  disabled,
  reveal,
}: {
  exercise: Exercise;
  answer: string;
  setAnswer: (v: string) => void;
  disabled: boolean;
  reveal: { correct: boolean } | null;
}) {
  return (
    <ExerciseRenderer
      exercise={exercise}
      value={answer}
      onChange={setAnswer}
      disabled={disabled}
      reveal={reveal}
    />
  );
}

