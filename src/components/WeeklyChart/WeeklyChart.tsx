import type { DailyStats } from '../../types';
import styles from './WeeklyChart.module.css';

interface Props {
  stats: DailyStats[];
}

export default function WeeklyChart({ stats }: Props) {
  const maxSessions = Math.max(1, ...stats.map(s => s.completedSessions));

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {stats.map(day => {
          const height = (day.completedSessions / maxSessions) * 100;
          const label = new Date(day.date + 'T00:00').toLocaleDateString('en', { weekday: 'short' });
          return (
            <div key={day.date} className={styles.column}>
              <span className={styles.count}>{day.completedSessions}</span>
              <div className={styles.barWrapper}>
                <div className={styles.barFill} style={{ height: `${Math.max(height, 2)}%` }} />
              </div>
              <span className={styles.dayLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
