import type { DailyStats } from '../types';

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreak(stats: DailyStats[]): number {
  const dateSet = new Set(
    stats.filter(s => s.completedSessions > 0).map(s => s.date)
  );

  const todayKey = getLocalDateString();
  const cursor = new Date();

  // If no sessions completed today yet, check starting from yesterday
  if (!dateSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = getLocalDateString(cursor);
    if (dateSet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateLongestStreak(stats: DailyStats[]): number {
  const activeDates = Array.from(
    new Set(stats.filter(s => s.completedSessions > 0).map(s => s.date))
  ).sort();

  if (activeDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1] + 'T00:00:00');
    const curr = new Date(activeDates[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}
