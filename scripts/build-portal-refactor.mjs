import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const body = fs.readFileSync(path.join(root, 'src/app/_usePortalController.body.ts'), 'utf8');

const hookImports = `import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Member, QueryFilters, ActivityLog, AdminProfile, Announcement, CalendarEvent } from '../types';
import { getParishesByDiocese, getNormalizedDiocese, getNormalizedParish } from '../data/diocesesParishes';
import { leadersList } from '../data/leadersData';
import {
  hasActiveFirebase,
  saveAdminProfile,
  deleteAdminProfile,
  deleteAnnouncement,
  deleteCalendarEvent,
  downloadLeaderPortraits,
} from '../firebase';
import { useAuth } from '../features/auth/AuthProvider';
import { apiFetch, isApiConfigured } from '../services/apiClient';
import { useDialog } from '../components/ui/DialogProvider';
import { submitApprovalRequest } from '../features/approvals/approvalRepository';
import {
  deleteMemberRecord as deleteMember,
  requestMemberChange,
  saveMemberRecord as saveMember,
} from '../repositories/memberRepository';
import { useDirectoryData } from '../features/directory/useDirectoryData';
import { saveEventAvailability } from '../features/events/availabilityRepository';
import type { PortalInitProps, AdminTab, AuthMode, ApostolateGroup, DirectoryViewStyle } from './types';
import type { MemberStatus } from '../types';

`;

const hookHeader = `export function usePortalController({
  initialPortalMode = 'welcome',
  initialAuthMode,
  initialPublicSection,
}: PortalInitProps) {
`;

const hookFooter = `
  return {
    dialog,
    navigate,
    firebaseUser,
    authRole,
    authLoading,
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
    syncStatus,
    setSyncStatus,
    lastSyncedTime,
    setLastSyncedTime,
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
    setLeaderImages,
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
    setTrackerFeedback,
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
    saveLogsToStorage,
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
    getFilteredMembers,
    filteredMembersList,
    filteredIdsList,
    handleStatusFilterChange,
    handleClearFilters,
    handleSecureLogin,
    resetAuthFlowForPortalReturn,
    authFlowLabel,
    handleMemberTrackerLookup,
    requiresAuthentication,
    isApiConfigured,
    hasActiveFirebase,
    leadersList,
    getParishesByDiocese,
    getNormalizedDiocese,
    getNormalizedParish,
  };
}
`;

let fixedBody = body
  .replace(
    "useState<'dashboard' | 'directory' | 'courses' | 'excellence' | 'voxgroup' | 'trainers' | 'madhatv' | 'campaigns' | 'reports' | 'analytics' | 'import-export' | 'audit-logs' | 'admins' | 'profile'>('dashboard')",
    "useState<AdminTab>('dashboard')",
  )
  .replace("useState<'sign-in' | 'register' | 'reset'>", 'useState<AuthMode>')
  .replace("useState<'all' | 'clerics' | 'media-tech' | 'youth' | 'active'>('all')", "useState<ApostolateGroup>('all')")
  .replace("useState<'bento' | 'canonical-table'>('bento')", "useState<DirectoryViewStyle>('bento')");

fixedBody = fixedBody.replace(
  `  const handleEventRsvp = async (eventId: string) => {
    if (!firebaseUser) {
      await dialog.alert({
        title: 'Sign in required',
        message: 'Sign in as a registered member before reserving an event place.',
      });
      return;
    }

    try {
      await apiFetch`,
  `  const handleEventRsvp = async (eventId: string) => {
    if (!firebaseUser) {
      await dialog.alert({
        title: 'Sign in required',
        message: 'Sign in as a registered member before reserving an event place.',
      });
      return;
    }

    if (!isApiConfigured()) {
      await dialog.alert({
        title: 'Reservations unavailable',
        message: 'Event RSVP requires the hosted API. Contact your administrator or try again from the full portal deployment.',
      });
      return;
    }

    try {
      await apiFetch`,
);

fs.writeFileSync(path.join(root, 'src/app/usePortalController.ts'), hookImports + hookHeader + fixedBody + hookFooter);

fs.writeFileSync(
  path.join(root, 'src/app/PortalContext.tsx'),
  `import { createContext, useContext, type ReactNode } from 'react';
import { usePortalController } from './usePortalController';
import type { PortalInitProps } from './types';

export type PortalContextValue = ReturnType<typeof usePortalController>;

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children, ...init }: PortalInitProps & { children: ReactNode }) {
  const value = usePortalController(init);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error('usePortal must be used within PortalProvider');
  return value;
}
`,
);

