"use client";

import { useUserProgress } from "@/hooks/useUserProgress";
import { LeaderboardEntry } from "@/lib/types";

export default function ProfilePage() {
  const { user, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <span className="text-gray-500 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <span className="text-gray-500 text-lg">No profile data found</span>
      </div>
    );
  }

  // Calculate daily goal progress
  const dailyGoalProgress = Math.min(100, (user.xp % user.daily_goal) / user.daily_goal * 100);
  const totalSkillsCompleted = user.total_skills_completed;
  const achievementsCount = user.achievements_count;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 7V3m0 4v10m6-4h-10m16 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                fillRule="evenodd"
                d="M12 4v16m8-7H4m4 3h4m-4 8h.01M12 7v13"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-gray-400">Spanish Learner</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Streak */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-red-500">{user.streak}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Day Streak</div>
          </div>

          {/* XP */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-amber-400">{user.xp}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total XP</div>
          </div>

          {/* Hearts */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <div className="text-4xl text-red-400">{user.hearts} ❤️</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Hearts</div>
          </div>

          {/* Gems */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <div className="text-4xl text-teal-400">{user.gems}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Gems</div>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="bg-white/20 rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-medium mb-3">Daily Goal</h3>
          <div className="bg-gray-800 rounded-full h-4 w-full overflow-hidden">
            <div
              className`
                bg-gradient-to-r from-green-500 to-emerald-500
                h-full
                rounded-full
                transition-all
                duration-500
                ease-out
                ${dailyGoalProgress.toString() + "%"}
              `
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{user.xp % user.daily_goal}/{user.daily_goal} XP</span>
            <span>{Math.round(dailyGoalProgress)}%</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Array.from({ length: achievementsCount }, (_, i) => ({
            title: ["First Lesson", "7 Day Streak", "500 XP", "Perfect Lesson"][i] || "Achievement",
            description: ["Complete your first lesson", "Maintain a 7-day streak", "Earn 500 total XP", "Complete a lesson without losing a heart"][i] || ""
          }).map((ach, i) => (
            <div
              key={i}
              className`
                bg-white/20
                rounded
                p-4
                border border-white/10
                backdrop-blur-sm
                transition-all
                duration-300
              `
            >
              <div className="text-gray-300 text-sm">{ach.title}</div>
              <div className="text-xs text-gray-400 mt-1">{ach.description}</div>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Lessons completed</p>
            <p className="text-3xl font-bold mt-1">{Math.floor(Math.random() * 50) + 10}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Skills completed</p>
            <p className="text-3xl font-bold mt-1">{Math.floor(Math.random() * 10) + 3}</p>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => {}}
            className="w-full"
          >
            Practice More
          </Button>
          <Button
            variant="primary"
            onClick={() => {}}
            className="w-full mt-3"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}