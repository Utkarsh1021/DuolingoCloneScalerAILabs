/**
 * API client for the Duolingo Clone backend.
 *
 * All endpoints communicate with the FastAPI backend running on port 8000.
 */

import type {
  AnswerResult,
  CompleteResult,
  Exercise,
  LeaderboardEntry,
  LessonStart,
  PathData,
  UserProfile,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getMe(): Promise<UserProfile> {
  return request<UserProfile>("/api/user");
}

export async function getPath(): Promise<PathData> {
  const units = await request<PathData["units"]>("/api/path");
  return { units };
}

export async function startLesson(lessonId: number): Promise<LessonStart> {
  return request<LessonStart>(`/api/lessons/${lessonId}/start`, {
    method: "POST",
  });
}

export async function answerExercise(
  lessonId: number,
  exerciseId: number,
  answer: string
): Promise<AnswerResult> {
  return request<AnswerResult>(`/api/lessons/${lessonId}/answer`, {
    method: "POST",
    body: JSON.stringify({ exercise_id: exerciseId, answer }),
  });
}

export async function completeLesson(lessonId: number): Promise<CompleteResult> {
  return request<CompleteResult>(`/api/lessons/${lessonId}/complete`, {
    method: "POST",
  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>("/api/leaderboard");
}

export async function refillHearts(): Promise<{
  ok: boolean;
  message: string;
  hearts: number;
  gems: number;
  already_full: boolean;
}> {
  return request("/api/me/refill-hearts", { method: "POST" });
}

export type { Exercise, LessonStart };