import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import type { VoxGroupActivity, VoxGroupId, VoxGroupMembership } from './voxGroupTypes';
import { VOX_GROUPS } from './voxGroupTypes';
import {
  joinGroup,
  leaveGroup,
  subscribeGroupActivities,
  subscribeGroupMemberships,
  subscribeMyMemberships,
} from './voxGroupRepository';

interface VoxGroupHubProps {
  memberUid?: string;
  memberName?: string;
  onRequireSignIn: () => void;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

export default function VoxGroupHub({
  memberUid,
  memberName,
  onRequireSignIn,
  onAddActivityLog,
}: VoxGroupHubProps) {
  const [memberships, setMemberships] = useState<VoxGroupMembership[]>([]);
  const [mine, setMine] = useState<VoxGroupMembership[]>([]);
  const [activities, setActivities] = useState<VoxGroupActivity[] | null>(null);
  const [busyGroup, setBusyGroup] = useState<VoxGroupId | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Membership counts are only readable when signed in (privacy rule);
  // signed-out visitors still see the pillars and public activities.
  useEffect(() => {
    if (!memberUid) {
      setMemberships([]);
      return;
    }
    return subscribeGroupMemberships(setMemberships, () => undefined);
  }, [memberUid]);

  useEffect(() => {
    if (!memberUid) {
      setMine([]);
      return;
    }
    return subscribeMyMemberships(memberUid, setMine, () => undefined);
  }, [memberUid]);

  useEffect(() => {
    return subscribeGroupActivities(
      setActivities,
      () => setNotice({ kind: 'err', text: 'Group activities could not be loaded right now.' }),
    );
  }, []);

  const countFor = useMemo(() => {
    const counts = new Map<VoxGroupId, number>();
    for (const m of memberships) counts.set(m.groupId, (counts.get(m.groupId) ?? 0) + 1);
    return counts;
  }, [memberships]);

  const myActiveGroups = useMemo(
    () => new Set(mine.filter(m => m.status === 'active').map(m => m.groupId)),
    [mine],
  );

  const handleToggle = async (groupId: VoxGroupId, groupName: string) => {
    if (!memberUid) {
      onRequireSignIn();
      return;
    }
    setBusyGroup(groupId);
    setNotice(null);
    try {
      if (myActiveGroups.has(groupId)) {
        await leaveGroup(groupId, memberUid);
        onAddActivityLog?.('Vox Group Left', groupId, groupName, 'Member left the group.');
        setNotice({ kind: 'ok', text: `You left ${groupName}.` });
      } else {
        await joinGroup(groupId, memberUid, memberName ?? 'Member');
        onAddActivityLog?.('Vox Group Joined', groupId, groupName, 'Member joined the group.');
        setNotice({ kind: 'ok', text: `Welcome to ${groupName}!` });
      }
    } catch (error) {
      setNotice({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Action failed. Please try again.',
      });
    } finally {
      setBusyGroup(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Vox Group · Four pillars of belonging
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Find your community
        </h2>
        <p className="mt-1 text-sm text-slate-400 max-w-2xl">
          Every member finds a home, a mission, and a community to grow with. Join one pillar or
          several; participate in events and announcements below.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            notice.kind === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {VOX_GROUPS.map(group => {
          const joined = myActiveGroups.has(group.id);
          const busy = busyGroup === group.id;
          const count = countFor.get(group.id) ?? 0;
          return (
            <article
              key={group.id}
              className={`flex flex-col rounded-2xl border p-5 text-center transition ${
                joined
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-950'
                  : 'border-slate-800 bg-slate-900/60 hover:border-amber-500/30'
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-xl text-slate-950" aria-hidden="true">
                {group.symbol}
              </div>
              <h3 className="mt-3 text-base font-black uppercase tracking-wide text-white">
                {group.name}
              </h3>
              <p className="mt-1 text-[12px] font-bold text-amber-200/90">{group.motto}</p>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-slate-400">
                {group.description}
              </p>
              {memberUid && (
                <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {count} member{count === 1 ? '' : 's'}
                </p>
              )}
              <button
                onClick={() => handleToggle(group.id, group.name)}
                disabled={busy}
                className={`mt-3 w-full cursor-pointer rounded-xl border-0 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition disabled:opacity-60 ${
                  joined
                    ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {busy ? 'Working…' : joined ? 'Leave group' : memberUid ? 'Join group' : 'Sign in to join'}
              </button>
            </article>
          );
        })}
      </div>

      <section aria-label="Group activities" className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">
          Activities &amp; announcements
        </h3>
        {activities === null ? (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8 text-center text-sm text-slate-400">
            No group activities announced yet. New events and announcements will appear here.
          </div>
        ) : (
          <ul className="space-y-2">
            {activities.map(activity => {
              const group = VOX_GROUPS.find(g => g.id === activity.groupId);
              return (
                <li key={activity.id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                      {group?.name ?? activity.groupId}
                    </span>
                    <span className="text-sm font-bold text-white">{activity.title}</span>
                    {activity.activityDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <CalendarDays className="h-3 w-3" aria-hidden="true" />
                        {new Date(activity.activityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{activity.description}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
