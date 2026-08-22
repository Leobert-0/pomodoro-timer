import type { TimerStatus } from '../../types';
import styles from './Controls.module.css';

interface Props {
  status: TimerStatus;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function Controls({ status, onStartPause, onReset, onSkip }: Props) {
  const isRunning = status === 'running';

  return (
    <section className={styles.section}>
      <button className={styles.primary} onClick={onStartPause} aria-label={isRunning ? 'Pause' : 'Start'}>
        {isRunning ? (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        <span>{isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}</span>
      </button>
      <div className={styles.secondary}>
        <button className={styles.btn} onClick={onReset} aria-label="Reset">
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset</span>
        </button>
        <button className={styles.btn} onClick={onSkip} aria-label="Skip">
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          <span>Skip</span>
        </button>
      </div>
    </section>
  );
}
