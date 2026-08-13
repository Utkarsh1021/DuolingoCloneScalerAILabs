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

// Exercise data shapes
export interface MCQData {
  options: string[];
  answer: string;
}

export interface WordBankData {
  words: string[];
  answer: string;
}

export interface MatchPairsData {
  pairs: [string, string][];
}

export interface FillBlankData {
  question: string;
  answer: string;
}

export interface TypeAnswerData {
  question: string;
}

// Union for exercise data
export exerciseData:
  | { type: "multiple_choice"; data: MCQData }
  | { type: "word_bank"; data: WordBankData }
  | { type: "match_pairs"; data: MatchPairsData }
  | { type: "fill_blank"; data: FillBlankData }
  | { type: "type_answer"; data: TypeAnswerData };

// Single exercise record
export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  question: string;
  correct_answer: string;
  data?: Record<string, unknown>;
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

// Skill progress
export interface SkillProgress {
  id: number;
  unit_id: number;
  title: string;
  description: string | null;
  order_index: number;
  status: "locked" | "available" | "completed";
  progress: number; // 0-100
  crowns: number;
}

// Unit data
export interface Unit {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillProgress[];
}

// Full path data
export interface PathUnits {
  units: Unit[];
}

// User profile
export interface UserStats {
  id: number;
  name: string;
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

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  avatar: string | null;
}

// Lesson state management
export interface LessonState {
  lessonId: number;
  currentExerciseIndex: number;
  hearts: number;
  xpEarned: number;
  completedExerciseIds: number[];
  status: "idle" | "active" | "completed" | "out_of_hearts";
  currentExercise: Exercise | null;
  feedback: "correct" | "incorrect" | null;
  showFeedback: boolean;
}

// Achievement definitions (from the 'achievements' table)
export interface AchievementDefinition {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
}

// User achievements (from the 'user_achievements' table - which user earned which achievement)
export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  achievement: AchievementDefinition;
}

// XP gain types
export const XP_VALUES = {
  CORRECT_ANSWER: 5,
  LESSON_COMPLETE: 10,
  PERFECT_BONUS: 5,
} as const;

export type XpKey = keyof typeof XP_VALUES;
