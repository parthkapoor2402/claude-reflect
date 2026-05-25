import { useEffect, useState, useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme } from '../theme/themeStore';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return theme;
}
