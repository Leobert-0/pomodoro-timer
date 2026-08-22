export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface DailyStats {
  date: string;
  completedSessions: number;
  totalFocusMinutes: number;
}
