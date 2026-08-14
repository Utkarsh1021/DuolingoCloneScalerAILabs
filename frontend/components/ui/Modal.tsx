"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "@/components/icon";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  tone?: "light" | "red" | "green";
  showClose?: boolean;
}

export default function Modal({
  open,
  onClose,
  children,
  tone = "light",
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const bg =
    tone === "red"
      ? "bg-duo-red"
      : tone === "green"
      ? "bg-duo-green"
      : "bg-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-[fadein_.15s_ease-out]"
      style={{ animation: "fadein 0.15s ease-out" }}
      onClick={onClose}
    >
      <style>{`@keyframes fadein { from {opacity:0} to {opacity:1} }`}</style>
      <div
        className={`relative w-full max-w-md rounded-2xl ${bg} shadow-2xl animate-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-duo-slate hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}