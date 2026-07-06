// Vox Ecclesiae landing page interactions.
// External module (not inline) so the strict CSP script-src 'self' passes.

// Progressive enhancement gate: reveal animations only apply when JS runs.
// Without this class, all content is fully visible (no-JS fallback).
document.documentElement.classList.add('js');

// Scroll progress bar + auto-hiding header.
const prog = document.getElementById('progress');
const hdr = document.getElementById('hdr');
let lastY = 0;
addEventListener(
  'scroll',
  () => {
    const y = scrollY;
    const max = document.body.scrollHeight - innerHeight;
    if (prog) prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    hdr?.classList.toggle('hide', y > 400 && y > lastY);
    lastY = y;
  },
  { passive: true },
);

// Reveal-on-scroll animations.
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Animated hero counters.
const cio = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const target = Number(el.dataset.count ?? 0);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3)))) + (target >= 100 ? '+' : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    }),
  { threshold: 0.6 },
);
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => cio.observe(el));

// Scrollspy for the chapter navigation.
const links = [...document.querySelectorAll<HTMLAnchorElement>('#chapnav a')];
const secs = links
  .map((a) => document.querySelector(a.getAttribute('href') ?? ''))
  .filter((s): s is Element => s !== null);
const sio = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }),
  { rootMargin: '-40% 0px -55% 0px' },
);
secs.forEach((s) => sio.observe(s));
