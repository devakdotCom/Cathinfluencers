import { useState, useEffect, useRef, type FormEvent } from 'react';
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
import type { PublicSection } from '../features/search/GlobalSearch';
import type { PortalInitProps, PortalMode, AdminTab, AuthMode, ApostolateGroup, DirectoryViewStyle } from './types';
import type { MemberStatus } from '../types';

export function usePortalController({
  initialPortalMode = 'welcome',
  initialAuthMode,
  initialPublicSection,
}: PortalInitProps) {
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
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  
  // Admin Authorization & Profiles State
  const isAdminAuthenticated = authRole === 'admin';

  const [adminLoginInput, setAdminLoginInput] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>(
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
  const [welcomeTab, setWelcomeTab] = useState<PublicSection>(initialPublicSection ?? 'home');
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

    if (!isApiConfigured()) {
      await dialog.alert({
        title: 'Reservations unavailable',
        message: 'Event RSVP requires the hosted API. Contact your administrator or try again from the full portal deployment.',
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
  const [directoryViewStyle, setDirectoryViewStyle] = useState<DirectoryViewStyle>('bento');

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
  const [selectedApostolateGroup, setSelectedApostolateGroup] = useState<ApostolateGroup>('all');
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
    handleToggleBulkSelect,
    handleSelectAll,
    handleBulkStatusChange,
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
