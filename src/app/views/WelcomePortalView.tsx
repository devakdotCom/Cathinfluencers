import { lazy } from 'react';
const MemberForm = lazy(() => import('../../components/MemberForm'));
const MemberDetailModal = lazy(() => import('../../components/MemberDetailModal'));
const BulkImportExport = lazy(() => import('../../components/BulkImportExport'));
const AdminDashboard = lazy(() => import('../../components/AdminDashboard'));
const MyProfile = lazy(() => import('../../components/MyProfile'));
const ConnectHub = lazy(() => import('../../components/ConnectHub'));
const ResourcesLibrary = lazy(() => import('../../components/ResourcesLibrary'));
const CourseCatalog = lazy(() => import('../../features/courses/CourseCatalog'));
const CourseAdminManager = lazy(() => import('../../features/courses/CourseAdminManager'));
const AchievementWall = lazy(() => import('../../features/excellence/AchievementWall'));
const AchievementAdminManager = lazy(() => import('../../features/excellence/AchievementAdminManager'));
const VoxGroupHub = lazy(() => import('../../features/voxgroup/VoxGroupHub'));
const VoxGroupAdminManager = lazy(() => import('../../features/voxgroup/VoxGroupAdminManager'));
const TrainersHub = lazy(() => import('../../features/trainers/TrainersHub'));
const TrainerAdminManager = lazy(() => import('../../features/trainers/TrainerAdminManager'));
const MadhaTvHub = lazy(() => import('../../features/madhatv/MadhaTvHub'));
const MadhaTvAdminManager = lazy(() => import('../../features/madhatv/MadhaTvAdminManager'));
const CampaignAdminManager = lazy(() => import('../../features/campaigns/CampaignAdminManager'));
const ReportsDashboard = lazy(() => import('../../features/reports/ReportsDashboard'));
import {
  Users,
  UserPlus,
  BarChart2,
  Database,
  Activity,
  Search,
  X,
  Square,
  CheckSquare,
  Trash2,
  Edit2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Globe,
  CheckCircle2,
  Bookmark,
  LogIn,
  Calendar as CalendarIcon,
  Megaphone,
  ExternalLink,
  Music,
  Download,
  Play,
  Pause,
  FileText,
  Check,
  Menu,
  GraduationCap,
} from 'lucide-react';
import MemberCard from '../../components/MemberCard';
import { formatBase64ToImageSource } from '../../utils/imageUtils';
import { VoxShield } from '../../components/VoxShield';
import { AuthFlowNavigation } from '../../features/auth/AuthFlowNavigation';
import { MobileBottomNav } from '../../components/navigation/MobileBottomNav';
import { PersonalizedDashboard } from '../../features/dashboard/PersonalizedDashboard';
import { AdminCommandCenter } from '../../features/admin/command/AdminCommandCenter';
import { AdvancedMemberDirectory } from '../../features/directory/AdvancedMemberDirectory';
import { PrivacyAnalyticsDashboard } from '../../features/analytics/PrivacyAnalyticsDashboard';
import { PrivacyConsentCenter } from '../../features/privacy/PrivacyConsentCenter';
import { LanguageSwitcher } from '../../features/i18n/LanguageSwitcher';
import { GlobalSearch } from '../../features/search/GlobalSearch';
import { AIAssistant } from '../../features/ai/AIAssistant';
import { NotificationCenter } from '../../features/notifications/NotificationCenter';
import { usePortal } from '../PortalContext';

