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

export function MemberFormPortalView() {
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

      {portalMode === 'member-form' && (
        <div className="auth-flow-page min-h-screen bg-slate-900 relative p-4 md:p-8 flex justify-center items-center" id="member-application-portal">
          <AuthFlowNavigation currentLabel="Register" onBeforeNavigate={resetAuthFlowForPortalReturn} />
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" id="form-embedded-wrapper">
            <div className="bg-slate-950 p-6 text-white flex items-center border-b border-amber-500/20">
              <div>
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">Affiliation Form</p>
                <h3 className="text-sm font-bold font-display uppercase tracking-wide text-white">VOX ECCLESIAE CATHFLUENCER REGISTRATION</h3>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex justify-between items-center">
              <span>Filing options: Register fresh Cathfluencer details or check status</span>
              <button 
                onClick={() => setPortalMode('member-tracker')}
                className="bg-amber-150 text-amber-900 border border-amber-400 px-3 py-1 rounded text-xs font-black uppercase tracking-wider hover:bg-amber-200 transition"
              >
                Lookup Existing Status ID 🆔
              </button>
            </div>

            <div className="overflow-hidden bg-white">
              <MemberForm
                member={null}
                onClose={() => setPortalMode('welcome')}
                onSave={(m) => {
                  const cleanF = m.firstName.trim().replace(/[\s\W]+/g, '');
                  const cleanL = m.lastName.trim().replace(/[\s\W]+/g, '');
                  const normDiocese = getNormalizedDiocese(m.diocese);
                  const normParish = getNormalizedParish(m.parish, normDiocese);
                  const normalizedM = {
                    ...m,
                    diocese: normDiocese,
                    parish: normParish,
                    voxUserId: m.voxUserId || (cleanF || cleanL ? `${cleanF}_${cleanL}@vox.in` : `${m.fullName.replace(/[\s\W]+/g, '')}@vox.in`)
                  };

                  handleSaveMember(normalizedM);
                  
                  setTrackerEmailField(m.email);
                  setTrackerActiveMember(normalizedM);
                  setPortalMode('member-tracker');
                }}
              />
            </div>
          </div>
        </div>
      )}
}
