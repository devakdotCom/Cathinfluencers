import { useEffect, useState } from 'react';
import { Archive, CheckCircle2, Copy, PencilLine, Plus, Trash2 } from 'lucide-react';
import type { Campaign, CampaignFormValues } from './campaignTypes';
import {
  CAMPAIGN_AUDIENCES,
  CAMPAIGN_TYPES,
  EMPTY_CAMPAIGN_FORM,
  campaignCopies,
} from './campaignTypes';
import {
  campaignFromForm,
  deleteCampaign,
  saveCampaign,
  setCampaignStatus,
  subscribeAllCampaigns,
} from './campaignRepository';

interface CampaignAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

function formFromCampaign(campaign: Campaign): CampaignFormValues {
  return {
    title: campaign.title,
    type: campaign.type,
    audience: campaign.audience,
    message: campaign.message,
    imageUrl: campaign.imageUrl ?? '',
    cta: campaign.cta ?? '',
    publishDate: campaign.publishDate ?? '',
  };
}

export default function CampaignAdminManager({ adminUid, onAddActivityLog }: CampaignAdminManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null);
  const [form, setForm] = useState<CampaignFormValues>(EMPTY_CAMPAIGN_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAllCampaigns(
      setCampaigns,
      () => setNotice({ kind: 'err', text: 'Campaigns could not be loaded.' }),
    );
  }, []);

  const set = <K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const startCreate = () => {
    setEditing('new');
    setForm(EMPTY_CAMPAIGN_FORM);
    setNotice(null);
  };

  const startEdit = (campaign: Campaign) => {
    setEditing(campaign);
    setForm(formFromCampaign(campaign));
    setNotice(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setNotice({ kind: 'err', text: 'Title and message are required.' });
      return;
    }
    setBusy(true);
    try {
      const campaign = campaignFromForm(form, adminUid, editing === 'new' ? undefined : editing ?? undefined);
      await saveCampaign(campaign);
      onAddActivityLog?.(
        editing === 'new' ? 'Campaign Created' : 'Campaign Updated',
        campaign.id, campaign.title, `${campaign.type} → ${campaign.audience}.`);
      setNotice({ kind: 'ok', text: `"${campaign.title}" saved.` });
      setEditing(null);
    } catch {
      setNotice({ kind: 'err', text: 'Saving failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (campaign: Campaign, status: Campaign['status']) => {
    setBusy(true);
    try {
      await setCampaignStatus(campaign.id, status, adminUid);
      onAddActivityLog?.('Campaign Status Changed', campaign.id, campaign.title, `Status set to ${status}.`);
    } catch {
      setNotice({ kind: 'err', text: 'Status change failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    setBusy(true);
    try {
      await deleteCampaign(campaign.id);
      onAddActivityLog?.('Campaign Deleted', campaign.id, campaign.title, 'Removed permanently.');
      setConfirmDeleteId(null);
    } catch {
      setNotice({ kind: 'err', text: 'Delete failed.' });
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setNotice({ kind: 'err', text: 'Copy failed. Select and copy manually.' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Campaign management
          </p>
          <h2 className="text-xl font-black tracking-tight text-white">Communications planner</h2>
          <p className="mt-1 text-sm text-slate-400">
            Write once; copy channel-ready text for WhatsApp, email, and social media.
          </p>
        </div>
        <button onClick={startCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400">
          <Plus className="h-4 w-4" aria-hidden="true" /> New campaign
        </button>
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

      {editing && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
            {editing === 'new' ? 'Create campaign' : `Edit: ${editing.title}`}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="cmp-title">Campaign title *</label>
              <input id="cmp-title" className={inputClass} value={form.title} maxLength={160}
                onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="cmp-type">Type</label>
              <select id="cmp-type" className={inputClass} value={form.type}
                onChange={e => set('type', e.target.value as CampaignFormValues['type'])}>
                {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="cmp-aud">Target audience</label>
              <select id="cmp-aud" className={inputClass} value={form.audience}
                onChange={e => set('audience', e.target.value as CampaignFormValues['audience'])}>
                {CAMPAIGN_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="cmp-msg">Message *</label>
              <textarea id="cmp-msg" className={inputClass} rows={4} value={form.message}
                maxLength={2000} onChange={e => set('message', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="cmp-cta">Call to action</label>
              <input id="cmp-cta" className={inputClass} value={form.cta} maxLength={300}
                onChange={e => set('cta', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="cmp-date">Publish date</label>
              <input id="cmp-date" type="date" className={inputClass} value={form.publishDate}
                onChange={e => set('publishDate', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="cmp-img">Image URL (Cloudinary)</label>
              <input id="cmp-img" className={inputClass} value={form.imageUrl}
                placeholder="https://res.cloudinary.com/…" onChange={e => set('imageUrl', e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} disabled={busy}
              className="cursor-pointer rounded-xl border-0 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {busy ? 'Saving…' : 'Save campaign'}
            </button>
            <button onClick={() => setEditing(null)} disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {campaigns === null ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
          No campaigns yet. Create one to generate channel-ready copy.
        </div>
      ) : (
        <ul className="space-y-2">
          {campaigns.map(campaign => {
            const copies = campaignCopies(campaign);
            const expanded = expandedId === campaign.id;
            return (
              <li key={campaign.id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">{campaign.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                        campaign.status === 'published' ? 'bg-emerald-500/10 text-emerald-300'
                        : campaign.status === 'draft' ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-slate-500/10 text-slate-400'
                      }`}>{campaign.status}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {campaign.type} · {campaign.audience}
                      {campaign.publishDate ? ` · ${campaign.publishDate}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setExpandedId(expanded ? null : campaign.id)}
                      className="cursor-pointer rounded-lg border-0 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/10">
                      {expanded ? 'Hide copy' : 'Get copy'}
                    </button>
                    <button onClick={() => startEdit(campaign)} title="Edit" aria-label={`Edit ${campaign.title}`}
                      className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
                      <PencilLine className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {campaign.status !== 'published' ? (
                      <button onClick={() => handleStatus(campaign, 'published')} disabled={busy}
                        title="Mark published" aria-label={`Mark ${campaign.title} published`}
                        className="cursor-pointer rounded-lg border-0 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button onClick={() => handleStatus(campaign, 'archived')} disabled={busy}
                        title="Archive" aria-label={`Archive ${campaign.title}`}
                        className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                        <Archive className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    {confirmDeleteId === campaign.id ? (
                      <button onClick={() => handleDelete(campaign)} disabled={busy}
                        className="cursor-pointer rounded-lg border-0 bg-rose-500/20 px-2.5 py-2 text-[10px] font-black uppercase text-rose-300 transition hover:bg-rose-500/30">
                        Confirm delete
                      </button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(campaign.id)}
                        title="Delete" aria-label={`Delete ${campaign.title}`}
                        className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {([['WhatsApp', copies.whatsapp], ['Email', copies.email], ['Social media', copies.social]] as const).map(([label, text]) => {
                      const key = `${campaign.id}-${label}`;
                      return (
                        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">{label}</span>
                            <button onClick={() => copyText(key, text)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 transition hover:bg-white/10">
                              <Copy className="h-3 w-3" aria-hidden="true" />
                              {copiedKey === key ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-slate-400">{text}</pre>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
