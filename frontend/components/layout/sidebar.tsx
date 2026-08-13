"use client";

import Link from "next/link";
import { useUserProgress } from "@/hooks/useUserProgress";

export default function Sidebar() {
  const { user, path } = useUserProgress();

  return (
    <aside className="bg-green-900 text-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Duolingo</h1>
        <div className="text-sm opacity-80">Learn Spanish</div>
      </div>

      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              href="/learn"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                !path || path.units.length === 0 ? "bg-green-800" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2l-2-2m0 0l-7 7 7 7"
                />
              </svg>
              Learn
            </Link>
          </li>
          <li>
            <Link
              href="/leaderboard"
              className="flex items-center gap-3 px-3 py-2 text-sm opacity-60">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Leaderboard
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm opacity-60">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 3v2h20v2H3V3zm0 4h6v16H3V7zm0 4h6v16H3V11z" />
              </svg>
              Profile
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-sm uppercase tracking-wider opacity-60 mb-4">Quick Actions</h3>
        <ul className="space-y-2">
          <li>
            <Button
              variant="outline"
              onClick={() => {}}
              className="text-sm">
              Practice
            </Button>
          </li>
          <li>
            <Button variant="outline" onClick={() => {}} className="text-sm">
              Settings
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
}