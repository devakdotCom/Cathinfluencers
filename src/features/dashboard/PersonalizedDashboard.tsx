import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Compass,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Announcement, CalendarEvent, Member } from '../../types';
import { Badge, Button, Card, EmptyState } from '../../components/ui/primitives';
import { useTranslation } from 'react-i18next';

interface PersonalizedDashboardProps {
  user: User | null;
  role: 'admin' | 'member' | 'public';
  member: Member | null;
  memberCount: number;
  events: CalendarEvent[];
  announcements: Announcement[];
  onRegister: () => void;
  onOpenProfile: () => void;
  onOpenDirectory: () => void;
  onOpenEvents: () => void;
  onOpenAnnouncements: () => void;
  onOpenAdmin: () => void;
  onVerify: () => void;
}

const requiredProfileFields: Array<keyof Member> = [
  'photoURL',
  'parish',
  'diocese',
  'profession',
  'ambition',
  'biographyDraft',
  'techSkills',
  'softSkills',
];

function getProfileCompletion(member: Member | null) {
  if (!member) return 0;
  const completed = requiredProfileFields.filter(field => {
    const value = member[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
  return Math.round((completed / requiredProfileFields.length) * 100);
}

function firstName(user: User | null, member: Member | null) {
  if (member?.firstName) return member.firstName;
  if (user?.displayName) return user.displayName.split(/\s+/)[0];
  if (user?.email) return user.email.split('@')[0];
  return 'friend';
}

export function PersonalizedDashboard({
  user,
  role,
  member,
  memberCount,
  events,
  announcements,
  onRegister,
  onOpenProfile,
  onOpenDirectory,
  onOpenEvents,
  onOpenAnnouncements,
  onOpenAdmin,
  onVerify,
}: PersonalizedDashboardProps) {
  const { t, i18n } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = [...events]
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const priorityAnnouncements = [...announcements]
    .sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    })
    .slice(0, 3);
  const completion = getProfileCompletion(member);
  const isSignedIn = Boolean(user);
  const dashboardTitle =
    role === 'admin'
      ? t('dashboard.adminTitle')
      : role === 'member'
        ? t('dashboard.memberWelcome', { name: firstName(user, member) })
        : t('dashboard.publicTitle');

  return (
    <section aria-labelledby="personal-dashboard-title" className="space-y-5">
      <Card className="relative isolate overflow-hidden border-amber-400/20 px-5 py-7 sm:px-8 sm:py-9">
        <div
          className="absolute -right-20 -top-28 -z-10 size-72 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge tone="gold">
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              {t('dashboard.personalizedWorkspace')}
            </Badge>
            <h2
              id="personal-dashboard-title"
              className="mt-4 font-serif text-3xl font-black leading-tight text-white sm:text-4xl"
            >
              {dashboardTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {role === 'admin'
                ? t('dashboard.adminDescription')
                : role === 'member'
                  ? t('dashboard.memberDescription')
                  : t('dashboard.publicDescription')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {role === 'admin' ? (
              <Button onClick={onOpenAdmin}>
                <ShieldCheck className="size-4" />
                {t('dashboard.commandCenter')}
              </Button>
            ) : role === 'member' ? (
              <Button onClick={onOpenProfile}>
                <CircleUserRound className="size-4" />
                {t('dashboard.updateProfile')}
              </Button>
            ) : (
              <Button onClick={onRegister}>
                <FileCheck2 className="size-4" />
                {t('dashboard.register')}
              </Button>
            )}
            <Button variant="secondary" onClick={onVerify}>
              {t('dashboard.verify')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card interactive className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <Badge tone="info">{t('dashboard.network')}</Badge>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{memberCount}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('dashboard.verifiedProfiles')}
          </p>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-between px-0"
            onClick={onOpenDirectory}
          >
            {t('dashboard.discover')}
            <ArrowRight className="size-4" />
          </Button>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <Badge tone="gold">{t('dashboard.upcoming')}</Badge>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{upcomingEvents.length}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('dashboard.eventsInView')}
          </p>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-between px-0"
            onClick={onOpenEvents}
          >
            {t('dashboard.openCalendar')}
            <ArrowRight className="size-4" />
          </Button>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
              <BellRing className="size-5" aria-hidden="true" />
            </span>
            <Badge tone="neutral">{t('dashboard.briefing')}</Badge>
          </div>
          <p className="mt-5 text-3xl font-black text-white">
            {priorityAnnouncements.length}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('dashboard.ministryUpdates')}
          </p>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-between px-0"
            onClick={onOpenAnnouncements}
          >
            {t('dashboard.readChronicles')}
            <ArrowRight className="size-4" />
          </Button>
        </Card>

        <Card interactive className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              {completion === 100 ? (
                <CheckCircle2 className="size-5" aria-hidden="true" />
              ) : (
                <Compass className="size-5" aria-hidden="true" />
              )}
            </span>
            <Badge tone={completion >= 75 ? 'success' : 'warning'}>
              {role === 'member' ? `${completion}%` : t('dashboard.nextStep')}
            </Badge>
          </div>
          <p className="mt-5 text-lg font-black text-white">
            {role === 'member'
              ? completion === 100
                ? 'Profile complete'
                : 'Strengthen your profile'
              : role === 'admin'
                ? 'Review registry health'
                : t('dashboard.createIdentity')}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
            {role === 'member'
              ? 'Complete profiles are easier for ministry collaborators to discover.'
              : t('dashboard.identityDescription')}
          </p>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-between px-0"
            onClick={
              role === 'admin'
                ? onOpenAdmin
                : role === 'member'
                  ? onOpenProfile
                  : onRegister
            }
          >
            {t('common.continue')}
            <ArrowRight className="size-4" />
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                Next on the calendar
              </p>
              <h3 className="mt-1 font-serif text-xl font-bold text-white">
                Upcoming ministry events
              </h3>
            </div>
            <Button variant="ghost" onClick={onOpenEvents}>
              View all
            </Button>
          </div>
          {upcomingEvents.length ? (
            <div className="mt-5 space-y-3">
              {upcomingEvents.map(event => (
                <button
                  type="button"
                  key={event.id}
                  onClick={onOpenEvents}
                  className="vox-focus flex min-h-16 w-full items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/55 p-3 text-left transition hover:border-amber-400/35"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-center text-xs font-black text-amber-200">
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString(i18n.resolvedLanguage === 'ta' ? 'ta-IN' : 'en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {event.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-400">
                      {[event.category, event.location, event.time]
                        .filter(Boolean)
                        .join(' | ')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays className="size-5" />}
              title="No upcoming events"
              description="The ministry calendar is clear. New events will appear here."
              className="mt-5 border-slate-700/50"
            />
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Recommended for you
          </p>
          <h3 className="mt-1 font-serif text-xl font-bold text-white">
            Quick ministry actions
          </h3>
          <div className="mt-5 space-y-3">
            {[
              {
                title: isSignedIn ? 'Keep your registry record current' : 'Join the verified registry',
                detail: isSignedIn
                  ? 'Review your public details and digital ministry skills.'
                  : 'Create a trusted Vox Ecclesiae identity.',
                action: isSignedIn ? onOpenProfile : onRegister,
              },
              {
                title: 'Find a Catholic collaborator',
                detail: 'Search by diocese, parish, profession, and media skill.',
                action: onOpenDirectory,
              },
              {
                title: 'Read the latest ministry briefing',
                detail: 'See priority announcements from the community.',
                action: onOpenAnnouncements,
              },
            ].map(item => (
              <button
                type="button"
                key={item.title}
                onClick={item.action}
                className="vox-focus flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/55 p-3 text-left transition hover:border-amber-400/35"
              >
                <span>
                  <span className="block text-sm font-bold text-white">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {item.detail}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-amber-300" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
