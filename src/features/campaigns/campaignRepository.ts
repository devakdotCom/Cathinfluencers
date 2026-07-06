import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Campaign, CampaignFormValues, CampaignStatus } from './campaignTypes';

export function campaignFromForm(
  values: CampaignFormValues,
  actorUid: string,
  existing?: Campaign,
): Campaign {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    title: values.title.trim(),
    type: values.type,
    audience: values.audience,
    message: values.message.trim(),
    ...(values.imageUrl.trim() ? { imageUrl: values.imageUrl.trim() } : {}),
    ...(values.cta.trim() ? { cta: values.cta.trim() } : {}),
    ...(values.publishDate ? { publishDate: values.publishDate } : {}),
    status: existing?.status ?? 'draft',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? actorUid,
    updatedBy: actorUid,
  };
}

export async function saveCampaign(campaign: Campaign): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'campaigns', campaign.id), campaign);
}

export async function setCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
  actorUid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'campaigns', campaignId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: actorUid,
  });
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'campaigns', campaignId));
}

export function subscribeAllCampaigns(
  onChange: (campaigns: Campaign[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'campaigns'),
    snapshot => {
      const campaigns = snapshot.docs.map(item => item.data() as Campaign);
      campaigns.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onChange(campaigns);
    },
    onError,
  );
}
