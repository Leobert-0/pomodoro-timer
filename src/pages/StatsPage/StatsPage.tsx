import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStats } from '../../hooks/useStats';
import StatsSummary from '../../components/StatsSummary/StatsSummary';
import StreakCalendar from '../../components/StreakCalendar/StreakCalendar';
import WeeklyChart from '../../components/WeeklyChart/WeeklyChart';
import styles from './StatsPage.module.css';

export default function StatsPage() {
  const { allStats, todayStats, weekStats, currentStreak, longestStreak } = useStats();

  useEffect(() => {
    document.body.setAttribute('data-mode', 'work');
    document.title = 'Statistics — Pomodoro';
    return () => { document.body.removeAttribute('data-mode'); };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Statistics</h1>
        <Link to="/" className={styles.backLink} aria-label="Back to Timer" title="Back to Timer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
      </header>

      <StatsSummary
        todayStats={todayStats}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Monthly Streak Activity</h2>
        <StreakCalendar stats={allStats} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>This Week</h2>
        <WeeklyChart stats={weekStats} />
      </section>
    </div>
  );
}
