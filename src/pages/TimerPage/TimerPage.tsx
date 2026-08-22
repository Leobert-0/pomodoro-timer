import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import { useNotification } from '../../hooks/useNotification';
import { useStats } from '../../hooks/useStats';
import { MODE_LABELS } from '../../utils/constants';
import { formatTime } from '../../utils/formatTime';
import { getNextBreakMode } from '../../utils/timerTransitions';
import type { TimerMode } from '../../types';
import Header from '../../components/Header/Header';
import ModeSelector from '../../components/ModeSelector/ModeSelector';
import TimerDisplay from '../../components/TimerDisplay/TimerDisplay';
import Controls from '../../components/Controls/Controls';
import SessionTracker from '../../components/SessionTracker/SessionTracker';
import SettingsModal from '../../components/SettingsModal/SettingsModal';
import styles from './TimerPage.module.css';

interface Props {
  isActive?: boolean;
}

export default function TimerPage({ isActive = true }: Props) {
  const { settings, updateSettings } = useSettings();
  const { playChime, warmUp } = useAudio();
  const { requestPermission, sendNotification } = useNotification();
  const { recordSession } = useStats();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasWarmedUp = useRef(false);

  const completedSessionsRef = useRef(0);
  const switchModeRef = useRef<(mode: TimerMode, autoStart?: boolean) => void>(() => {});
  const setCompletedSessionsRef = useRef<(count: number | ((prev: number) => number)) => void>(() => {});

  const handleComplete = useCallback((completedMode: TimerMode) => {
    if (settings.soundEnabled) playChime();
    if (settings.notificationsEnabled) sendNotification(completedMode);

    if (completedMode === 'work') {
      recordSession(settings.workDuration);
      const newCount = completedSessionsRef.current + 1;
      completedSessionsRef.current = newCount;
      setCompletedSessionsRef.current(newCount);
      const nextMode = getNextBreakMode(newCount, settings.longBreakInterval);
      switchModeRef.current(nextMode, settings.autoStartBreaks);
    } else {
      switchModeRef.current('work', settings.autoStartPomodoros);
    }
  }, [settings, playChime, sendNotification, recordSession]);

  const {
    mode, status, timeLeft, totalDuration, completedSessions,
    start, pause, reset, switchMode, setCompletedSessions,
  } = useTimer(settings, handleComplete);

  switchModeRef.current = switchMode;
  setCompletedSessionsRef.current = setCompletedSessions;

  // Keep completedSessionsRef in sync
  useEffect(() => {
    completedSessionsRef.current = completedSessions;
  }, [completedSessions]);

  // Set body data-mode for CSS variable switching
  useEffect(() => {
    if (!isActive) return;

    document.body.setAttribute('data-mode', mode);
    return () => { document.body.removeAttribute('data-mode'); };
  }, [isActive, mode]);

  // Dynamic browser tab title
  useEffect(() => {
    if (!isActive) return;

    const label = MODE_LABELS[mode];
    document.title = `(${formatTime(timeLeft)}) ${label} — Pomodoro`;
  }, [isActive, timeLeft, mode]);

  const handleStartPause = useCallback(() => {
    if (!hasWarmedUp.current) {
      warmUp();
      if (settings.notificationsEnabled) requestPermission();
      hasWarmedUp.current = true;
    }
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  }, [pause, requestPermission, settings.notificationsEnabled, start, status, warmUp]);

  const handleSkip = useCallback(() => {
    const nextMode = mode === 'work' ? 'shortBreak' : 'work';
    switchMode(nextMode, false);
  }, [mode, switchMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.key.toLowerCase() === 'r') {
        reset();
      } else if (e.key.toLowerCase() === 's') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSkip, handleStartPause, reset]);

  const handleModeChange = (newMode: TimerMode) => {
    if (status !== 'running' && newMode !== mode) switchMode(newMode, false);
  };

  const handleToggleSound = () => {
    updateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const sessionLabel = mode === 'work'
    ? (status === 'running' ? 'Keep focusing!' : 'Time to focus')
    : (status === 'running' ? 'Enjoy your rest!' : 'Take a breath');

  return (
    <div className={styles.container}>
      <Header mode={mode} onOpenSettings={() => setSettingsOpen(true)} />
      <ModeSelector
        mode={mode}
        disabled={status === 'running'}
        onModeChange={handleModeChange}
      />
      <TimerDisplay timeLeft={timeLeft} totalDuration={totalDuration} label={sessionLabel} />
      <Controls
        status={status}
        onStartPause={handleStartPause}
        onReset={reset}
        onSkip={handleSkip}
      />
      <SessionTracker
        completedSessions={completedSessions}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />
      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        durationChangesDeferred={status !== 'idle'}
        onSave={updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
