/** Hook for managing lesson state and exercise processing. */
import { useEffect, useState } from "react";
import {
  startLesson,
  answerExercise,
  completeLesson,
  type LessonState,
  type LessonExercises,
  type Exercise,
} from "@/lib/api";

export function useLesson(lessonId?: number) {
  const [state, setState] = useState<LessonState>({
    lessonId: lessonId || 0,
    currentExerciseIndex: 0,
    hearts: 5,
    xpEarned: 0,
    completedExerciseIds: [],
    status: "idle",
    currentExercise: null,
    feedback: null,
    showFeedback: false,
  });

  const [exerciseData, setExerciseData] = useState<LessonExercises | null>(null);

  // Load lesson data when lessonId changes
  useEffect(() => {
    if (!lessonId) return;

    async function loadLesson() {
      try {
        // Start the lesson which returns state + exercises
        const lessonState = await startLesson(lessonId);
        setState(lessonState);

        // Fetch exercises for this lesson
        // Note: In a full implementation, we'd get these from the API
        // For now, we'll store the exercises in the lesson state
      } catch (err) {
        console.error("Failed to load lesson:", err);
      }
    }

    loadLesson();
  }, [lessonId]);

  // Process answer
  const handleAnswer = async (answer: string) => {
    if (!lessonId || state.status !== "active") return;

    const currentExercise = state.currentExercise;
    if (!currentExercise) return;

    try {
      const result = await answerExercise(lessonId, currentExercise.id, answer);
      
      // Update state based on result
      setState({
        ...state,
        currentExerciseIndex: state.currentExerciseIndex + 1,
        hearts: result.hearts_remaining,
        xpEarned: state.xpEarned + result.xp_earned,
        completedExerciseIds: [...state.completedExerciseIds, currentExercise.id],
        feedback: result.correct ? "correct" : "incorrect",
        showFeedback: true,
        status: result.hearts_remaining <= 0 ? "out_of_hearts" : "active",
      });

      // Check if lesson is complete after this answer
      // We'll handle this after all exercises are done
      if (result.correct && state.currentExerciseIndex + 1 >= state.exerciseData?.lessons?.length) {
        // Lesson complete
        completeLesson(lessonId);
      }
    } catch (err) {
      console.error("Failed to process answer:", err);
    }
  };

  // Hide feedback after a moment
  const hideFeedback = () => {
    setState({
      ...state,
      showFeedback: false,
      feedback: null,
    });
  };

  // Complete lesson
  const handleComplete = async () => {
    if (!lessonId || state.status !== "active") return;
    
    try {
      const result = await completeLesson(lessonId);
      setState({
        ...state,
        status: "completed",
        showFeedback: false,
        feedback: null,
      });
      // In a real app, we'd navigate back or show completion modal
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    }
  };

  return {
    state,
    exerciseData,
    handleAnswer,
    hideFeedback,
    handleComplete,
    setExerciseData,
  };
}