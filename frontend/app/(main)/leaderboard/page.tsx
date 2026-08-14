"use client";

import { useEffect, useState } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { getLeaderboard } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";
import { DuoOwl, TrophyIcon, FlameIcon, StarIcon } from "@/components/icon";

const MEDALS = ["🥇", "🥈", "🥉"];
const ROW_TONES = [
  "from-duo-yellow/15 border-duo-yellow/40",
  "from-duo-slate/10 border-duo-slate/30",
  "from-duo-orange/10 border-duo-orange/40",
];

export default function LeaderboardPage() {
  const { user } = useUserProgress();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myRank = user ? rows.findIndex((r) => r.xp === user.xp) + 1 : rows.length + 1;
  const division = 8 - rows.findIndex((r) => r.xp === user?.xp) - 1;
  const promotionPts = 7 + division;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* League header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-duo-ink">Weekly Challenge</h1>
        <p className="text-duo-slate font-medium">Gold League · ends in 2d 14h</p>
      </div>

      {/* Division card */}
      <div className="rounded-2xl bg-gradient-to-br from-duo-yellow to-duo-orange p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <p className="text-sm font-extrabold uppercase tracking-wide opacity-90 mb-1">
          Your position
        </p>
        <p className="text-4xl font-extrabold mb-2">#{Math.max(1, myRank)}</p>
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5" />
          <span className="font-bold">
            You&apos;re in line to promote. Earn{" "}
            <span className="text-white font-extrabold">{promotionPts} XP</span> more to
            secure a spot.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <DuoOwl className="w-14 h-14 animate-float" />
          <span className="text-duo-slate font-bold">Loading the league…</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-20 text-center text-duo-slate font-bold">
          No rivals yet — start a lesson to claim first place!
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((entry, i) => (
            <LeaderboardRow
              key={`${entry.name}-${entry.rank}`}
              entry={entry}
              isMe={user != null && entry.xp === user.xp}
              tone={ROW_TONES[i % ROW_TONES.length]}
              medal={i < 3 ? MEDALS[i] : null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  isMe,
  tone,
  medal,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  tone: string;
  medal: string | null;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-r px-4 py-3 ${
        isMe ? "border-duo-green bg-duo-green/5" : "border-transparent bg-white"
      } ${!isMe ? tone : ""}`}
    >
      <span className="w-8 text-center font-extrabold text-duo-ink text-lg shrink-0">
        {medal ?? entry.rank}
      </span>
      <div className="w-10 h-10 rounded-full bg-duo-green-light text-duo-green flex items-center justify-center font-extrabold shrink-0">
        {entry.name[0]?.toUpperCase()}
      </div>
      <span className="flex-1 font-extrabold text-duo-ink truncate">
        {entry.name}
        {isMe && (
          <span className="ml-2 text-xs font-bold text-duo-green">You</span>
        )}
      </span>
      <span className="flex items-center gap-1 text-xs text-duo-slate font-bold">
        <FlameIcon className="w-4 h-4 text-duo-red" />
        {entry.streak}
      </span>
      <span className="flex items-center gap-1 font-extrabold text-duo-ink">
        <StarIcon className="w-4 h-4 text-duo-yellow" />
        {entry.xp}
      </span>
    </li>
  );
}