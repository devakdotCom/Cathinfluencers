import {
  Bot,
  CalendarPlus,
  FileText,
  Lightbulb,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { AppRole } from '../auth/AuthProvider';
import type { Member } from '../../types';
import { Badge, Button, Card, EmptyState } from '../../components/ui/primitives';
import {
  createAnnouncementDraft,
  createEventDraft,
  draftBiographyLocally,
  findMatchingMembers,
  suggestMinistries,
  type AssistantDraft,
  type AssistantMode,
} from './assistantEngine';
import { draftBiography } from './biographyService';
import { submitApprovalRequest } from '../approvals/approvalRepository';

interface AIAssistantProps {
  user: User | null;
  role: AppRole;
  currentMember: Member | null;
  members: Member[];
  onOpenMember: (member: Member) => void;
}

const modes: Array<{
  id: AssistantMode;
  label: string;
  description: string;
  icon: typeof Search;
}> = [
  {
    id: 'find_member',
    label: 'Find a collaborator',
    description: 'Search skills, ministry, parish, or profession.',
    icon: Search,
  },
  {
    id: 'biography',
    label: 'Draft my biography',
    description: 'Create an editable profile biography.',
    icon: UserRound,
  },
  {
    id: 'announcement',
    label: 'Draft an announcement',
    description: 'Prepare a concise ministry notice.',
    icon: FileText,
  },
  {
    id: 'event',
    label: 'Draft an event',
    description: 'Prepare an event description for review.',
    icon: CalendarPlus,
  },
  {
    id: 'ministry',
    label: 'Suggest ministries',
    description: 'Match strengths with practical service.',
    icon: Lightbulb,
  },
];

export function AIAssistant({
  user,
  role,
  currentMember,
  members,
  onOpenMember,
}: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('find_member');
  const [prompt, setPrompt] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [draft, setDraft] = useState<AssistantDraft | null>(null);
  const [matches, setMatches] = useState<Member[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const selectedMode = useMemo(
    () => modes.find(item => item.id === mode) || modes[0],
    [mode],
  );

  const resetOutput = () => {
    setDraft(null);
    setMatches([]);
    setSuggestions([]);
    setFeedback('');
  };

  const runAssistant = async () => {
    resetOutput();
    if (mode === 'find_member') {
      setMatches(findMatchingMembers(prompt, members));
      return;
    }
    if (mode === 'ministry') {
      setSuggestions(suggestMinistries(currentMember, prompt));
      return;
    }
    if (mode === 'biography') {
      if (!currentMember) {
        setFeedback('Sign in with a linked member profile to draft your biography.');
        return;
      }
      setWorking(true);
      try {
        let content = draftBiographyLocally(currentMember);
        const remoteAssistantAvailable =
          !import.meta.env.PROD || Boolean(import.meta.env.VITE_API_BASE_URL);
        if (remoteAssistantAvailable) {
          try {
            const drafts = await draftBiography({
              name: currentMember.fullName,
              parish: currentMember.parish,
              diocese: currentMember.diocese,
              profession: currentMember.profession || '',
              ambition: currentMember.ambition,
              ministry: currentMember.roles,
              experience: currentMember.fiveYears || currentMember.achievements,
              interests: currentMember.hobbies,
              skills: currentMember.techSkills || [],
            });
            content = drafts.ministry;
          } catch {
            // The private API is optional; the safe local draft remains available.
          }
        }
        setDraft({
          title: `${currentMember.fullName} biography`,
          content,
          publishAs: 'member_biography',
        });
      } finally {
        setWorking(false);
      }
      return;
    }
    setDraft(
      mode === 'announcement'
        ? createAnnouncementDraft(prompt, user?.displayName || user?.email || 'Vox member')
        : createEventDraft(prompt, eventDate),
    );
  };

  const submitDraft = async () => {
    if (!draft || !draft.publishAs || !user) return;
    setWorking(true);
    setFeedback('');
    try {
      let payload: Record<string, unknown>;
      if (draft.publishAs === 'member_biography' && currentMember) {
        payload = {
          publishAs: draft.publishAs,
          member: { ...currentMember, biographyDraft: draft.content },
        };
      } else {
        payload = {
          publishAs: draft.publishAs,
          content: draft.structuredContent,
        };
      }
      await submitApprovalRequest({
        kind: 'ai_content',
        title: `AI-assisted ${draft.publishAs.replaceAll('_', ' ')}`,
        summary: draft.title,
        ownerUid: user.uid,
        ownerName: user.displayName || user.email || 'Vox member',
        targetId: currentMember?.id,
        payload,
      });
      setFeedback('Draft submitted for administrator review. It is not published yet.');
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'The draft could not be submitted.',
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        iconOnly
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 z-40 rounded-full bg-slate-950/90 shadow-2xl md:bottom-6 md:left-6"
        onClick={() => setOpen(true)}
        aria-label="Open Vox AI assistant"
      >
        <Sparkles className="size-5 text-amber-300" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            className="vox-glass vox-safe-bottom flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:max-h-[85dvh] sm:rounded-3xl"
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-700/60 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
                  <Bot className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="ai-assistant-title" className="font-serif text-xl font-bold text-white">
                      Vox Guide
                    </h2>
                    <Badge tone="gold">Draft only</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Smart assistance with human review before publication
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                iconOnly
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
              >
                <X className="size-5" />
              </Button>
            </header>

            <div className="vox-scrollbar grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[18rem_1fr]">
              <nav
                aria-label="AI assistant tools"
                className="flex gap-2 overflow-x-auto border-b border-slate-700/60 p-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r"
              >
                {modes.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setMode(item.id);
                        resetOutput();
                      }}
                      className={`vox-focus min-h-14 min-w-44 rounded-2xl p-3 text-left transition lg:min-w-0 ${
                        mode === item.id
                          ? 'bg-amber-400/12 text-white'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <Icon className="size-4 text-amber-300" />
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="min-w-0 p-4 sm:p-6">
                <Badge>{role || 'public'} workspace</Badge>
                <h3 className="mt-3 font-serif text-2xl font-bold text-white">
                  {selectedMode.label}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{selectedMode.description}</p>

                {mode !== 'biography' && (
                  <div className="mt-5">
                    <label htmlFor="assistant-prompt" className="text-xs font-bold text-slate-300">
                      {mode === 'find_member'
                        ? 'What collaborator do you need?'
                        : mode === 'ministry'
                          ? 'Tell us about your interests'
                          : 'Draft topic'}
                    </label>
                    <textarea
                      id="assistant-prompt"
                      value={prompt}
                      onChange={event => setPrompt(event.target.value)}
                      rows={3}
                      maxLength={600}
                      placeholder={
                        mode === 'find_member'
                          ? 'Example: video editor in Chennai who works with youth'
                          : 'Describe the topic in a sentence'
                      }
                      className="vox-focus mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white placeholder:text-slate-600"
                    />
                  </div>
                )}

                {mode === 'event' && (
                  <div className="mt-3">
                    <label htmlFor="assistant-event-date" className="text-xs font-bold text-slate-300">
                      Proposed date
                    </label>
                    <input
                      id="assistant-event-date"
                      type="date"
                      value={eventDate}
                      onChange={event => setEventDate(event.target.value)}
                      className="vox-focus mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-white"
                    />
                  </div>
                )}

                <Button
                  type="button"
                  className="mt-4"
                  loading={working}
                  onClick={() => void runAssistant()}
                >
                  <Sparkles className="size-4" />
                  Generate response
                </Button>

                {draft && (
                  <Card className="mt-5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-white">{draft.title}</h4>
                      <Badge tone="warning">Requires review</Badge>
                    </div>
                    <textarea
                      value={draft.content}
                      onChange={event =>
                        setDraft(current =>
                          current ? { ...current, content: event.target.value } : current,
                        )
                      }
                      rows={7}
                      className="vox-focus mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm leading-6 text-slate-200"
                      aria-label="Editable AI draft"
                    />
                    {user && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3"
                        loading={working}
                        onClick={() => void submitDraft()}
                      >
                        <Send className="size-4" />
                        Submit for admin review
                      </Button>
                    )}
                  </Card>
                )}

                {matches.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {matches.map(member => (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => {
                          onOpenMember(member);
                          setOpen(false);
                        }}
                        className="vox-focus rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-left transition hover:border-amber-400/40"
                      >
                        <span className="block font-bold text-white">{member.fullName}</span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {[member.profession, member.parish].filter(Boolean).join(' | ')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {mode === 'find_member' && prompt && !matches.length && !working && (
                  <EmptyState
                    icon={<Search className="size-5" />}
                    title="No collaborators found"
                    description="Try a broader skill, ministry, parish, or profession."
                    className="mt-5"
                  />
                )}

                {suggestions.length > 0 && (
                  <Card className="mt-5 p-5">
                    <h4 className="font-bold text-white">Recommended ministry paths</h4>
                    <div className="mt-3 space-y-2">
                      {suggestions.map(suggestion => (
                        <div
                          key={suggestion}
                          className="flex gap-3 rounded-xl bg-slate-900/60 p-3 text-sm text-slate-200"
                        >
                          <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-300" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {feedback && (
                  <p
                    className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100"
                    role="status"
                  >
                    {feedback}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
