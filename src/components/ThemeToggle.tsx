import { useEffect, useState } from 'react';
import { applyVoxTheme, readStoredTheme, type VoxTheme } from '../theme/voxTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<VoxTheme>(() => readStoredTheme());

  useEffect(() => {
    const sync = () => setTheme(readStoredTheme());
    document.addEventListener('vox-theme-change', sync);
    return () => document.removeEventListener('vox-theme-change', sync);
  }, []);

  const setThemeAndApply = (next: VoxTheme) => {
    applyVoxTheme(next);
    setTheme(next);
  };

  return (
    <div className={`theme-switch ${className}`} role="group" aria-label="Site theme">
      <button
        type="button"
        className={theme === 'dark' ? 'is-active' : ''}
        aria-pressed={theme === 'dark'}
        onClick={() => setThemeAndApply('dark')}
      >
        Heritage
      </button>
      <button
        type="button"
        className={theme === 'corporate' ? 'is-active' : ''}
        aria-pressed={theme === 'corporate'}
        onClick={() => setThemeAndApply('corporate')}
      >
        Corporate
      </button>
    </div>
  );
}
