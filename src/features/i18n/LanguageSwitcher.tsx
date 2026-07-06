import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'ta' ? 'ta' : 'en';

  return (
    <div className={`vox-glass fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex -translate-x-1/2 items-center gap-1 rounded-full p-1 ${className}`}>
      <Languages className="ml-2 size-4 text-amber-300" aria-hidden="true" />
      <span className="sr-only">{t('common.language')}</span>
      {(['en', 'ta'] as const).map(item => (
        <button
          type="button"
          key={item}
          onClick={() => void i18n.changeLanguage(item)}
          className={`vox-focus min-h-9 rounded-full px-3 text-xs font-black ${
            language === item
              ? 'bg-amber-400 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          aria-pressed={language === item}
          lang={item}
        >
          {item === 'en' ? t('common.english') : t('common.tamil')}
        </button>
      ))}
    </div>
  );
}
