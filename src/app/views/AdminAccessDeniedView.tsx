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

export function AdminAccessDeniedView() {
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

  if (!(portalMode === 'admin' && !!firebaseUser && !isAdminAuthenticated)) return null;

  return (
        <div 
          className="auth-flow-page min-h-[100svh] flex items-center justify-center p-6 text-white relative" 
          id="admin-security-gateway"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(13, 10, 27, 0.9), rgba(5, 3, 13, 0.95)), url('https://upload.wikimedia.org/wikipedia/commons/e/ee/San_Thome_Basilica%2C_Chennai.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <AuthFlowNavigation currentLabel="Sign In" onBeforeNavigate={resetAuthFlowForPortalReturn} />
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-[#05030d]/80 z-0 opacity-85" />
          
          <div className="max-w-md w-full bg-[#161224] border border-amber-500/20 rounded-2xl p-8 z-10 shadow-2xl relative overflow-hidden animate-fade-in" id="admin-login-box">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
            
            <div className="text-center space-y-4 mb-8">
              <div className="w-20 h-20 mx-auto filter drop-shadow-[0_5px_10px_rgba(245,158,11,0.2)]">
                <VoxShield size="100%" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 font-display">Clergy Registry Administration</span>
                <h3 className="text-xl font-display font-semibold uppercase tracking-wider text-white mt-1">Council Authorization Gate</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                  Identify yourself to initiate secure session replication. Access is strictly confined to sanctioned clergy members of the Archdiocese.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div role="alert" className="bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-xl p-4 text-sm">
                This signed-in account does not have the required administrator claim.
              </div>
              <button
                type="button"
                onClick={() => void signOut().finally(() => {
                  setPortalMode('welcome');
                  setAdminLoginError('');
                  setAdminLoginInput('');
                })}
                className="w-full min-h-11 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white block text-center transition cursor-pointer"
              >
                Sign out and use an administrator account
              </button>
            </div>
          </div>
        </div>
  );
}
