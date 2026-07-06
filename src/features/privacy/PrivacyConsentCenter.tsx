import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Member, ProfilePrivacyConsent } from '../../types';
import { Badge, Button, Card } from '../../components/ui/primitives';
import { getPrivacyConsent } from '../../utils/memberPrivacy';

interface PrivacyConsentCenterProps {
  member: Member;
  onSubmit: (updatedMember: Member) => Promise<void> | void;
}

const options: Array<{
  key: keyof Pick<
    ProfilePrivacyConsent,
    | 'showPhoto'
    | 'showLocation'
    | 'showSocialProfiles'
    | 'showBiography'
    | 'showSkills'
    | 'showTamilName'
  >;
  label: string;
  description: string;
}> = [
  {
    key: 'showPhoto',
    label: 'Profile photo',
    description: 'Show your approved profile photograph in the public directory.',
  },
  {
    key: 'showLocation',
    label: 'Parish and diocese',
    description: 'Help collaborators discover you by Catholic community location.',
  },
  {
    key: 'showSocialProfiles',
    label: 'Social ministry profiles',
    description: 'Publish your submitted Instagram, Facebook, and YouTube links.',
  },
  {
    key: 'showBiography',
    label: 'Biography and ministry story',
    description: 'Show your ambition, biography, roles, and selected achievements.',
  },
  {
    key: 'showSkills',
    label: 'Skills and ministry goals',
    description: 'Use your skills for search and collaboration recommendations.',
  },
  {
    key: 'showTamilName',
    label: 'Tamil display name',
    description: 'Show your Tamil name alongside your English name.',
  },
];

export function PrivacyConsentCenter({
  member,
  onSubmit,
}: PrivacyConsentCenterProps) {
  const [consent, setConsent] = useState(() => getPrivacyConsent(member));
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = async () => {
    setWorking(true);
    setFeedback('');
    try {
      await onSubmit({
        ...member,
        privacyConsent: {
          ...consent,
          acceptedAt: new Date().toISOString(),
          version: '2026-01',
        },
      });
      setFeedback('Privacy preferences submitted for secure publication review.');
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Privacy preferences could not be submitted.',
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6" id="privacy-consent-center">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone="success">
            <ShieldCheck className="mr-1 size-3" />
            Privacy center
          </Badge>
          <h3 className="mt-3 font-serif text-2xl font-bold text-white">
            Control your public profile
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Email, phone, birth date, blood group, and street address are always
            private. Choose which optional ministry details may be published.
          </p>
        </div>
        <Badge tone="neutral">Consent v2026-01</Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {options.map(option => {
          const enabled = consent[option.key];
          return (
            <button
              type="button"
              key={option.key}
              onClick={() =>
                setConsent(current => ({
                  ...current,
                  [option.key]: !current[option.key],
                }))
              }
              className={`vox-focus flex min-h-20 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                enabled
                  ? 'border-emerald-400/30 bg-emerald-400/8'
                  : 'border-slate-700 bg-slate-900/55'
              }`}
              aria-pressed={enabled}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  enabled
                    ? 'bg-emerald-400/12 text-emerald-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </span>
              <span>
                <span className="block text-sm font-bold text-white">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Button className="mt-5" loading={working} onClick={() => void submit()}>
        Save privacy preferences
      </Button>
      {feedback && (
        <p className="mt-3 text-sm text-amber-200" role="status">
          {feedback}
        </p>
      )}
    </Card>
  );
}

