import type { TimerMode } from '../types';

export function getNextBreakMode(
  completedWorkSessions: number,
  longBreakInterval: number,
): TimerMode {
  return completedWorkSessions > 0 && completedWorkSessions % longBreakInterval === 0
    ? 'longBreak'
    : 'shortBreak';
}
