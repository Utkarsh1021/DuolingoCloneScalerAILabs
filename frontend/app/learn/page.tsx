"use client";

import Link from "next/link";
import { useUserProgress, type PathData } from "@/hooks/useUserProgress";
import { SkillProgress } from "@/lib/types";

export default function LearnPage() {
  const { user, path, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 via-green-200 to-green-100 flex items-center justify-center p-8">
        <span className="text-gray-600 text-lg">Loading learning path...</span>
      </div>
    );
  }

  if (!path || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 via-green-200 to-green-100 flex items-center justify-center p-8">
        <span className="text-gray-600 text-lg">
          No course data found. <a href="/settings" className="text-green-600 underline">Set up a course</a>.
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button and title */}
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M15 12l-3-3m0 0l-3 3m3-3v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v1zM9 10H7a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2z"
                clipRule="evenodd"
              />
            </svg>
            Learn
          </Link>
          <span className="text-sm text-gray-500">Spanish Course</span>
        </div>
      </header>

      <main className="p-6">
        {/* Top stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{user?.xp ?? 0} XP</div>
            <div className="text-sm text-gray-500">Total XP</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-400">{user?.hearts ?? 5} ❤️</div>
            <div className="text-sm text-gray-500">Hearts</div>
          </div>
        </div>

        {/* Skill Tree Visualization */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              {path.units.length} Units
            </h2>
            <p className="text-sm text-gray-500">
              {user?.streak ?? 0} day streak
            </p>
          </div>

          <div className="space-y-4">
            {path.units.map((unit) => (
              <SkillTreeUnit key={unit.id} unit={unit} user={user} />
            ))}
          </div>
        </section>

        {/* CTA: Continue Learning */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Continue Learning
          </h3>
          <p className="text-gray-600 mb-6">
            Keep your streak alive! {user?.streak ?? 0} day{user?.streak !== 1 ? "s" : ""} streak
          </p>
          <Link
            href="/lesson/1"
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium px-8 py-3 rounded-full text-lg hover:opacity-90 transition-opacity shadow-lg">
            Start First Lesson
          </Link>
        </div>
      </main>
    </div>
  );
}

/** Skill Tree Unit component - renders a unit with its skills. */
function SkillTreeUnit({
  unit,
  user,
}: {
  unit: PathData["units"][0];
  user: UserProfile | undefined;
}) {
  const [unitSkills] = unit.skills;

  return (
    <div className="border-rounded-2xl overflow-hidden">
      {/* Unit header */}
      <div className="bg-gradient-to-b from-green-100 via-green-200 to-green-50 p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">
          {unit.title}{" "}
          <span className="text-sm text-gray-500">({unit.skills.length} skills)</span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">{unit.description || "Basic vocabulary and phrases"}</p>
      </div>

      {/* Skills grid */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {unitSkills.map((skill) => renderSkillCard(skill, unit.id, user))}
        </div>
      </div>
    </div>
  );
}

/** Individual skill card with progression state. */
function SkillCard({
  skill,
  unitId,
  user,
}: {
  skill: PathData["units"][0]["skills"][0];
  unitId: number;
  user: UserProfile | undefined;
}) {
  // Determine skill status
  const isCompleted = skill.progress >= 100 && skill.completed;
  const isAvailable = skill.status === "available" && !isCompleted;
  const isLocked = skill.status === "locked";

  const statusClass =
    isCompleted
      ? "bg-green-100 text-green-800"
      : isAvailable
      ? "bg-green-50 text-green-700 border border-green-200"
      : isLocked
      ? "bg-gray-100 text-gray-500"
      : "";

  const statusBorder =
    isCompleted
      ? "border-green-500"
      : isAvailable
      ? "border-green-200"
      : isLocked
      ? "border-gray-300"
      : "";

  const crownClass = skill.crowns > 0 ? "crown" : "";

  return (
    <button
      key={skill.id}
      className={`group relative w-full h-24 rounded-lg border ${statusBorder} transition-all duration-300 hover:shadow-lg ${
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-green-50 hover:text-green-800"
      }`}
      onClick={() => {}}
    >
      {/* Lock icon for locked skills */}
      {isLocked && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
          🔒
        </div>
      )}

      {/* Skill title and progress */}
      <div className="absolute top-3 left-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {skill.order_index + 1}
        </span>
      </div>

      <div className="relative flex flex-col items-start p-4">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
          {skill.title}
        </h4>
        <p className="text-xs text-gray-400 line-clamp-1 mt-1">
          {skill.description || ""}
        </p>
      </div>

      {/* Progress ring */}
      <div className="mt-auto w-10 h-10 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            className="transition-stroke"
            strokeWidth={4}
            r={8}
            cx={12}
            cy={12}
          />
          <path
            className="transition-stroke"
            strokeWidth={4}
            fill="currentColor"
            d="M4.93 4l1.41 1.41L19.24 7l1.41 1.41L4.93 19.24l1.41-1.41L19.24 12.01l-1.41-1.41L4.93 4.93l-1.41 1.41z"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold {statusClass}">
            {skill.progress}%
          </span>
        </div>
      </div>

      {/* Crowns indicator */}
      {skill.crowns > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {Array.from({ length: skill.crowns }, (_, i) => (
            <svg
              key={i}
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3l5 9-5 9H5l5-9 5 9H3l5-9zM5 13h4l2-6H5z"
              />
            </svg>
          ))}
        </div>
      )}
    </button>
  );
}

/** Render a single skill card with its state. */
function renderSkillCard({
  skill,
  unitId,
  user,
}: {
  skill: PathData["units"][0]["skills"][0];
  unitId: number;
  user: UserProfile | undefined;
}) {
  // Determine skill status based on user progress
  const userSkill = skill.order_index === 1 ? user : undefined;

  let status: "locked" | "available" | "completed" = "locked";
  let progress = 0;
  let crowns = 0;

  if (user?.skill_progress) {
    const up = user.skill_progress.find(
      (sp) => sp.skill_id === skill.id
    );
    if (up) {
      progress = up.progress;
      crowns = up.crowns;
      completed = up.completed;

      if (up.completed) status = "completed";
      else if (up.progress > 0) status = "available";
      else status = "locked";
    }
  }

  // Unlock logic: skill is available if the previous skill is completed
  // For demo: unlock skills sequentially within a unit
  const allPreviousCompleted = true; // Simplified for demo

  if (status === "locked" && allPreviousCompleted) {
    status = "available";
  }

  return SkillCard({
    skill,
    unitId,
    user,
    status,
    progress,
    crowns,
  });
}