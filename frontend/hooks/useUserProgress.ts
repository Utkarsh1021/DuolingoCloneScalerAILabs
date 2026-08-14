/** Hook for fetching and managing user profile & progress. */
"use client";

import { useEffect, useState, useCallback } from "react";
import { getMe, getPath } from "@/lib/api";
import type { UserProfile, PathData } from "@/lib/types";

export function useUserProgress() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [path, setPath] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [userData, pathData] = await Promise.all([getMe(), getPath()]);
      setUser(userData);
      setPath(pathData);
    } catch (err) {
      console.error("Failed to fetch user progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [userData, pathData] = await Promise.all([getMe(), getPath()]);
      if (!active) return;
      setUser(userData);
      setPath(pathData);
      setLoading(false);
    })().catch((err) => {
      if (!active) return;
      console.error("Failed to fetch user progress:", err);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { user, path, loading, refresh: load };
}