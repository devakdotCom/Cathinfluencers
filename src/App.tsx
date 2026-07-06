import { lazy, Suspense, useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Member, QueryFilters, ActivityLog, MembershipClass, MemberStatus, AdminProfile, Announcement, CalendarEvent } from './types';
import { getParishesByDiocese, getNormalizedDiocese, getNormalizedParish } from './data/diocesesParishes';
import MemberCard from './components/MemberCard';
import { formatBase64ToImageSource } from './utils/imageUtils';
import { leadersList } from './data/leadersData';
import { VoxEcclesiaeLogo } from './components/VoxEcclesiaeLogo';
import { 
  hasActiveFirebase, 
  saveAdminProfile, 
  deleteAdminProfile, 
  deleteAnnouncement,
  deleteCalendarEvent,
  downloadLeaderPortraits,
} from './firebase';
import { useAuth } from './features/auth/AuthProvider';
import { apiFetch } from './services/apiClient';
import { useDialog } from './components/ui/DialogProvider';
import { GlobalSearch, type PublicSection } from './features/search/GlobalSearch';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { PersonalizedDashboard } from './features/dashboard/PersonalizedDashboard';
import { AdminCommandCenter } from './features/admin/command/AdminCommandCenter';
import { AIAssistant } from './features/ai/AIAssistant';
import { NotificationCenter } from './features/notifications/NotificationCenter';
import { AdvancedMemberDirectory } from './features/directory/AdvancedMemberDirectory';
import { submitApprovalRequest } from './features/approvals/approvalRepository';
import { LanguageSwitcher } from './features/i18n/LanguageSwitcher';
import { AuthFlowNavigation } from './features/auth/AuthFlowNavigation';
import { PrivacyAnalyticsDashboard } from './features/analytics/PrivacyAnalyticsDashboard';
import { PrivacyConsentCenter } from './features/privacy/PrivacyConsentCenter';
import {
  deleteMemberRecord as deleteMember,
  requestMemberChange,
  saveMemberRecord as saveMember,
} from './repositories/memberRepository';
import { useDirectoryData } from './features/directory/useDirectoryData';
import { saveEventAvailability } from './features/events/availabilityRepository';
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
  GraduationCap
} from 'lucide-react';

