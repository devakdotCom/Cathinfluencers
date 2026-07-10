function storeOriginal(el: HTMLElement) {
  if (!el.dataset.duoStored) {
    el.dataset.duoStored = el.innerHTML;
    el.dataset.duoPlain = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }
}

function renderWord(parent: HTMLElement, word: string) {
  const wordWrap = document.createElement('span');
  wordWrap.className = 'duo-word';

  [...word].forEach((char, index) => {
    const glyph = document.createElement('span');
    glyph.className = 'duo-char';
    glyph.style.setProperty('--duo-i', String(index));
    glyph.innerHTML = `<span class="duo-primary">${char}</span><span class="duo-ghost" aria-hidden="true">${char}</span>`;
    wordWrap.appendChild(glyph);
  });

  parent.appendChild(wordWrap);
}

function renderLine(parent: HTMLElement, line: string) {
  const lineWrap = document.createElement('span');
  lineWrap.className = 'duo-line';

  line.split(/\s+/).filter(Boolean).forEach((word, wordIndex) => {
    if (wordIndex > 0) lineWrap.append('\u00a0');
    renderWord(lineWrap, word);
  });

  parent.appendChild(lineWrap);
}

export function renderDuoHeadlines() {
  const corporate = document.documentElement.dataset.theme === 'corporate';

  document.querySelectorAll<HTMLElement>('.duo-headline').forEach(el => {
    storeOriginal(el);

    if (!corporate) {
      el.innerHTML = el.dataset.duoStored ?? '';
      el.classList.remove('duo-ready');
      return;
    }

    const lines = (el.dataset.duoLines || el.dataset.duoPlain || '')
      .split('|')
      .map(line => line.trim())
      .filter(Boolean);

    el.innerHTML = '';
    el.classList.add('duo-ready');
    lines.forEach((line, index) => {
      if (index > 0) el.appendChild(document.createElement('br'));
      renderLine(el, line);
    });
  });
}
