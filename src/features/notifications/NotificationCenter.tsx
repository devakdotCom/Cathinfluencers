import {
  Bell,
  CalendarDays,
  CheckCheck,
  FileCheck2,
  Megaphone,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import type { AppNotification } from '../../types';
import {
  markNotificationRead,
  subscribeNotifications,
} from './notificationRepository';
import { Badge, Button, EmptyState } from '../../components/ui/primitives';
import { useTranslation } from 'react-i18next';

const icons: Record<AppNotification['type'], ComponentType<{ className?: string }>> = {
  approval: FileCheck2,
  event: CalendarDays,
  announcement: Megaphone,
  profile: UserRound,
  system: Settings,
};

export function NotificationCenter({ userUid }: { userUid: string }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const unread = useMemo(
    () => notifications.filter(notification => !notification.readAt).length,
    [notifications],
  );

  useEffect(
    () =>
      subscribeNotifications(
        userUid,
        setNotifications,
        error => setErrorMessage(error.message),
      ),
    [userUid],
  );

  const markRead = async (notification: AppNotification) => {
    if (notification.readAt) return;
    try {
      await markNotificationRead(notification.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Notification could not be updated.',
      );
    }
  };

  const markAllRead = async () => {
    await Promise.all(
      notifications
        .filter(notification => !notification.readAt)
        .map(notification => markNotificationRead(notification.id)),
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        iconOnly
        className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] left-4 z-40 rounded-full bg-slate-950/90 shadow-2xl md:bottom-20 md:left-6"
        onClick={() => setOpen(true)}
        aria-label={`Open notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-slate-950/70 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            className="vox-glass vox-safe-bottom flex h-full w-full max-w-md flex-col rounded-none border-y-0 border-r-0"
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-700/60 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="notifications-title" className="font-serif text-xl font-bold text-white">
                    {t('notifications.title')}
                  </h2>
                  <Badge tone={unread ? 'warning' : 'neutral'}>{t('notifications.unread', { count: unread })}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {t('notifications.description')}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                iconOnly
                onClick={() => setOpen(false)}
                aria-label={t('notifications.close')}
              >
                <X className="size-5" />
              </Button>
            </header>

            {unread > 0 && (
              <div className="border-b border-slate-700/60 px-4 py-2 text-right">
                <Button type="button" variant="ghost" onClick={() => void markAllRead()}>
                  <CheckCheck className="size-4" />
                  {t('notifications.markAllRead')}
                </Button>
              </div>
            )}

            <div className="vox-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
              {errorMessage && (
                <p className="mb-3 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-100" role="alert">
                  {errorMessage}
                </p>
              )}
              {!notifications.length ? (
                <EmptyState
                  icon={<Bell className="size-5" />}
                  title={t('notifications.emptyTitle')}
                  description={t('notifications.emptyDescription')}
                  className="border-0 bg-transparent shadow-none"
                />
              ) : (
                <div className="space-y-2">
                  {notifications.map(notification => {
                    const Icon = icons[notification.type];
                    return (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => void markRead(notification)}
                        className={`vox-focus flex min-h-20 w-full gap-3 rounded-2xl border p-3 text-left transition ${
                          notification.readAt
                            ? 'border-slate-800 bg-slate-900/35'
                            : 'border-amber-400/25 bg-amber-400/8'
                        }`}
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-amber-300">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-white">{notification.title}</span>
                            {!notification.readAt && (
                              <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400" />
                            )}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-400">
                            {notification.message}
                          </span>
                          <span className="mt-2 block text-[10px] text-slate-600">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
