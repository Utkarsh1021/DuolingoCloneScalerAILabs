"use client";

import { useUserProgress, getLeaderboard } from "@/lib/api";
import { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const { user } = useUserProgress();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <span className="text-gray-500 text-lg">Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="border-b border-gray-700 py-4 mb-6">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-gray-400 text-sm">Weekly competition</p>
        </header>

        {loading
          ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <span className="text-gray-500">Loading leaderboard...</span>
            </div>
          )
          : leaderboard.length === 0
          ? (
            <div className="min-h-[400px] text-center text-gray-400">
              <p>No leaderboard data available</p>
              <p className="mt-2">Be the first to complete a lesson!</p>
            </div>
          )
          : (
            <div className="space-y-4">
              {/* Our user's position */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-2">
                  Your Position
                </h3>
                <p className="text-3xl font-extrabold">
                  #{findUserRank(user, leaderboard)}
                </p>
                <p className="text-green-300">
                  {user?.xp ?? 0} XP
                </p>
              </div>

              {/* Leaderboard entries */}
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className`
                      flex items-center gap-4
                      px-4
                      py-3
                      rounded-lg
                        ${index < 3
                          ? "bg-yellow-500/20 border-yellow-500"
                          : "bg-white/20 border-gray-700"
                        }
                      transition-all
                      duration-200
                    `
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-gray-400">{entry.streak} day streak</p>
                    </div>
                    <span className="text-amber-400 font-medium">{entry.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

/** Find user's rank in the leaderboard. */
function findUserRank(
  user: UserProfile | undefined,
  leaderboard: LeaderboardEntry[]
): number {
  if (!user) return leaderboard.length + 1;

  const userXp = user.xp;
  // Count how many users have more XP
  const higherRank = leaderboard.filter((e) => e.xp > userXp).length;
  return higherRank + 1;
}