const MemberForm = lazy(() => import('./components/MemberForm'));
const MemberDetailModal = lazy(() => import('./components/MemberDetailModal'));
const BulkImportExport = lazy(() => import('./components/BulkImportExport'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const MyProfile = lazy(() => import('./components/MyProfile'));
const ConnectHub = lazy(() => import('./components/ConnectHub'));
const ResourcesLibrary = lazy(() => import('./components/ResourcesLibrary'));
const CourseCatalog = lazy(() => import('./features/courses/CourseCatalog'));
const CourseAdminManager = lazy(() => import('./features/courses/CourseAdminManager'));
const AchievementWall = lazy(() => import('./features/excellence/AchievementWall'));
const AchievementAdminManager = lazy(() => import('./features/excellence/AchievementAdminManager'));
const VoxGroupHub = lazy(() => import('./features/voxgroup/VoxGroupHub'));
const VoxGroupAdminManager = lazy(() => import('./features/voxgroup/VoxGroupAdminManager'));

type PortalMode = 'welcome' | 'member-form' | 'member-tracker' | 'admin' | 'directory' | 'analytics' | 'import-export' | 'audit-logs';

function AppContent({
  initialPortalMode = 'welcome',
  initialAuthMode,
}: {
  initialPortalMode?: PortalMode;
  initialAuthMode?: 'sign-in' | 'register' | 'reset';
}) {
  const dialog = useDialog();
  const navigate = useNavigate();
  const {
    user: firebaseUser,
    role: authRole,
    loading: authLoading,
    signIn,
    register,
    resetPassword,
    signOut,
  } = useAuth();
  // Portal Navigation: 'welcome' | 'member-form' | 'member-tracker' | 'admin-dashboard'
  const [portalMode, setPortalMode] = useState<PortalMode>(initialPortalMode);

  const {
    members,
    setMembers,
    activityLogs,
    setActivityLogs,
    adminProfiles: adminProfileList,
    setAdminProfiles: setAdminProfileList,
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
  } = useDirectoryData(firebaseUser, authRole);

  const [isFirebaseQuotaExceeded, setIsFirebaseQuotaExceeded] = useState<boolean>(false);
  
  // Secondary sub-tab for Admin Dashboard - support 'profile' as a custom sub-tab!
  const [adminTab, setAdminTab] = useState<'dashboard' | 'directory' | 'courses' | 'excellence' | 'voxgroup' | 'analytics' | 'import-export' | 'audit-logs' | 'admins' | 'profile'>('dashboard');
  
  // Admin Authorization & Profiles State
  const isAdminAuthenticated = authRole === 'admin';

  const [adminLoginInput, setAdminLoginInput] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'register' | 'reset'>(
    () => initialAuthMode ?? (initialPortalMode === 'member-form' ? 'register' : 'sign-in'),
  );
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [newAdminNameInput, setNewAdminNameInput] = useState('');
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [newAdminVoxInput, setNewAdminVoxInput] = useState('');
  const [selectedMemberIdToPromote, setSelectedMemberIdToPromote] = useState('');

  // Member events availabilities mapping state
  const [memberAvailabilities, setMemberAvailabilities] = useState<Record<string, 'available' | 'not_available'>>({});

  const handleToggleAvailability = (eventId: string, memberId: string, status: 'available' | 'not_available') => {
    const updated = {
      ...memberAvailabilities,
      [`${eventId}_${memberId}`]: status
    };
    setMemberAvailabilities(updated);
    if (firebaseUser && authenticatedMember?.id === memberId) {
      void saveEventAvailability(eventId, memberId, firebaseUser.uid, status)
        .catch(error => console.error('Failed to save event availability:', error));
    }
    
    // Log active status
    const mObj = members.find(m => m.id === memberId);
    if (mObj) {
      addActivityLog(
        'Update Availability',
        memberId,
        mObj.fullName,
        `Marked availability as "${status}" for event: "${events.find(e => e.id === eventId)?.title || eventId}"`
      );
    }
  };
  
  // Welcome Public Portal Tab & Search filter states
  const [welcomeTab, setWelcomeTab] = useState<PublicSection>('home');
  const publicTabsRef = useRef<HTMLDivElement>(null);
  const [publicTabsCanScrollLeft, setPublicTabsCanScrollLeft] = useState(false);
  const [publicTabsCanScrollRight, setPublicTabsCanScrollRight] = useState(true);
  const [publicSearch, setPublicSearch] = useState('');
  const [publicDiocese, setPublicDiocese] = useState('');
  const [publicParish, setPublicParish] = useState('');
  const [publicSkill, setPublicSkill] = useState('');

  const navigatePublicSection = (section: PublicSection) => {
    setPortalMode('welcome');
    setWelcomeTab(section);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const openAccountWorkspace = () => {
    if (authRole === 'admin') {
      setPortalMode('admin');
      setAdminTab('dashboard');
      return;
    }
    if (authenticatedMember) {
      setPortalMode('admin');
      setAdminTab('profile');
      return;
    }
    setPortalMode(firebaseUser ? 'member-form' : 'admin');
  };

  useEffect(() => {
    const tabs = publicTabsRef.current;
    if (!tabs) return;

    const updateScrollIndicators = () => {
      const maxScrollLeft = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
      setPublicTabsCanScrollLeft(tabs.scrollLeft > 4);
      setPublicTabsCanScrollRight(tabs.scrollLeft < maxScrollLeft - 4);
    };

    tabs.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    updateScrollIndicators();
    tabs.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(tabs);

    return () => {
      tabs.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [welcomeTab]);

  const scrollPublicTabs = (direction: 'left' | 'right') => {
    publicTabsRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth'
    });
  };

  // Traditional Choral Repertoire & RSVP states
  const [activeHymn, setActiveHymn] = useState<'sacrament' | 'anima' | 'veni' | 'tamil'>('sacrament');
  const [isHymnPlaying, setIsHymnPlaying] = useState(false);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Set<string>>(() => new Set());

  const handleEventRsvp = async (eventId: string) => {
    if (!firebaseUser) {
      await dialog.alert({
        title: 'Sign in required',
        message: 'Sign in as a registered member before reserving an event place.',
      });
      return;
    }

    try {
      await apiFetch<{ success: true; id: string }>(`/api/events/${encodeURIComponent(eventId)}/rsvp`, {
        method: 'POST',
      });
      setRsvpedEventIds(previous => new Set(previous).add(eventId));
    } catch (error) {
      await dialog.alert({
        title: 'Reservation unavailable',
        message: error instanceof Error ? error.message : 'The reservation could not be completed.',
      });
    }
  };

  // Modals / Editors
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const isLegacyLeaderIllustration = (value: string | null | undefined) =>
    Boolean(value?.startsWith('data:image/svg+xml'));

  // Firebase Hosting serves the default portraits; local/cloud photo overrides remain supported.
  const [leaderImages, setLeaderImages] = useState<{ [id: string]: string }>(() =>
    Object.fromEntries(leadersList.map(leader => [leader.id, leader.image]))
  );

  // Load optional Firestore overrides created by an administrator.
  useEffect(() => {
    const syncPortraits = async () => {
      try {
        let loadedPortraits: { [id: string]: string } = {};

        if (hasActiveFirebase) {
          try {
            const dbPortraits = await downloadLeaderPortraits();
            if (dbPortraits && Object.keys(dbPortraits).length > 0) {
              loadedPortraits = Object.fromEntries(
                Object.entries(dbPortraits).filter(([, value]) => !isLegacyLeaderIllustration(value))
              );
            }
          } catch (fbErr) {
            console.error("Failed to sync leader portraits from Firestore:", fbErr);
          }
        }

        if (Object.keys(loadedPortraits).length > 0) {
          setLeaderImages(prev => {
            const updated = { ...prev };
            Object.keys(loadedPortraits).forEach(id => {
              if (loadedPortraits[id]) {
                const val = loadedPortraits[id];
                updated[id] = val;
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn('Unable to load leader portrait overrides:', err);
      }
    };
    syncPortraits();
  }, [hasActiveFirebase]);

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);
  
  // Member Sign-in State
  const [trackerEmailField, setTrackerEmailField] = useState('');
  const [trackerActiveMember, setTrackerActiveMember] = useState<Member | null>(null);
  const [trackerFeedback, setTrackerFeedback] = useState('');

  // Sorters and Advanced Search Filters
  const [filters, setFilters] = useState<QueryFilters>({
    searchQuery: '',
    statuses: [],
    membershipClasses: [],
    diocese: '',
    parish: '',
    gender: '',
    sortBy: 'name-asc'
  });

  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // Elite directory visual style & fast tags
  const [directoryViewStyle, setDirectoryViewStyle] = useState<'bento' | 'canonical-table'>('bento');

  useEffect(() => {
    const useMobileDirectoryLayout = () => {
      if (window.innerWidth < 640) {
        setDirectoryViewStyle('bento');
      }
    };

    useMobileDirectoryLayout();
    window.addEventListener('resize', useMobileDirectoryLayout);
    return () => window.removeEventListener('resize', useMobileDirectoryLayout);
  }, []);
  const [selectedApostolateGroup, setSelectedApostolateGroup] = useState<'all' | 'clerics' | 'media-tech' | 'youth' | 'active'>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Listen for background Firestore write limit or quota errors.
  useEffect(() => {
    const onQuotaExceeded = () => {
      setIsFirebaseQuotaExceeded(true);
    };

    window.addEventListener('firebase-quota-exceeded', onQuotaExceeded);
    return () => {
      window.removeEventListener('firebase-quota-exceeded', onQuotaExceeded);
    };
  }, []);

  // Compatibility callback for child components. Firestore document writes are
  // authoritative; whole-database synchronization has been retired.
  const triggerBackendSync = async (..._legacyArguments: unknown[]) => {
    setSyncStatus(hasActiveFirebase ? 'synced' : 'offline');
    if (hasActiveFirebase) setLastSyncedTime(new Date().toLocaleTimeString());
  };

  // Handle Deep Linking of specific dossier via ?memberId=XYZ URL parameter inline
  useEffect(() => {
    if (members.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const memberIdParam = params.get('memberId');
      if (memberIdParam) {
        const found = members.find(m => m.id === memberIdParam);
        if (found) {
          setSelectedMember(found);
        }
      }
    }
  }, [members]);

  const saveMembersToStorage = (updatedList: Member[]) => {
    const normalized = updatedList.map(m => {
      const normDiocese = getNormalizedDiocese(m.diocese);
      const normParish = getNormalizedParish(m.parish, normDiocese);
      return {
        ...m,
        diocese: normDiocese,
        parish: normParish,
        voxUserId: m.voxUserId || `${m.firstName.trim().replace(/[\s\W]+/g, '')}_${m.lastName.trim().replace(/[\s\W]+/g, '')}@vox.in`
      };
    });

    setMembers(normalized);
    
    // Sync active tracker session if there is one
    if (trackerActiveMember) {
      const freshTrackerSess = normalized.find(m => m.id === trackerActiveMember.id);
      if (freshTrackerSess) {
        setTrackerActiveMember(freshTrackerSess);
      }
    }

    triggerBackendSync(normalized, adminProfileList, activityLogs);
  };

  const saveAdminsToStorage = (updatedAdmins: AdminProfile[]) => {
    setAdminProfileList(updatedAdmins);
    triggerBackendSync(members, updatedAdmins, activityLogs);
  };

  const updateAdminClaim = async (uid: string | undefined, admin: boolean) => {
    if (!uid) throw new Error('This profile is not linked to a Firebase Authentication UID.');
    await apiFetch<{ success: true }>('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify({ uid, admin }),
    });
  };

  const handleToggleAdminAccess = async (targetMember: Member) => {
    const isAlreadyAdmin = adminProfileList.some(
      adm => adm.email.toLowerCase() === targetMember.email.toLowerCase() || 
             (targetMember.voxUserId && adm.voxId.trim().toLowerCase() === targetMember.voxUserId.trim().toLowerCase())
    );

    if (isAlreadyAdmin) {
      const foundAdmin = adminProfileList.find(
        adm => adm.email.toLowerCase() === targetMember.email.toLowerCase() || 
               (targetMember.voxUserId && adm.voxId.trim().toLowerCase() === targetMember.voxUserId.trim().toLowerCase())
      );
      if (foundAdmin) {
        if (adminProfileList.length <= 1) {
          await dialog.alert({
            title: 'Administrator required',
            message: 'You cannot remove the sole remaining administrator. Authorize another administrator first.',
          });
          return;
        }
        if (authenticatedAdmin && authenticatedAdmin.id === foundAdmin.id) {
          if (await dialog.confirm({
            title: 'Revoke your access?',
            message: `Administrative access for ${foundAdmin.name} will be removed and this session will end.`,
            confirmLabel: 'Revoke access',
            destructive: true,
          })) {
            const updatedList = adminProfileList.filter(a => a.id !== foundAdmin.id);
            saveAdminsToStorage(updatedList);
            void updateAdminClaim(foundAdmin.uid || targetMember.ownerUid, false)
              .catch(error => console.error('Failed to revoke admin claim:', error));
            if (hasActiveFirebase) {
              deleteAdminProfile(foundAdmin.id);
            }
            addActivityLog(
              'Revoke Admin Access', 
              foundAdmin.id, 
              foundAdmin.name, 
              `Revoked own administrative privileges for ${foundAdmin.name} (${foundAdmin.voxId}) from member profile view. Session terminated.`
            );
            void signOut();
            setPortalMode('welcome');
            if (selectedMember && selectedMember.id === targetMember.id) {
              setSelectedMember({...targetMember});
            }
          }
          return;
        }
        if (await dialog.confirm({
          title: 'Revoke administrator?',
          message: `Remove administrative access for ${foundAdmin.name}?`,
          confirmLabel: 'Revoke access',
          destructive: true,
        })) {
          const updatedList = adminProfileList.filter(a => a.id !== foundAdmin.id);
          saveAdminsToStorage(updatedList);
          void updateAdminClaim(foundAdmin.uid || targetMember.ownerUid, false)
            .catch(error => console.error('Failed to revoke admin claim:', error));
          if (hasActiveFirebase) {
            deleteAdminProfile(foundAdmin.id);
          }
          addActivityLog(
            'Revoke Admin Access', 
            foundAdmin.id, 
            foundAdmin.name, 
            `Revoked administrative privileges for ${foundAdmin.name} (${foundAdmin.voxId}) from member profile view.`
          );
          
          if (selectedMember && selectedMember.id === targetMember.id) {
            setSelectedMember({...targetMember});
          }
        }
      }
    } else {
      if (await dialog.confirm({
        title: 'Grant administrator access?',
        message: `${targetMember.fullName} will receive administrative access after their Firebase token refreshes.`,
        confirmLabel: 'Grant access',
      })) {
        const cleanF = targetMember.firstName.trim().replace(/[\s\W]+/g, '');
        const cleanL = targetMember.lastName.trim().replace(/[\s\W]+/g, '');
        const defaultVox = targetMember.voxUserId || (cleanF || cleanL ? `${cleanF}_${cleanL}@vox.in` : `${targetMember.fullName.replace(/[\s\W]+/g, '')}@vox.in`);
        
        const newAdmin: AdminProfile = {
          id: targetMember.ownerUid || crypto.randomUUID(),
          uid: targetMember.ownerUid,
          name: targetMember.fullName,
          email: targetMember.email || `${cleanF || cleanL ? cleanF + '_' + cleanL : 'admin'}@vox.com`,
          voxId: defaultVox.endsWith('@vox.in') ? defaultVox : defaultVox + '@vox.in',
          addedAt: new Date().toISOString()
        };
        const updatedList = [...adminProfileList, newAdmin];
        saveAdminsToStorage(updatedList);
        void updateAdminClaim(targetMember.ownerUid, true)
          .catch(error => console.error('Failed to grant admin claim:', error));
        if (hasActiveFirebase) {
          saveAdminProfile(newAdmin);
        }
        addActivityLog(
          'Authorize Admin', 
          newAdmin.id, 
          newAdmin.name, 
          `Granted Administrative clerking authorization to existing dossier profile: ${newAdmin.name} (${newAdmin.voxId}) from member profile view.`
        );

        if (selectedMember && selectedMember.id === targetMember.id) {
          setSelectedMember({...targetMember});
        }
      }
    }
  };

  const saveLogsToStorage = (updatedLogs: ActivityLog[]) => {
    setActivityLogs(updatedLogs);
    triggerBackendSync(members, adminProfileList, updatedLogs);
  };

  const addActivityLog = (action: string, memberId: string, memberName: string, details: string) => {
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      memberId,
      memberName,
      details
    };
    saveLogsToStorage([newLog, ...activityLogs]);
    if (firebaseUser) {
      void apiFetch<{ success: true }>('/api/logs', {
        method: 'POST',
        body: JSON.stringify({ action, memberId, memberName, details }),
      }).catch(error => console.error('Audit log write failed:', error));
    }
  };

  // Add or Update save handler
  const handleSaveMember = async (savedMember: Member) => {
    if (!firebaseUser) {
      setAdminLoginError('Please sign in before saving a private member profile.');
      setPortalMode('member-form');
      return;
    }
    const persistedMember = {
      ...savedMember,
      ownerUid: savedMember.ownerUid || firebaseUser.uid,
    };
    const isEdit = members.some(m => m.id === persistedMember.id);
    let updatedList: Member[] = [];

    if (isEdit) {
      updatedList = members.map(m => m.id === persistedMember.id ? persistedMember : m);
      addActivityLog(
        'Update Particulars', 
        persistedMember.id, 
        persistedMember.fullName, 
        `Updated profile particulars. Status changed to ${persistedMember.status}.`
      );
    } else {
      updatedList = [...members, persistedMember];
      addActivityLog(
        'Register Member', 
        persistedMember.id, 
        persistedMember.fullName, 
        `Submitted new applicant dossier from parish ${persistedMember.parish} to the review queue.`
      );
    }

    if (hasActiveFirebase && authRole !== 'admin') {
      await requestMemberChange(
        { ...persistedMember, status: isEdit ? persistedMember.status : 'Pending' },
        firebaseUser.uid,
        firebaseUser.displayName || firebaseUser.email || persistedMember.fullName,
        !isEdit,
      );
      await dialog.alert({
        title: isEdit ? 'Changes submitted' : 'Application submitted',
        message: `Your ${isEdit ? 'profile changes were' : 'new member application was'} submitted for administrator approval.`,
      });
    } else {
      saveMembersToStorage(updatedList);
      if (hasActiveFirebase) await saveMember(persistedMember);
    }
    setBulkSelection([]);
    setIsFormOpen(false);
    setEditingMember(null);
  };

  // Single record deletion handler
  const handleDeleteMember = async (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    if (await dialog.confirm({
      title: 'Delete member permanently?',
      message: `${target.fullName} will be removed from private and public directories. This cannot be undone.`,
      confirmLabel: 'Delete member',
      destructive: true,
    })) {
      const updatedList = members.filter(m => m.id !== memberId);
      saveMembersToStorage(updatedList);
      if (hasActiveFirebase) {
        deleteMember(memberId);
      }
      setBulkSelection(bulkSelection.filter(id => id !== memberId));
      addActivityLog('Delete Record', memberId, target.fullName, 'Physically extracted record from secure database storage.');
    }
  };

  // Approval quick induction action
  const handleApproveInduction = (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, status: 'Affiliated' as MemberStatus };
      }
      return m;
    });

    saveMembersToStorage(updated);
    if (hasActiveFirebase) {
      saveMember({ ...target, status: 'Affiliated' as MemberStatus });
    }
    addActivityLog('Approve Applicant', memberId, target.fullName, `Validated credentials. Inducted as official affiliated Cathfluencer.`);
  };

  const handleRejectInduction = (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, status: 'Abdicated' as MemberStatus };
      }
      return m;
    });

    saveMembersToStorage(updated);
    if (hasActiveFirebase) {
      saveMember({ ...target, status: 'Abdicated' as MemberStatus });
    }
    addActivityLog('Reject Applicant', memberId, target.fullName, `Rejected application. Marked dossier status as Abdicated.`);
  };

  const saveAnnouncementsToStorage = (updated: Announcement[], logs = activityLogs) => {
    setAnnouncements(updated);
    triggerBackendSync(members, adminProfileList, logs, updated, events);
  };

  const saveEventsToStorage = (updated: CalendarEvent[], logs = activityLogs) => {
    setEvents(updated);
    triggerBackendSync(members, adminProfileList, logs, announcements, updated);
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    if (!firebaseUser) return;
    void submitApprovalRequest({
      kind: 'announcement',
      title: `Announcement: ${newAnn.title}`,
      summary: newAnn.content.slice(0, 180),
      ownerUid: firebaseUser.uid,
      ownerName: authenticatedAdmin?.name || firebaseUser.email || 'Administrator',
      targetId: newAnn.id,
      payload: newAnn as unknown as Record<string, unknown>,
    })
      .then(() =>
        dialog.alert({
          title: 'Announcement queued',
          message: 'The announcement is awaiting review and has not been published.',
        }),
      )
      .catch(error =>
        dialog.alert({
          title: 'Submission failed',
          message: error instanceof Error ? error.message : 'The announcement could not be queued.',
        }),
      );
  };

  const handleDeleteAnnouncement = (id: string) => {
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    const updatedAnns = announcements.filter(a => a.id !== id);
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'Retract Decree',
      memberId: 'admin',
      memberName: authenticatedAdmin?.name || 'Clerical Admin',
      details: `Retracted advisory decree: "${target.title}"`
    };
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    if (hasActiveFirebase) {
      deleteAnnouncement(id);
    }
    saveAnnouncementsToStorage(updatedAnns, updatedLogs);
  };

  const handleAddEvent = (newEvt: CalendarEvent) => {
    if (!firebaseUser) return;
    void submitApprovalRequest({
      kind: 'event',
      title: `Event: ${newEvt.title}`,
      summary: `${newEvt.date} | ${newEvt.category} | ${newEvt.location || 'Location pending'}`,
      ownerUid: firebaseUser.uid,
      ownerName: authenticatedAdmin?.name || firebaseUser.email || 'Administrator',
      targetId: newEvt.id,
      payload: newEvt as unknown as Record<string, unknown>,
    })
      .then(() =>
        dialog.alert({
          title: 'Event queued',
          message: 'The event is awaiting review and is not visible on the public calendar yet.',
        }),
      )
      .catch(error =>
        dialog.alert({
          title: 'Submission failed',
          message: error instanceof Error ? error.message : 'The event could not be queued.',
        }),
      );
  };

  const handleDeleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    if (!target) return;
    const updatedEvts = events.filter(e => e.id !== id);
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'Cancel Event',
      memberId: 'admin',
      memberName: authenticatedAdmin?.name || 'Clerical Admin',
      details: `Canceled scheduled event: "${target.title}"`
    };
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    if (hasActiveFirebase) {
      deleteCalendarEvent(id);
    }
    saveEventsToStorage(updatedEvts, updatedLogs);
  };

  // Bulk operation routines
  const handleToggleBulkSelect = (memberId: string) => {
    if (bulkSelection.includes(memberId)) {
      setBulkSelection(bulkSelection.filter(id => id !== memberId));
    } else {
      setBulkSelection([...bulkSelection, memberId]);
    }
  };

  const handleSelectAll = (filteredIds: string[]) => {
    if (bulkSelection.length === filteredIds.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(filteredIds);
    }
  };

  const handleBulkStatusChange = (newStatus: MemberStatus) => {
    if (bulkSelection.length === 0) return;

    const updated = members.map(m => {
      if (bulkSelection.includes(m.id)) {
        return { ...m, status: newStatus };
      }
      return m;
    });

    saveMembersToStorage(updated);
    if (hasActiveFirebase) {
      updated.forEach(m => {
        if (bulkSelection.includes(m.id)) {
          saveMember(m);
        }
      });
    }
    addActivityLog(
      'Bulk Status Update', 
      'system', 
      'Multiple dossiers', 
      `Mass induction changed status to ${newStatus} for ${bulkSelection.length} selected dossiers.`
    );
    setBulkSelection([]);
  };

  const handleBulkDelete = async () => {
    if (bulkSelection.length === 0) return;

    if (await dialog.confirm({
      title: 'Delete selected members?',
      message: `${bulkSelection.length} selected member records will be permanently removed.`,
      confirmLabel: 'Delete selected',
      destructive: true,
    })) {
      const updated = members.filter(m => !bulkSelection.includes(m.id));
      saveMembersToStorage(updated);
      if (hasActiveFirebase) {
        bulkSelection.forEach(id => {
          deleteMember(id);
        });
      }
      addActivityLog(
        'Bulk Permanent Delete', 
        'system', 
        'Multiple dossiers', 
        `Mass purge deleted ${bulkSelection.length} record folders from persistent disk cache.`
      );
      setBulkSelection([]);
    }
  };

  // Importer Callback
  const handleImportMembers = (importedList: Member[]) => {
    const mergedList = [...members, ...importedList];
    saveMembersToStorage(mergedList);
    if (hasActiveFirebase) {
      importedList.forEach(m => {
        saveMember(m);
      });
    }
    setBulkSelection([]);
    setAdminTab('directory');
  };

  const handleResetAppToDemo = () => {
    setAdminLoginError('Production data reset is disabled. Use the Firebase Emulator Suite for test data.');
  };

  // Directory search filters query matching
  const getFilteredMembers = () => {
    let result = [...members];

    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.fullName.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        m.parish.toLowerCase().includes(q) ||
        m.bibleBook?.toLowerCase().includes(q) ||
        m.techSkills?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter(m => filters.statuses.includes(m.status));
    }

    if (filters.diocese) {
      result = result.filter(m => m.diocese === filters.diocese);
    }

    if (filters.parish) {
      result = result.filter(m => {
        const mParish = m.parish.toLowerCase();
        const fParish = filters.parish.toLowerCase();
        return mParish === fParish || mParish.includes(fParish) || fParish.includes(mParish);
      });
    }

    if (filters.gender) {
      result = result.filter(m => m.gender === filters.gender);
    }

    // Fast categorizer groups shunting (Masterpiece feature):
    if (selectedApostolateGroup !== 'all') {
      if (selectedApostolateGroup === 'clerics') {
        result = result.filter(m => 
          m.membershipClass === 'Seminarian' || 
          m.profession?.toLowerCase().includes('cler') || 
          m.profession?.toLowerCase().includes('priest') || 
          m.profession?.toLowerCase().includes('reverend') || 
          m.profession?.toLowerCase().includes('father') || 
          m.profession?.toLowerCase().includes('sister') ||
          m.fullName.toLowerCase().includes('rev.') ||
          m.fullName.toLowerCase().includes('fr.') ||
          m.fullName.toLowerCase().includes('sr.') ||
          m.fullName.toLowerCase().includes('seminarian')
        );
      } else if (selectedApostolateGroup === 'media-tech') {
        result = result.filter(m => 
          m.techSkills.some(sk => ['design', 'video', 'editing', 'podcast', 'developer', 'photography', 'audio', 'writing', 'web'].some(k => sk.toLowerCase().includes(k))) ||
          m.profession?.toLowerCase().includes('media') ||
          m.profession?.toLowerCase().includes('editor') ||
          m.profession?.toLowerCase().includes('tech') ||
          m.profession?.toLowerCase().includes('designer') ||
          m.profession?.toLowerCase().includes('journal')
        );
      } else if (selectedApostolateGroup === 'youth') {
        result = result.filter(m => 
          m.membershipClass === 'Student' ||
          m.ambition?.toLowerCase().includes('youth') ||
          m.hobbies?.toLowerCase().includes('youth') ||
          m.profession?.toLowerCase().includes('student')
        );
      } else if (selectedApostolateGroup === 'active') {
        result = result.filter(m => m.status === 'Affiliated' || m.status === 'Active');
      }
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.fullName.localeCompare(b.fullName);
        case 'name-desc':
          return b.fullName.localeCompare(a.fullName);
        case 'joined-newest':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case 'joined-oldest':
          return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
        case 'status-asc':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  };

  const filteredMembersList = getFilteredMembers();
  const filteredIdsList = filteredMembersList.map(m => m.id);

  const handleStatusFilterChange = (status: MemberStatus) => {
    const activeStat = [...filters.statuses];
    if (activeStat.includes(status)) {
      setFilters({ ...filters, statuses: activeStat.filter(s => s !== status) });
    } else {
      setFilters({ ...filters, statuses: [...activeStat, status] });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      statuses: [],
      membershipClasses: [],
      diocese: '',
      parish: '',
      gender: '',
      sortBy: 'name-asc'
    });
  };

  const handleSecureLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminLoginError('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'reset') {
        await resetPassword(adminLoginInput);
        await dialog.alert({
          title: 'Password reset sent',
          message: 'Check the inbox and spam folder for the registered Firebase email address.',
        });
        setAuthMode('sign-in');
      } else if (authMode === 'register') {
        const role = await register(adminLoginInput, adminLoginPassword);
        navigate(role === 'admin' ? '/admin/dashboard' : role === 'moderator' ? '/admin/reviews' : '/dashboard', { replace: true });
      } else {
        const role = await signIn(adminLoginInput, adminLoginPassword);
        navigate(role === 'admin' ? '/admin/dashboard' : role === 'moderator' ? '/admin/reviews' : '/dashboard', { replace: true });
      }
      setAdminLoginInput('');
      setAdminLoginPassword('');
      setAdminTab('dashboard');
    } catch (error) {
      console.error('Firebase sign-in failed:', error);
      const authCode = (
        error
        && typeof error === 'object'
        && 'code' in error
        && typeof error.code === 'string'
      ) ? error.code : '';
      const messageByCode: Record<string, string> = {
        'auth/invalid-credential': 'The email or password is incorrect. Reset the password in Firebase if needed.',
        'auth/user-disabled': 'This Firebase Authentication account has been disabled.',
        'auth/too-many-requests': 'Too many failed attempts. Wait a few minutes or reset the password.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication.',
        'auth/network-request-failed': 'Firebase could not be reached. Check your connection and try again.',
      };
      setAdminLoginError(
        messageByCode[authCode]
        || (error instanceof Error ? error.message : 'Sign-in failed. Please try again.'),
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const resetAuthFlowForPortalReturn = () => {
    setAdminLoginError('');
    setAuthMode('sign-in');
    setTrackerFeedback('');
    setTrackerActiveMember(null);
    setPortalMode(authRole === 'admin' ? 'admin' : 'welcome');
  };

  const authFlowLabel = authMode === 'reset'
    ? 'Reset Password'
    : authMode === 'register' || portalMode === 'member-form'
      ? 'Register'
      : portalMode === 'member-tracker'
        ? 'Credential Lookup'
        : 'Sign In';

  // Member Status Search Lookup Handle
  const handleMemberTrackerLookup = () => {
    if (authenticatedMember) {
      setTrackerActiveMember(authenticatedMember);
      setTrackerFeedback('');
    } else {
      setTrackerActiveMember(null);
      setTrackerFeedback('No private member profile is linked to this authenticated account.');
    }
  };

  // Intercept and enforce Universal Security Gatehouse for any unauthenticated visitors trying to access clerks/admin mode
  const requiresAuthentication =
    portalMode === 'admin' || portalMode === 'member-form' || portalMode === 'member-tracker';

  if (requiresAuthentication && authLoading) {
    return (
      <div className="auth-flow-page relative min-h-[100svh] bg-slate-950 text-white grid place-items-center">
        <AuthFlowNavigation currentLabel={authFlowLabel} />
        <p role="status">Verifying secure session...</p>
      </div>
    );
  }

  if (requiresAuthentication && !firebaseUser) {
    return (
      <div 
        className="auth-flow-page min-h-screen flex items-center justify-center p-6 text-white relative font-sans bg-slate-950" 
        id="universal-security-gateway"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(13, 10, 27, 0.95), rgba(5, 3, 13, 0.98)), url('https://upload.wikimedia.org/wikipedia/commons/e/ee/San_Thome_Basilica%2C_Chennai.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <AuthFlowNavigation
          currentLabel={authFlowLabel}
          onBeforeNavigate={resetAuthFlowForPortalReturn}
        />
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-[#05030d]/80 z-0 opacity-85 pointer-events-none" />
        
        <div className="flex flex-col gap-4 max-w-md w-full z-10 animate-fade-in animate-duration-300">
          {isFirebaseQuotaExceeded && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200 flex flex-col gap-2 relative overflow-hidden shadow-xl" id="firebase-quota-alert-login">
              <div className="flex items-start gap-2">
                <span className="text-[14px] mt-0.5">⚠️</span>
                <div>
                  <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-1">Cloud Registry Quota Notice</h4>
                  <p className="leading-relaxed">
                    This database has reached its current write allowance. Existing data remains readable, but editing is temporarily unavailable until quota resets or billing limits are adjusted.
                  </p>
                </div>
              </div>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="text-[9px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg transition-colors font-sans flex items-center justify-center gap-1 mt-1 shrink-0"
              >
                <span>Diagnose Database In Firebase</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          <div className="w-full bg-[#161224] border border-amber-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden" id="admin-login-box">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 font-sans"></div>
          
          <div className="text-center space-y-4 mb-6">
            <div className="w-20 h-20 mx-auto filter drop-shadow-[0_5px_10px_rgba(245,158,11,0.2)]">
              <VoxEcclesiaeLogo size="100%" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 font-display">Archdiocese of Madras - Mylapore</span>
              <h3 className="text-xl font-display font-semibold uppercase tracking-wider text-white mt-1">
                {authMode === 'reset'
                  ? 'Reset Your Password'
                  : authMode === 'register'
                    ? 'Create Your Secure Account'
                    : 'Vox Ecclesiae Secure Gate'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 select-none font-medium">
                {authMode === 'reset'
                  ? 'Enter your registered email address and we will send a secure password reset link.'
                  : authMode === 'register'
                    ? 'Create your portal credentials before completing your Cathfluencer registration.'
                    : 'Identify yourself using your registered email address to safely retrieve your digital badge, audit register entries, or configure systems.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSecureLogin} className="space-y-4" id="admin-login-form">
            
            {adminLoginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 text-xs font-bold leading-relaxed" id="login-error-banner">
                ⚠️ {adminLoginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="secure-login-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registered email address *</label>
              <div className="relative">
                <input
                  id="secure-login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={adminLoginInput}
                  onChange={(e) => setAdminLoginInput(e.target.value)}
                  placeholder="name@example.org"
                  className="w-full min-h-11 text-xs p-3.5 bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 rounded-xl font-sans text-white focus:bg-slate-900/65 font-medium transition"
                />
              </div>
            </div>

            {authMode !== 'reset' && <div className="space-y-1.5">
              <label htmlFor="secure-login-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Password *</label>
              <input
                id="secure-login-password"
                type="password"
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={adminLoginPassword}
                onChange={(e) => setAdminLoginPassword(e.target.value)}
                className="w-full min-h-11 text-xs p-3.5 bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 rounded-xl font-sans text-white"
              />
            </div>}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full min-h-11 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition active:scale-95 cursor-pointer mt-2 disabled:cursor-wait disabled:opacity-70"
            >
              {authSubmitting
                ? 'Please wait...'
                : authMode === 'reset'
                  ? 'Send Reset Link'
                  : authMode === 'register'
                    ? 'Create Secure Account'
                    : 'Sign In Securely'}
            </button>

            {authMode === 'sign-in' && (
              <button
                type="button"
                onClick={() => {
                  setAdminLoginError('');
                  setAuthMode('reset');
                }}
                className="w-full min-h-11 text-xs font-bold text-slate-300 hover:text-amber-300 underline underline-offset-4"
              >
                Forgot password?
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMode(current => current === 'sign-in' ? 'register' : 'sign-in');
                setAdminLoginError('');
              }}
              className="w-full min-h-11 text-xs font-bold text-amber-300 hover:text-white underline"
            >
              {authMode === 'register'
                ? 'Already registered? Sign in'
                : authMode === 'reset'
                  ? 'Return to sign in'
                  : 'New member? Create an account'}
            </button>
          </form>



          {/* Registration Trigger */}
          <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
            <p className="text-[11px] text-slate-400 leading-normal">
              Not a member yet?{' '}
              <button 
                type="button" 
                onClick={() => {
                  setAdminLoginError('');
                  setAdminLoginInput('');
                  setAuthMode('register');
                }}
                className="text-amber-400 font-bold hover:text-white transition underline cursor-pointer"
              >
                Enroll &amp; Register fresh digital handle here ✍️
              </button>
            </p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans" id="vox-app-frame">
      
      {/* 2-way Persistent Header Ribbon linking Portals */}
      {isAdminAuthenticated && (
        <div className="bg-slate-950 p-2 text-center text-[9px] md:text-[10px] uppercase font-bold tracking-wider md:tracking-widest text-amber-300 flex items-center justify-between gap-3 px-3 md:px-6 border-b border-amber-500/10 z-50 sticky top-0 md:h-8" id="persistent-portal-linkbar">
        <span>🕊️ Vox Ecclesiae • Catholic Digital Commission Registry</span>
        
        <div className="flex gap-2 md:gap-4 shrink-0">
          {portalMode !== 'welcome' && (
            <button 
              type="button" 
              onClick={() => {
                setPortalMode('welcome');
                setTrackerActiveMember(null);
              }}
              className="text-white hover:text-amber-200 transition underline cursor-cmd"
            >
              Main Entry 🏛️
            </button>
          )}

          {portalMode !== 'admin' && portalMode !== 'directory' && portalMode !== 'analytics' && portalMode !== 'import-export' && portalMode !== 'audit-logs' ? (
            <button 
              type="button" 
              onClick={() => {
                setPortalMode('admin');
                setAdminTab('dashboard');
              }}
              className="text-amber-300 hover:text-white transition flex items-center gap-1 cursor-cmd"
            >
              <span>Switch to Clergy Admin Portal 🔑</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => setPortalMode('welcome')}
              className="text-amber-300 hover:text-white transition flex items-center gap-1 cursor-cmd"
            >
              <span>Switch to Applicant &amp; Member Portal 🕊️</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      )}

      {isFirebaseQuotaExceeded && (
        <div className="bg-amber-55 border-b border-amber-500/25 px-3 md:px-6 py-3 text-xs text-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 z-50 sticky top-0 md:top-8" id="firebase-quota-alert-banner">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-slate-900 leading-normal">
                Cloud Database Quota Active
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">
                The cloud database has reached its current write allowance. Editing is temporarily unavailable; existing cloud data remains readable. Retry after the quota resets or review project billing and usage.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsFirebaseQuotaExceeded(false);
              }}
              className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Acknowledge &amp; Retry
            </button>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-450 text-slate-950 px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <span>Review In Firebase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 1. PUBLIC DIOCESAN INFORMATION HUB & ENTRY GATEWAY */}
      {portalMode === 'welcome' && (
        <div className="vox-mobile-content min-h-screen bg-slate-950 text-white font-sans flex flex-col relative select-text overflow-x-clip" id="portal-landing-page">
          {/* Main Hero Background Banner */}
          <div 
            className="relative py-9 md:py-14 px-4 text-center overflow-hidden border-b border-slate-800/80 flex flex-col items-center justify-center bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 26, 0.94), rgba(8, 4, 18, 0.98)), url('https://upload.wikimedia.org/wikipedia/commons/e/ee/San_Thome_Basilica%2C_Chennai.jpg')",
            }}
          >
            {/* Sacred Radial Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent z-0 opacity-45 pointer-events-none" />
            
            <div className="w-full min-w-0 max-w-4xl mx-auto space-y-5 z-10 relative">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)]">
                <VoxEcclesiaeLogo size="100%" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-display">Archdiocese of Madras - Mylapore</p>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-white">
                  VOX ECCLESIAE
                </h1>
                <p className="text-xs md:text-sm text-slate-350 max-w-xl mx-auto leading-relaxed">
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
                  className="flex md:flex-wrap items-center overflow-x-auto md:overflow-visible md:justify-center gap-1 px-12 md:px-1 py-1 bg-slate-900/90 border border-slate-800 rounded-2xl w-full min-w-0 backdrop-blur-md shadow-lg select-none"
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
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'home' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'home'}
                  aria-controls="pub-tab-lobby"
                  tabIndex={welcomeTab === 'home' ? 0 : -1}
                >
                  🏛️ Portal Hub
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('directory')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'directory' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'directory'}
                  aria-controls="pub-tab-leaders"
                  tabIndex={welcomeTab === 'directory' ? 0 : -1}
                >
                  👑 Our Leaders
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('courses')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'courses'}
                  aria-controls="pub-tab-courses"
                  tabIndex={welcomeTab === 'courses' ? 0 : -1}
                >
                  🎓 Courses
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('excellence')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'excellence' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'excellence'}
                  aria-controls="pub-tab-excellence"
                  tabIndex={welcomeTab === 'excellence' ? 0 : -1}
                >
                  🏆 Excellence
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('voxgroup')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'voxgroup' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'voxgroup'}
                  aria-controls="pub-tab-voxgroup"
                  tabIndex={welcomeTab === 'voxgroup' ? 0 : -1}
                >
                  ⁘ Vox Group
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('announcements')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'announcements' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'announcements'}
                  aria-controls="pub-tab-announcements"
                  tabIndex={welcomeTab === 'announcements' ? 0 : -1}
                >
                  📢 Chronicles
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('events')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'events' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'events'}
                  aria-controls="pub-tab-events"
                  tabIndex={welcomeTab === 'events' ? 0 : -1}
                >
                  📅 Calendar &amp; RSVP
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('resources')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'resources' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'resources'}
                  aria-controls="pub-tab-connect"
                  tabIndex={welcomeTab === 'resources' ? 0 : -1}
                >
                  🌐 Catholic Connect
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTab('guidelines')}
                  className={`shrink-0 px-3 py-1.5 border-0 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${welcomeTab === 'guidelines' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  role="tab"
                  aria-selected={welcomeTab === 'guidelines'}
                  aria-controls="pub-tab-resources"
                  tabIndex={welcomeTab === 'guidelines' ? 0 : -1}
                >
                  📚 Resources
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

      {/* 2. MEMBER APPLICATION FORM (IN-PLACE PORTAL ENTRY) */}
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

      {/* 3. SIMULATED MEMBER LOGIN / STATUS TRACKER & DIGITAL ID BADGE VIEW */}
      {portalMode === 'member-tracker' && (
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
                        <VoxEcclesiaeLogo size="100%" />
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
      )}

      {/* 4. DIGITAL CLERGY / COMMISSION SECURITY GATEWAY */}
      {portalMode === 'admin' && !!firebaseUser && !isAdminAuthenticated && (
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
                <VoxEcclesiaeLogo size="100%" />
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
      )}

      {/* 5. DIGITAL CLERGY / COMMISION DIRECTORY ADMIN DASHBOARD */}
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
                    <VoxEcclesiaeLogo size="100%" />
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



      {/* CORE POP-UP WIZARDS */}
      <LanguageSwitcher />
      <GlobalSearch
        members={firebaseUser ? members : []}
        events={events}
        announcements={announcements}
        onOpenMember={(member) => {
          setSelectedMember(member);
          setPortalMode('welcome');
          setWelcomeTab('directory');
        }}
        onNavigate={navigatePublicSection}
      />
      <AIAssistant
        user={firebaseUser}
        role={authRole}
        currentMember={authenticatedMember}
        members={members}
        onOpenMember={(member) => {
          setSelectedMember(member);
          setPortalMode('welcome');
          setWelcomeTab('directory');
        }}
      />
      {firebaseUser && <NotificationCenter userUid={firebaseUser.uid} />}

      {isFormOpen && (
        <MemberForm
          member={editingMember}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMember(null);
          }}
          onSave={(m) => {
            handleSaveMember(m);
            // If updating current active tracker profile, refresh it
            if (trackerActiveMember && trackerActiveMember.id === m.id) {
              setTrackerActiveMember(m);
            }
          }}
        />
      )}

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(m) => {
            setEditingMember(m);
            setIsFormOpen(true);
          }}
          isAdminMode={!!authenticatedAdmin}
          isSelf={!!authenticatedMember && authenticatedMember.id === selectedMember.id}
          actorUid={firebaseUser?.uid}
          adminProfileList={adminProfileList}
          onToggleAdminAccess={handleToggleAdminAccess}
        />
      )}

    </div>
  );
}

export default function App({
  initialPortalMode,
  initialAuthMode,
}: {
  initialPortalMode?: PortalMode;
  initialAuthMode?: 'sign-in' | 'register' | 'reset';
}) {
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
      <AppContent initialPortalMode={initialPortalMode} initialAuthMode={initialAuthMode} />
    </Suspense>
  );
}
