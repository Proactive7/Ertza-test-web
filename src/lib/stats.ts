export const USER_RESULTS_KEY = "ertzatest_user_results";

export type StoredTestResult = {
  id: string;
  topicKey: string;
  topicName: string;
  dateISO: string;
  score: number;
  correct: number;
  incorrect: number;
  blank: number;
  answered: number;
  totalQuestions: number;
  pointsEarned: number;
  timeRemainingSeconds: number;
  timeSpentSeconds: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getStoredResults(): StoredTestResult[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(USER_RESULTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as StoredTestResult[];
  } catch {
    return [];
  }
}

export function saveTestResult(result: StoredTestResult): void {
  if (!canUseStorage()) return;

  const current = getStoredResults();
  const updated = [result, ...current];
  window.localStorage.setItem(USER_RESULTS_KEY, JSON.stringify(updated));
}

export function getAverageScore(results: StoredTestResult[]): number {
  if (!results.length) return 0;
  const total = results.reduce((sum, item) => sum + item.score, 0);
  return total / results.length;
}

export function getApprovedTestsCount(results: StoredTestResult[]): number {
  return results.filter((item) => item.score >= 20).length;
}

export function getRecentResults(
  results: StoredTestResult[],
  limit = 5
): StoredTestResult[] {
  return [...results]
    .sort(
      (a, b) =>
        new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    )
    .slice(0, limit);
}

export function getBestScore(results: StoredTestResult[]): number {
  if (!results.length) return 0;
  return Math.max(...results.map((item) => item.score));
}

export function getMostPlayedTopic(results: StoredTestResult[]): string {
  if (!results.length) return "Sin datos";

  const counts = new Map<string, number>();

  for (const result of results) {
    counts.set(result.topicName, (counts.get(result.topicName) ?? 0) + 1);
  }

  let winner = "Sin datos";
  let max = 0;

  for (const [topic, count] of counts.entries()) {
    if (count > max) {
      max = count;
      winner = topic;
    }
  }

  return winner;
}

function toDayKey(dateISO: string): string {
  const date = new Date(dateISO);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentStreak(results: StoredTestResult[]): number {
  if (!results.length) return 0;

  const uniqueDays = Array.from(new Set(results.map((item) => toDayKey(item.dateISO))))
    .sort((a, b) => (a < b ? 1 : -1));

  if (!uniqueDays.length) return 0;

  let streak = 1;
  let previousDate = new Date(`${uniqueDays[0]}T00:00:00`);

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const currentDate = new Date(`${uniqueDays[i]}T00:00:00`);
    const diffMs = previousDate.getTime() - currentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}