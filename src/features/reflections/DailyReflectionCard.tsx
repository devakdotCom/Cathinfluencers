import { BookOpen, Pencil, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getDailyReflection,
  saveDailyReflection,
  type DailyReflection,
  type ReflectionContent,
} from './dailyReflectionService';

export function DailyReflectionCard({ adminUid }: { adminUid?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'ta' ? 'ta' : 'en';
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [draft, setDraft] = useState<ReflectionContent | null>(null);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    void getDailyReflection().then(value => {
      if (active) setReflection(value);
    });
    return () => { active = false; };
  }, []);

  if (!reflection) {
    return (
      <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-6" role="status">
        <div className="h-4 w-48 animate-pulse rounded bg-amber-200" />
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-amber-100" />
        <p className="sr-only">{t('reflection.loading')}</p>
      </div>
    );
  }

  const content = editing && draft ? draft : reflection[language];
  const fields: Array<[keyof ReflectionContent, string]> = [
    ['gospel', t('reflection.todayGospel')],
    ['reflection', t('reflection.reflection')],
    ['prayer', t('reflection.prayer')],
    ['saintQuote', t('reflection.saintQuote')],
    ['action', t('reflection.action')],
  ];

  return (
    <article className="rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200 pb-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800">
            <BookOpen className="size-4" />{t('reflection.eyebrow')}
          </p>
          <h3 className="mt-2 font-serif text-xl font-black text-amber-950">{t('reflection.featured')}</h3>
          <p className="mt-1 text-xs text-amber-800/70">{new Date(`${reflection.date}T12:00:00`).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { dateStyle: 'full' })}</p>
        </div>
        {adminUid && (
          <button
            type="button"
            onClick={() => {
              setDraft({ ...reflection[language] });
              setEditing(current => !current);
              setStatus('');
            }}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-amber-300 px-3 text-xs font-black text-amber-900 hover:bg-amber-100"
          >
            <Pencil className="size-4" />{t('reflection.adminOverride')}
          </button>
        )}
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {fields.map(([field, label], index) => (
          <section key={field} className={`rounded-xl border border-amber-200/80 bg-white/70 p-4 ${index === 1 ? 'lg:row-span-2' : ''}`}>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-800">
              {index === 1 && <Sparkles className="size-3" />}{label}
            </p>
            {editing ? (
              <textarea
                value={content[field]}
                onChange={event => setDraft(current => current ? { ...current, [field]: event.target.value } : current)}
                rows={index === 1 ? 5 : 3}
                lang={language}
                className="mt-2 w-full rounded-lg border border-amber-200 bg-white p-3 text-sm leading-6 text-amber-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            ) : (
              <p lang={language} className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-950">{content[field]}</p>
            )}
          </section>
        ))}
      </div>

      {editing && adminUid && draft && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          {status && <p role="status" className="mr-auto text-xs font-semibold text-amber-900">{status}</p>}
          <button
            type="button"
            onClick={async () => {
              setStatus(t('common.loading'));
              const updated = {
                ...reflection,
                [language]: draft,
              };
              try {
                const saved = await saveDailyReflection(updated, adminUid);
                setReflection(saved);
                setEditing(false);
                setStatus('');
              } catch (error) {
                setStatus(error instanceof Error ? error.message : t('reflection.unavailable'));
              }
            }}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-black text-white hover:bg-amber-700"
          >
            <Save className="size-4" />{t('reflection.saveOverride')}
          </button>
        </div>
      )}
    </article>
  );
}
