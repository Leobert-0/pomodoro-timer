import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerMode, TimerStatus, Settings } from '../types';

export function getDuration(mode: TimerMode, settings: Settings): number {
  switch (mode) {
    case 'work': return settings.workDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
  }
}

export function useTimer(settings: Settings, onComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(() => getDuration('work', settings));
  const [totalDuration, setTotalDuration] = useState(() => getDuration('work', settings));
  const [completedSessions, setCompletedSessions] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const statusRef = useRef(status);
  statusRef.current = status;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stopInterval = useCallback(() => {
    endTimeRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (statusRef.current === 'running') return;
    endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return;
    stopInterval();
    setStatus('paused');
  }, [stopInterval]);

  const reset = useCallback(() => {
    stopInterval();
    const dur = getDuration(modeRef.current, settingsRef.current);
    setTimeLeft(dur);
    setTotalDuration(dur);
    setStatus('idle');
  }, [stopInterval]);

  const switchMode = useCallback((newMode: TimerMode, autoStart = false) => {
    const dur = getDuration(newMode, settingsRef.current);
    setMode(newMode);
    setTimeLeft(dur);
    setTotalDuration(dur);
    if (autoStart) {
      endTimeRef.current = Date.now() + dur * 1000;
      setStatus('running');
    } else {
      stopInterval();
      setStatus('idle');
    }
  }, [stopInterval]);

  // Idle timers follow settings immediately. Running and paused sessions keep
  // the duration snapshot they started with, so progress cannot jump backward.
  useEffect(() => {
    if (status === 'idle') {
      const dur = getDuration(mode, settings);
      setTimeLeft(dur);
      setTotalDuration(dur);
    }
  }, [settings, mode, status]);

  // Main tick interval
  useEffect(() => {
    if (status !== 'running') return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
    }

    const intervalId = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        endTimeRef.current = null;
        setStatus('idle');
        onCompleteRef.current?.(modeRef.current);
      }
    }, 100);

    return () => clearInterval(intervalId);
  // A completed session can auto-start the next mode while the batched status
  // remains "running", so the mode change must also create a fresh interval.
  }, [status, mode]);

  return {
    mode, status, timeLeft, totalDuration, completedSessions,
    start, pause, reset, switchMode, setCompletedSessions,
  };
}
