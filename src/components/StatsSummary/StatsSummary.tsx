import type { DailyStats } from '../../types';
import styles from './StatsSummary.module.css';

interface Props {
  todayStats: DailyStats;
  currentStreak: number;
  longestStreak: number;
}

export default function StatsSummary({ todayStats, currentStreak, longestStreak }: Props) {
  const hours = Math.floor(todayStats.totalFocusMinutes / 60);
  const mins = todayStats.totalFocusMinutes % 60;
  const focusTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.emoji}>🔥</span>
        <span className={styles.value}>{currentStreak}</span>
        <span className={styles.label}>Current Streak</span>
      </div>
      <div className={styles.card}>
        <span className={styles.emoji}>🏆</span>
        <span className={styles.value}>{longestStreak}</span>
        <span className={styles.label}>Longest Streak</span>
      </div>
      <div className={styles.card}>
        <span className={styles.emoji}>📊</span>
        <span className={styles.value}>{todayStats.completedSessions}</span>
        <span className={styles.label}>Today's Sessions</span>
      </div>
      <div className={styles.card}>
        <span className={styles.emoji}>⏱️</span>
        <span className={styles.value}>{focusTime}</span>
        <span className={styles.label}>Focus Time</span>
      </div>
    </div>
  );
}
