"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProgress } from "@/hooks/useUserProgress";
import {
  DuoOwl,
  FlameIcon,
  CrystalIcon,
  HeartIcon,
  HomeIcon,
  TrophyIcon,
  ProfileIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/icon";

const NAV = [
  { href: "/learn", label: "Learn", icon: HomeIcon, activeColor: "text-duo-green" },
  { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon, activeColor: "text-duo-orange" },
  { href: "/profile", label: "Profile", icon: ProfileIcon, activeColor: "text-duo-blue" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, activeColor: "text-duo-purple" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserProgress();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-duo-mist bg-white sticky top-0 h-screen px-4 py-6">
      <Link href="/learn" className="flex items-center gap-2 mb-8 px-2">
        <DuoOwl className="w-9 h-9" />
        <span className="text-2xl font-extrabold text-duo-green tracking-tight">
          duolingo
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, activeColor }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                active ? "bg-duo-faint text-duo-ink" : "text-duo-slate hover:bg-duo-faint/60 hover:text-duo-ink"
              }`}
            >
              <span className={`${active ? activeColor : "text-duo-slate"} group-hover:text-duo-ink`}>
                <Icon className="w-6 h-6" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-duo-mist pt-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-duo-green-light flex items-center justify-center text-duo-green font-extrabold text-lg">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-duo-ink truncate">
              {user?.name ?? "Learner"}
            </p>
            <p className="text-xs text-duo-slate">{user?.streak ?? 0} day streak</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUserProgress();
  const xpToday = user?.xp ?? 0;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-duo-mist bg-white">
      <div className="grid grid-cols-4">
        {NAV.map(({ href, label, icon: Icon, activeColor }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold ${
                active ? activeColor : "text-duo-slate"
              }`}
            >
              <Icon className="w-6 h-6" />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-duo-mist/60 px-4 py-2 flex items-center justify-between text-xs font-bold text-duo-ink">
        <span className="flex items-center gap-1">
          <FlameIcon className="w-4 h-4 text-duo-red" /> {user?.streak ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-duo-yellow" /> {xpToday} XP
        </span>
        <span className="flex items-center gap-1">
          <HeartIcon className="w-4 h-4 text-duo-red" /> {user?.hearts ?? 5}
        </span>
        <span className="flex items-center gap-1">
          <CrystalIcon className="w-4 h-4 text-duo-teal" /> {user?.gems ?? 0}
        </span>
      </div>
    </nav>
  );
}