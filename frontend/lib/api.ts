/**
 * API client for the Duolingo Clone backend.
 * 
 * All endpoints communicate with the FastAPI backend running on port 8000.
 * The base URL should be configured per environment (development vs production).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ExerciseData {
  id: number;
  lesson_id: number;
  type: "multiple_choice" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer";
  question: string;
  correct_answer: string;
  data?: Record<string, unknown>;
  order_index: number;
}

export interface LessonExercises {
  lesson_id: number;
  title: string;
  xp_reward: number;
  skill_title: string;
  exercises: ExerciseData[];
}

export interface SkillProgress {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  status: "locked" | "available" | "completed";
  progress: number; // 0-100
  crowns: number;
  lessons_count: number;
}

export interface UnitData {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillProgress[];
}

export interface PathData {
  units: UnitData[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  daily_goal: number;
  last_active_date: string | null;
  total_skills_completed: number;
  achievements_count: number;
  avatar: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  avatar: string | null;
}

export interface LessonState {
  lesson_id: number;
  current_exercise_index: number;
  hearts: number;
  xp_earned: number;
  completed_exercise_ids: number[];
  status: "idle" | "active" | "completed" | "out_of_hearts";
  exercise: ExerciseData | null;
}

/**
 * Fetch the current user profile.
 */
export async function getMe(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/user`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

/**
 * Fetch the learning path with units and skills.
 */
export async function getPath(): Promise<PathData> {
  const res = await fetch(`${BASE_URL}/api/path`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch learning path");
  return res.json();
}

/**
 * Start a lesson.
 */
export async function startLesson(lessonId: number): Promise<LessonState> {
  const res = await fetch(`${BASE_URL}/api/lessons/${lessonId}/start`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to start lesson: ${txt}`);
  }
  return res.json();
}

/**
 * Process an answer to an exercise.
 */
export async function answerExercise(
  lessonId: number,
  exerciseId: number,
  answer: string
): Promise<{
  correct: boolean;
  correct_answer: string;
  xp_earned: number;
  hearts_remaining: number;
  hearts_lost: number;
  message: string;
}> {
  const res = await fetch(`${BASE_URL}/api/lessons/${lessonId}/answer`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ exercise_id: exerciseId, answer }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to process answer: ${txt}`);
  }
  return res.json();
}

/**
 * Complete a lesson.
 */
export async function completeLesson(lessonId: number): Promise<{
  completed: boolean;
  xp_earned: number;
  total_xp: number;
  streak: number;
  skill_progress: number;
  skill_completed: boolean;
  hearts_lost: number;
  message: string;
  unlocked_skill: string | null;
}> {
  const res = await fetch(`${BASE_URL}/api/lessons/${lessonId}/complete`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to complete lesson: ${txt}`);
  }
  return res.json();
}

/**
 * Fetch the leaderboard.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

/**
 * Fetch a user's profile by ID (for leaderboard context).
 */
export async function getUserProfile(userId: number): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/user/${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}