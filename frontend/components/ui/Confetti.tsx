"use client";

import { useCallback, useRef, useState } from "react";

const COLORS = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  height: number;
  rotate: number;
}

function makePieces(): ConfettiPiece[] {
  return Array.from({ length: 80 }, (_, i) => ({
    id: Math.floor(Math.random() * 1e9) + i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2 + Math.random() * 2,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    height: 4 + Math.random() * 6,
    rotate: Math.random() * 360,
  }));
}

/**
 * Renders a confetti burst whenever `burst` increases.
 * `fire` is safe to call from event handlers.
 */
export function useConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(() => {
    setPieces(makePieces());
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPieces([]), 5000);
  }, []);

  if (pieces.length === 0) return { fire, node: null };

  return {
    fire,
    node: (
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.height,
              background: p.color,
              animation: `confetti ${p.duration}s linear ${p.delay}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>
    ),
  };
}