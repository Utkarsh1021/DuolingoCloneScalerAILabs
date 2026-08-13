/** Hook for fetching and managing user profile & progress. */
import { useEffect, useState } from "react";
import { getMe, getPath, getLeaderboard, type UserProfile, type PathData, type LeaderboardEntry } from "@/lib/api";

export function useUserProgress() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [path, setPath] = useState<PathData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, pathData, leaderboardData] = await Promise.all([
          getMe(),
          getPath(),
          getLeaderboard(),
        ]);
        setUser(userData);
        setPath(pathData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Failed to fetch user progress:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { user, path, leaderboard, loading };
}