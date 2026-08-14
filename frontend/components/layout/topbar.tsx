"use client";

import Link from "next/link";
import { useUserProgress } from "@/hooks/useUserProgress";
import { DuoOwl, FlameIcon, HeartIcon, CrystalIcon, StarIcon } from "@/components/icon";

export default function TopBar() {
  const { user } = useUserProgress();

  const xpToday = user?.xp_today ?? 0;
  const dailyGoal = user?.daily_goal ?? 20;
  const goalPct = Math.min(100, Math.round((xpToday / dailyGoal) * 100));

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-duo-mist">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/learn">
            <DuoOwl className="w-8 h-8" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-base font-extrabold text-duo-ink">
            <FlameIcon className="w-6 h-6 text-duo-red" />
            {user?.streak ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Daily goal */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-3 rounded-full bg-duo-mist overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-duo-yellow to-duo-red transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <StarIcon className="w-5 h-5 text-duo-yellow" />
            <span className="text-sm font-extrabold text-duo-ink">{xpToday}</span>
          </div>

          {/* Gems */}
          <span className="flex items-center gap-1.5 text-base font-extrabold text-duo-ink">
            <CrystalIcon className="w-6 h-6 text-duo-teal" />
            {user?.gems ?? 0}
          </span>

          {/* Hearts */}
          <span className="flex items-center gap-1.5 text-base font-extrabold text-duo-ink">
            <HeartIcon className="w-6 h-6 text-duo-red" />
            {user?.hearts ?? 5}
          </span>
        </div>
      </div>
    </header>
  );
}