import {
  CalendarDays,
  Home,
  Library,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { PublicSection } from '../../features/search/GlobalSearch';
import { useLanguage } from '../../features/i18n/LanguageProvider';

interface NavigationItem {
  id: PublicSection | 'account';
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface MobileBottomNavProps {
  current: PublicSection;
  isAdmin: boolean;
  isSignedIn: boolean;
  onNavigate: (section: PublicSection) => void;
  onAccount: () => void;
}

export function MobileBottomNav({
  current,
  isAdmin,
  isSignedIn,
  onNavigate,
  onAccount,
}: MobileBottomNavProps) {
  const { t } = useLanguage();
  const items: NavigationItem[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'directory', label: t('directory'), icon: Users },
    { id: 'events', label: t('events'), icon: CalendarDays },
    { id: 'guidelines', label: t('resources'), icon: Library },
    {
      id: 'account',
      label: isAdmin ? t('admin') : isSignedIn ? t('account') : t('signIn'),
      icon: isAdmin ? ShieldCheck : UserRound,
    },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="vox-glass vox-safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 rounded-t-2xl border-x-0 border-b-0 px-1 pt-1 md:hidden"
    >
      {items.map(item => {
        const Icon = item.icon;
        const active = item.id !== 'account' && current === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() =>
              item.id === 'account' ? onAccount() : onNavigate(item.id)
            }
            className={`vox-focus relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.62rem] font-bold transition ${
              active
                ? 'bg-amber-400/12 text-amber-300'
                : 'text-slate-400 active:bg-slate-800'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
            {active && (
              <span
                className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-amber-400"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
