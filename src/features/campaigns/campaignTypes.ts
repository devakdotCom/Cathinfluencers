// Campaign management module types.
// Admin-only communication planner: one message, formatted for each channel.

export type CampaignStatus = 'draft' | 'published' | 'archived';

export const CAMPAIGN_TYPES = [
  'Course announcement',
  'Membership campaign',
  'Madha TV campaign',
  'Event promotion',
  'Achievement announcement',
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_AUDIENCES = [
  'All members',
  'Students',
  'Trainers',
  'Vox Group members',
  'Public',
] as const;

export type CampaignAudience = (typeof CAMPAIGN_AUDIENCES)[number];

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  audience: CampaignAudience;
  message: string;
  imageUrl?: string;
  cta?: string;
  publishDate?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CampaignFormValues {
  title: string;
  type: CampaignType;
  audience: CampaignAudience;
  message: string;
  imageUrl: string;
  cta: string;
  publishDate: string;
}

export const EMPTY_CAMPAIGN_FORM: CampaignFormValues = {
  title: '',
  type: 'Course announcement',
  audience: 'All members',
  message: '',
  imageUrl: '',
  cta: 'Register at https://www.voxecclesiae.in/',
  publishDate: '',
};

/** Channel-formatted copies derived from one campaign message. */
export function campaignCopies(campaign: Campaign): {
  whatsapp: string;
  email: string;
  social: string;
} {
  const cta = campaign.cta ? `\n\n${campaign.cta}` : '';
  return {
    whatsapp: `*${campaign.title}*\n\n${campaign.message}${cta}\n\n🕊️ Vox Ecclesiae`,
    email: `Subject: ${campaign.title}\n\nDear ${campaign.audience === 'Public' ? 'friend' : 'member'},\n\n${campaign.message}${cta}\n\nIn Christ,\nVox Ecclesiae · Catholic Digital Commission`,
    social: `${campaign.title}\n\n${campaign.message}${cta}\n\n#VoxEcclesiae #CatholicMedia #FaithFormation`,
  };
}
