import { CIRCUMFERENCE } from '../../utils/constants';
import { formatTime } from '../../utils/formatTime';
import styles from './TimerDisplay.module.css';

interface Props {
  timeLeft: number;
  totalDuration: number;
  label: string;
}

export default function TimerDisplay({ timeLeft, totalDuration, label }: Props) {
  const progress = timeLeft / totalDuration;
  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <section className={styles.timerSection}>
      <div className={styles.ringWrapper}>
        <svg className={styles.progressRing} viewBox="0 0 280 280">
          <circle className={styles.track} cx="140" cy="140" r="120" />
          <circle
            className={styles.fill}
            cx="140" cy="140" r="120"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: strokeOffset,
            }}
          />
        </svg>
        <div className={styles.content}>
          <div className={styles.time} aria-live="polite">{formatTime(timeLeft)}</div>
          <div className={styles.label}>{label}</div>
        </div>
      </div>
    </section>
  );
}
