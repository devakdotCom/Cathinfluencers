import { lazy } from 'react';
import type { QueryFilters, MemberStatus } from '../../types';
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

export function AdminPortalView() {
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
    handleToggleBulkSelect,
    handleSelectAll,
    handleBulkStatusChange,
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

      {portalMode === 'admin' && isAdminAuthenticated && (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans" id="admin-workspace-layout animate-fade-in">
          
          {/* Mobile Overlay Background Dimmer */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs lg:hidden transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Navigation Sidebar Panel */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:h-screen lg:overflow-y-auto'}`} id="sidebar-panel">
            <div>
              {/* Logo Branding */}
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 filter drop-shadow-[0_2px_5px_rgba(245,158,11,0.25)]">
                    <VoxShield size="100%" />
                  </div>
                  <span className="font-bold text-base tracking-tight uppercase text-white font-display">Vox Ecclesiae</span>
                </div>
              </div>

              <div className="space-y-1 lg:p-4 mt-2 lg:mt-4" id="sidebar-tab-menu">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">
                  {authenticatedAdmin ? 'Clergy Council Tools' : 'Portals & Directory'}
                </span>
                
                <button
                  onClick={() => { setAdminTab('dashboard'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'dashboard' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                  id="tab-btn-dashboard"
                >
                  <BookOpen className={`w-4 h-4 ${adminTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{authenticatedAdmin ? 'Admin Dashboard' : 'Council Dashboard'}</span>
                </button>

                <button
                  onClick={() => { setAdminTab('directory'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'directory' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                >
                  <Users className={`w-4 h-4 ${adminTab === 'directory' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Dossiers Directory</span>
                </button>

                {authenticatedMember && (
                  <button
                    onClick={() => { setAdminTab('profile'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'profile' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                  >
                    <UserCheck className={`w-4 h-4 ${adminTab === 'profile' ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>My Profile Dossier</span>
                  </button>
                )}

                {authenticatedAdmin && (
                  <>
                    <button
                      onClick={() => { setAdminTab('analytics'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'analytics' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <BarChart2 className={`w-4 h-4 ${adminTab === 'analytics' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>Commission Metrics</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('import-export'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'import-export' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Database className={`w-4 h-4 ${adminTab === 'import-export' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Bulk Import &amp; Export</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('courses'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'courses' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <GraduationCap className={`w-4 h-4 ${adminTab === 'courses' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>CISCAF Courses</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('excellence'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'excellence' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Award className={`w-4 h-4 ${adminTab === 'excellence' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Vox Excellence</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('voxgroup'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'voxgroup' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Users className={`w-4 h-4 ${adminTab === 'voxgroup' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Vox Group</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('trainers'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'trainers' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <UserCheck className={`w-4 h-4 ${adminTab === 'trainers' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Trainers</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('madhatv'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'madhatv' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Play className={`w-4 h-4 ${adminTab === 'madhatv' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Madha TV</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('campaigns'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'campaigns' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <ExternalLink className={`w-4 h-4 ${adminTab === 'campaigns' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Campaigns</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('reports'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'reports' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <FileText className={`w-4 h-4 ${adminTab === 'reports' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Reports</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('audit-logs'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'audit-logs' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Activity className={`w-4 h-4 ${adminTab === 'audit-logs' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Registry Audit Trail</span>
                    </button>

                    <button
                      onClick={() => { setAdminTab('admins'); setBulkSelection([]); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${adminTab === 'admins' ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                    >
                      <Shield className={`w-4 h-4 ${adminTab === 'admins' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Authorized Admins</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar footer details */}
            <div className="mt-8 lg:p-4 border-t border-slate-850 pt-4 space-y-4 font-sans" id="sidebar-footer">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 bg-slate-950 border border-slate-800 rounded-lg hidden lg:flex">
                  <div className="w-8 h-8 rounded-full bg-slate-705 text-amber-200 flex items-center justify-center text-xs font-black uppercase">
                    {authenticatedAdmin 
                      ? authenticatedAdmin.name.split(' ').map(n => n[0]).join('').substring(0, 2) 
                      : (authenticatedMember 
                      ? authenticatedMember.firstName[0] + (authenticatedMember.lastName[0] || '')
                      : 'AA')}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-100 truncate">
                      {authenticatedAdmin ? authenticatedAdmin.name : (authenticatedMember ? authenticatedMember.fullName : 'Guest Session')}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      {authenticatedAdmin ? authenticatedAdmin.voxId : (authenticatedMember ? (authenticatedMember.voxUserId || authenticatedMember.email) : 'guest@vox.in')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                    setPortalMode('welcome');
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/30 font-sans py-1.5 transition cursor-pointer rounded-lg"
                >
                  Sign Out Securely
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg text-center border border-slate-800/60" id="reset-pane">
                <button
                  onClick={() => { handleResetAppToDemo(); setIsMobileSidebarOpen(false); }}
                  className="w-full text-[10px] font-bold uppercase bg-slate-900 border border-slate-850 hover:bg-rose-900/40 hover:text-rose-200 text-slate-400 py-1 transition cursor-pointer rounded"
                >
                  Restore Seed Dossiers
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Workspace viewport */}
          <div className="flex-1 flex flex-col min-h-screen lg:h-screen lg:overflow-y-auto overflow-x-hidden">
            {/* Top Local Bar inside admin panel */}
            <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40" id="workspace-header">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(prev => !prev)}
                  className="p-1.5 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg lg:hidden transition scale-100 hover:scale-105"
                  title="Toggle Admin Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-xs md:text-sm font-bold font-display uppercase tracking-wider text-slate-950 leading-none truncate">
                    {adminTab === 'dashboard' && 'Clerical Council Dashboard'}
                    {adminTab === 'directory' && 'Cathfluencer Dossier Records'}
                    {adminTab === 'courses' && 'CISCAF Course Manager'}
                    {adminTab === 'excellence' && 'Vox Excellence Review'}
                    {adminTab === 'voxgroup' && 'Vox Group Management'}
                    {adminTab === 'trainers' && 'Trainer Applications & Assignments'}
                    {adminTab === 'madhatv' && 'Madha TV Programs & Participants'}
                    {adminTab === 'campaigns' && 'Campaign Communications Planner'}
                    {adminTab === 'reports' && 'Reports & Ministry Analytics'}
                    {adminTab === 'analytics' && 'Commission statistics'}
                    {adminTab === 'import-export' && 'Importer & Exporter'}
                    {adminTab === 'audit-logs' && 'Administrative Registry Audit'}
                    {adminTab === 'admins' && 'Authorized Clerical Admins'}
                    {adminTab === 'profile' && 'My Member Dossier'}
                  </h1>
                  <span className="hidden sm:block text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 truncate">
                    COMMISSION MANAGEMENT SYSTEM • ACTIVE REPLICATED CACHE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <div className="hidden sm:block text-right pr-4 border-r border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none font-sans">Active Records</span>
                  <span className="text-xs font-bold text-amber-600 font-mono mt-0.5 block">{members.length} Dossiers</span>
                </div>
                {authenticatedAdmin && (
                  <button
                    onClick={() => {
                      setEditingMember(null);
                      setIsFormOpen(true);
                    }}
                    className="bg-slate-950 text-amber-400 border border-amber-500/20 px-2.5 md:px-3 text-[10px] md:text-xs py-1.5 md:py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-xs flex items-center gap-1 md:gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">New Dossier</span>
                  </button>
                )}
              </div>
            </header>

            {/* Primary View Router */}
            <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6" id="admin-main-view">
              
              {/* ADMIN DASHBOARD VIEW */}
              {adminTab === 'dashboard' && (
                <>
                  {authenticatedAdmin && (
                    <AdminCommandCenter
                      members={members}
                      events={events}
                      announcements={announcements}
                      activityLogs={activityLogs}
                      reviewerUid={firebaseUser.uid}
                      onCreateMember={() => {
                        setEditingMember(null);
                        setIsFormOpen(true);
                      }}
                      onOpenDirectory={() => setAdminTab('directory')}
                      onOpenAnalytics={() => setAdminTab('analytics')}
                      onOpenImportExport={() => setAdminTab('import-export')}
                    />
                  )}
                  <AdminDashboard
                    announcements={announcements}
                    events={events}
                    authenticatedAdmin={authenticatedAdmin}
                    authenticatedMember={authenticatedMember}
                    memberAvailabilities={memberAvailabilities}
                    onToggleAvailability={handleToggleAvailability}
                    allMembers={members}
                    onAddAnnouncement={handleAddAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                    onAddEvent={handleAddEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onApproveMember={handleApproveInduction}
                    onRejectMember={handleRejectInduction}
                  />
                </>
              )}

              {/* MY PROFILE VIEW */}
              {adminTab === 'profile' && authenticatedMember && (
                <div className="space-y-6">
                  <MyProfile member={authenticatedMember} actorUid={firebaseUser.uid} />
                  <PrivacyConsentCenter
                    member={authenticatedMember}
                    onSubmit={handleSaveMember}
                  />
                </div>
              )}
              
              {/* SPECIAL FEATURE: PENDING VERIFICATION ROW FOR FAST ACTION CLERGY REVIEW */}
              {!!authenticatedAdmin && adminTab === 'directory' && members.some(m => m.status === 'Pending') && (
                <div className="bg-amber-50 rounded-xl border border-amber-300 p-4 space-y-3 animate-fade-in" id="pending-applications-list">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest flex items-center">
                      <Sparkles className="w-4 h-4 text-amber-500 mr-2 animate-pulse" />
                      Pending Applications Requiring Bishop / Priest Review ({members.filter(m => m.status === 'Pending').length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {members.filter(m => m.status === 'Pending').map(m => (
                      <div key={m.id} className="bg-white border border-amber-200 p-3 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{m.fullName}</p>
                          <p className="text-[10px] text-slate-500">{m.parish} • {m.diocese}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded"
                          >
                            Read Bio
                          </button>
                          <button
                            onClick={() => handleApproveInduction(m.id)}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded"
                          >
                            Approve Induction ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DIRECTORY VIEW */}
              {adminTab === 'directory' && (
                <div className="space-y-6 animate-fade-in" id="elite-dossiers-directory-view">
                  
                  {/* 1. MASTER DIRECTORY ELEVATION BANNER */}
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-950 p-4 md:p-6 relative overflow-hidden shadow-lg select-none hover:shadow-xl transition-shadow duration-300" id="directory-master-elevation-banner">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mylapore Canonical Catalog</span>
                        </span>
                        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-slate-100 uppercase tracking-tight">
                          Archdiocese Digital Apostles Registry
                        </h2>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                          Canonical census containing active digital creators, catechists, clergymen, and liturgists serving online missions across Southern India.
                        </p>
                      </div>

                      {/* Small stats badges of filtered subset */}
                      <div className="grid grid-cols-3 gap-2 md:flex md:gap-3 w-full md:w-auto">
                        <div className="bg-slate-850 border border-slate-750/70 p-2 md:p-3 rounded-xl min-w-0 md:min-w-[90px] text-center">
                          <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-wider">Total</span>
                          <span className="font-mono text-base font-extrabold text-amber-300">{members.length}</span>
                        </div>
                        <div className="bg-slate-850 border border-slate-750/70 p-2 md:p-3 rounded-xl min-w-0 md:min-w-[90px] text-center">
                          <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-wider font-sans">Clerics</span>
                          <span className="font-mono text-base font-extrabold text-indigo-300">
                            {members.filter(m => m.membershipClass === 'Seminarian' || m.fullName.toLowerCase().includes('fr.') || m.fullName.toLowerCase().includes('rev.') || m.profession?.toLowerCase().includes('priest')).length}
                          </span>
                        </div>
                        <div className="bg-slate-850 border border-slate-750/70 p-2 md:p-3 rounded-xl min-w-0 md:min-w-[90px] text-center">
                          <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-wider font-sans">Media/Tech</span>
                          <span className="font-mono text-base font-extrabold text-purple-300">
                            {members.filter(m => m.techSkills.some(s => ['editing', 'video', 'podcast', 'web', 'designer', 'graphic', 'photo'].some(k => s.toLowerCase().includes(k)))).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. TABBED CATEGORY SHUNTERS & DIRECTORY STYLE CONTROL BAR */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-3xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    {/* Category Fast Switcher tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" id="apostolate-fast-tabs">
                      <button
                        onClick={() => { setSelectedApostolateGroup('all'); setBulkSelection([]); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${selectedApostolateGroup === 'all' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        All Apostolates
                      </button>
                      <button
                        onClick={() => { setSelectedApostolateGroup('clerics'); setBulkSelection([]); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${selectedApostolateGroup === 'clerics' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        id="apostolate-tab-clerics"
                      >
                        ⛪ Clergy &amp; Seminarians
                      </button>
                      <button
                        onClick={() => { setSelectedApostolateGroup('media-tech'); setBulkSelection([]); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${selectedApostolateGroup === 'media-tech' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        id="apostolate-tab-media"
                      >
                        🎙️ Media &amp; Tech
                      </button>
                      <button
                        onClick={() => { setSelectedApostolateGroup('youth'); setBulkSelection([]); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${selectedApostolateGroup === 'youth' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        id="apostolate-tab-youth"
                      >
                        🎓 Youth ministry
                      </button>
                      <button
                        onClick={() => { setSelectedApostolateGroup('active'); setBulkSelection([]); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${selectedApostolateGroup === 'active' ? 'bg-slate-900 text-amber-300 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        id="apostolate-tab-active"
                      >
                        ✓ Approved active
                      </button>
                    </div>

                    {/* Layout switcher buttons */}
                    <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg shrink-0 w-max self-end sm:self-auto gap-0.5" id="view-layout-toggle-bar">
                      <button
                        onClick={() => setDirectoryViewStyle('bento')}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${directoryViewStyle === 'bento' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-550 hover:text-slate-850'}`}
                        title="Bento Grid View"
                        id="btn-layout-bento"
                      >
                        <span>Grid cards</span>
                      </button>
                      <button
                        onClick={() => setDirectoryViewStyle('canonical-table')}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${directoryViewStyle === 'canonical-table' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-550 hover:text-slate-850'}`}
                        title="Canonical Registry Table View"
                        id="btn-layout-table"
                      >
                        <span>Liturgical Table</span>
                      </button>
                    </div>
                  </div>

                  {/* SEARCH FILTERS HEADER PANEL */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-5 space-y-4 shadow-xs" id="directory-query-panel">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Plaintext bar input */}
                      <div className="relative flex-grow" id="wrapper-searchQuery">
                        <Search className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          value={filters.searchQuery}
                          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                          placeholder="Search members by name, diocese, parish church, email, primary skills..."
                          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 focus:bg-white font-sans outline-none transition"
                          id="input-filters-searchQuery"
                        />
                        {filters.searchQuery && (
                          <button
                            onClick={() => setFilters({ ...filters, searchQuery: '' })}
                            className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 cursor-pointer animate-fade-in"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Sorting filter options */}
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 md:flex md:space-x-3" id="wrapper-sorter">
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest font-sans">Sort By</span>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as QueryFilters['sortBy'] })}
                          className="min-w-0 w-full md:w-auto text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg cursor-pointer tracking-wide border border-transparent"
                          id="select-filters-sortBy"
                        >
                          <option value="name-asc">Full Name (A - Z)</option>
                          <option value="name-desc">Full Name (Z - A)</option>
                          <option value="joined-newest">Newest dossiers first</option>
                          <option value="joined-oldest">Oldest dossiers first</option>
                          <option value="status-asc">Divide by Status</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                          className={`px-3 py-2 rounded-lg border transition flex items-center space-x-2 text-xs font-bold cursor-pointer ${showAdvanceFilters ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          id="btn-toggle-advanced-filters"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Advanced Filters</span>
                        </button>
                      </div>
                    </div>

                    {/* Advanced Dropdown filter checklist */}
                    {showAdvanceFilters && (
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" id="drawer-advance-filters">
                        
                        {/* Status query buttons */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Account Status Mode
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(['Affiliated', 'Pending', 'Abdicated', 'Director', 'ID card to be provided', 'Data Insufficient'] as MemberStatus[]).map(status => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusFilterChange(status)}
                                className={`px-2.5 py-1.4 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer border ${filters.statuses.includes(status) ? 'bg-slate-900 border-slate-900 text-amber-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Diocese Selection dropdown */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Filter by Diocese Location
                          </span>
                          <select
                            value={filters.diocese}
                            onChange={(e) => setFilters({ ...filters, diocese: e.target.value, parish: '' })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <option value="">All Dioceses</option>
                            <option>Archdiocese of Madras – Mylapore</option>
                            <option>Diocese of Chengalpattu</option>
                            <option>Diocese of Tuticorin</option>
                            <option>Diocese of Vellore</option>
                            <option>Diocese of Salem</option>
                            <option>Diocese of Dharmapuri</option>
                            <option>Diocese of Coimbatore</option>
                            <option>Diocese of Ootacamund (Ooty)</option>
                            <option>Diocese of Tiruchirapalli (Trichy)</option>
                            <option>Diocese of Thanjavur</option>
                            <option>Diocese of Dindigul</option>
                            <option>Diocese of Sivagangai</option>
                            <option>Diocese of Palayamkottai</option>
                            <option>Diocese of Kottar</option>
                            <option>Other Dioceses</option>
                          </select>
                        </div>

                        {/* Dependent Parish Selection dropdown */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Filter by Parish Church
                          </span>
                          <select
                            value={filters.parish}
                            disabled={!filters.diocese}
                            onChange={(e) => setFilters({ ...filters, parish: e.target.value })}
                            className={`w-full text-xs p-2 border rounded-lg outline-none font-semibold transition ${
                              filters.diocese 
                                ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100/50 hover:border-slate-350' 
                                : 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {!filters.diocese ? (
                              <option value="">Select a diocese first</option>
                            ) : (
                              <>
                                <option value="">All Parishes in this Diocese</option>
                                {(() => {
                                  const parishes = getParishesByDiocese(filters.diocese);
                                  const sorted = [...parishes].sort((a, b) => {
                                    const nameA = a.location ? `${a.name} – ${a.location}` : a.name;
                                    const nameB = b.location ? `${b.name} – ${b.location}` : b.name;
                                    return nameA.localeCompare(nameB);
                                  });
                                  return sorted.map((p) => {
                                    const label = p.location ? `${p.name} – ${p.location}` : p.name;
                                    return (
                                      <option key={label} value={label}>
                                        {label}
                                      </option>
                                    );
                                  });
                                })()}
                                <option value="Other">Other Parishes</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Gender filter dropdown */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Filter by Gender
                          </span>
                          <select
                            value={filters.gender}
                            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 hover:border-slate-350 transition-colors cursor-pointer"
                          >
                            <option value="">All Genders</option>
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </div>

                        {/* Cleanup button active filter indicators */}
                        {(filters.statuses.length > 0 || filters.searchQuery !== '' || filters.diocese !== '' || filters.parish !== '' || filters.gender !== '') && (
                          <div className="sm:col-span-2 md:col-span-4 pt-2 flex justify-start">
                            <button
                              type="button"
                              onClick={handleClearFilters}
                              className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200/80 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer border border-transparent"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Clear Active Filters</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bulk directories status updates bar */}
                  {!!authenticatedAdmin && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4" id="directory-bulk-bar">
                      <div className="flex items-center space-x-3 text-xs">
                        {/* Global list selection triggers */}
                        <button
                          onClick={() => handleSelectAll(filteredIdsList)}
                          className="p-1 text-slate-350 hover:text-slate-900 rounded-lg transition cursor-pointer"
                          title="Bulk select current view"
                        >
                          {bulkSelection.length === filteredIdsList.length && filteredIdsList.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <span className="font-bold text-slate-755">
                          {bulkSelection.length === 0 ? 'Bulk actions' : `${bulkSelection.length} dossiers marked for operation`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono select-none">({filteredMembersList.length} total matched)</span>
                      </div>

                      {/* Operational trigger buttons */}
                      {bulkSelection.length > 0 ? (
                        <div className="flex items-center space-x-2 flex-wrap">
                          <button
                            onClick={() => handleBulkStatusChange('Affiliated')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            Approve/Affiliate
                          </button>
                          <button
                            onClick={() => handleBulkStatusChange('Abdicated')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            Mark Inactive
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Files</span>
                          </button>
                          <button
                            onClick={() => setBulkSelection([])}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 max-w-sm text-right select-none leading-relaxed">
                          Toggle check boxes on cards to perform administrative actions.
                        </span>
                      )}
                    </div>
                  )}

                  {/* CARDS INDEX GRID */}
                  {filteredMembersList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center" id="directory-empty">
                      <div className="w-12 h-12 bg-slate-50 text-slate-350 rounded-lg flex items-center justify-center mx-auto font-mono text-xl mb-3">?</div>
                      <h4 className="text-xs font-bold uppercase text-slate-700">No Dossiers Match</h4>
                      <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing advanced filters, or restyle your plaintext search query.</p>
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-[10px] uppercase font-bold rounded-lg transition"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  ) : directoryViewStyle === 'canonical-table' ? (
                    /* MASTER CLERICAL HIGH-DENSITY SHEET TABLE */
                    <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-xs animate-fade-in" id="canonical-cathfluencer-sheet">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 text-amber-300 border-b border-slate-950 uppercase text-[9px] font-black tracking-widest select-none">
                              {!!authenticatedAdmin && <th className="p-4 w-12 text-center">Mark</th>}
                              <th className="p-4 pl-6">Digital Apostle Reference</th>
                              <th className="p-4">Commission Diocese</th>
                              <th className="p-4">Parish Congregation</th>
                              <th className="p-4">Vocation Field</th>
                              <th className="p-4">Directory Status</th>
                              <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {filteredMembersList.map(member => (
                              <tr 
                                key={member.id} 
                                className={`hover:bg-slate-50/90 transition-all transform duration-200 hover:scale-[1.01] hover:shadow-md hover:z-10 relative cursor-pointer ${bulkSelection.includes(member.id) ? 'bg-amber-500/5' : ''}`}
                              >
                                {!!authenticatedAdmin && (
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() => handleToggleBulkSelect(member.id)}
                                      className="p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer inline-flex items-center justify-center"
                                      title="Mark record"
                                    >
                                      {bulkSelection.includes(member.id) ? (
                                        <CheckSquare className="w-4 h-4 text-amber-600" />
                                      ) : (
                                        <Square className="w-4 h-4" />
                                      )}
                                    </button>
                                  </td>
                                )}
                                <td className="p-4 pl-6">
                                  <div className="flex items-center gap-3">
                                    {member.photoURL ? (
                                      <img 
                                        src={formatBase64ToImageSource(member.photoURL)} 
                                        alt={member.fullName} 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-3xs"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 ${member.avatarUrl || 'bg-indigo-650'}`}>
                                        {member.fullName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <h5 className="font-extrabold text-slate-900 uppercase tracking-wide truncate text-xs">{member.fullName}</h5>
                                      <span className="font-mono text-[9px] text-amber-600 font-bold block leading-none mt-0.5">{member.voxUserId || "nominee@vox.in"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-slate-700 max-w-[180px] truncate">
                                  {member.diocese || "Archdiocese of Madras - Mylapore"}
                                </td>
                                <td className="p-4 text-slate-600 font-medium max-w-[180px] truncate">
                                  {member.parish || "Parish not listed"}
                                </td>
                                <td className="p-4">
                                  <span className="bg-slate-100/80 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider">
                                    {member.profession || "Catechist"}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                    member.status === 'Affiliated' || member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                                    member.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse' :
                                    member.status === 'Director' ? 'bg-purple-50 text-purple-700 border-purple-250' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full mr-1 ${
                                      member.status === 'Affiliated' || member.status === 'Active' ? 'bg-emerald-500' :
                                      member.status === 'Pending' ? 'bg-amber-500 animate-ping' :
                                      'bg-slate-400'
                                    }`}></span>
                                    <span>{member.status || 'Active'}</span>
                                  </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex justify-end items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={() => setSelectedMember(member)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-150 cursor-pointer"
                                      title="Open Bio Dossier"
                                    >
                                      Bio file
                                    </button>
                                    {!!authenticatedAdmin && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingMember(member);
                                            setIsFormOpen(true);
                                          }}
                                          className="p-1.5 hover:bg-amber-100/50 text-slate-400 hover:text-amber-700 rounded-lg transition cursor-pointer"
                                          title="Edit records"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMember(member.id)}
                                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-700 rounded-lg transition cursor-pointer"
                                          title="Purge dossier"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-450 uppercase font-black tracking-widest gap-2">
                        <span>LITURGICAL REGISTRY LEDGER READ-OUT SUCCESSFUL</span>
                        <span>Showing {filteredMembersList.length} canonical records</span>
                      </div>
                    </div>
                  ) : (
                    /* DOSSERS CARD BENTO GRID VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="bento-directory-grid-view">
                      {filteredMembersList.map(member => {
                        return (
                          <div 
                            key={member.id} 
                            className="relative group transition-all duration-300"
                          >
                            
                            {/* Selection checkbox overlay */}
                            {!!authenticatedAdmin && (
                              <button
                                onClick={() => handleToggleBulkSelect(member.id)}
                                className={`absolute top-4 left-4 z-10 p-1 rounded-lg transition-all outline-none ${bulkSelection.includes(member.id) ? 'bg-indigo-600 text-white opacity-100 scale-100 shadow-sm' : 'bg-slate-150 border border-slate-205 text-slate-700 opacity-0 group-hover:opacity-100 scale-95 hover:scale-100 cursor-pointer duration-150'}`}
                                title="Toggle dossiers check"
                              >
                                {bulkSelection.includes(member.id) ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            <div className={bulkSelection.includes(member.id) ? 'ring-3 ring-amber-400 rounded-2xl shadow-md' : ''}>
                              <MemberCard
                                member={member}
                                onViewDetails={setSelectedMember}
                                onEdit={(m) => {
                                  setEditingMember(m);
                                  setIsFormOpen(true);
                                }}
                                onDelete={handleDeleteMember}
                                isAdmin={!!authenticatedAdmin}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* METRICS VIEW */}
              {adminTab === 'courses' && authenticatedAdmin && (
                <CourseAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'excellence' && authenticatedAdmin && (
                <AchievementAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'voxgroup' && authenticatedAdmin && (
                <VoxGroupAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'trainers' && authenticatedAdmin && (
                <TrainerAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'madhatv' && authenticatedAdmin && (
                <MadhaTvAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'campaigns' && authenticatedAdmin && (
                <CampaignAdminManager
                  adminUid={firebaseUser?.uid ?? ''}
                  onAddActivityLog={addActivityLog}
                />
              )}

              {adminTab === 'reports' && authenticatedAdmin && (
                <ReportsDashboard members={members} />
              )}

              {adminTab === 'analytics' && (
                <PrivacyAnalyticsDashboard members={members} events={events} />
              )}

              {/* BATCH EXPORTS VIEW */}
              {adminTab === 'import-export' && (
                <BulkImportExport 
                  members={members} 
                  onImport={handleImportMembers} 
                  addActivityLog={addActivityLog}
                />
              )}

              {/* AUDIT LOG VIEWER */}
              {adminTab === 'audit-logs' && (
                <div className="space-y-6 animate-fade-in" id="elite-audit-trail-panel">
                  
                  {/* MASTER ELEVATION HEADER */}
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-950 p-6 relative overflow-hidden shadow-lg select-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>Canonical Ledger Trails</span>
                        </span>
                        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-slate-100 uppercase tracking-tight">
                          Registry Auditor &amp; Security Logs
                        </h2>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                          Tamper-resistant audit trials recording clerical operations, dossier updates, credential permissions, and database sync status.
                        </p>
                      </div>

                      {/* Small actions and count details */}
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-850 border border-slate-750/70 p-3 rounded-xl min-w-[100px] text-center">
                          <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-wider">Log Entries</span>
                          <span className="font-mono text-base font-extrabold text-amber-300">{activityLogs.length}</span>
                        </div>
                        {activityLogs.length > 0 && (
                          <button
                            onClick={() => {
                              void dialog.alert({
                                title: 'Audit logs are immutable',
                                message: 'Production audit logs cannot be purged from the client. Configure retention through the trusted backend.',
                              });
                            }}
                            className="p-3 bg-rose-500/10 hover:bg-rose-600/90 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer h-full py-4 px-4 shadow-sm"
                            title="Clear audit trail cache"
                          >
                            Purge Ledgers
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEARCH CONTROL BAR */}
                  {activityLogs.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-205 p-3 flex flex-col sm:flex-row gap-3 items-center" id="audit-log-search-bar">
                      <div className="relative flex-grow w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={auditSearchQuery}
                          onChange={(e) => setAuditSearchQuery(e.target.value)}
                          placeholder="Search logs by action, administrator operator name or operation briefing description..."
                          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 bg-slate-50/50"
                        />
                      </div>
                      {auditSearchQuery && (
                        <button
                          onClick={() => setAuditSearchQuery('')}
                          className="text-[10px] uppercase font-black tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  )}

                  {/* LOGS OUTPUT TABLE */}
                  {activityLogs.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center select-none" id="logs-empty">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Audit Trail Vacuum</h4>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        No operations are cached right now. Any additions, purges or profile edits will generate real-time ledger entries here.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-3xs" id="audit-logs-table-wrapper">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 text-amber-300 border-b border-slate-950 uppercase text-[9px] font-black tracking-widest select-none">
                              <th className="p-4 pl-6 w-52">Absolute Timestamp</th>
                              <th className="p-4 w-44">Canonical Action</th>
                              <th className="p-4 w-48">Operator / Target</th>
                              <th className="p-4 pr-6">Operational Brief &amp; Payload Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {activityLogs
                              .filter(log => {
                                if (!auditSearchQuery) return true;
                                const q = auditSearchQuery.toLowerCase();
                                return (
                                  (log.action || '').toLowerCase().includes(q) ||
                                  (log.memberName || '').toLowerCase().includes(q) ||
                                  (log.details || '').toLowerCase().includes(q)
                                );
                              })
                              .map((log) => {
                                // Dynamic colors based on operation type
                                const isDestructive = log.details.toLowerCase().includes('delete') || log.details.toLowerCase().includes('revoke') || log.details.toLowerCase().includes('flush') || log.details.toLowerCase().includes('purge');
                                const isCreation = log.action.toLowerCase().includes('register') || log.action.toLowerCase().includes('onboard') || log.action.toLowerCase().includes('authorize');
                                
                                return (
                                  <tr key={log.id} className="hover:bg-slate-50/70 transition-all duration-155">
                                    <td className="p-4 pl-6">
                                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-450 font-bold select-all">
                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-350" />
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-bold uppercase border ${
                                        isDestructive ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                        isCreation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        'bg-slate-900 text-amber-300 border-slate-850'
                                      }`}>
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-450"></div>
                                        <span className="font-extrabold text-slate-900 uppercase tracking-wide">{log.memberName}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 pr-6 leading-relaxed text-slate-600 font-medium break-words max-w-md select-all">
                                      {log.details}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                      {/* Read out footer bar */}
                      <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-widest gap-2 select-none">
                        <span>Ledger Integrity Verification Checked</span>
                        <span className="text-amber-700 font-bold">Showing {activityLogs.filter(log => {
                          if (!auditSearchQuery) return true;
                          const q = auditSearchQuery.toLowerCase();
                          return (
                            (log.action || '').toLowerCase().includes(q) ||
                            (log.memberName || '').toLowerCase().includes(q) ||
                            (log.details || '').toLowerCase().includes(q)
                          );
                        }).length} captured sessions</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* AUTHORIZED ADMINISTRATIVE PROFILES VIEW */}
              {adminTab === 'admins' && (
                <div className="space-y-6 animate-fade-in" id="authorized-admins-tab-panel">
                  
                  {/* MASTER COUNCIL ELEVATION BANNER */}
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-950 p-6 relative overflow-hidden shadow-lg select-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Administrative Curia &amp; Council</span>
                        </span>
                        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-slate-100 uppercase tracking-tight">
                          Authorized Clergy &amp; Clerks Council
                        </h2>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                          Secure directory of high-rank administrative accounts authorized to access the digital gatehouse, audit dossiers, and modify parish records.
                        </p>
                      </div>

                      {/* Councils Badge Counter */}
                      <div className="flex gap-3">
                        <div className="bg-slate-850 border border-slate-750/70 p-3 rounded-xl min-w-[110px] text-center">
                          <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-wider">Active Curia</span>
                          <span className="font-mono text-base font-extrabold text-amber-300">{adminProfileList.length} admins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Provide Admin Access or Create Custom */}
                    <div className="space-y-6 self-start">
                      
                      {/* Form A: Promote Existing Dossier */}
                      <div className="bg-white rounded-2xl border border-slate-205 p-6 space-y-4 shadow-3xs">
                        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Promote Active Apostle</h4>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Elevate an active digital creator or catechist member directly to authorized clerical councils.
                        </p>

                        <div className="space-y-3.5 text-xs">
                          <div>
                            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Select Member Dossier</label>
                            <select
                              value={selectedMemberIdToPromote}
                              onChange={(e) => setSelectedMemberIdToPromote(e.target.value)}
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition"
                            >
                              <option value="">-- Choose Member Profile --</option>
                              {members.filter(m => {
                                return !adminProfileList.some(
                                  adm => adm.email.toLowerCase() === m.email.toLowerCase() || 
                                         (m.voxUserId && adm.voxId.trim().toLowerCase() === m.voxUserId.trim().toLowerCase())
                                );
                              }).map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.fullName} ({m.profession || 'Apostle'})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            disabled={!selectedMemberIdToPromote}
                            onClick={() => {
                              const m = members.find(x => x.id === selectedMemberIdToPromote);
                              if (m) {
                                handleToggleAdminAccess(m);
                                setSelectedMemberIdToPromote('');
                              }
                            }}
                            className="w-full py-3.5 bg-slate-900 border border-slate-950 text-amber-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition font-black uppercase text-[10px] tracking-wider rounded-xl outline-none cursor-pointer flex items-center justify-center gap-2"
                          >
                            🔑 Authorize Selected Representative
                          </button>
                        </div>
                      </div>

                      {/* Form B: Create Custom Admin Account */}
                      <div className="bg-white rounded-2xl border border-slate-205 p-6 space-y-4 shadow-3xs">
                        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">New Council Commission</h4>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Authorize external diocesan counselor, supervisor, or registrar directly.
                        </p>

                        <form onSubmit={(event) => event.preventDefault()} className="space-y-4 text-xs select-none">
                          <div className="space-y-1.5">
                            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-wider mb-1">Clerk Full Name *</label>
                            <input
                              type="text"
                              required
                              value={newAdminNameInput}
                              onChange={(e) => setNewAdminNameInput(e.target.value)}
                              placeholder="e.g. Rev. Fr. Maria Joseph"
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-wider mb-1">Email Coordinates *</label>
                            <input
                              type="email"
                              required
                              value={newAdminEmailInput}
                              onChange={(e) => setNewAdminEmailInput(e.target.value)}
                              placeholder="e.g. joseph@diocesan.in"
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[9.5px] font-black text-slate-505 uppercase tracking-wider mb-1">Vox Digital Identifier</label>
                            <input
                              type="text"
                              value={newAdminVoxInput}
                              onChange={(e) => setNewAdminVoxInput(e.target.value)}
                              placeholder="e.g. RevFr_Joseph@vox.in"
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none font-mono transition"
                            />
                            <p className="text-[9px] text-slate-400 leading-normal">
                              Leave blank to auto-compile as FirstName_LastName@vox.in. Must resolve to @vox.in
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled
                            className="w-full min-h-11 py-3.5 bg-slate-200 border border-slate-300 text-slate-500 font-black uppercase text-[10.5px] tracking-wider rounded-xl cursor-not-allowed mt-1"
                          >
                            Create Firebase Auth Account First
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: List of Active Administrators */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-3xs flex flex-col justify-between">
                      <div>
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Active Administrative Council Roster ({adminProfileList.length})</h4>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>System Synchronized</span>
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black uppercase text-slate-400 tracking-wider select-none">
                                <th className="p-4 pl-6">Curia Councilor Identity</th>
                                <th className="p-4">Coordinates Reference</th>
                                <th className="p-4">Canonical Identifier</th>
                                <th className="p-4 pr-6 text-right">Administrative Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans text-slate-650">
                              {adminProfileList.map((adm) => {
                                const isSelf = authenticatedAdmin && authenticatedAdmin.id === adm.id;
                                return (
                                  <tr key={adm.id} className={`hover:bg-slate-50/70 transition-all duration-155 ${isSelf ? 'bg-amber-500/[0.02]' : ''}`}>
                                    <td className="p-4 pl-6 font-extrabold text-slate-900 uppercase tracking-wide">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-300/40 text-amber-300 flex items-center justify-center font-black text-[9px]">
                                          {adm.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span>
                                          {adm.name} {isSelf && <span className="text-[9.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 ml-1">You</span>}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4 font-mono text-[11px] text-slate-550">{adm.email}</td>
                                    <td className="p-4">
                                      <span className="font-mono text-[10px] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 text-emerald-800 font-bold">
                                        {adm.voxId}
                                      </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (adminProfileList.length <= 1) {
                                            await dialog.alert({
                                              title: 'Administrator required',
                                              message: 'You cannot remove the sole remaining administrator.',
                                            });
                                            return;
                                          }
                                          if (authenticatedAdmin && authenticatedAdmin.id === adm.id) {
                                            if (await dialog.confirm({
                                              title: 'Revoke your access?',
                                              message: `Administrative access for ${adm.name} will be removed and this session will end.`,
                                              confirmLabel: 'Revoke access',
                                              destructive: true,
                                            })) {
                                              await updateAdminClaim(adm.uid, false);
                                              const updatedList = adminProfileList.filter(a => a.id !== adm.id);
                                              saveAdminsToStorage(updatedList);
                                              addActivityLog(
                                                'Revoke Admin Access', 
                                                adm.id, 
                                                adm.name, 
                                                `Revoked own administrative privileges for ${adm.name} (${adm.voxId}). Session terminated.`
                                              );
                                              void signOut();
                                              setPortalMode('welcome');
                                            }
                                            return;
                                          }
                                          if (await dialog.confirm({
                                            title: 'Revoke administrator?',
                                            message: `Remove administrative access for ${adm.name}?`,
                                            confirmLabel: 'Revoke access',
                                            destructive: true,
                                          })) {
                                            await updateAdminClaim(adm.uid, false);
                                            const updatedList = adminProfileList.filter(a => a.id !== adm.id);
                                            saveAdminsToStorage(updatedList);
                                            addActivityLog(
                                              'Revoke Admin Access', 
                                              adm.id, 
                                              adm.name, 
                                              `Revoked cleric administrative privileges for ${adm.name} (${adm.voxId}).`
                                            );
                                          }
                                        }}
                                        className="p-1.5 px-3 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-[9.5px] text-rose-600 font-black uppercase tracking-wider transition cursor-pointer"
                                      >
                                        Revoke Access
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Read out footer bar */}
                      <div className="p-4 bg-slate-50 border-t border-slate-105 mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-widest gap-2 select-none">
                        <span>Curia Access Keys Signed</span>
                        <span>Multi-user encryption active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>

        </div>
      )}
}
