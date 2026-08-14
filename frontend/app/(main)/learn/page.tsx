"use client";

import Link from "next/link";
import { useUserProgress } from "@/hooks/useUserProgress";
import type { SkillProgress, Unit } from "@/lib/types";
import {
  DuoOwl,
  LockIcon,
  StarIcon,
  CrownIcon,
  CheckIcon,
  ZapIcon,
  HomeIcon,
} from "@/components/icon";

const UNIT_COLORS = [
  { banner: "from-duo-green to-duo-teal", badge: "bg-duo-green", ring: "ring-duo-green", text: "text-duo-green" },
  { banner: "from-duo-blue to-duo-purple", badge: "bg-duo-blue", ring: "ring-duo-blue", text: "text-duo-blue" },
  { banner: "from-duo-orange to-duo-red", badge: "bg-duo-orange", ring: "ring-duo-orange", text: "text-duo-orange" },
];

const SKILL_EMOJI: Record<number, string> = {
  1: "👋",
  2: "🍎",
  3: "👨‍👩‍👧",
  4: "🔢",
  5: "💬",
};

export default function LearnPage() {
  const { user, path, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <DuoOwl className="w-16 h-16 animate-float" />
        <span className="text-duo-slate font-bold">Loading your path…</span>
      </div>
    );
  }

  if (!path || path.units.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <DuoOwl className="w-20 h-20 animate-pop" />
        <p className="text-xl font-extrabold text-duo-ink">Nothing here yet!</p>
        <p className="text-duo-slate">Your course is being prepared.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4">
      {/* Course header */}
      <div className="flex items-center justify-between px-2 py-4">
        <div>
          <h1 className="text-2xl font-extrabold text-duo-ink">
            Spanish{" "}
            <Link href="/learn" className="text-duo-slate font-bold text-sm">
              ·
            </Link>
          </h1>
          <p className="text-sm text-duo-slate font-medium">
            {user?.name ? `${user.name}, you're doing great!` : "Keep learning!"}
          </p>
        </div>
      </div>

      {/* Weekly quest teaser */}
      <div className="mx-2 mb-6 rounded-2xl bg-gradient-to-r from-duo-green-light to-duo-blue/10 border border-duo-green/20 p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center">
          <ZapIcon className="w-6 h-6 text-duo-blue" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-duo-ink text-sm">Weekly Quest</p>
          <p className="text-xs text-duo-slate">
            Complete {Math.max(0, 10 - (user?.xp ?? 0))} XP to earn 10 gems
          </p>
        </div>
        <StarIcon className="w-5 h-5 text-duo-yellow" />
      </div>

      {/* Path */}
      <div className="relative">
        {path.units.map((unit, unitIdx) => (
          <PathUnit
            key={unit.id}
            unit={unit}
            colorIdx={unitIdx % UNIT_COLORS.length}
          />
        ))}
      </div>

      <div className="py-10 text-center">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-duo-blue font-extrabold text-sm hover:underline"
        >
          <HomeIcon className="w-5 h-5" />
          Back to profile
        </Link>
      </div>
    </div>
  );
}

