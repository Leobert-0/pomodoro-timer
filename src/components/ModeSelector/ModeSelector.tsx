import styles from './ModeSelector.module.css';
import type { TimerMode } from '../../types';

interface Props {
  mode: TimerMode;
  disabled?: boolean;
  onModeChange: (mode: TimerMode) => void;
}

const tabs: { mode: TimerMode; label: string }[] = [
  { mode: 'work', label: 'Work' },
  { mode: 'shortBreak', label: 'Short Break' },
  { mode: 'longBreak', label: 'Long Break' },
];

export default function ModeSelector({ mode, disabled = false, onModeChange }: Props) {
  return (
    <nav className={styles.nav} aria-label="Timer Modes">
      {tabs.map(tab => (
        <button
          key={tab.mode}
          className={`${styles.tab} ${mode === tab.mode ? styles.active : ''}`}
          disabled={disabled && mode !== tab.mode}
          onClick={() => onModeChange(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
