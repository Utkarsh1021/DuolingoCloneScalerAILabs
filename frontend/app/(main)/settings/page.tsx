"use client";

import { useState } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { DuoOwl } from "@/components/icon";

interface ToggleProps {
  label: string;
  desc?: string;
}

function ToggleRow({ label, desc }: ToggleProps) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="w-full flex items-center justify-between rounded-2xl border-2 border-duo-mist bg-white p-5 text-left hover:bg-duo-faint/40 transition-colors"
    >
      <div>
        <p className="font-extrabold text-duo-ink">{label}</p>
        {desc && <p className="text-sm text-duo-slate font-bold">{desc}</p>}
      </div>
      <span
        className={`relative w-12 h-7 rounded-full transition-colors ${
          on ? "bg-duo-green" : "bg-duo-slate"
        }`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { user, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <DuoOwl className="w-16 h-16 animate-float" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-duo-ink mb-1">Settings</h1>
      <p className="text-duo-slate font-bold mb-6">
        {user?.name}&apos;s account and preferences
      </p>

      <section className="mb-8">
        <h2 className="font-extrabold text-duo-ink mb-3">Profile</h2>
        <div className="rounded-2xl border-2 border-duo-mist bg-white p-5 flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-full bg-duo-green-light text-duo-green flex items-center justify-center font-extrabold text-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-duo-ink">{user?.name}</p>
            <p className="text-sm text-duo-slate font-bold">{user?.email}</p>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-duo-mist bg-white p-5">
          <p className="font-extrabold text-duo-ink mb-1">Daily Goal</p>
          <p className="text-sm text-duo-slate font-bold">
            {user?.daily_goal} XP per day
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-extrabold text-duo-ink mb-3">Notications</h2>
        <div className="space-y-3">
          <ToggleRow
            label="Streak reminders"
            desc="Keep your streak alive with gentle nudges"
          />
          <ToggleRow
            label="Achievements"
            desc="Celebrate when you unlock new badges"
          />
          <ToggleRow label="Sound effects" desc="Play sounds during lessons" />
        </div>
      </section>

      <section>
        <h2 className="font-extrabold text-duo-ink mb-3">Privacy</h2>
        <div className="space-y-3">
          <ToggleRow label="Show me on the leaderboard" desc="Visible to other learners" />
          <button
            className="w-full rounded-2xl border-2 border-duo-red/30 bg-duo-red/5 p-5 text-left font-extrabold text-duo-red hover:bg-duo-red/10 transition-colors"
          >
            Reset my progress
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-duo-slate font-bold">
        Settings are placeholders for this demo build.
      </p>
    </div>
  );
}