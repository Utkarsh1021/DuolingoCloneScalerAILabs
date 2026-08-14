/**
 * Core types for the Duolingo Clone frontend.
 * These types mirror the backend schemas and API responses.
 */

// Exercise types
export type ExerciseType =
  | "multiple_choice"
  | "word_bank"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";

// Single exercise record
export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  question: string;
  correct_answer: string;
  data?: Record<string, unknown> | null;
  order_index: number;
}

// Lesson info
export interface Lesson {
  id: number;
  skill_id: number;
  title: string;
  description: string | null;
  order_index: number;
  xp_reward: number;
}

// Skill progress (path node)
export interface SkillProgress {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  status: "locked" | "available" | "completed";
  progress: number; // 0-100
  crowns: number;
  lessons_count: number;
  first_lesson_id?: number | null;
}

// Unit data
export interface Unit {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillProgress[];
}

// Full path data
export interface PathData {
  units: Unit[];
}

// User profile
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
  earned_achievement_ids: number[];
  xp_today: number;
  avatar: string | null;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  avatar: string | null;
}

// Lesson start state returned by the backend
export interface LessonStart {
  lesson_id: number;
  title: string;
  xp_reward: number;
  skill_title: string;
  hearts: number;
  current_exercise_index: number;
  xp_earned: number;
  completed_exercise_ids: number[];
  status: "idle" | "active" | "completed" | "out_of_hearts";
  exercises: Exercise[];
}

// Answer result
export interface AnswerResult {
  correct: boolean;
  correct_answer: string;
  xp_earned: number;
  hearts_remaining: number;
  hearts_lost: number;
  message: string;
}

// Lesson completion result
export interface CompleteResult {
  completed: boolean;
  xp_earned: number;
  total_xp: number;
  streak: number;
  skill_progress: number;
  skill_completed: boolean;
  hearts_lost: number;
  message: string;
  unlocked_skill: string | null;
  earned_achievements: string[];
}

// Achievement definitions
export interface AchievementDefinition {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
}

// XP gain types
export const XP_VALUES = {
  CORRECT_ANSWER: 5,
  LESSON_COMPLETE: 10,
  PERFECT_BONUS: 5,
} as const;

export type XpKey = keyof typeof XP_VALUES;