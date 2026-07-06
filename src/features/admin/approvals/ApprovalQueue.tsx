import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  FileCheck2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApprovalRequest, Member } from '../../../types';
import { formatBase64ToImageSource } from '../../../utils/imageUtils';
import {
  reviewApprovalRequest,
  subscribePendingApprovals,
} from '../../approvals/approvalRepository';
import { Badge, Button, Card, EmptyState } from '../../../components/ui/primitives';

const kindLabels: Record<ApprovalRequest['kind'], string> = {
  member_create: 'New member',
  member_update: 'Profile update',
  announcement: 'Announcement',
  event: 'Event',
  ai_content: 'AI-assisted draft',
};

function value(payload: Record<string, unknown>, key: keyof Member) {
  return payload[key] == null ? '' : String(payload[key]);
}

function MemberReviewCard({ request }: { request: ApprovalRequest }) {
  const { t } = useTranslation();
  const payload = request.payload;
  const skills = [
    ...(Array.isArray(payload.techSkills) ? payload.techSkills : []),
    ...(Array.isArray(payload.softSkills) ? payload.softSkills : []),
  ].map(String).filter(Boolean);
  const photo = value(payload, 'photoURL');
  const fullName = value(payload, 'fullName') || request.ownerName;
  const socialLinks = [
    ['Instagram', value(payload, 'instagram')],
    ['Facebook', value(payload, 'facebook')],
    ['YouTube', value(payload, 'ytChannels')],
  ].filter(([, entry]) => entry);

  return (
    <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
      <aside className="rounded-2xl border border-slate-700/60 bg-slate-950/65 p-5 text-center">
        {photo ? (
          <img
            src={formatBase64ToImageSource(photo)}
            alt=""
            className="mx-auto size-28 rounded-2xl border border-amber-400/30 object-cover"
          />
        ) : (
          <div className="mx-auto grid size-28 place-items-center rounded-2xl bg-slate-800 text-amber-300">
            <UserRound className="size-10" />
          </div>
        )}
        <h4 className="mt-4 text-lg font-black text-white">{fullName}</h4>
        {value(payload, 'fullNameTa') && (
          <p lang="ta" className="mt-1 text-sm text-amber-200">{value(payload, 'fullNameTa')}</p>
        )}
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {[value(payload, 'parish'), value(payload, 'diocese')].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-4 space-y-2 text-left text-xs text-slate-300">
          {value(payload, 'email') && <p className="flex gap-2"><Mail className="size-4 shrink-0 text-amber-300" />{value(payload, 'email')}</p>}
          {value(payload, 'phone') && <p className="flex gap-2"><Phone className="size-4 shrink-0 text-amber-300" />{value(payload, 'phone')}</p>}
          {value(payload, 'currentAddress') && <p className="flex gap-2"><MapPin className="size-4 shrink-0 text-amber-300" />{value(payload, 'currentAddress')}</p>}
        </div>
      </aside>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{t('approval.ministry')}</p>
          <p className="mt-2 text-sm font-bold text-white">{value(payload, 'profession') || 'Not specified'}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{value(payload, 'ambition') || value(payload, 'roles') || 'No ministry statement provided.'}</p>
        </section>
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{t('approval.skills')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length ? skills.slice(0, 12).map(skill => (
              <span key={skill} className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-200">{skill}</span>
            )) : <p className="text-xs text-slate-500">No skills listed.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4 sm:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{t('approval.biography')}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {value(payload, 'biographyDraft') || value(payload, 'fiveYears') || 'No biography supplied.'}
          </p>
        </section>
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{t('approval.experience')}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{value(payload, 'achievements') || value(payload, 'fiveYears') || 'Not specified'}</p>
        </section>
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{t('approval.socialLinks')}</p>
          <div className="mt-2 space-y-2 text-xs text-slate-300">
            {socialLinks.length ? socialLinks.map(([label, entry]) => <p key={label}><strong>{label}:</strong> {entry}</p>) : <p className="text-slate-500">No social profiles supplied.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function ContentReviewCard({ request }: { request: ApprovalRequest }) {
  return (
    <dl className="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 sm:grid-cols-2">
      {Object.entries(request.payload)
        .filter(([, entry]) => typeof entry !== 'object')
        .slice(0, 12)
        .map(([key, entry]) => (
          <div key={key}>
            <dt className="text-[10px] font-black uppercase tracking-wider text-amber-300">{key.replace(/([A-Z])/g, ' $1')}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{String(entry || '—')}</dd>
          </div>
        ))}
    </dl>
  );
}

export function ApprovalQueue({
  reviewerUid,
  isSuperAdmin = false,
}: {
  reviewerUid: string;
  isSuperAdmin?: boolean;
}) {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [developerId, setDeveloperId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(
    () => subscribePendingApprovals(setRequests, error => setErrorMessage(error.message)),
    [],
  );

  const decide = async (
    request: ApprovalRequest,
    decision: 'approve' | 'reject' | 'request_changes',
  ) => {
    const note = notes[request.id]?.trim() || '';
    if (decision === 'request_changes' && !note) {
      setErrorMessage('Add clear revision guidance before requesting changes.');
      setExpandedId(request.id);
      return;
    }
    setWorkingId(request.id);
    setErrorMessage('');
    try {
      await reviewApprovalRequest(request, decision, reviewerUid, note);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The review could not be completed.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <section aria-labelledby="approval-queue-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">{t('approval.eyebrow')}</p>
          <h2 id="approval-queue-title" className="mt-1 font-serif text-2xl font-bold text-white">{t('approval.title')}</h2>
          <p className="mt-1 text-sm text-slate-400">{t('approval.description')}</p>
        </div>
        <Badge tone={requests.length ? 'warning' : 'success'}>{t('approval.pending', { count: requests.length })}</Badge>
      </div>

      {errorMessage && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100" role="alert">{errorMessage}</p>}

      {!requests.length ? (
        <EmptyState icon={<FileCheck2 className="size-5" />} title={t('approval.clearTitle')} description={t('approval.clearDescription')} />
      ) : (
        <div className="grid gap-3">
          {requests.map(request => {
            const expanded = expandedId === request.id;
            const isAI = request.kind === 'ai_content';
            const isMember = request.kind === 'member_create' || request.kind === 'member_update';
            return (
              <Card key={request.id} className="overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={isAI ? 'gold' : 'neutral'}>{isAI && <Sparkles className="mr-1 size-3" />}{kindLabels[request.kind]}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 className="size-3" />{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-white">{request.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{request.summary}</p>
                      <p className="mt-2 text-xs text-slate-500">{t('approval.submittedBy', { name: request.ownerName })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" onClick={() => setExpandedId(expanded ? null : request.id)} aria-expanded={expanded}>
                        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}{t('common.reviewDetails')}
                      </Button>
                      <Button type="button" variant="ghost" loading={workingId === request.id} onClick={() => void decide(request, 'request_changes')}>
                        <MessageSquareText className="size-4" />{t('common.requestChanges')}
                      </Button>
                      <Button type="button" variant="danger" loading={workingId === request.id} onClick={() => void decide(request, 'reject')}>
                        <X className="size-4" />{t('common.reject')}
                      </Button>
                      <Button type="button" loading={workingId === request.id} onClick={() => void decide(request, 'approve')}>
                        <Check className="size-4" />{t('common.approve')}
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-5 border-t border-slate-700/60 pt-5">
                      {isMember ? <MemberReviewCard request={request} /> : <ContentReviewCard request={request} />}
                      {isSuperAdmin && (
                        <div className="mt-4">
                          <Button type="button" variant="ghost" onClick={() => setDeveloperId(developerId === request.id ? null : request.id)}>
                            <Code2 className="size-4" />{t('common.developerView')}
                          </Button>
                          {developerId === request.id && (
                            <pre className="vox-scrollbar mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950/75 p-4 text-xs leading-6 text-slate-300">
                              {JSON.stringify(request.payload, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                      <label htmlFor={`review-note-${request.id}`} className="mt-4 block text-xs font-bold text-slate-300">{t('approval.reviewNote')}</label>
                      <textarea
                        id={`review-note-${request.id}`}
                        value={notes[request.id] || ''}
                        onChange={event => setNotes(current => ({ ...current, [request.id]: event.target.value }))}
                        rows={3}
                        maxLength={500}
                        className="vox-focus mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white"
                        placeholder={t('approval.reviewPlaceholder')}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
