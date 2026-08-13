"use client";

import { useUserProgress } from "@/hooks/useUserProgress";
import { XpValues } from "@/lib/types";

export default function TopBar() {
  const { user } = useUserProgress();

  if (!user) {
    return (
      <div className="bg-white/20 backdrop-blur-sm min-h-14">
        <div className="flex items-center justify-between px-6 py-2">
          <span className="text-white/80 text-sm">Duolingo</span>
          <span className="text-white/60 text-xs">Log in</span>
        </div>
      </div>
    );
  }

  return (
    <header className="bg-white/20 backdrop-blur-sm min-h-14 border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 7V3m0 4v10m6-4h-10m16 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
            <path
              d="M12 4v16m8-7H4m4 3h4m-4 8h.01M12 7v13"
            />
          </svg>
          <span className="font-bold text-lg">Duolingo</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="flex items-center gap-1 text-sm">
            <svg
              className="w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M8 4c1.657 0 3 .683 3 1.5S9.657 7 8 7s-3-.683-3-1.5S6.343 4 8 4zm0 3c1.397 0 2.771.478 3.996 1.32l3.028 2.876 1.51-2.443C13.771 5.478 12.398 5 11 5s-2.771.478-3.996 1.32L3.168 5.939A4.99 4.99 0 004 8c0 1.397.478 2.771 1.325 3.996l2.876 3.028-2.443 1.51c-1.32.771-1.997 1.996-1.996 3.996s.771 3.225 1.325 4.599l1.324 2.876C6.343 17 8 18.657 8 20s.657-.683 1.5-1.5l3.029-2.875 1.512 2.443c.772 1.247 1.998 1.823 3.668 1.35 3.003-.57 4.894-2.057 5.436-4.303z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">{user.streak} day{user.streak !== 1 ? "s" : ""} streak</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 text-sm">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M22 11.08V12a1 1 0 01-1 1h-7.72a1 1 0 01-.95-.58L12 15.72a1 1 0 01-.58-.95l3.16-3.17a1 1 0 01.58-.57h1.9a1 1 0 011 1.08z"
              />
              <path
                fillRule="evenodd"
                d="M2 7a2 2 0 012-2h2.586a2 2 0 011.414l9.143 9.143a1 1 0 010 1.414l-9.143 9.143a2 2 0 01-1.414-1.415H10a2 2 0 01-2-2V7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">{user.xp} XP</span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1 text-sm">
            <svg
              className="w-4 h-4 text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M16.75 15.75c-.66 0-1.267.16-1.825.45l3.5 3.5c.03.03.045.07.045.11 0 .11-.05.217-.14.3l-2.15 2.15a.75.75 0 11-1.06-.85l1.46-3.06a.75.75 0 01.85-1.06zm-3.5 2.15a.75.75 0 100-1.5.75.75 0 001.5 1.5zM5.75 11.75a.75.75 0 100-1.5.75.75 0 001.5 1.5zm7.5 0a.75.75 0 100-1.5.75.75 0 001.5 1.5zm3.75-5.25a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM8.5 13.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM12 16.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM15.25 13.75a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">{user.hearts} heart{user.hearts !== 1 ? "s" : ""}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 text-sm">
            <svg
              className="w-4 h-4 text-teal-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M10 8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-2v-2zm4-6a6 6 0 00-7.743 2.242l-.241.068a6 6 0 01-1.578-5.053l-1.992-.603a6 6 0 01-2.562.906l-.715 2.145a6 6 0 01-.596 3.567l-.005.088a6 6 0 01-1.382 3.058l-1.538.385a6 6 0 01-3.755-.557l-.725-1.987a6 6 0 01-.427-3.228l-.136.046a6 6 0 01-.332-1.5l-.084-.363a6 6 0 01-.186-.875L3.287 5.607a6 6 0 01.962-6.437l1.57 1.586zm9.742 5.053l-.822-.347-.236-.07A6 6 0 0120.77 7.25l.85.6l.85.6c.368.28.743.533 1.213.603l.615.15a6 6 0 014.888 1.298l.213.056a6 6 0 015.598 4.275l-.185.553.013.055a6 6 0 01.087.256zM2.78 4.393a6 6 0 01-.54-.857l-.165-.058-.005-.033a6 6 0 01-.34-.673l-.468-.836.836.468a6 6 0 01.673.34l-.033-.005-.033-.005a6 6 0 01-.673-.34l-.836.468.468-.836a6 6 0 01-.673-.34l-.005-.033-.033-.005a6 6 0 01-.673-.34l-.836.468.836-.468a6 6 0 01-.34.673l.005.033a6 6 0 01.087.256l.013.055-.185-.553z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">{user.gems} gems</span>
          </div>
        </div>
      </div>
    </header>
  );
}