import { useRef, useCallback } from 'react';

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playChime = useCallback(() => {
    try {
      const ctx = getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.4 },
        { freq: 659.25, time: 0.15, dur: 0.5 },
        { freq: 783.99, time: 0.3, dur: 0.8 },
        { freq: 1046.50, time: 0.45, dur: 1.2 },
      ];
      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.25, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      }
    } catch {
      // Audio not available
    }
  }, [getContext]);

  const warmUp = useCallback(() => {
    getContext();
  }, [getContext]);

  return { playChime, warmUp };
}
