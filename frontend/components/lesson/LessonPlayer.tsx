"use client";

import { useLesson, type LessonState, type Exercise, type XpValues } from "@/lib/api";
import { useUserProgress } from "@/hooks/useUserProgress";
import { XP_VALUES } from "@/lib/types";

interface ExerciseComponentProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  showFeedback: boolean;
  feedback: "correct" | "incorrect" | null;
}

interface MultipleChoiceProps {
  exercise: Exercise;
  onSelect: (option: string) => void;
}

/** Multiple Choice Exercise Component */
function MultipleChoice({ exercise, onSelect }: MultipleChoiceProps) {
  const options = exercise.data?.options || [];

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={index}
          className`
            w-full
            rounded-lg px-4 py-3
            text-left
            font-medium
            transition-all duration-200
            ${option === "correct" 
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }
          `
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Word Bank Exercise Component - translate with word bank */
function WordBank({ exercise }: ExerciseComponentProps) {
  const words = exercise.data?.words || [];

  return (
    <div className="space-y-3">
      {words.map((word, index) => (
        <button
          key={index}
          className`
            inline-flex items-center rounded-full px-4 py-2
            mr-2 mb-2
            text-sm
            font-medium
            transition-all duration-200
            ${word === "correct"
              ? "bg-green-100 text-green-800"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          `
        >
          {word}
        </button>
      )}
    </div>
  );
}

/** Match Pairs Exercise Component */
function MatchPairs({ exercise }: ExerciseComponentProps) {
  const pairs = exercise.data?.pairs || [];

  return (
    <div className="space-y-3">
      {pairs.map(([left, right], index) => (
        <div
          key={index}
          className`
            flex items-center gap-3
            px-3 py-2
            rounded-lg
            border-2
            border-transparent
            transition-all duration-200
            ${left === "correct" || right === "correct"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white"
            }
          `
        >
          <span className="font-medium">{left}</span>
          <span className="text-gray-400 arrow">→</span>
          <span className="font-medium">{right}</span>
        </div>
      ))}
    </div>
  );
}

/** Fill in the Blank Exercise Component */
function FillBlank({ exercise }: ExerciseComponentProps) {
  const question = exercise.question;

  return (
    <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-white transition-all">
      <p className="text-lg font-medium">
        {question}
      </p>
      <input
        type="text"
        className`
          w-full
          px-4
          py-2
          rounded-lg
          border
          border-blue-500
          focus:outline-none focus:border-blue-600
          background-white
          transition-colors
        `
        placeholder="Type your answer..."
      />
    </div>
  );
}

/** Type Answer Exercise Component */
function TypeAnswer({ exercise }: ExerciseComponentProps) {
  return (
    <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-white transition-all">
      <p className="text-lg font-medium">
        {exercise.question}
      </p>
      <input
        type="text"
        className`
          w-full
          px-4
          py-2
          rounded-lg
          border
          border-blue-500
          focus:outline-none focus:border-blue-600
          background-white
          transition-colors
        `
        placeholder="Type your answer..."
      />
    </div>
  );
}

/** Feedback Bar - the signature Duolingo bottom bar */
function FeedbackBar({ feedback, onHide }: { feedback: "correct" | "incorrect" | null; onHide: () => void }) {
  if (!feedback) return null;

  return (
    <div
      className`
        fixed
        bottom-0
        left-0
        right-0
        padding-6
        background:${feedback === "correct" ? "bg-green-600" : "bg-red-600"}
        color-white
        text-center
        text-lg
        font-medium
        shadow-2xl
        transform
        translate-y-full
        transition-all duration-300
        ease-out
      `
      onClick={onHide}
    >
      {feedback === "correct"
        ? "✓ Great job!"
        : `✕ Correct answer: ${feedback}`}
    </div>
  );
}

/** Lesson Player Page */
export default function LessonPage() {
  const { user } = useUserProgress();
  const { state, exerciseData, handleAnswer, hideFeedback, handleComplete } = useLesson(
    state.lessonId
  );

  if (!state.lessonId || !exerciseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <span className="text-gray-500 text-lg">Lesson not found</span>
      </div>
    );
  }

  const currentExercise = state.currentExercise;
  const totalExercises = exerciseData.exercises.length;

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <span className="text-gray-500 text-lg">No exercises found</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Lesson Header */}
      <header className="border-b border-gray-700 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M15 12l-3-3m0 0l-3 3m3-3v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v1zM9 10H7a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-2xl font-bold">Lesson: {state.lessonTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Hearts display in header */}
          <div className="flex items-center gap-1">
            {Array.from({ length: state.hearts }, (_, i) => (
              <svg
                key={i}
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M16.75 15.75c-.66 0-1.267.16-1.825.45l3.5 3.5c.03.03.045.07.045.11 0 .11-.05.217-.14.3l-2.15 2.15a.75.75 0 11-1.06-.85l1.46-3.06a.75.75 0 01.85-1.06zm-3.5 2.15a.75.75 0 100-1.5.75.75 0 001.5 1.5zm7.5 0a.75.75 0 100-1.5.75.75 0 001.5 1.5zm3.75-5.25a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM8.5 13.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM12 16.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM15.25 13.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75z"
                  clipRule="evenodd"
                />
              </svg>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-32 h-2 rounded-full bg-gray-600 overflow-hidden">
            <div
              className`
                h-full
                bg-green-500
                transition-width
                duration-300
                ease-out
                ${((state.currentExerciseIndex / totalExercises) * 100).toString() + "%"}
              `
            />
          </div>

          {/* XP earned display */}
          <span className="text-sm font-medium ml-4">
            +{state.xpEarned} XP
          </span>
        </div>
      </header>

      {/* Lesson Content Area */}
      <main className="pt-20 px-6">
        {/* Current Exercise */}
        <section className="mb-8">
          {/* Exercise Type Renderer */}
          {currentExercise.type === "multiple_choice" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                {currentExercise.question}
              </h3>

              <MultipleChoice
                exercise={currentExercise}
                onSelect={(option) => handleAnswer(option)}
              />

              {/* Answer buttons */}
              <div className="mt-8 space-y-3">
                {/* Options are rendered in MultipleChoice component */}
              </div>
            </div>
          )}

          {currentExercise.type === "word_bank" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                {currentExercise.question}
              </h3>

              <WordBank exercise={currentExercise} />
            </div>
          )}

          {currentExercise.type === "match_pairs" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                {currentExercise.question}
              </h3>

              <MatchPairs exercise={currentExercise} />
            </div>
          )}

          {currentExercise.type === "fill_blank" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                {currentExercise.question}
              </h3>

              <FillBlank exercise={currentExercise} />
            </div>
          )}

          {currentExercise.type === "type_answer" && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                {currentExercise.question}
              </h3>

              <TypeAnswer exercise={currentExercise} />
            </div>
          )}
        </section>

        {/* Feedback Bar */}
        <FeedbackBar
          feedback={state.feedback}
          onHide={hideFeedback}
        />
      </main>

      {/* Lesson Complete Modal */}
      {state.status === "completed" && (
        <div
          className`
            fixed
            inset-0
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
          `
        >
          <div
            className`
              bg-white
              rounded-2xl
              p-8
              max-w-sm
              width-full
              text-center
              animate-in
              fade-in-0
              zoom-in-95
            `
          >
            <svg
              className="mx-auto mb-4 text-green-500 w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                className="stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M5 13l4 4L2 12l-4 4 1.29-5.36a1 1 0 011.22-1.12L12 10l5.06-2.83a1 1 0 011.22 1.12l1.29 5.36L22 4l-4.9-4.5L12 4l-4 4-4.71-5.36a1 1 0 011.22-1.12L12 10l-1.29 5.36a1 1 0 01-1.22 1.12L3 14l4-4z"
              />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Lesson Complete!</h3>
            <p className="text-gray-600 mb-6">
              You earned {state.xpEarned} XP
            </p>
            <button
              onClick={handleComplete}
              className`
                w-full
                bg-gradient-to-r from-green-500 to-emerald-600
                text-white
                font-medium
                px-6
                py-3
                rounded-full
                text-lg
                hover:opacity-90
                transition-opacity
              `
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Out of Hearts Modal */}
      {state.status === "out_of_hearts" && (
        <div
          className`
            fixed
            inset-0
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
          `
        >
          <div
            className`
              bg-white
              rounded-2xl
              p-8
              max-w-sm
              width-full
              text-center
              animate-in
              fade-in-0
              zoom-in-95
            `
          >
            <svg
              className="mx-auto mb-4 text-red-500 w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                className="stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M12 1v2m0 10v2m-7-7h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4m2 6H7m5 0a2 2 0 012 2v2a2 2 0 01-2 2h-2v-2zm7 3a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Out of Hearts</h3>
            <p className="text-gray-600 mb-6">
              You've run out of hearts. Practice to regenerate them, or come back tomorrow!
            </p>
            <div className="flex gap-3">
              <button
                className`
                  flex-1
                  bg-gray-200
                  text-gray-700
                  font-medium
                  px-4
                  py-2
                  rounded
                  hover:bg-gray-300
                  transition-colors
                `
                onClick={() => {}}
              >
                Practice
              </button>
              <button
                className`
                  flex-1
                  bg-green-500
                  text-white
                  font-medium
                  px-4
                  py-2
                  rounded
                  hover:bg-green-600
                  transition-colors
                `
                onClick={() => {}}
              >
                Refill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}