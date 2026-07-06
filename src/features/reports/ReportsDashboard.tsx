import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Member } from '../../types';
import type { Course, Enrollment } from '../courses/courseTypes';
import { subscribeAllCourses } from '../courses/courseRepository';
import { subscribeAllEnrollments } from '../courses/enrollmentRepository';
import type { Achievement } from '../excellence/achievementTypes';
import { subscribeAllAchievements } from '../excellence/achievementRepository';
import type { VoxGroupMembership } from '../voxgroup/voxGroupTypes';
import { VOX_GROUPS } from '../voxgroup/voxGroupTypes';
import { subscribeGroupMemberships } from '../voxgroup/voxGroupRepository';
import type { TrainerApplication } from '../trainers/trainerTypes';
import { subscribeAllApplications } from '../trainers/trainerRepository';
import type { MadhaTvParticipant } from '../madhatv/madhaTvTypes';
import { subscribeAllParticipants } from '../madhatv/madhaTvRepository';
import type { Campaign } from '../campaigns/campaignTypes';
import { subscribeAllCampaigns } from '../campaigns/campaignRepository';
import { exportCsv } from './exportCsv';

interface ReportsDashboardProps {
  members: Member[];
}

const CHART_GOLD = '#f5bd32';
const CHART_GRID = 'rgba(148,163,184,0.15)';
const CHART_TEXT = '#9aa6bd';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

export default function ReportsDashboard({ members }: ReportsDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [groupMembers, setGroupMembers] = useState<VoxGroupMembership[]>([]);
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [participants, setParticipants] = useState<MadhaTvParticipant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const unsubs = [
      subscribeAllCourses(setCourses, () => undefined),
      subscribeAllEnrollments(setEnrollments, () => undefined),
      subscribeAllAchievements(setAchievements, () => undefined),
      subscribeGroupMemberships(setGroupMembers, () => undefined),
      subscribeAllApplications(setApplications, () => undefined),
      subscribeAllParticipants(setParticipants, () => undefined),
      subscribeAllCampaigns(setCampaigns, () => undefined),
    ];
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  const activeEnrollments = useMemo(
    () => enrollments.filter(e => e.status !== 'cancelled'),
    [enrollments],
  );

  const enrollmentChart = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of activeEnrollments) {
      counts.set(e.courseTitle, (counts.get(e.courseTitle) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name: name.length > 22 ? `${name.slice(0, 22)}…` : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [activeEnrollments]);

  const groupChart = useMemo(
    () =>
      VOX_GROUPS.map(group => ({
        name: group.name,
        count: groupMembers.filter(m => m.groupId === group.id).length,
      })),
    [groupMembers],
  );

  const publishedAchievements = achievements.filter(a => a.status === 'published').length;
  const pendingAchievements = achievements.filter(a => a.status === 'pending').length;
  const approvedTrainers = applications.filter(a => a.status === 'approved').length;
  const pendingTrainers = applications.filter(a => a.status === 'pending').length;
  const approvedParticipants = participants.filter(p => p.status === 'approved').length;

  const reports: Array<{ label: string; onExport: () => void }> = [
    {
      label: 'Member report',
      onExport: () =>
        exportCsv('members-report', ['Name', 'Status', 'Class', 'Diocese', 'Parish'],
          members.map(m => [m.fullName, m.status, m.membershipClass, m.diocese ?? '', m.parish ?? ''])),
    },
    {
      label: 'Course enrollment report',
      onExport: () =>
        exportCsv('enrollments-report', ['Course', 'Member', 'Enrolled at', 'Status', 'Payment'],
          enrollments.map(e => [e.courseTitle, e.memberName, e.enrolledAt, e.status, e.paymentStatus])),
    },
    {
      label: 'Achievement report',
      onExport: () =>
        exportCsv('achievements-report', ['Title', 'Member', 'Category', 'Status', 'Date', 'Parish'],
          achievements.map(a => [a.title, a.memberName, a.category, a.status, a.achievedOn, a.parish ?? ''])),
    },
    {
      label: 'Vox Group report',
      onExport: () =>
        exportCsv('voxgroup-report', ['Group', 'Member', 'Joined at'],
          groupMembers.map(m => [m.groupId, m.memberName, m.joinedAt])),
    },
    {
      label: 'Trainer report',
      onExport: () =>
        exportCsv('trainers-report', ['Name', 'Email', 'Qualification', 'Status', 'Preference'],
          applications.map(a => [a.fullName, a.email, a.qualification, a.status, a.preference])),
    },
    {
      label: 'Madha TV participation report',
      onExport: () =>
        exportCsv('madhatv-report', ['Program', 'Member', 'Status', 'Registered at'],
          participants.map(p => [p.programTitle, p.memberName, p.status, p.registeredAt])),
    },
    {
      label: 'Campaign report',
      onExport: () =>
        exportCsv('campaigns-report', ['Title', 'Type', 'Audience', 'Status', 'Publish date'],
          campaigns.map(c => [c.title, c.type, c.audience, c.status, c.publishDate ?? ''])),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Reports &amp; analytics
        </p>
        <h2 className="text-xl font-black tracking-tight text-white">Ministry overview</h2>
        <p className="mt-1 text-sm text-slate-400">
          Live counts across every module, with CSV exports for offline reporting.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Members" value={members.length}
          sub={`${members.filter(m => m.status === 'Pending').length} pending`} />
        <StatCard label="Courses" value={courses.length}
          sub={`${courses.filter(c => c.status === 'published').length} published`} />
        <StatCard label="Enrollments" value={activeEnrollments.length}
          sub={`${activeEnrollments.filter(e => e.paymentStatus === 'paid').length} paid`} />
        <StatCard label="Achievements" value={publishedAchievements}
          sub={`${pendingAchievements} pending review`} />
        <StatCard label="Trainers" value={approvedTrainers} sub={`${pendingTrainers} applications pending`} />
        <StatCard label="Vox Group members" value={groupMembers.length} />
        <StatCard label="Madha TV participants" value={approvedParticipants}
          sub={`${participants.filter(p => p.status === 'pending').length} pending`} />
        <StatCard label="Campaigns" value={campaigns.length}
          sub={`${campaigns.filter(c => c.status === 'published').length} published`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label="Enrollments per course" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-amber-400">
            Enrollments per course
          </h3>
          {enrollmentChart.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No enrollments yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentChart} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: CHART_TEXT, fontSize: 10 }} interval={0} angle={-20} height={54} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#0d1222', border: '1px solid rgba(148,163,184,.25)', borderRadius: 12, color: '#f8fafc' }} />
                  <Bar dataKey="count" fill={CHART_GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section aria-label="Vox Group membership" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-amber-400">
            Vox Group membership
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupChart} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: CHART_TEXT, fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: '#0d1222', border: '1px solid rgba(148,163,184,.25)', borderRadius: 12, color: '#f8fafc' }} />
                <Bar dataKey="count" fill={CHART_GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section aria-label="CSV exports" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-amber-400">
          Export reports (CSV)
        </h3>
        <div className="flex flex-wrap gap-2">
          {reports.map(report => (
            <button key={report.label} onClick={report.onExport}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5 hover:text-white">
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> {report.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
