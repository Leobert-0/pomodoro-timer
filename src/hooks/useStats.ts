import { useState, useCallback } from 'react';
import type { DailyStats } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { getLocalDateString, calculateStreak, calculateLongestStreak } from '../utils/streak';

export function useStats() {
  const [allStats, setAllStats] = useState<DailyStats[]>(() =>
    loadFromStorage<DailyStats[]>(STORAGE_KEYS.STATS, [])
  );

  const todayKey = getLocalDateString();
  const todayStats: DailyStats = allStats.find(s => s.date === todayKey)
    ?? { date: todayKey, completedSessions: 0, totalFocusMinutes: 0 };

  const currentStreak = calculateStreak(allStats);
  const longestStreak = calculateLongestStreak(allStats);

  const recordSession = useCallback((focusMinutes: number) => {
    setAllStats(prev => {
      const today = getLocalDateString();
      const existing = prev.find(s => s.date === today);
      let updated: DailyStats[];
      if (existing) {
        updated = prev.map(s => s.date === today ? {
          ...s,
          completedSessions: s.completedSessions + 1,
          totalFocusMinutes: s.totalFocusMinutes + focusMinutes,
        } : s);
      } else {
        updated = [...prev, {
          date: today,
          completedSessions: 1,
          totalFocusMinutes: focusMinutes,
        }];
      }
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 365);
      const cutoffStr = getLocalDateString(cutoff);
      const filtered = updated.filter(s => s.date >= cutoffStr);
      saveToStorage(STORAGE_KEYS.STATS, filtered);
      return filtered;
    });
  }, []);

  const weekStats: DailyStats[] = (() => {
    const result: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getLocalDateString(d);
      result.push(allStats.find(s => s.date === key) ?? {
        date: key, completedSessions: 0, totalFocusMinutes: 0,
      });
    }
    return result;
  })();

  return { allStats, todayStats, weekStats, currentStreak, longestStreak, recordSession };
}
