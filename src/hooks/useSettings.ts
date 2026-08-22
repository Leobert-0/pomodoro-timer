import { useState, useCallback } from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    saveToStorage(STORAGE_KEYS.SETTINGS, next);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
