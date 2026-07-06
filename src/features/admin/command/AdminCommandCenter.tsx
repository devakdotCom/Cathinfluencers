import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ChartNoAxesCombined,
  CircleUserRound,
  Database,
  Megaphone,
  Plus,
  Users,
} from 'lucide-react';
import type {
  ActivityLog,
  Announcement,
  CalendarEvent,
  Member,
} from '../../../types';
import { Badge, Button, Card } from '../../../components/ui/primitives';
import { getDirectoryHealth } from '../health/healthMetrics';
import { AdminHealthDashboard } from '../health/AdminHealthDashboard';
import { ApprovalQueue } from '../approvals/ApprovalQueue';

interface AdminCommandCenterProps {
  members: Member[];
  events: CalendarEvent[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  reviewerUid: string;
  onCreateMember: () => void;
  onOpenDirectory: () => void;
  onOpenAnalytics: () => void;
  onOpenImportExport: () => void;
}

export function AdminCommandCenter({
  members,
  events,
  announcements,
  activityLogs,
  reviewerUid,
  onCreateMember,
  onOpenDirectory,
  onOpenAnalytics,
  onOpenImportExport,
}: AdminCommandCenterProps) {
  const health = getDirectoryHealth(members);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(event => event.date >= today).length;
  const highPriority = announcements.filter(
    announcement => announcement.priority === 'high',
  ).length;
  const issues =
    health.pending +
    health.missingOwner +
    health.stale +
    health.duplicates.length;

  const metrics = [
    {
      label: 'Registry profiles',
      value: members.length,
      detail: `${health.pending} awaiting review`,
      icon: Users,
      tone: 'text-sky-300 bg-sky-400/10',
    },
    {
      label: 'Registry health',
      value: `${health.score}%`,
      detail: issues ? `${issues} checks need attention` : 'All checks clear',
      icon: Activity,
      tone:
        health.score >= 85
          ? 'text-emerald-300 bg-emerald-400/10'
          : 'text-orange-300 bg-orange-400/10',
    },
    {
      label: 'Upcoming events',
      value: upcoming,
      detail: `${events.length} total events`,
      icon: CalendarClock,
      tone: 'text-amber-300 bg-amber-400/10',
    },
    {
      label: 'Priority notices',
      value: highPriority,
      detail: `${announcements.length} published`,
      icon: Megaphone,
      tone: 'text-violet-300 bg-violet-400/10',
    },
  ];

  return (
    <section aria-labelledby="admin-command-title" className="space-y-5">
      <Card className="relative overflow-hidden border-amber-400/20 p-5 sm:p-7">
        <div
          className="absolute -right-24 -top-32 size-80 rounded-full bg-orange-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">Admin command center</Badge>
              {issues > 0 ? (
                <Badge tone="warning">
                  <AlertTriangle className="mr-1 size-3" />
                  {issues} attention items
                </Badge>
              ) : (
                <Badge tone="success">Systems healthy</Badge>
              )}
            </div>
            <h2
              id="admin-command-title"
              className="mt-4 font-serif text-3xl font-black text-white"
            >
              Ministry operations overview
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Registry quality, publishing activity, events, approvals, and
              operational actions in one accountable workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateMember}>
              <Plus className="size-4" />
              Add member
            </Button>
            <Button variant="secondary" onClick={onOpenDirectory}>
              <CircleUserRound className="size-4" />
              Directory
            </Button>
            <Button variant="secondary" onClick={onOpenAnalytics}>
              <ChartNoAxesCombined className="size-4" />
              Analytics
            </Button>
            <Button variant="secondary" onClick={onOpenImportExport}>
              <Database className="size-4" />
              Data tools
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-5">
              <div className={`grid size-11 place-items-center rounded-xl ${metric.tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-3xl font-black text-white">{metric.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-300">
                {metric.label}
              </p>
              <p className="mt-2 text-xs text-slate-500">{metric.detail}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminHealthDashboard members={members} />
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                Audit pulse
              </p>
              <h3 className="mt-1 font-serif text-xl font-bold text-white">
                Latest activity
              </h3>
            </div>
            <Badge>{activityLogs.length} logs</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {activityLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-700/60 bg-slate-900/55 p-3"
              >
                <p className="truncate text-sm font-bold text-white">{log.action}</p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {log.memberName || log.memberId} | {log.details}
                </p>
              </div>
            ))}
            {!activityLogs.length && (
              <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
                Audit activity will appear here.
              </p>
            )}
          </div>
        </Card>
      </div>

      <ApprovalQueue reviewerUid={reviewerUid} isSuperAdmin />
    </section>
  );
}
