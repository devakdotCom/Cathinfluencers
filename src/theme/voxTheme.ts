export type VoxTheme = 'dark' | 'corporate';

export const VOX_THEME_STORAGE_KEY = 'vox-landing-theme';

const META_COLORS: Record<VoxTheme, string> = {
  dark: '#050712',
  corporate: '#ffffff',
};

export function readStoredTheme(): VoxTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.localStorage.getItem(VOX_THEME_STORAGE_KEY) === 'corporate' ? 'corporate' : 'dark';
}

export function applyVoxTheme(theme: VoxTheme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
  window.localStorage.setItem(VOX_THEME_STORAGE_KEY, theme);

  document.querySelectorAll<HTMLButtonElement>('[data-theme-set]').forEach(button => {
    const active = button.dataset.themeSet === theme;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
  });

  document.dispatchEvent(new CustomEvent('vox-theme-change', { detail: { theme } }));
}

export function initVoxTheme() {
  applyVoxTheme(readStoredTheme());

  document.querySelectorAll<HTMLButtonElement>('[data-theme-set]').forEach(button => {
    button.addEventListener('click', () => {
      const next = button.dataset.themeSet as VoxTheme | undefined;
      if (next === 'dark' || next === 'corporate') applyVoxTheme(next);
    });
  });
}
