import type { TimerMode, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

export const PROGRESS_RING_RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

export const STORAGE_KEYS = {
  SETTINGS: 'pomodoro-settings',
  STATS: 'pomodoro-daily-stats',
} as const;

export const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};
