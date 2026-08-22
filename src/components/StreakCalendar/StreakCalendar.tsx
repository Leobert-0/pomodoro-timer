import { useState } from 'react';
import type { DailyStats } from '../../types';
import { getLocalDateString } from '../../utils/streak';
import styles from './StreakCalendar.module.css';

interface Props {
  stats: DailyStats[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StreakCalendar({ stats }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [showInfo, setShowInfo] = useState(false);

  const sessionMap = new Map(stats.map(s => [s.date, s]));

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayKey = getLocalDateString(today);

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (!isCurrentMonth) {
      setViewDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  const handleCurrentMonth = () => {
    setViewDate(new Date());
  };

  // Month days calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate days for this specific month
  const days = [];
  let monthTotalSessions = 0;
  let monthTotalMinutes = 0;

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayStat = sessionMap.get(dateKey);
    const count = dayStat?.completedSessions || 0;
    const minutes = dayStat?.totalFocusMinutes || 0;

    monthTotalSessions += count;
    monthTotalMinutes += minutes;

    days.push({
      dayNum,
      dateKey,
      count,
      minutes,
      isToday: dateKey === todayKey,
    });
  }

  const maxCount = Math.max(1, ...days.map(d => d.count));

  function getLevel(count: number): string {
    if (count === 0) return styles.level0;
    if (count <= maxCount * 0.25) return styles.level1;
    if (count <= maxCount * 0.5) return styles.level2;
    if (count <= maxCount * 0.75) return styles.level3;
    return styles.level4;
  }

  const hours = Math.floor(monthTotalMinutes / 60);
  const mins = monthTotalMinutes % 60;
  const focusTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className={styles.container}>
      {/* Month Header & Controls */}
      <div className={styles.calendarHeader}>
        <div className={styles.monthTitleWrapper}>
          <span className={styles.monthTitle}>{monthLabel}</span>
          <button
            type="button"
            className={`${styles.infoBtn} ${showInfo ? styles.infoBtnActive : ''}`}
            onClick={() => setShowInfo(prev => !prev)}
            title="How streak works"
            aria-label="How streak works"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>

        <div className={styles.navControls}>
          {!isCurrentMonth && (
            <button
              type="button"
              className={styles.todayBtn}
              onClick={handleCurrentMonth}
              title="Jump to current month"
            >
              Today
            </button>
          )}
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrevMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${isCurrentMonth ? styles.navBtnDisabled : ''}`}
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
            title={isCurrentMonth ? 'Current month' : 'Next month'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Streak Explanation Info Card */}
      {showInfo && (
        <div className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <span className={styles.infoTitle}>🔥 How Streaks Work</span>
            <button className={styles.infoClose} onClick={() => setShowInfo(false)} aria-label="Close info">×</button>
          </div>
          <p className={styles.infoText}>
            • Complete at least <strong>1 Pomodoro session</strong> daily to build and maintain your streak.
          </p>
          <p className={styles.infoText}>
            • The calendar shows every day of the month with color brightness reflecting how many sessions you finished that day.
          </p>
          <p className={styles.infoText}>
            • Use the <strong>&lt;</strong> and <strong>&gt;</strong> buttons to browse your history in previous months.
          </p>
        </div>
      )}

      {/* Weekday Labels (7 Columns) */}
      <div className={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <span key={day} className={styles.weekdayLabel}>{day}</span>
        ))}
      </div>

      {/* Month Calendar Grid */}
      <div className={styles.monthGrid}>
        {/* Leading empty padding days for starting weekday alignment */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} className={styles.emptyDay} />
        ))}

        {/* Days of current month */}
        {days.map(d => (
          <div
            key={d.dateKey}
            className={`${styles.dayCell} ${getLevel(d.count)} ${d.isToday ? styles.todayCell : ''}`}
            title={`${d.dateKey}: ${d.count} session${d.count !== 1 ? 's' : ''} (${d.minutes}m focus)`}
          >
            <span className={styles.dayNumber}>{d.dayNum}</span>
            {d.count > 0 && <span className={styles.dotIndicator} />}
          </div>
        ))}
      </div>

      {/* Monthly Summary & Legend */}
      <div className={styles.calendarFooter}>
        <div className={styles.monthStats}>
          <span className={styles.monthStatItem}>
            <strong>{monthTotalSessions}</strong> session{monthTotalSessions !== 1 ? 's' : ''}
          </span>
          <span className={styles.dotDivider}>•</span>
          <span className={styles.monthStatItem}>
            <strong>{focusTimeStr}</strong> focus
          </span>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          <div className={`${styles.legendDot} ${styles.level0}`} />
          <div className={`${styles.legendDot} ${styles.level1}`} />
          <div className={`${styles.legendDot} ${styles.level2}`} />
          <div className={`${styles.legendDot} ${styles.level3}`} />
          <div className={`${styles.legendDot} ${styles.level4}`} />
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>
    </div>
  );
}
