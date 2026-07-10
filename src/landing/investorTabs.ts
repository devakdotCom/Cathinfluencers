export function initInvestorTabs() {
  const root = document.querySelector('.corp-investor');
  if (!root) return;

  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

  const activate = (tabId: string) => {
    tabs.forEach(tab => {
      const active = tab.dataset.tab === tabId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.tabPanel !== tabId;
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      if (tabId) activate(tabId);
    });
  });

  const initial = tabs.find(tab => tab.classList.contains('is-active'))?.dataset.tab ?? tabs[0]?.dataset.tab;
  if (initial) activate(initial);
}
