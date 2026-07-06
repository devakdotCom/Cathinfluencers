import {
  Activity,
  CalendarCheck2,
  CircleUserRound,
  ShieldCheck,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import type { CalendarEvent, Member } from '../../types';
import { aggregateWithSuppression } from './privacyAnalytics';
import { useEngagementMetrics } from './useEngagementMetrics';
import { Badge, Card, EmptyState } from '../../components/ui/primitives';

function isComplete(member: Member) {
  return Boolean(
    member.photoURL &&
      member.parish &&
      member.diocese &&
      member.profession &&
      member.ambition &&
      member.techSkills?.length,
  );
}

export function PrivacyAnalyticsDashboard({
  members,
  events,
}: {
  members: Member[];
  events: CalendarEvent[];
}) {
  const engagement = useEngagementMetrics(true);
  const active = members.filter(
    member => member.status === 'Active' || member.status === 'Affiliated',
  ).length;
  const incomplete = members.filter(member => !isComplete(member)).length;
  const joinedLast30Days = members.filter(member => {
    const joined = Date.parse(member.joinedDate);
    return Number.isFinite(joined) && Date.now() - joined <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const dioceseGroups = aggregateWithSuppression(
    members,
    member => member.diocese,
    3,
  ).slice(0, 8);
  const statusGroups = aggregateWithSuppression(
    members,
    member => member.status,
    3,
  );
  const upcomingEvents = events.filter(
    event => event.date >= new Date().toISOString().slice(0, 10),
  ).length;

  const metrics = [
    {
      label: 'Total members',
      value: members.length,
      detail: `${joinedLast30Days} joined in 30 days`,
      icon: CircleUserRound,
    },
    {
      label: 'Active profiles',
      value: active,
      detail: `${members.length ? Math.round((active / members.length) * 100) : 0}% of registry`,
      icon: UserRoundCheck,
    },
    {
      label: 'Incomplete profiles',
      value: incomplete,
      detail: 'Needs safe data completion',
      icon: Activity,
    },
    {
      label: 'Event engagement',
      value: engagement.rsvps + engagement.availabilityResponses,
      detail: `${upcomingEvents} upcoming events`,
      icon: CalendarCheck2,
    },
  ];

  return (
    <section aria-labelledby="privacy-analytics-title" className="space-y-5">
      <Card className="border-emerald-400/20 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone="success">
              <ShieldCheck className="mr-1 size-3" />
              Privacy-safe analytics
            </Badge>
            <h2
              id="privacy-analytics-title"
              className="mt-3 font-serif text-3xl font-black text-white"
            >
              Registry and engagement insights
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Small demographic groups are suppressed. Reports show aggregate
              operational trends, never private member-level analytics.
            </p>
          </div>
          <Badge tone="neutral">Minimum group: 3</Badge>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-5">
              <Icon className="size-5 text-amber-300" />
              <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-300">
                {metric.label}
              </p>
              <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-amber-300" />
            <h3 className="font-serif text-xl font-bold text-white">
              Diocese representation
            </h3>
          </div>
          {dioceseGroups.length ? (
            <div className="mt-5 space-y-3">
              {dioceseGroups.map(group => (
                <div key={group.label}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="truncate text-slate-300">{group.label}</span>
                    <span className="font-bold text-white">{group.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{
                        width: `${Math.max(6, (group.count / Math.max(1, members.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Groups are protected"
              description="No diocese currently meets the minimum group size for display."
              className="mt-4"
            />
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl font-bold text-white">
            Operational summary
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {statusGroups.map(group => (
              <div
                key={group.label}
                className="rounded-xl border border-slate-700/60 bg-slate-900/55 p-3"
              >
                <p className="text-2xl font-black text-white">{group.count}</p>
                <p className="mt-1 text-xs text-slate-400">{group.label}</p>
              </div>
            ))}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/55 p-3">
              <p className="text-2xl font-black text-white">{engagement.reminders}</p>
              <p className="mt-1 text-xs text-slate-400">Event reminders</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