const sharedDestructure = `  const {
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
`;

const iconImports = `import {
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
`;

const lazyImports = `import { lazy } from 'react';
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
`;

const baseImports = `import MemberCard from '../../components/MemberCard';
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
`;

const viewMeta = {
  AuthLoadingView: { ret: false, lazy: false, icons: false },
  AuthGatewayView: { ret: true, lazy: false, icons: true },
  PortalChrome: { ret: false, lazy: false, icons: true },
  WelcomePortalView: { ret: false, lazy: true, icons: true },
  MemberFormPortalView: { ret: false, lazy: true, icons: true },
  MemberTrackerPortalView: { ret: false, lazy: false, icons: true },
  AdminAccessDeniedView: { ret: false, lazy: false, icons: true },
  AdminPortalView: { ret: false, lazy: true, icons: true },
  PortalOverlays: { ret: false, lazy: true, icons: true },
};

for (const [key, meta] of Object.entries(viewMeta)) {
  const chunk = fs.readFileSync(path.join(root, 'src/app/views/_' + key + '.chunk.tsx'), 'utf8');
  let content = chunk;
  if (meta.ret) {
    content = chunk.replace(/^\s*if \(requiresAuthentication && !firebaseUser\) \{\s*\n\s*return \(/, 'return (');
    content = content.replace(/\}\s*$/, '');
  }
  const name = key;
  const imports = [
    meta.lazy ? lazyImports : '',
    meta.icons ? iconImports : "import { ExternalLink } from 'lucide-react';\n",
    name === 'AuthLoadingView'
      ? "import { AuthFlowNavigation } from '../../features/auth/AuthFlowNavigation';\nimport { usePortal } from '../PortalContext';\n"
      : baseImports,
  ].join('');
  const file = `${imports}
export function ${name}() {
${name === 'AuthLoadingView' ? "  const { authFlowLabel } = usePortal();\n" : sharedDestructure}
${content}
}
`;
  fs.writeFileSync(path.join(root, 'src/app/views/' + name + '.tsx'), file);
}

fs.writeFileSync(
  path.join(root, 'src/app/PortalShell.tsx'),
  `import { AuthLoadingView } from './views/AuthLoadingView';
import { AuthGatewayView } from './views/AuthGatewayView';
import { PortalChrome } from './views/PortalChrome';
import { WelcomePortalView } from './views/WelcomePortalView';
import { MemberFormPortalView } from './views/MemberFormPortalView';
import { MemberTrackerPortalView } from './views/MemberTrackerPortalView';
import { AdminAccessDeniedView } from './views/AdminAccessDeniedView';
import { AdminPortalView } from './views/AdminPortalView';
import { PortalOverlays } from './views/PortalOverlays';
import { usePortal } from './PortalContext';

export function PortalShell() {
  const { requiresAuthentication, authLoading, firebaseUser } = usePortal();

  if (requiresAuthentication && authLoading) {
    return <AuthLoadingView />;
  }

  if (requiresAuthentication && !firebaseUser) {
    return <AuthGatewayView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans" id="vox-app-frame">
      <PortalChrome />
      <WelcomePortalView />
      <MemberFormPortalView />
      <MemberTrackerPortalView />
      <AdminAccessDeniedView />
      <AdminPortalView />
      <PortalOverlays />
    </div>
  );
}
`,
);

fs.writeFileSync(
  path.join(root, 'src/App.tsx'),
  `import { Suspense } from 'react';
import { PortalProvider } from './app/PortalContext';
import { PortalShell } from './app/PortalShell';
import type { PortalInitProps } from './app/types';

export default function App({
  initialPortalMode,
  initialAuthMode,
  initialPublicSection,
}: PortalInitProps) {
  return (
    <Suspense
      fallback={(
        <div className="min-h-[100dvh] bg-slate-950 text-amber-300 flex items-center justify-center px-6 text-center">
          <div role="status" aria-live="polite" className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-amber-500/25 border-t-amber-400 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Loading portal</p>
          </div>
        </div>
      )}
    >
      <PortalProvider
        initialPortalMode={initialPortalMode}
        initialAuthMode={initialAuthMode}
        initialPublicSection={initialPublicSection}
      >
        <PortalShell />
      </PortalProvider>
    </Suspense>
  );
}
`,
);

console.log('Portal refactor files generated.');
