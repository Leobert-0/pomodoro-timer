import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { DailyStats } from '../../types';
import { getLocalDateString } from '../../utils/streak';
import styles from './StreakCalendar.module.css';

interface Props {
  stats: DailyStats[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE_PX = 10;

interface CalendarDay {
  dayNum: number;
  dateKey: string;
  count: number;
  minutes: number;
  isToday: boolean;
  isFuture: boolean;
}

export default function StreakCalendar({ stats }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [showInfo, setShowInfo] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef({ x: 0, y: 0 });
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const sessionMap = new Map(stats.map(s => [s.date, s]));

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayKey = getLocalDateString(today);

  // Month navigation
  const handlePrevMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (!isCurrentMonth) {
      setSelectedDay(null);
      setViewDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  const handleCurrentMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date());
  };

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const openDayDetails = (day: CalendarDay, trigger: HTMLButtonElement) => {
    if (day.isFuture) return;
    triggerRef.current = trigger;
    setSelectedDay(day);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, day: CalendarDay) => {
    if (event.button !== 0 || day.isFuture) return;
    clearLongPress();
    pressStartRef.current = { x: event.clientX, y: event.clientY };
    const trigger = event.currentTarget;
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      openDayDetails(day, trigger);
      navigator.vibrate?.(20);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dx = event.clientX - pressStartRef.current.x;
    const dy = event.clientY - pressStartRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearLongPress();
  };

  const closeDayDetails = useCallback(() => {
    setSelectedDay(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    dialogCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDayDetails();
      if (event.key === 'Tab') {
        event.preventDefault();
        dialogCloseRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDayDetails, selectedDay]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  // Month days calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate days for this specific month
  const days: CalendarDay[] = [];
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
      isFuture: dateKey > todayKey,
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

  const selectedFocusTime = selectedDay
    ? (() => {
        const selectedHours = Math.floor(selectedDay.minutes / 60);
        const selectedMinutes = selectedDay.minutes % 60;
        return selectedHours > 0 ? `${selectedHours}h ${selectedMinutes}m` : `${selectedMinutes}m`;
      })()
    : '';

  const selectedDateLabel = selectedDay
    ? new Date(
        Number(selectedDay.dateKey.slice(0, 4)),
        Number(selectedDay.dateKey.slice(5, 7)) - 1,
        Number(selectedDay.dateKey.slice(8, 10)),
      ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

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
            • Long-press a day to view its completed sessions and focus time.
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
          <button
            type="button"
            key={d.dateKey}
            className={`${styles.dayCell} ${getLevel(d.count)} ${d.isToday ? styles.todayCell : ''} ${d.isFuture ? styles.futureCell : ''}`}
            title={`${d.dateKey}: ${d.count} session${d.count !== 1 ? 's' : ''} (${d.minutes}m focus)`}
            aria-label={`${d.dateKey}: ${d.count} completed Pomodoro${d.count !== 1 ? 's' : ''}, ${d.minutes} minutes of focus. Long press for details.`}
            disabled={d.isFuture}
            onPointerDown={event => handlePointerDown(event, d)}
            onPointerMove={handlePointerMove}
            onPointerUp={clearLongPress}
            onPointerCancel={clearLongPress}
            onPointerLeave={clearLongPress}
            onContextMenu={event => event.preventDefault()}
            onClick={event => {
              if (event.detail === 0) openDayDetails(d, event.currentTarget);
            }}
          >
            <span className={styles.dayNumber}>{d.dayNum}</span>
            {d.count > 0 && <span className={styles.dotIndicator} />}
          </button>
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

      {selectedDay && (
        <div className={styles.sheetBackdrop} onPointerDown={closeDayDetails}>
          <section
            className={styles.detailSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-detail-title"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className={styles.sheetHandle} aria-hidden="true" />
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailEyebrow}>Daily progress</span>
                <h3 id="day-detail-title" className={styles.detailTitle}>{selectedDateLabel}</h3>
              </div>
              <button
                ref={dialogCloseRef}
                type="button"
                className={styles.detailClose}
                onClick={closeDayDetails}
                aria-label="Close daily statistics"
              >
                ×
              </button>
            </div>

            <div className={styles.detailStats}>
              <div className={styles.detailStatCard}>
                <strong>{selectedDay.count}</strong>
                <span>Pomodoro{selectedDay.count !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.detailStatCard}>
                <strong>{selectedFocusTime}</strong>
                <span>Focus time</span>
              </div>
            </div>

            {selectedDay.count === 0 && (
              <p className={styles.emptyDetail}>No focus activity was recorded for this day.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
