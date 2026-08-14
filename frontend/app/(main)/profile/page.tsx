"use client";

import Link from "next/link";
import { useUserProgress } from "@/hooks/useUserProgress";
import {
  DuoOwl,
  FlameIcon,
  StarIcon,
  HeartIcon,
  CrystalIcon,
  CrownIcon,
} from "@/components/icon";

const ACHIEVEMENTS = [
  { id: 1, icon: "🎯", title: "First Lesson", desc: "Complete your first lesson" },
  { id: 2, icon: "🔥", title: "7 Day Streak", desc: "Maintain a 7 day streak" },
  { id: 3, icon: "⭐", title: "XP Hunter", desc: "Earn 500 XP" },
  { id: 4, icon: "💯", title: "Perfect Lesson", desc: "Finish a lesson with no mistakes" },
];

export default function ProfilePage() {
  const { user, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <DuoOwl className="w-16 h-16 animate-float" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <DuoOwl className="w-20 h-20" />
        <p className="text-duo-slate font-bold">Couldn&apos;t load your profile.</p>
      </div>
    );
  }

  const xpToday = user.xp_today;
  const dailyGoal = user.daily_goal;
  const goalPct = Math.min(100, Math.round((xpToday / dailyGoal) * 100));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-duo-green to-duo-teal flex items-center justify-center text-duo-green-dark font-extrabold text-3xl text-white shadow-lg shrink-0">
          {user.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-duo-ink">{user.name}</h1>
          <p className="text-duo-slate font-bold">Spanish Learner</p>
        </div>
        <Link
          href="/settings"
          className="rounded-xl border-2 border-duo-mist px-4 py-2 text-sm font-extrabold text-duo-blue hover:bg-duo-faint transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<FlameIcon className="w-7 h-7 text-duo-red" />}
          value={user.streak}
          label="Day streak"
        />
        <StatCard
          icon={<StarIcon className="w-7 h-7 text-duo-yellow" />}
          value={user.xp}
          label="Total XP"
        />
        <StatCard
          icon={<HeartIcon className="w-7 h-7 text-duo-red" />}
          value={user.hearts}
          label="Hearts"
        />
        <StatCard
          icon={<CrystalIcon className="w-7 h-7 text-duo-teal" />}
          value={user.gems}
          label="Gems"
        />
      </div>

      {/* Daily goal */}
      <div className="rounded-2xl border-2 border-duo-mist bg-white p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-extrabold text-duo-ink">Daily Goal</p>
          <span className="text-sm font-bold text-duo-slate">
            {Math.min(user.xp, dailyGoal)}/{dailyGoal} XP
          </span>
        </div>
        <div className="h-4 rounded-full bg-duo-mist overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-duo-yellow to-duo-orange transition-all duration-700"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>

      {/* Completed skills */}
      <div className="rounded-2xl border-2 border-duo-mist bg-white p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-extrabold text-duo-ink">Skills completed</p>
          <p className="text-sm text-duo-slate font-bold">
            Keep going — practice makes progress!
          </p>
        </div>
        <div className="flex items-center gap-1">
          <CrownIcon className="w-8 h-8 text-duo-yellow" />
          <span className="text-3xl font-extrabold text-duo-ink">
            {user.total_skills_completed}
          </span>
        </div>
      </div>

      {/* Achievements */}
      <h2 className="font-extrabold text-lg text-duo-ink mb-3">
        Achievements
        <span className="ml-2 text-sm font-bold text-duo-slate">
          {user.achievements_count} unlocked
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked =
            user.earned_achievement_ids?.includes(ach.id) ?? false;
          return (
            <div
              key={ach.title}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 ${
                unlocked
                  ? "border-duo-yellow/50 bg-gradient-to-br from-duo-yellow/5 to-white"
                  : "border-duo-mist bg-white opacity-60 grayscale"
              }`}
            >
              <span className="text-4xl">{ach.icon}</span>
              <div>
                <p className="font-extrabold text-duo-ink">{ach.title}</p>
                <p className="text-sm text-duo-slate font-bold">{ach.desc}</p>
              </div>
              {unlocked && (
                <span className="ml-auto text-duo-yellow text-lg">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-duo-mist bg-white p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-2xl font-extrabold text-duo-ink leading-none">
          {value}
        </p>
        <p className="text-xs text-duo-slate font-bold mt-1">{label}</p>
      </div>
    </div>
  );
}