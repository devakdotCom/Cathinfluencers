import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';

export interface EngagementMetrics {
  rsvps: number;
  reminders: number;
  availabilityResponses: number;
}

export function useEngagementMetrics(enabled: boolean) {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    rsvps: 0,
    reminders: 0,
    availabilityResponses: 0,
  });

  useEffect(() => {
    if (!db || !enabled) return;
    const unsubscribers = [
      onSnapshot(collection(db, 'eventRsvps'), snapshot =>
        setMetrics(current => ({ ...current, rsvps: snapshot.size })),
      ),
      onSnapshot(collection(db, 'eventReminderSubscriptions'), snapshot =>
        setMetrics(current => ({ ...current, reminders: snapshot.size })),
      ),
      onSnapshot(collection(db, 'eventAvailabilities'), snapshot =>
        setMetrics(current => ({
          ...current,
          availabilityResponses: snapshot.size,
        })),
      ),
    ];
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [enabled]);

  return metrics;
}

