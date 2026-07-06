import { AlertTriangle, CheckCircle2, Fingerprint, Sparkles, UserRoundCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Member } from '../../../types';
import {
  getAIHealthMetrics,
  type AIHealthMetrics,
} from '../../ai/biographyService';
import { getDirectoryHealth } from './healthMetrics';

export function AdminHealthDashboard({ members }: { members: Member[] }) {
  const { t } = useTranslation();
  const health = getDirectoryHealth(members);
  const [aiHealth, setAIHealth] = useState<AIHealthMetrics>(() => getAIHealthMetrics());
  useEffect(() => {
    const update = () => setAIHealth(getAIHealthMetrics());
    window.addEventListener('vox-ai-health-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('vox-ai-health-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  const successRate = aiHealth.requests
    ? Math.round((aiHealth.successes / aiHealth.requests) * 100)
    : 100;
  const metrics = [
    { label: 'Pending review', value: health.pending },
    { label: 'Missing account owner', value: health.missingOwner },
    { label: 'Stale profiles', value: health.stale },
    { label: 'Duplicate groups', value: health.duplicates.length },
  ];

  return (
    <section aria-labelledby="directory-health-title" className="vox-surface rounded-2xl border border-slate-700/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${health.score >= 85 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
            {health.score >= 85 ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
          </div>
          <div>
            <h2 id="directory-health-title" className="font-display text-sm font-black uppercase tracking-wide text-white">
              Registry Health
            </h2>
            <p className="text-xs text-slate-500">Privacy-safe quality checks across authenticated records.</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">{health.score}</span>
          <span className="text-xs font-bold text-slate-400">/100</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-xl border border-slate-700/60 bg-slate-900/55 p-3">
            <p className="text-2xl font-black text-white">{metric.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-1"><Fingerprint className="h-3 w-3" /> Duplicate detection active</span>
        <span className="inline-flex items-center gap-1"><UserRoundCheck className="h-3 w-3" /> UID ownership monitored</span>
      </div>
      <div className="mt-5 border-t border-slate-700/60 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-white">
              <Sparkles className="size-4 text-amber-300" />
              {t('aiHealth.title')}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {t('aiHealth.provider')}: {aiHealth.fallbacks > 0 ? t('aiHealth.degraded') : t('aiHealth.healthy')}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
            aiHealth.fallbacks > 0
              ? 'bg-amber-400/10 text-amber-300'
              : 'bg-emerald-400/10 text-emerald-300'
          }`}>
            {successRate}% {t('aiHealth.successRate')}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            [t('aiHealth.requests'), aiHealth.requests],
            [t('aiHealth.successes'), aiHealth.successes],
            [t('aiHealth.failures'), aiHealth.fallbacks],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-slate-700/60 bg-slate-900/55 p-3">
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
