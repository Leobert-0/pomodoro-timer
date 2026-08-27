import { useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { TimerMode } from '../types';

interface TimerNotificationPlugin {
  requestNotificationPermission(): Promise<{ granted: boolean }>;
  showTimerNotification(options: {
    endTimeEpochMs: number;
    mode: TimerMode;
    title: string;
    phrase: string;
  }): Promise<{ shown: boolean }>;
  cancelTimerNotification(): Promise<void>;
  showCompletionNotification(options: { title: string; body: string }): Promise<{ shown: boolean }>;
}

const TimerNotification = registerPlugin<TimerNotificationPlugin>('TimerNotification');

const TIMER_COPY: Record<TimerMode, { title: string; phrase: string }> = {
  work: { title: 'Focus Time', phrase: "Stay focused\u2014you've got this!" },
  shortBreak: { title: 'Short Break', phrase: 'Take a breather and recharge.' },
  longBreak: { title: 'Long Break', phrase: 'Reset, recharge, and come back strong.' },
};

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await TimerNotification.requestNotificationPermission();
        return result.granted;
      } catch {
        return false;
      }
    }

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }, []);

  const sendNotification = useCallback((completedMode: TimerMode) => {
    const isWork = completedMode === 'work';
    const title = isWork ? 'Work session complete!' : 'Break is over!';
    const body = isWork ? 'Great focus! Time for a break.' : 'Ready to get back to work?';

    if (Capacitor.isNativePlatform()) {
      void TimerNotification.showCompletionNotification({ title, body }).catch(() => {});
      return;
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: 'pomodoro-timer',
    });
  }, []);

  const showTimerNotification = useCallback((mode: TimerMode, endTimeEpochMs: number) => {
    if (!Capacitor.isNativePlatform()) return;
    const copy = TIMER_COPY[mode];
    void TimerNotification.showTimerNotification({
      endTimeEpochMs,
      mode,
      title: copy.title,
      phrase: copy.phrase,
    }).catch(() => {});
  }, []);

  const cancelTimerNotification = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;
    void TimerNotification.cancelTimerNotification().catch(() => {});
  }, []);

  return {
    requestPermission,
    sendNotification,
    showTimerNotification,
    cancelTimerNotification,
  };
}
