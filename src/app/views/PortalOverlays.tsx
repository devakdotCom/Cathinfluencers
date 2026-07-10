import { lazy } from 'react';
import { LanguageSwitcher } from '../../features/i18n/LanguageSwitcher';
import { GlobalSearch } from '../../features/search/GlobalSearch';
import { AIAssistant } from '../../features/ai/AIAssistant';
import { NotificationCenter } from '../../features/notifications/NotificationCenter';
import { usePortal } from '../PortalContext';

const MemberForm = lazy(() => import('../../components/MemberForm'));
const MemberDetailModal = lazy(() => import('../../components/MemberDetailModal'));

export function PortalOverlays() {
  const {
    firebaseUser,
    authRole,
    members,
    events,
    announcements,
    authenticatedMember,
    authenticatedAdmin,
    adminProfileList,
    setSelectedMember,
    setPortalMode,
    setWelcomeTab,
    navigatePublicSection,
    isFormOpen,
    setIsFormOpen,
    editingMember,
    setEditingMember,
    selectedMember,
    handleSaveMember,
    trackerActiveMember,
    setTrackerActiveMember,
    handleToggleAdminAccess,
  } = usePortal();

  return (
    <>
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
    </>
  );
}