function PathUnit({
  unit,
  colorIdx,
}: {
  unit: Unit;
  colorIdx: number;
}) {
  const colors = UNIT_COLORS[colorIdx];
  return (
    <section className="mb-4">
      {/* Unit banner */}
      <div
        className={`sticky top-16 z-10 flex items-center justify-between rounded-2xl bg-gradient-to-r ${colors.banner} px-5 py-3 text-white shadow-lg mb-6`}
      >
        <span className="font-extrabold text-lg drop-shadow-sm">
          {unit.title}
        </span>
        <span className="flex items-center gap-1">
          {unit.skills.reduce((acc, s) => acc + s.crowns, 0)}{" "}
          <CrownIcon className="w-5 h-5" />
        </span>
      </div>

      {/* Winding road + nodes */}
      <div className="relative">
        <Road
          count={unit.skills.length}
          currentIndex={
            unit.skills.findIndex((s) => s.status !== "completed") < 0
              ? unit.skills.length
              : unit.skills.findIndex((s) => s.status !== "completed")
          }
        />
        <div className="relative flex flex-col">
          {unit.skills.map((skill, idx) => (
            <PathNode
              key={skill.id}
              skill={skill}
              side={idx % 2 === 0 ? "left" : "right"}
              current={
                skill.status !== "completed" &&
                unit.skills.findIndex((s) => s.status !== "completed") === idx
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Thick rounded road winding between the node centers, styled like Duolingo. */
function Road({ count, currentIndex }: { count: number; currentIndex: number }) {
  const LEFT = 22;
  const RIGHT = 78;
  const ROW = 100; // each node row spans 100 viewBox units vertically

  const points = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? LEFT : RIGHT,
    y: i * ROW + 50,
  }));

  const path = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    })
    .join(" ");

  // Green up to and including the current node; grey for the rest.
  const traveled = points.slice(0, Math.max(1, Math.min(currentIndex + 1, count)));
  const traveledPath = traveled
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = traveled[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const height = Math.max(count, 1) * ROW;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke="#e5e5e5"
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {traveledPath && (
        <path
          d={traveledPath}
          fill="none"
          stroke="#58cc02"
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function PathNode({
  skill,
  side,
  current,
}: {
  skill: SkillProgress;
  side: "left" | "right";
  current: boolean;
}) {
  const completed = skill.status === "completed";
  const locked = skill.status === "locked";
  const started = skill.status === "available" && skill.progress > 0;

  const emoji = SKILL_EMOJI[skill.order_index] ?? "⭐";
  const lessonHref = skill.first_lesson_id
    ? `/lesson/${skill.first_lesson_id}`
    : "/learn";

  const sidePos = side === "left" ? "left-[22%] -translate-x-1/2" : "right-[22%] translate-x-1/2";
  const actionPos =
    side === "left" ? "left-[36%] -translate-x-1/2" : "right-[36%] translate-x-1/2";

  const renderNode = () => {
    if (locked) {
      return (
        <div className="w-16 h-16 rounded-full bg-duo-mist ring-8 ring-duo-faint flex items-center justify-center text-duo-slate">
          <LockIcon className="w-7 h-7" />
        </div>
      );
    }

    if (completed) {
      return (
        <div className="relative w-16 h-16 rounded-full bg-duo-yellow ring-8 ring-duo-yellow/30 flex items-center justify-center shadow-lg">
          <span className="text-3xl">{emoji}</span>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-duo-green flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-white" />
          </span>
          {skill.crowns > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center gap-0.5 bg-white rounded-full px-1 shadow">
              {Array.from({ length: Math.min(skill.crowns, 2) }, (_, i) => (
                <CrownIcon key={i} className="w-3 h-3 text-duo-yellow" />
              ))}
            </span>
          )}
        </div>
      );
    }

    // Available / current
    return (
      <div
        className={`relative w-16 h-16 rounded-full bg-duo-green ring-8 ring-duo-green/20 flex items-center justify-center shadow-md ${
          current ? "animate-float" : ""
        }`}
      >
        <span className="text-3xl">{emoji}</span>
        {started && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold text-duo-green border border-duo-green/30">
            {skill.progress}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-24 flex items-center">
      {/* Node */}
      <div className={`absolute top-1/2 -translate-y-1/2 ${sidePos} ${
        locked ? "opacity-70" : ""
      }`}>
        {locked ? (
          renderNode()
        ) : (
          <Link href={lessonHref} className="group relative block">
            {renderNode()}
          </Link>
        )}
      </div>

      {/* Action bubble for the current available node */}
      {current && skill.first_lesson_id && (
        <Link
          href={lessonHref}
          className={`absolute top-1/2 -translate-y-1/2 ${actionPos} inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold text-white shadow ${
            started ? "bg-duo-blue" : "bg-duo-green"
          }`}
        >
          {started ? "CONTINUE" : "START"}
        </Link>
      )}
    </div>
  );
}