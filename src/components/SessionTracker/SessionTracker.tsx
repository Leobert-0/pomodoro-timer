import styles from './SessionTracker.module.css';

interface Props {
  completedSessions: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function SessionTracker({ completedSessions, soundEnabled, onToggleSound }: Props) {
  return (
    <footer className={styles.footer}>
      <div className={styles.stat}>
        <span className={styles.number}>{completedSessions}</span>
        <span className={styles.label}>Pomodoros</span>
      </div>
      <button className={styles.soundBtn} onClick={onToggleSound} aria-label="Toggle Sound">
        {soundEnabled ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </footer>
  );
}
