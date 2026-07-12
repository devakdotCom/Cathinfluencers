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

export function MemberTrackerPortalView() {
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

  if (portalMode !== 'member-tracker') return null;

  return (
        <div className="auth-flow-page min-h-[100svh] bg-slate-800 p-6 md:p-12 text-white flex flex-col items-center justify-center animate-fade-in" id="member-tracker-portal">
          <AuthFlowNavigation currentLabel="Credential Lookup" onBeforeNavigate={resetAuthFlowForPortalReturn} />
          <div className="w-full max-w-lg bg-slate-900 border border-slate-750 p-6 rounded-2xl shadow-xl space-y-6">
            
            {/* Header branding */}
            <div className="text-center">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Cathfluencer Status Tracker</p>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Credential ID Lookup</h3>
            </div>

            {/* Email verification input */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Email Coordinates</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={trackerEmailField}
                  onChange={(e) => setTrackerEmailField(e.target.value)}
                  placeholder="e.g. dennismarianaldo24@gmail.com"
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                  onKeyDown={(e) => { if(e.key === 'Enter') handleMemberTrackerLookup(); }}
                />
                <button
                  type="button"
                  onClick={handleMemberTrackerLookup}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-cmd"
                >
                  Search
                </button>
              </div>
              <p className="text-[10px] text-slate-500 select-none">
                Try scanning with seed accounts: <span className="text-amber-300 font-mono select-all">dennismarianaldo24@gmail.com</span> or <span className="text-amber-300 font-mono select-all font-semibold">itzmeprami@gmail.com</span>
              </p>
              {trackerFeedback && (
                <p className="text-[11px] text-rose-400 font-medium pt-1">⚠️ {trackerFeedback}</p>
              )}
            </div>

            {/* STATUS DISPLAY AND BADGE BOX */}
            {trackerActiveMember ? (
              <div className="space-y-6 pt-4 border-t border-slate-800 animate-fade-in" id="badge-wrapper-holder">
                
                {/* Visual application tracker state */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Verification Progress State:</span>
                  <div className="grid grid-cols-3 gap-1 grid-flow-row" id="application-step-dots">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-[10px] font-black text-slate-400">STEP 1</span>
                      <span className="text-[9px] text-emerald-500 font-bold">✓ Filed</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-[10px] font-black text-slate-400">STEP 2</span>
                      <span className={`text-[9px] font-bold ${trackerActiveMember.status === 'Pending' ? 'text-amber-400 animate-pulse' : 'text-emerald-500'}`}>
                        {trackerActiveMember.status === 'Pending' ? '⏳ Auditing' : '✓ Reviewed'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="block text-[10px] font-black text-slate-400">STEP 3</span>
                      <span className={`text-[9px] font-bold ${
                        trackerActiveMember.status === 'Affiliated' || trackerActiveMember.status === 'Director' ? 'text-emerald-400' : 
                        trackerActiveMember.status === 'Pending' ? 'text-slate-600' : 'text-rose-500'
                      }`}>
                        {trackerActiveMember.status === 'Affiliated' || trackerActiveMember.status === 'Director' ? '❇️ Commissioned' : 
                         trackerActiveMember.status === 'Pending' ? '⏳ Pending' : '⚠️ Rejected'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HIGH-FIDELITY PRINTABLE SACRED ID BADGE CARD */}
                <div className="relative border-2 border-amber-400 rounded-xl bg-gradient-to-b from-[#1C1536] to-[#0A0515] p-5 shadow-2xl relative overflow-hidden" id="cathfluencer-badge-art">
                  {/* Holy radiant glow halo effect backdrop */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl" />
                  
                  {/* Badge Crest */}
                  <div className="flex justify-between items-start border-b border-amber-500/20 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]">
                        <VoxShield size="100%" />
                      </div>
                      <span className="font-display font-bold text-[10px] uppercase tracking-widest text-amber-200">VOX ECCLESIAE COUNCIL</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{trackerActiveMember.joinedDate}</span>
                  </div>

                  {/* Core Card Section */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white border-2 border-amber-400/60 shadow-md ${trackerActiveMember.avatarUrl}`}>
                      {trackerActiveMember.fullName.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white tracking-wider pb-0.5">{trackerActiveMember.fullName}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">CREDENTIAL ID: <span className="text-amber-300 font-bold">{trackerActiveMember.id}</span></p>
                      <p className="text-[9px] text-slate-300 uppercase tracking-wider pt-1">{trackerActiveMember.profession}</p>
                    </div>
                  </div>

                  {/* Parish Parish details */}
                  <div className="space-y-1 mb-4 text-[10px] text-slate-300 border-t border-slate-800/40 pt-3">
                    <p><strong>Parish:</strong> {trackerActiveMember.parish}</p>
                    <p className="capitalize"><strong>Diocese:</strong> {trackerActiveMember.diocese}</p>
                  </div>

                  {/* Favorite Quote */}
                  {trackerActiveMember.bibleBook && (
                    <div className="border-t border-slate-800/60 pt-3 text-center text-[10px] italic text-slate-400 select-all">
                      "{trackerActiveMember.bibleVerseText}"
                      <span className="block font-display text-[9px] font-bold text-amber-400/80 uppercase tracking-widest mt-1">
                        ✝ {trackerActiveMember.bibleBook} {trackerActiveMember.bibleChapter}:{trackerActiveMember.bibleVerse}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-3 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">verified cache</span>
                  </div>
                </div>

                {/* Edit my particulars button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMember(trackerActiveMember);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500 text-amber-200 hover:text-white text-xs font-bold rounded-lg uppercase tracking-wider transition cursor-cmd text-center"
                  >
                    ✏️ Update Profile Details
                  </button>
                  <button
                    onClick={() => setTrackerActiveMember(null)}
                    className="px-4 py-2.5 border border-slate-800 hover:bg-slate-950 text-slate-400 hover:text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition"
                  >
                    Clear Search
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-500" id="empty-lookup-state">
                <Search className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-xs">No active search profile loaded. Submit email coordinates to review status.</p>
              </div>
            )}

          </div>
        </div>
  );
}
