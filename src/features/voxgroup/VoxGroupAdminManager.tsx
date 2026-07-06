import { useEffect, useMemo, useState } from 'react';
import { Archive, Plus, Trash2, Users } from 'lucide-react';
import type { VoxGroupActivity, VoxGroupId, VoxGroupMembership } from './voxGroupTypes';
import { VOX_GROUPS } from './voxGroupTypes';
import {
  createGroupActivity,
  deleteGroupActivity,
  setActivityStatus,
  subscribeAllGroupActivities,
  subscribeGroupMemberships,
} from './voxGroupRepository';

interface VoxGroupAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

export default function VoxGroupAdminManager({ adminUid, onAddActivityLog }: VoxGroupAdminManagerProps) {
  const [memberships, setMemberships] = useState<VoxGroupMembership[] | null>(null);
  const [activities, setActivities] = useState<VoxGroupActivity[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<VoxGroupId>('adore');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubMembers = subscribeGroupMemberships(
      setMemberships,
      () => setNotice({ kind: 'err', text: 'Group members could not be loaded.' }),
    );
    const unsubActivities = subscribeAllGroupActivities(setActivities, () => undefined);
    return () => {
      unsubMembers();
      unsubActivities();
    };
  }, []);

  const groupMembers = useMemo(
    () => (memberships ?? []).filter(m => m.groupId === selectedGroup),
    [memberships, selectedGroup],
  );

  const groupActivities = useMemo(
    () => activities.filter(a => a.groupId === selectedGroup),
    [activities, selectedGroup],
  );

  const countFor = useMemo(() => {
    const counts = new Map<VoxGroupId, number>();
    for (const m of memberships ?? []) counts.set(m.groupId, (counts.get(m.groupId) ?? 0) + 1);
    return counts;
  }, [memberships]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      setNotice({ kind: 'err', text: 'Title and description are required.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const activity = await createGroupActivity(
        { groupId: selectedGroup, title, description, activityDate: activityDate || undefined },
        adminUid,
      );
      onAddActivityLog?.('Vox Group Activity Created', activity.id, activity.title,
        `Announced for group ${selectedGroup}.`);
      setNotice({ kind: 'ok', text: `"${activity.title}" announced.` });
      setShowForm(false);
      setTitle(''); setDescription(''); setActivityDate('');
    } catch {
      setNotice({ kind: 'err', text: 'Creating the activity failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async (activity: VoxGroupActivity) => {
    setBusy(true);
    try {
      await setActivityStatus(activity.id, activity.status === 'active' ? 'archived' : 'active', adminUid);
      onAddActivityLog?.('Vox Group Activity Updated', activity.id, activity.title,
        activity.status === 'active' ? 'Archived.' : 'Restored.');
    } catch {
      setNotice({ kind: 'err', text: 'Update failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (activity: VoxGroupActivity) => {
    setBusy(true);
    try {
      await deleteGroupActivity(activity.id);
      onAddActivityLog?.('Vox Group Activity Deleted', activity.id, activity.title, 'Removed permanently.');
      setConfirmDeleteId(null);
    } catch {
      setNotice({ kind: 'err', text: 'Delete failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Vox Group administration
        </p>
        <h2 className="text-xl font-black tracking-tight text-white">Groups, members &amp; activities</h2>
      </div>

      {notice && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          notice.kind === 'ok'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        }`}>
          {notice.text}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Groups">
        {VOX_GROUPS.map(group => (
          <button key={group.id} role="tab" aria-selected={selectedGroup === group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
              selectedGroup === group.id ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}>
            {group.symbol} {group.name} ({countFor.get(group.id) ?? 0})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label="Group members" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-400">
            <Users className="h-4 w-4" aria-hidden="true" /> Members ({groupMembers.length})
          </h3>
          {memberships === null ? (
            <div className="space-y-2" aria-hidden="true">
              {[0, 1, 2].map(i => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}
            </div>
          ) : groupMembers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No members in this group yet.</p>
          ) : (
            <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-1">
              {groupMembers.map(member => (
                <li key={member.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span className="truncate font-semibold text-slate-200">{member.memberName}</span>
                  <span className="shrink-0 text-[11px] text-slate-500">
                    joined {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Group activities" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">Activities</h3>
            <button onClick={() => { setShowForm(v => !v); setNotice(null); }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-amber-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New activity
            </button>
          </div>

          {showForm && (
            <div className="mb-4 space-y-3 rounded-xl border border-amber-500/30 bg-slate-950/50 p-3">
              <div>
                <label className={labelClass} htmlFor="act-title">Title *</label>
                <input id="act-title" className={inputClass} value={title} maxLength={160}
                  onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="act-desc">Description *</label>
                <textarea id="act-desc" className={inputClass} rows={2} value={description}
                  maxLength={1000} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="act-date">Date (optional)</label>
                <input id="act-date" type="date" className={inputClass} value={activityDate}
                  onChange={e => setActivityDate(e.target.value)} />
              </div>
              <button onClick={handleCreate} disabled={busy}
                className="cursor-pointer rounded-xl border-0 bg-amber-500 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
                {busy ? 'Publishing…' : 'Publish to group'}
              </button>
            </div>
          )}

          {groupActivities.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No activities for this group yet.</p>
          ) : (
            <ul className="space-y-2">
              {groupActivities.map(activity => (
                <li key={activity.id} className="rounded-lg bg-white/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-200">{activity.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {activity.status === 'archived' ? 'Archived · ' : ''}
                        {activity.activityDate ?? activity.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button onClick={() => handleArchive(activity)} disabled={busy}
                        title={activity.status === 'active' ? 'Archive' : 'Restore'}
                        aria-label={`${activity.status === 'active' ? 'Archive' : 'Restore'} ${activity.title}`}
                        className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      {confirmDeleteId === activity.id ? (
                        <button onClick={() => handleDelete(activity)} disabled={busy}
                          className="cursor-pointer rounded-lg border-0 bg-rose-500/20 px-2.5 py-2 text-[10px] font-black uppercase text-rose-300 transition hover:bg-rose-500/30">
                          Confirm
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(activity.id)}
                          title="Delete" aria-label={`Delete ${activity.title}`}
                          className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