export function WelcomePortalView() {
  const {
    dialog,
    navigate,
    firebaseUser,
    authRole,
    signIn,
    register,
    resetPassword,
    signOut,
    portalMode,
    setPortalMode,
    members,
    setMembers,
    activityLogs,
    setActivityLogs,
    adminProfileList,
    setAdminProfileList,
    announcements,
    setAnnouncements,
    events,
    setEvents,
    authenticatedAdmin,
    authenticatedMember,
    isFirebaseQuotaExceeded,
    setIsFirebaseQuotaExceeded,
    adminTab,
    setAdminTab,
    isAdminAuthenticated,
    adminLoginInput,
    setAdminLoginInput,
    adminLoginPassword,
    setAdminLoginPassword,
    authMode,
    setAuthMode,
    authSubmitting,
    adminLoginError,
    setAdminLoginError,
    newAdminNameInput,
    setNewAdminNameInput,
    newAdminEmailInput,
    setNewAdminEmailInput,
    newAdminVoxInput,
    setNewAdminVoxInput,
    selectedMemberIdToPromote,
    setSelectedMemberIdToPromote,
    memberAvailabilities,
    handleToggleAvailability,
    welcomeTab,
    setWelcomeTab,
    publicTabsRef,
    publicTabsCanScrollLeft,
    publicTabsCanScrollRight,
    publicSearch,
    setPublicSearch,
    publicDiocese,
    setPublicDiocese,
    publicParish,
    setPublicParish,
    publicSkill,
    setPublicSkill,
    navigatePublicSection,
    openAccountWorkspace,
    scrollPublicTabs,
    activeHymn,
    setActiveHymn,
    isHymnPlaying,
    setIsHymnPlaying,
    rsvpedEventIds,
    handleEventRsvp,
    isFormOpen,
    setIsFormOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    leaderImages,
    editingMember,
    setEditingMember,
    selectedMember,
    setSelectedMember,
    bulkSelection,
    setBulkSelection,
    trackerEmailField,
    setTrackerEmailField,
    trackerActiveMember,
    setTrackerActiveMember,
    trackerFeedback,
    filters,
    setFilters,
    showAdvanceFilters,
    setShowAdvanceFilters,
    directoryViewStyle,
    setDirectoryViewStyle,
    selectedApostolateGroup,
    setSelectedApostolateGroup,
    auditSearchQuery,
    setAuditSearchQuery,
    triggerBackendSync,
    saveMembersToStorage,
    saveAdminsToStorage,
    updateAdminClaim,
    handleToggleAdminAccess,
    addActivityLog,
    handleSaveMember,
    handleDeleteMember,
    handleApproveInduction,
    handleRejectInduction,
    handleAddAnnouncement,
    handleDeleteAnnouncement,
    handleAddEvent,
    handleDeleteEvent,
    handleBulkDelete,
    handleImportMembers,
    handleResetAppToDemo,
    filteredMembersList,
    filteredIdsList,
    handleStatusFilterChange,
    handleClearFilters,
    handleSecureLogin,
    resetAuthFlowForPortalReturn,
    authFlowLabel,
    handleMemberTrackerLookup,
    hasActiveFirebase,
    leadersList,
    getParishesByDiocese,
    getNormalizedDiocese,
    getNormalizedParish,
  } = usePortal();

      {portalMode === 'welcome' && (
        <div className="vox-mobile-content min-h-screen bg-slate-950 text-white font-sans flex flex-col relative select-text overflow-x-clip" id="portal-landing-page">
          {/* Main Hero Background Banner */}
          <div
            className="relative py-14 md:py-24 px-4 text-center overflow-hidden border-b border-slate-800/80 flex flex-col items-center justify-center"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% -8%, rgba(47,111,237,.18), transparent 70%), radial-gradient(ellipse 45% 35% at 50% 112%, rgba(245,189,50,.12), transparent 70%), #050712',
            }}
          >
            <div className="w-full min-w-0 max-w-4xl mx-auto space-y-5 z-10 relative">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto filter drop-shadow-[0_10px_24px_rgba(245,189,50,0.35)]">
                <VoxShield size="100%" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-400">Vox Ecclesiae · Catholic Digital Commission</p>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                  The Voice of the Church, <em className="font-serif italic normal-case text-amber-400">reimagined</em>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Digital Media Ministry &amp; Cathfluencer Registry. Let us stand united to catalog, empower, and elevate local Catholic content creators and parish apologists.
                </p>
              </div>

              {/* Public Tabs Navigation */}
              <div className="public-tabs-shell relative w-full min-w-0 max-w-full md:max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={() => scrollPublicTabs('left')}
                  className={`public-tabs-scroll-control public-tabs-scroll-left md:hidden ${publicTabsCanScrollLeft ? 'is-visible' : ''}`}
                  aria-label="Show previous navigation tabs"
                  aria-controls="public-tabs-nav-bar"
                  tabIndex={publicTabsCanScrollLeft ? 0 : -1}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <div
                  ref={publicTabsRef}
                  className="flex md:flex-wrap items-center overflow-x-auto md:overflow-visible md:justify-center gap-2 px-12 md:px-1 py-2 bg-transparent border-y border-slate-800/60 w-full min-w-0 select-none"
                  id="public-tabs-nav-bar"
                  role="tablist"
                  aria-label="Public portal sections"
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    const tabList = event.currentTarget as HTMLDivElement;
                    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
                    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
                    if (currentIndex < 0) return;

                    event.preventDefault();
                    const nextIndex =
                      event.key === 'Home' ? 0 :
                      event.key === 'End' ? tabs.length - 1 :
                      event.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length :
                      (currentIndex - 1 + tabs.length) % tabs.length;

                    tabs[nextIndex]?.focus();
                    tabs[nextIndex]?.click();
                  }}
                >
                <button
                  type="button"
                  onClick={() => setWelcomeTab('home')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'home' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'home'}
                  aria-controls="pub-tab-lobby"
                  tabIndex={welcomeTab === 'home' ? 0 : -1}
                >
                  Portal Hub
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('directory')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'directory' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'directory'}
                  aria-controls="pub-tab-leaders"
                  tabIndex={welcomeTab === 'directory' ? 0 : -1}
                >
                  Our Leaders
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('courses')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'courses' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'courses'}
                  aria-controls="pub-tab-courses"
                  tabIndex={welcomeTab === 'courses' ? 0 : -1}
                >
                  Courses
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('excellence')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'excellence' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'excellence'}
                  aria-controls="pub-tab-excellence"
                  tabIndex={welcomeTab === 'excellence' ? 0 : -1}
                >
                  Excellence
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('voxgroup')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'voxgroup' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'voxgroup'}
                  aria-controls="pub-tab-voxgroup"
                  tabIndex={welcomeTab === 'voxgroup' ? 0 : -1}
                >
                  Vox Group
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('trainers')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'trainers' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'trainers'}
                  aria-controls="pub-tab-trainers"
                  tabIndex={welcomeTab === 'trainers' ? 0 : -1}
                >
                  Trainers
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('madhatv')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'madhatv' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'madhatv'}
                  aria-controls="pub-tab-madhatv"
                  tabIndex={welcomeTab === 'madhatv' ? 0 : -1}
                >
                  Madha TV
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('announcements')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'announcements' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'announcements'}
                  aria-controls="pub-tab-announcements"
                  tabIndex={welcomeTab === 'announcements' ? 0 : -1}
                >
                  Chronicles
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('events')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'events' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'events'}
                  aria-controls="pub-tab-events"
                  tabIndex={welcomeTab === 'events' ? 0 : -1}
                >
                  Calendar &amp; RSVP
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('resources')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'resources' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'resources'}
                  aria-controls="pub-tab-connect"
                  tabIndex={welcomeTab === 'resources' ? 0 : -1}
                >
                  Catholic Connect
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('guidelines')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'guidelines' ? 'text-amber-300 underline underline-offset-8 decoration-amber-400/70 decoration-2' : 'text-slate-400 hover:text-white'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'guidelines'}
                  aria-controls="pub-tab-resources"
                  tabIndex={welcomeTab === 'guidelines' ? 0 : -1}
                >
                  Resources
                </button>
                </div>
                <button
                  type="button"
                  onClick={() => scrollPublicTabs('right')}
                  className={`public-tabs-scroll-control public-tabs-scroll-right md:hidden ${publicTabsCanScrollRight ? 'is-visible' : ''}`}
                  aria-label="Show more navigation tabs, including Resources"
                  aria-controls="public-tabs-nav-bar"
                  tabIndex={publicTabsCanScrollRight ? 0 : -1}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
                <div className="public-tabs-swipe-hint md:hidden" aria-hidden="true">
                  <span className={publicTabsCanScrollLeft ? 'is-active' : ''} />
                  <span className={publicTabsCanScrollRight ? 'is-active' : ''} />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Sub-View Delivery Stage */}
          <div className="flex-1 bg-gradient-to-b from-slate-950 via-[#0e0717] to-slate-950 p-3 sm:p-4 md:p-8">
            <div className="max-w-7xl mx-auto" id="public-tabs-content-viewport">
              
              {/* TAB A: MAIN PORTAL LOBBY */}
              {welcomeTab === 'home' && (
                <div className="animate-fade-in" id="pub-tab-lobby" role="tabpanel">
                  <PersonalizedDashboard
                    user={firebaseUser}
                    role={authRole === 'moderator' ? 'admin' : authRole || 'public'}
                    member={authenticatedMember}
                    memberCount={members.length}
                    events={events}
                    announcements={announcements}
                    onRegister={() => setPortalMode('member-form')}
                    onOpenProfile={openAccountWorkspace}
                    onOpenDirectory={() => navigatePublicSection('directory')}
                    onOpenEvents={() => navigatePublicSection('events')}
                    onOpenAnnouncements={() => navigatePublicSection('announcements')}
                    onOpenAdmin={() => {
                      setPortalMode('admin');
                      setAdminTab('dashboard');
                    }}
                    onVerify={() => setPortalMode('member-tracker')}
                  />
                </div>
              )}

              {/* TAB B: LEADERS LIST (REPLACED DISCOVER CREATORS) */}
              {welcomeTab === 'directory' && (
                <div className="space-y-8 md:space-y-12 animate-fade-in max-w-7xl mx-auto py-4 md:py-6" id="pub-tab-leaders" role="tabpanel">
                  
                  {/* Centered Heading exactly as shown in screenshot */}
                  <div className="text-center space-y-3 pb-5 md:pb-8 border-b border-slate-900">
                    <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-white uppercase">
                      Our Leaders
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
                      Our heartfelt thanks go out to the Heads for their <span className="text-amber-500 font-semibold">leadership and guidance</span>, which has helped us to grow in <span className="text-amber-500 font-semibold">faith and service</span> to others.
                    </p>
                  </div>

                  {/* 5 Leaders Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 justify-center">
                    {leadersList.map((leader) => (
                      <div 
                        key={leader.id} 
                        className="flex flex-col items-center text-center space-y-3 md:space-y-4 group transition duration-300 min-w-0 last:col-span-2 last:w-full last:max-w-[210px] last:justify-self-center lg:last:col-span-1"
                        id={`leader-card-${leader.id}`}
                      >
                        {/* Image Container with Custom Hover Glow */}
                        <div className="relative w-full aspect-square max-w-[210px] overflow-hidden rounded-xl md:rounded-2xl border border-slate-800 bg-slate-900/40 shadow-md group-hover:border-amber-500/40 group-hover:shadow-[0_8px_24px_rgba(245,158,11,0.08)] transition duration-300">
                          <img 
                            src={leaderImages[leader.id]} 
                            alt={leader.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300 select-none"
                            onError={(e) => {
                              const imgTarget = e.currentTarget;
                              if (imgTarget.dataset.fallbackApplied !== 'true') {
                                imgTarget.dataset.fallbackApplied = 'true';
                                imgTarget.src = leader.fallbackImage;
                              }
                            }}
                          />
                          {/* Ambient Inner Gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-t ${leader.bgColor || 'from-slate-950/20 to-transparent'} mix-blend-multiply opacity-70`} />
                        </div>

                        {/* Leader Bio Details */}
                        <div className="space-y-1 px-2 select-text">
                          {leader.title ? (
                            <p className="text-[10.5px] font-medium italic text-slate-400 tracking-wide font-sans">
                              {leader.title}
                            </p>
                          ) : (
                            <div className="h-4" /> /* Keeps cards aligned even when title is empty */
                          )}
                          
                          <h3 className="text-xs md:text-sm font-black text-blue-400 tracking-wide font-display hover:text-blue-300 transition">
                            {leader.name}
                          </h3>
                          
                          <div className="space-y-0.5">
                            <p className="text-[10.5px] font-bold text-slate-400 leading-snug">
                              {leader.role}
                            </p>
                            {leader.subRole && (
                              <p className="text-[9.5px] italic text-slate-500 font-medium tracking-normal leading-normal">
                                {leader.subRole}
                              </p>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  <AdvancedMemberDirectory
                    members={members}
                    user={firebaseUser}
                    currentMember={authenticatedMember}
                    onOpenMember={setSelectedMember}
                  />

                </div>
              )}

              {/* TAB C: CHRONICLES & OFFICIAL BULLETIN */}
              {welcomeTab === 'announcements' && (
                <div className="space-y-6 animate-fade-in" id="pub-tab-announcements" role="tabpanel">
                  <div className="border-b border-slate-900 pb-5">
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">Archdiocesan Media Commission Chronicles</h2>
                    <p className="text-xs text-slate-400">Official circulars, digital media mandates, guidelines, and council decrees.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                    {announcements.map((ann, idx) => (
                      <div 
                        key={ann.id || idx} 
                        className={`p-6 rounded-2xl border bg-slate-900/65 flex flex-col justify-between space-y-4 relative overflow-hidden transition hover:-translate-y-0.5 ${
                          ann.priority === 'high' ? 'border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.06)]' : 'border-slate-850'
                        }`}
                        id={`chronicle-ann-${ann.id}`}
                      >
                        {ann.priority === 'high' && (
                          <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-500 to-amber-700 text-slate-950 text-[8px] font-black uppercase tracking-widest px-3 py-1">
                            High Priority Decrees
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {ann.author || 'Council'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">
                              Filed {new Date(ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-display font-black uppercase tracking-wide text-white">
                            {ann.title}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                            {ann.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {announcements.length === 0 && (
                      <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                        <p className="text-sm">No official circulars posted on the public wire yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB D: CALENDAR & RSVP SYSTEM */}
              {welcomeTab === 'events' && (
                <div className="space-y-6 animate-fade-in" id="pub-tab-events" role="tabpanel">
                  <div className="border-b border-slate-900 pb-5">
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">Ecclesiastical &amp; Media Council Calendar</h2>
                    <p className="text-xs text-slate-400">View diocese guild training summits, feasts, apologist roundtables, and workshops. RSVP to join.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Events List panel */}
                    <div className="lg:col-span-2 space-y-4">
                      {events.map((ev, idx) => {
                        const hasRsvped = rsvpedEventIds.has(ev.id);
                        
                        return (
                          <div 
                            key={ev.id || idx} 
                            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-850 hover:border-slate-800 transition flex flex-col md:flex-row gap-4 items-start"
                            id={`public-event-tile-${ev.id}`}
                          >
                            {/* Date Badge */}
                            <div className="p-3 bg-slate-950 border border-slate-800 text-center rounded-xl min-w-[70px] select-none shadow-sm flex flex-col items-center justify-center shrink-0">
                              <span className="block text-[8px] uppercase tracking-widest font-black text-amber-500 leading-none">Date</span>
                              <span className="text-lg font-black font-mono tracking-tight text-white mt-1 leading-none">
                                {ev.date.split('-')[2] || ev.date}
                              </span>
                              <span className="text-[8px] uppercase font-bold text-slate-450 mt-1 block">
                                {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                              </span>
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[8px] font-black uppercase text-slate-950 bg-amber-400 px-2 py-0.5 rounded shadow-3xs font-sans">
                                    {ev.type}
                                  </span>
                                  {ev.category && (
                                    <span className="text-[8.5px] font-bold uppercase text-slate-400 bg-slate-850 border border-slate-800 px-2 py-0.5 rounded font-sans">
                                      {ev.category}
                                    </span>
                                  )}
                                  {ev.time && (
                                    <span className="text-[10px] font-mono font-bold text-slate-450">
                                      🕒 {ev.time}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wide text-white">{ev.title}</h3>
                                <p className="text-xs text-slate-350 leading-relaxed leading-relaxed">{ev.description}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium text-slate-450 pt-1">
                                {ev.location && (
                                  <span className="flex items-center gap-1">
                                    <span>📍</span>
                                    <span className="truncate max-w-[250px]">{ev.location}</span>
                                  </span>
                                )}
                                {ev.link && (
                                  <a 
                                    href={ev.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    <span>🔗</span>
                                    <span>Join Session Info</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* RSVP Button */}
                            <div className="self-stretch flex items-center justify-end md:border-l md:border-slate-850 md:pl-4 min-w-[110px]" onClick={(e) => e.stopPropagation()}>
                              {hasRsvped ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider block text-center shadow-3xs">
                                  ✓ Registered
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void handleEventRsvp(ev.id)}
                                  className="w-full bg-slate-850 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-slate-700 hover:border-amber-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer shadow-xs"
                                >
                                  Reserve Spot
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {events.length === 0 && (
                        <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                          <p className="text-sm">No commissions schedules or events logged in.</p>
                        </div>
                      )}
                    </div>

                    {/* Left Panel: Liturgical Highlights & Holidays */}
                    <div className="space-y-4">
                      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                        <div className="border-b border-slate-800 pb-3">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Liturgical Calendar</p>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Catholic Solenmities 2026</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Follow the principal high holidays and feasts registered dynamically for apostolic media preparations inside Madras-Mylapore.
                        </p>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {[
                            { name: "Thai Pongal (Harvest Feast)", date: "Jan 15, 2026", status: "feast" },
                            { name: "Good Friday Observance", date: "Apr 03, 2026", status: "holyday" },
                            { name: "The Glorious Easter Feast", date: "Apr 05, 2026", status: "feast" },
                            { name: "St. Thomas Cathedral Feast", date: "Jul 03, 2026", status: "feast" },
                            { name: "Our Lady of Velankanni Solemnity", date: "Sep 08, 2026", status: "feast" },
                            { name: "Christmas-tide Liturgy", date: "Dec 25, 2026", status: "feast" },
                          ].map((hl, index) => (
                            <div key={index} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900/80">
                              <div>
                                <p className="text-xs text-white font-black uppercase tracking-wide">{hl.name}</p>
                                <p className="text-[9px] text-slate-450 font-bold font-mono">{hl.date}</p>
                              </div>
                              <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded ${hl.status === 'feast' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'}`}>
                                {hl.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB E: DIGITIZED ECOSYSTEM CENTRAL (CATHOLIC CONNECT) */}
              {/* TAB: CISCAF COURSES & FORMATION */}
              {welcomeTab === 'courses' && (
                <div id="pub-tab-courses" role="tabpanel">
                  <CourseCatalog
                    memberUid={firebaseUser?.uid}
                    memberName={authenticatedMember?.fullName ?? firebaseUser?.displayName ?? undefined}
                    onRequireSignIn={() => setPortalMode('member-form')}
                    onAddActivityLog={addActivityLog}
                  />
                </div>
              )}

              {/* TAB: VOX EXCELLENCE ACHIEVEMENT WALL */}
              {welcomeTab === 'excellence' && (
                <div id="pub-tab-excellence" role="tabpanel">
                  <AchievementWall
                    memberUid={firebaseUser?.uid}
                    memberName={authenticatedMember?.fullName ?? firebaseUser?.displayName ?? undefined}
                    onRequireSignIn={() => setPortalMode('member-form')}
                    onAddActivityLog={addActivityLog}
                  />
                </div>
              )}

              {/* TAB: VOX GROUP FOUR PILLARS */}
              {welcomeTab === 'voxgroup' && (
                <div id="pub-tab-voxgroup" role="tabpanel">
                  <VoxGroupHub
                    memberUid={firebaseUser?.uid}
                    memberName={authenticatedMember?.fullName ?? firebaseUser?.displayName ?? undefined}
                    onRequireSignIn={() => setPortalMode('member-form')}
                    onAddActivityLog={addActivityLog}
                  />
                </div>
              )}

              {/* TAB: TRAINERS & MENTORS */}
              {welcomeTab === 'trainers' && (
                <div id="pub-tab-trainers" role="tabpanel">
                  <TrainersHub
                    memberUid={firebaseUser?.uid}
                    memberName={authenticatedMember?.fullName ?? firebaseUser?.displayName ?? undefined}
                    memberEmail={firebaseUser?.email ?? undefined}
                    onRequireSignIn={() => setPortalMode('member-form')}
                    onAddActivityLog={addActivityLog}
                  />
                </div>
              )}

              {/* TAB: MADHA TV PROGRAMS & PARTICIPATION */}
              {welcomeTab === 'madhatv' && (
                <div id="pub-tab-madhatv" role="tabpanel">
                  <MadhaTvHub
                    memberUid={firebaseUser?.uid}
                    memberName={authenticatedMember?.fullName ?? firebaseUser?.displayName ?? undefined}
                    onRequireSignIn={() => setPortalMode('member-form')}
                    onAddActivityLog={addActivityLog}
                  />
                </div>
              )}

              {welcomeTab === 'resources' && (
                <div id="pub-tab-connect" role="tabpanel">
                  <ConnectHub 
                    onAddActivityLog={addActivityLog}
                    syncTrigger={() => triggerBackendSync(members, adminProfileList, activityLogs, announcements, events)}
                    authenticatedMember={authenticatedMember}
                  />
                </div>
              )}

              {/* TAB F: ARCHDIOCESAN CURIA LIBRARY & LITURGICAL RESOURCES */}
              {welcomeTab === 'guidelines' && (
                <div id="pub-tab-resources" role="tabpanel">
                  <ResourcesLibrary 
                    onAddActivityLog={addActivityLog} 
                    authenticatedMember={authenticatedMember} 
                  />
                </div>
              )}

            </div>
          </div>

          {/* Micro Aesthetic Static Sticky Ribbon Footer */}
          <div className="bg-slate-950 py-4 px-6 border-t border-slate-900/80 text-center text-[10px] tracking-widest text-slate-500 uppercase flex flex-col md:flex-row justify-between items-center gap-3">
            <span>Chennai Roman Catholic Media Council • Established 2026</span>
            <div className="flex gap-4">
              <button onClick={() => setWelcomeTab('home')} className="hover:text-white transition">Portals Home</button>
              <span>•</span>
              <button onClick={() => { setPortalMode('admin'); setAdminTab('dashboard'); }} className="hover:text-white transition text-amber-400 font-bold">Admin Gateway</button>
            </div>
          </div>
          <MobileBottomNav
            current={welcomeTab}
            isAdmin={authRole === 'admin'}
            isSignedIn={Boolean(firebaseUser)}
            onNavigate={navigatePublicSection}
            onAccount={openAccountWorkspace}
          />
        </div>
      )}
}
