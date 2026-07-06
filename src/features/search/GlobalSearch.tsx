import {
  CalendarDays,
  FileText,
  Library,
  Megaphone,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { Announcement, CalendarEvent, Member } from '../../types';
import { Badge, Button, EmptyState } from '../../components/ui/primitives';

export type PublicSection =
  | 'home'
  | 'directory'
  | 'courses'
  | 'excellence'
  | 'voxgroup'
  | 'announcements'
  | 'events'
  | 'resources'
  | 'guidelines';

type ResultKind =
  | 'member'
  | 'event'
  | 'announcement'
  | 'resource'
  | 'navigation';

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  description: string;
  keywords: string;
  section?: PublicSection;
  member?: Member;
}

const kindIcons: Record<ResultKind, ComponentType<{ className?: string }>> = {
  member: UserRound,
  event: CalendarDays,
  announcement: Megaphone,
  resource: Library,
  navigation: FileText,
};

const staticResults: SearchResult[] = [
  {
    id: 'nav-directory',
    kind: 'navigation',
    title: 'Member Directory',
    description: 'Browse public ministry profiles and discover collaborators.',
    keywords: 'people members creators directory ministry parish diocese',
    section: 'directory',
  },
  {
    id: 'nav-events',
    kind: 'navigation',
    title: 'Calendar and RSVP',
    description: 'View upcoming liturgical, media, clergy, and youth events.',
    keywords: 'calendar rsvp event meeting feast holyday',
    section: 'events',
  },
  {
    id: 'nav-resources',
    kind: 'resource',
    title: 'Catholic Resource Library',
    description: 'Forms, formation material, liturgy, catechism, and canon law.',
    keywords: 'resources forms liturgy catechism canon law downloads',
    section: 'guidelines',
  },
  {
    id: 'nav-connect',
    kind: 'resource',
    title: 'Catholic Connect',
    description: 'Open the digital ecosystem for Catholic media collaboration.',
    keywords: 'catholic connect collaboration media network ecosystem',
    section: 'resources',
  },
  {
    id: 'nav-guidelines',
    kind: 'resource',
    title: 'Community Guidelines',
    description: 'Review ministry standards, conduct, and safeguarding guidance.',
    keywords: 'guidelines conduct safety policy standards',
    section: 'guidelines',
  },
  {
    id: 'nav-announcements',
    kind: 'navigation',
    title: 'Chronicles and Announcements',
    description: 'Read ministry updates and important notices.',
    keywords: 'news chronicles announcement updates notice',
    section: 'announcements',
  },
];

const normalize = (value: string) =>
  value.toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();

interface GlobalSearchProps {
  members: Member[];
  events: CalendarEvent[];
  announcements: Announcement[];
  onOpenMember: (member: Member) => void;
  onNavigate: (section: PublicSection) => void;
}

export function GlobalSearch({
  members,
  events,
  announcements,
  onOpenMember,
  onNavigate,
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentResults, setRecentResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<SearchResult[]>(
    () => [
      ...staticResults,
      ...members.map(member => ({
        id: `member-${member.id}`,
        kind: 'member' as const,
        title: member.fullName,
        description:
          [member.parish, member.diocese, member.profession]
            .filter(Boolean)
            .join(' | ') || 'Vox Ecclesiae member',
        keywords: [
          member.fullName,
          member.voxUserId,
          member.parish,
          member.diocese,
          member.profession,
          ...(member.techSkills || []),
          ...(member.softSkills || []),
        ]
          .filter(Boolean)
          .join(' '),
        member,
      })),
      ...events.map(event => ({
        id: `event-${event.id}`,
        kind: 'event' as const,
        title: event.title,
        description: [event.date, event.location, event.category]
          .filter(Boolean)
          .join(' | '),
        keywords: `${event.title} ${event.description} ${event.category} ${event.type}`,
        section: 'events' as const,
      })),
      ...announcements.map(announcement => ({
        id: `announcement-${announcement.id}`,
        kind: 'announcement' as const,
        title: announcement.title,
        description: announcement.content,
        keywords: `${announcement.title} ${announcement.content} ${announcement.author}`,
        section: 'announcements' as const,
      })),
    ],
    [announcements, events, members],
  );

  const results = useMemo(() => {
    const searchTerms = normalize(query).split(/\s+/).filter(Boolean);
    if (!searchTerms.length) {
      return recentResults.length ? recentResults : index.slice(0, 8);
    }

    return index
      .map(result => {
        const haystack = normalize(
          `${result.title} ${result.description} ${result.keywords}`,
        );
        const score = searchTerms.reduce(
          (total, term) =>
            total +
            (normalize(result.title).includes(term) ? 4 : 0) +
            (haystack.includes(term) ? 1 : 0),
          0,
        );
        return { result, score };
      })
      .filter(entry => entry.score >= searchTerms.length)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(entry => entry.result);
  }, [index, query, recentResults]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => setActiveIndex(0), [query]);

  const selectResult = (result: SearchResult) => {
    setRecentResults(current => [
      result,
      ...current.filter(item => item.id !== result.id),
    ].slice(0, 4));
    if (result.member) onOpenMember(result.member);
    else if (result.section) onNavigate(result.section);
    setIsOpen(false);
    setQuery('');
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(current => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(current => (current - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      selectResult(results[activeIndex] || results[0]);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full bg-slate-950/90 px-4 shadow-2xl md:bottom-6 md:right-6"
        onClick={() => setIsOpen(true)}
        aria-label="Open global search"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search everything</span>
        <kbd className="hidden rounded border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-400 lg:inline">
          Ctrl K
        </kbd>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/80 px-3 pb-[env(safe-area-inset-bottom)] pt-[max(4rem,env(safe-area-inset-top))] backdrop-blur-sm sm:px-6"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="vox-glass flex max-h-[min(78dvh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-700/70 p-3 sm:p-4">
              <Search className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
              <label htmlFor="global-search-input" className="sr-only">
                Search members, events, announcements, and resources
              </label>
              <input
                ref={inputRef}
                id="global-search-input"
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search people, events, resources..."
                autoComplete="off"
                className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                aria-controls="global-search-results"
                aria-activedescendant={
                  results[activeIndex] ? `search-result-${results[activeIndex].id}` : undefined
                }
              />
              <Button
                type="button"
                variant="ghost"
                iconOnly
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h2 id="global-search-title" className="text-sm font-black text-white">
                  {query ? 'Search results' : recentResults.length ? 'Recent and suggested' : 'Suggested'}
                </h2>
                <p className="text-xs text-slate-400">
                  Members, events, announcements, and ministry resources
                </p>
              </div>
              <Badge tone="gold">{results.length} found</Badge>
            </div>

            <div
              id="global-search-results"
              role="listbox"
              className="vox-scrollbar overflow-y-auto px-2 pb-3 sm:px-3"
            >
              {results.length ? (
                results.map((result, indexValue) => {
                  const Icon = kindIcons[result.kind];
                  const isActive = activeIndex === indexValue;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      id={`search-result-${result.id}`}
                      key={result.id}
                      onMouseEnter={() => setActiveIndex(indexValue)}
                      onClick={() => selectResult(result)}
                      className={`vox-focus flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        isActive
                          ? 'bg-amber-400/12 text-white'
                          : 'text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-800 text-amber-300">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {result.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {result.description}
                        </span>
                      </span>
                      <Badge>{result.kind}</Badge>
                    </button>
                  );
                })
              ) : (
                <EmptyState
                  icon={<Users className="size-5" />}
                  title="No matching records"
                  description="Try a person's name, parish, event, ministry topic, or resource."
                  className="border-0 bg-transparent shadow-none"
                />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
