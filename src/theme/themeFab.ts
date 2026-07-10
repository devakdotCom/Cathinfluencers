import { applyVoxTheme, readStoredTheme, type VoxTheme } from './voxTheme';

const PALETTE_ICON = `
<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
</svg>`;

function syncMenu(root: HTMLElement) {
  const theme = readStoredTheme();
  root.querySelectorAll<HTMLButtonElement>('[data-theme-pick]').forEach(button => {
    const active = button.dataset.themePick === theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function closeMenu(menu: HTMLElement, button: HTMLButtonElement) {
  menu.hidden = true;
  button.setAttribute('aria-expanded', 'false');
}

export function mountThemeFab() {
  if (document.getElementById('vox-theme-fab-root')) return;

  const root = document.createElement('div');
  root.id = 'vox-theme-fab-root';
  root.className = 'vox-theme-fab-root';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'vox-theme-fab';
  button.setAttribute('aria-label', 'Change site theme');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-haspopup', 'true');
  button.innerHTML = PALETTE_ICON;

  const menu = document.createElement('div');
  menu.className = 'vox-theme-fab-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Theme options');

  (['dark', 'corporate'] as VoxTheme[]).forEach(theme => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'vox-theme-fab-option';
    option.dataset.themePick = theme;
    option.setAttribute('role', 'menuitemradio');
    option.textContent = theme === 'dark' ? 'Heritage' : 'Corporate';
    option.addEventListener('click', () => {
      applyVoxTheme(theme);
      syncMenu(root);
      closeMenu(menu, button);
    });
    menu.appendChild(option);
  });

  button.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) syncMenu(root);
  });

  document.addEventListener('click', event => {
    if (!root.contains(event.target as Node)) closeMenu(menu, button);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(menu, button);
  });

  document.addEventListener('vox-theme-change', () => syncMenu(root));

  root.append(button, menu);
  document.body.appendChild(root);
  syncMenu(root);
}
