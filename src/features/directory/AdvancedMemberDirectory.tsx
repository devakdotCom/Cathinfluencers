import {
  Bookmark,
  BookmarkCheck,
  Grid2X2,
  ListFilter,
  MapPinned,
  Search,
  Sparkles,
  UserRoundSearch,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { Member } from '../../types';
import { Badge, Button, Card, EmptyState } from '../../components/ui/primitives';
import {
  subscribeSavedMemberIds,
  toggleSavedMember,
} from './savedMemberRepository';
import { getMemberMatch } from './memberMatching';
import { parishDirectionsUrl } from '../maps/parishMap';
import { formatBase64ToImageSource } from '../../utils/imageUtils';

type DirectoryView = 'cards' | 'map';
type SortMode = 'match' | 'name' | 'newest';

interface AdvancedMemberDirectoryProps {
  members: Member[];
  user: User | null;
  currentMember: Member | null;
  onOpenMember: (member: Member) => void;
}

export function AdvancedMemberDirectory({
  members,
  user,
  currentMember,
  onOpenMember,
}: AdvancedMemberDirectoryProps) {
  const [query, setQuery] = useState('');
  const [diocese, setDiocese] = useState('');
  const [skill, setSkill] = useState('');
  const [sort, setSort] = useState<SortMode>(currentMember ? 'match' : 'name');
  const [view, setView] = useState<DirectoryView>('cards');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    return subscribeSavedMemberIds(
      user.uid,
      setSavedIds,
      error => setFeedback(error.message),
    );
  }, [user]);

  const dioceses = useMemo(
    () =>
      [...new Set(members.map(member => member.diocese).filter(Boolean))].sort(),
    [members],
  );
  const skills = useMemo(
    () =>
      [
        ...new Set(
          members.flatMap(member => [
            ...(member.techSkills || []),
            ...(member.softSkills || []),
          ]),
        ),
      ]
        .filter(Boolean)
        .sort()
        .slice(0, 80),
    [members],
  );

  const results = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase().trim();
    const saved = new Set(savedIds);
    return members
      .map(member => ({
        member,
        match: getMemberMatch(currentMember, member),
      }))
      .filter(({ member }) => {
        const haystack = [
          member.fullName,
          member.profession,
          member.parish,
          member.diocese,
          member.roles,
          member.ambition,
          ...(member.techSkills || []),
          ...(member.softSkills || []),
        ]
          .join(' ')
          .toLocaleLowerCase();
        return (
          (!normalizedQuery || haystack.includes(normalizedQuery)) &&
          (!diocese || member.diocese === diocese) &&
          (!skill ||
            [...(member.techSkills || []), ...(member.softSkills || [])].includes(
              skill,
            )) &&
          (!savedOnly || saved.has(member.id))
        );
      })
      .sort((left, right) => {
        if (sort === 'match') {
          return (
            right.match.score - left.match.score ||
            left.member.fullName.localeCompare(right.member.fullName)
          );
        }
        if (sort === 'newest') {
          return (
            Date.parse(right.member.joinedDate) - Date.parse(left.member.joinedDate)
          );
        }
        return left.member.fullName.localeCompare(right.member.fullName);
      });
  }, [currentMember, diocese, members, query, savedIds, savedOnly, skill, sort]);

  const parishGroups = useMemo(() => {
    const grouped = new Map<string, Member[]>();
    results.forEach(({ member }) => {
      const key = `${member.parish || 'Parish not listed'}|${member.diocese || 'Diocese not listed'}`;
      grouped.set(key, [...(grouped.get(key) || []), member]);
    });
    return [...grouped.entries()]
      .map(([key, groupMembers]) => {
        const [parish, groupDiocese] = key.split('|');
        return { parish, diocese: groupDiocese, members: groupMembers };
      })
      .sort((a, b) => b.members.length - a.members.length);
  }, [results]);

  const toggleSaved = async (memberId: string) => {
    if (!user) {
      setFeedback('Sign in to save member profiles.');
      return;
    }
    const shouldSave = !savedIds.includes(memberId);
    setSavedIds(current =>
      shouldSave
        ? [...current, memberId]
        : current.filter(savedId => savedId !== memberId),
    );
    try {
      await toggleSavedMember(user.uid, memberId, shouldSave);
    } catch (error) {
      setSavedIds(current =>
        shouldSave
          ? current.filter(savedId => savedId !== memberId)
          : [...current, memberId],
      );
      setFeedback(
        error instanceof Error ? error.message : 'Saved profiles could not be updated.',
      );
    }
  };

  return (
    <section
      aria-labelledby="advanced-directory-title"
      className="mt-12 space-y-5 border-t border-slate-800 pt-10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="gold">
            <UserRoundSearch className="mr-1 size-3" />
            Ministry discovery
          </Badge>
          <h2
            id="advanced-directory-title"
            className="mt-3 font-serif text-3xl font-black text-white"
          >
            Find Catholic collaborators
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Discover public profiles by skill, parish, diocese, and ministry fit.
            Contact details remain private.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`vox-focus min-h-11 rounded-lg px-3 text-xs font-bold ${
              view === 'cards' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            <Grid2X2 className="mr-1 inline size-4" />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            className={`vox-focus min-h-11 rounded-lg px-3 text-xs font-bold ${
              view === 'map' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            <MapPinned className="mr-1 inline size-4" />
            Parish map
          </button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search members</span>
            <Search className="absolute left-3 top-3.5 size-4 text-slate-500" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Name, ministry, profession, parish..."
              className="vox-focus min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-white"
            />
          </label>
          <label>
            <span className="sr-only">Filter by diocese</span>
            <select
              value={diocese}
              onChange={event => setDiocese(event.target.value)}
              className="vox-focus min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-white"
            >
              <option value="">All dioceses</option>
              {dioceses.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by skill</span>
            <select
              value={skill}
              onChange={event => setSkill(event.target.value)}
              className="vox-focus min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-white"
            >
              <option value="">All skills</option>
              {skills.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant={savedOnly ? 'primary' : 'secondary'}
            onClick={() => setSavedOnly(current => !current)}
          >
            <Bookmark className="size-4" />
            Saved
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ListFilter className="size-4" />
            {results.length} profiles
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Sort
            <select
              value={sort}
              onChange={event => setSort(event.target.value as SortMode)}
              className="vox-focus min-h-11 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-white"
            >
              {currentMember && <option value="match">Best match</option>}
              <option value="name">Name</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
        {feedback && (
          <p className="mt-3 text-xs text-amber-200" role="status">
            {feedback}
          </p>
        )}
      </Card>

      {!results.length ? (
        <EmptyState
          icon={<UserRoundSearch className="size-5" />}
          title="No profiles match"
          description="Try clearing a filter or searching for a broader ministry skill."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setQuery('');
                setDiocese('');
                setSkill('');
                setSavedOnly(false);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === 'map' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {parishGroups.map(group => (
            <Card key={`${group.parish}-${group.diocese}`} interactive className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
                  <MapPinned className="size-5" />
                </span>
                <Badge>{group.members.length} members</Badge>
              </div>
              <h3 className="mt-4 font-bold text-white">{group.parish}</h3>
              <p className="mt-1 text-xs text-slate-400">{group.diocese}</p>
              <div className="mt-4 flex -space-x-2">
                {group.members.slice(0, 5).map(member =>
                  member.photoURL ? (
                    <img
                      key={member.id}
                      src={formatBase64ToImageSource(member.photoURL)}
                      alt=""
                      className="size-9 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ) : (
                    <span
                      key={member.id}
                      className="grid size-9 place-items-center rounded-full border-2 border-slate-900 bg-slate-700 text-[10px] font-bold text-white"
                    >
                      {member.fullName
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  ),
                )}
              </div>
              <a
                href={parishDirectionsUrl({
                  name: group.parish,
                  diocese: group.diocese,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="vox-focus mt-5 inline-flex min-h-11 items-center rounded-xl border border-slate-700 px-3 text-xs font-bold text-amber-200 hover:bg-slate-800"
              >
                Open parish location
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map(({ member, match }) => {
            const saved = savedIds.includes(member.id);
            return (
              <Card key={member.id} interactive className="relative overflow-hidden p-5">
                <button
                  type="button"
                  onClick={() => void toggleSaved(member.id)}
                  className="vox-focus absolute right-3 top-3 grid min-h-11 min-w-11 place-items-center rounded-xl bg-slate-950/80 text-amber-300"
                  aria-label={`${saved ? 'Remove' : 'Save'} ${member.fullName}`}
                  aria-pressed={saved}
                >
                  {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
                </button>
                <div className="flex items-center gap-3 pr-12">
                  {member.photoURL ? (
                    <img
                      src={formatBase64ToImageSource(member.photoURL)}
                      alt={member.fullName}
                      loading="lazy"
                      className="size-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-2xl bg-slate-800 font-bold text-amber-200">
                      {member.fullName
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-white">{member.fullName}</h3>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {member.profession || 'Catholic media collaborator'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-400">
                  {[member.parish, member.diocese].filter(Boolean).join(' | ')}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(member.techSkills || []).slice(0, 3).map(item => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
                {currentMember && member.id !== currentMember.id && (
                  <div className="mt-4 rounded-xl bg-amber-400/8 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-200">
                        <Sparkles className="size-3" />
                        Ministry match
                      </span>
                      <Badge tone={match.score >= 50 ? 'success' : 'gold'}>
                        {match.score}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {match.reasons[0] || 'Explore this profile for complementary strengths.'}
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => onOpenMember(member)}
                >
                  View public profile
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

