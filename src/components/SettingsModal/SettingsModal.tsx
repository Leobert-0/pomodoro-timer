import { useState, useEffect } from 'react';
import type { Settings } from '../../types';
import styles from './SettingsModal.module.css';

interface Props {
  isOpen: boolean;
  settings: Settings;
  durationChangesDeferred: boolean;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({
  isOpen,
  settings,
  durationChangesDeferred,
  onSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<Settings>(settings);

  useEffect(() => {
    if (isOpen) setDraft(settings);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const setField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Settings</h2>

        <div className={styles.sectionLabel}>Timer (minutes)</div>
        <div className={styles.inputGroup}>
          <label>Work</label>
          <input type="number" min={1} max={120} value={draft.workDuration}
            onChange={e => setField('workDuration', Math.max(1, Math.min(120, +e.target.value)))} />
        </div>
        <div className={styles.inputGroup}>
          <label>Short Break</label>
          <input type="number" min={1} max={60} value={draft.shortBreakDuration}
            onChange={e => setField('shortBreakDuration', Math.max(1, Math.min(60, +e.target.value)))} />
        </div>
        <div className={styles.inputGroup}>
          <label>Long Break</label>
          <input type="number" min={1} max={60} value={draft.longBreakDuration}
            onChange={e => setField('longBreakDuration', Math.max(1, Math.min(60, +e.target.value)))} />
        </div>
        <div className={styles.inputGroup}>
          <label>Long Break Interval</label>
          <input type="number" min={2} max={10} value={draft.longBreakInterval}
            onChange={e => setField('longBreakInterval', Math.max(2, Math.min(10, +e.target.value)))} />
        </div>
        {durationChangesDeferred && (
          <p className={styles.settingsNote}>
            Duration changes apply to the next session or after reset.
          </p>
        )}

        <div className={styles.sectionLabel}>Preferences</div>
        <div className={styles.toggleGroup}>
          <span>Auto-start Breaks</span>
          <label className={styles.toggle}>
            <input type="checkbox" checked={draft.autoStartBreaks}
              onChange={e => setField('autoStartBreaks', e.target.checked)} />
            <span className={styles.slider} />
          </label>
        </div>
        <div className={styles.toggleGroup}>
          <span>Auto-start Pomodoros</span>
          <label className={styles.toggle}>
            <input type="checkbox" checked={draft.autoStartPomodoros}
              onChange={e => setField('autoStartPomodoros', e.target.checked)} />
            <span className={styles.slider} />
          </label>
        </div>
        <div className={styles.toggleGroup}>
          <span>Sound</span>
          <label className={styles.toggle}>
            <input type="checkbox" checked={draft.soundEnabled}
              onChange={e => setField('soundEnabled', e.target.checked)} />
            <span className={styles.slider} />
          </label>
        </div>
        <div className={styles.toggleGroup}>
          <span>Notifications</span>
          <label className={styles.toggle}>
            <input type="checkbox" checked={draft.notificationsEnabled}
              onChange={e => setField('notificationsEnabled', e.target.checked)} />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={() => { onSave(draft); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}
