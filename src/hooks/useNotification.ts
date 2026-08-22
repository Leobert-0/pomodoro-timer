import { useCallback } from 'react';
import type { TimerMode } from '../types';

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback((completedMode: TimerMode) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const isWork = completedMode === 'work';
    new Notification(isWork ? 'Work session complete!' : 'Break is over!', {
      body: isWork ? 'Great focus! Time for a break.' : 'Ready to get back to work?',
      icon: '/vite.svg',
      tag: 'pomodoro-timer',
    });
  }, []);

  return { requestPermission, sendNotification };
}
