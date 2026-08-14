"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckIcon, XIcon, StarIcon } from "@/components/icon";

export type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setRemoved((r) => new Set(r).add(id)), 2600);
  }, []);

  const dismiss = useCallback((id: number) => {
    setRemoved((r) => new Set(r).add(id));
  }, []);

  // Actually remove after the animation
  useEffect(() => {
    if (removed.size === 0) return;
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => !removed.has(x.id)));
      setRemoved(new Set());
    }, 350);
    return () => clearTimeout(timer);
  }, [removed]);

  const node = (
    <div className="fixed top-20 right-4 z-[70] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          tone={t.tone}
          leaving={removed.has(t.id)}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </div>
  );

  return { push, node };
}

function Toast({
  message,
  tone,
  leaving,
  onDismiss,
}: {
  message: string;
  tone: ToastTone;
  leaving: boolean;
  onDismiss: () => void;
}) {
  const styles = {
    success: "bg-duo-green text-white",
    error: "bg-duo-red text-white",
    info: "bg-duo-blue text-white",
  }[tone];

  return (
    <button
      onClick={onDismiss}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg animate-slide-up ${
        leaving ? "animate-slide-down opacity-0" : ""
      } ${styles}`}
    >
      {tone === "success" && <CheckIcon className="w-4 h-4" />}
      {tone === "error" && <XIcon className="w-4 h-4" />}
      {tone === "info" && <StarIcon className="w-4 h-4" />}
      {message}
    </button>
  );
}