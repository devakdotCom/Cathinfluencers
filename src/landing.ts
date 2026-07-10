import './landing/themes.css';
import './styles/theme-fab.css';
import { initLandingTheme } from './landing/theme';
import { renderDuoHeadlines } from './landing/duoHeadlines';
import { initInvestorTabs } from './landing/investorTabs';
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { collection, getCountFromServer, getFirestore, query, where } from 'firebase/firestore';
import { PLATFORM_STATS_FALLBACK, type PlatformStats } from './data/platformStats';

// Progressive enhancement gate: reveal animations only apply when JS runs.
document.documentElement.classList.add('js');
initLandingTheme();
initInvestorTabs();
renderDuoHeadlines();
document.addEventListener('vox-theme-change', () => renderDuoHeadlines());

function firebaseWebConfig(): FirebaseOptions | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const response = await fetch('/api/public/stats');
    if (response.ok) {
      return await response.json() as PlatformStats;
    }
  } catch {
    // Hosted API may be unavailable on Firebase-only deploys.
  }

  const config = firebaseWebConfig();
  if (!config) return { ...PLATFORM_STATS_FALLBACK, updatedAt: new Date().toISOString() };

  try {
    const app = initializeApp(config, 'landing-stats');
    const db = getFirestore(app);
    const [members, courses] = await Promise.all([
      getCountFromServer(collection(db, 'publicMembers')),
      getCountFromServer(query(collection(db, 'courses'), where('status', '==', 'published'))),
    ]);
    return {
      memberCount: members.data().count,
      courseCount: courses.data().count,
      liveSessionCount: PLATFORM_STATS_FALLBACK.liveSessionCount,
      languageCount: PLATFORM_STATS_FALLBACK.languageCount,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Landing stats fallback:', error);
    return { ...PLATFORM_STATS_FALLBACK, updatedAt: new Date().toISOString() };
  }
}

function animateStat(el: HTMLElement, target: number, suffix = '') {
  const t0 = performance.now();
  const step = (t: number) => {
    const p = Math.min((t - t0) / 1200, 1);
    const value = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = `${value}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function applyPlatformStats(stats: PlatformStats) {
  const memberTargets = document.querySelectorAll<HTMLElement>('[data-stat="members"]');
  const courseTargets = document.querySelectorAll<HTMLElement>('[data-stat="courses"]');
  const sessionTargets = document.querySelectorAll<HTMLElement>('[data-stat="sessions"]');
  const languageTargets = document.querySelectorAll<HTMLElement>('[data-stat="languages"]');

  memberTargets.forEach(el => animateStat(el, stats.memberCount, stats.memberCount >= 100 ? '+' : ''));
  courseTargets.forEach(el => animateStat(el, stats.courseCount));
  sessionTargets.forEach(el => animateStat(el, stats.liveSessionCount));
  languageTargets.forEach(el => animateStat(el, stats.languageCount));

  if (stats.updatedAt) {
    document.querySelectorAll<HTMLElement>('[data-stats-updated]').forEach(node => {
      node.hidden = false;
      node.textContent = `Registry figures updated ${new Date(stats.updatedAt).toLocaleDateString()}`;
    });
  }
}

void fetchPlatformStats().then(applyPlatformStats);

// Scroll progress bar + auto-hiding header.
const prog = document.getElementById('progress');
const hdr = document.getElementById('hdr');
let lastY = 0;
addEventListener(
  'scroll',
  () => {
    const y = scrollY;
    const max = document.body.scrollHeight - innerHeight;
    if (prog) prog.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
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

// Scrollspy for the chapter navigation.
const links = [...document.querySelectorAll<HTMLAnchorElement>('#chapnav a')];
const secs = links
  .map((a) => document.querySelector(a.getAttribute('href') ?? ''))
  .filter((s): s is Element => s !== null);
const sio = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
    }),
  { rootMargin: '-40% 0px -55% 0px' },
);
secs.forEach((s) => sio.observe(s));
