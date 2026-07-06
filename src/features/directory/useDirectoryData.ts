import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { db, hasActiveFirebase } from '../../firebase';
import { INITIAL_ANNOUNCEMENTS, INITIAL_EVENTS } from '../../data/mockEvents';
import type {
  ActivityLog,
  AdminProfile,
  Announcement,
  CalendarEvent,
  Member,
} from '../../types';
import type { AppRole } from '../auth/AuthProvider';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'initial';

export function useDirectoryData(user: User | null, role: AppRole) {
  const [members, setMembers] = useState<Member[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('initial');
  const [lastSyncedTime, setLastSyncedTime] = useState('');

  useEffect(() => {
    if (!hasActiveFirebase || !db) {
      setSyncStatus('offline');
      return;
    }

    const onError = (error: unknown) => {
      console.error('Firestore subscription failed:', error);
      setSyncStatus('error');
    };
    const subscriptions: Array<() => void> = [];
    const memberSource = role === 'admin'
      ? collection(db, 'members')
      : collection(db, 'publicMembers');

    subscriptions.push(onSnapshot(
      memberSource,
      snapshot => setMembers(snapshot.docs.map(item => item.data() as Member)),
      onError,
    ));
    subscriptions.push(onSnapshot(
      collection(db, 'announcements'),
      snapshot => setAnnouncements(snapshot.docs.map(item => item.data() as Announcement)),
      onError,
    ));
    subscriptions.push(onSnapshot(
      collection(db, 'calendarEvents'),
      snapshot => setEvents(snapshot.docs.map(item => item.data() as CalendarEvent)),
      onError,
    ));

    if (role === 'admin') {
      subscriptions.push(onSnapshot(
        collection(db, 'adminProfiles'),
        snapshot => setAdminProfiles(snapshot.docs.map(item => item.data() as AdminProfile)),
        onError,
      ));
      subscriptions.push(onSnapshot(
        collection(db, 'activityLogs'),
        snapshot => {
          const logs = snapshot.docs.map(item => item.data() as ActivityLog);
          logs.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
          setActivityLogs(logs);
        },
        onError,
      ));
    }

    setSyncStatus('synced');
    setLastSyncedTime(new Date().toLocaleTimeString());
    return () => subscriptions.forEach(unsubscribe => unsubscribe());
  }, [role]);

  const authenticatedAdmin = useMemo<AdminProfile | null>(() => {
    if (!user || role !== 'admin') return null;
    return adminProfiles.find(profile =>
      profile.uid === user.uid ||
      profile.email.toLowerCase() === user.email?.toLowerCase()
    ) || {
      id: user.uid,
      uid: user.uid,
      name: user.displayName || user.email || 'Administrator',
      email: user.email || '',
      voxId: user.email || user.uid,
      addedAt: user.metadata.creationTime || new Date().toISOString(),
    };
  }, [adminProfiles, role, user]);

  const [privateMember, setPrivateMember] = useState<Member | null>(null);
  useEffect(() => {
    if (!db || !user || role !== 'member') {
      setPrivateMember(null);
      return;
    }
    return onSnapshot(
      query(collection(db, 'members'), where('ownerUid', '==', user.uid)),
      snapshot => setPrivateMember(snapshot.docs[0]?.data() as Member || null),
      error => console.error('Private member subscription failed:', error),
    );
  }, [role, user]);

  return {
    members,
    setMembers,
    activityLogs,
    setActivityLogs,
    adminProfiles,
    setAdminProfiles,
    announcements,
    setAnnouncements,
    events,
    setEvents,
    syncStatus,
    setSyncStatus,
    lastSyncedTime,
    setLastSyncedTime,
    authenticatedAdmin,
    authenticatedMember: privateMember,
  };
}
