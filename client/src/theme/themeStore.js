/** In-memory theme preference (no localStorage). */
let currentTheme = 'dark';
const listeners = new Set();

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  if (theme !== 'dark' && theme !== 'light') return;
  currentTheme = theme;
  listeners.forEach((fn) => fn(currentTheme));
}

export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
