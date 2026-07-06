import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Member } from '../types';
import { 
  Mail, Phone, Calendar, MapPin, Lock, User, 
  Briefcase, Award, Sparkles, Heart, FileText, CheckCircle2, QrCode, ShieldX
} from 'lucide-react';
import { formatBase64ToImageSource } from '../utils/imageUtils';
import {
  getOrIssueCredential,
  revokeCredential,
} from '../features/credentials/credentialRepository';
import { useDialog } from './ui/DialogProvider';

interface MyProfileProps {
  member: Member;
  actorUid: string;
}

export default function MyProfile({ member, actorUid }: MyProfileProps) {
  const dialog = useDialog();
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialExpiresAt, setCredentialExpiresAt] = useState('');
  const [credentialFeedback, setCredentialFeedback] = useState('');

  useEffect(() => {
    let active = true;
    void getOrIssueCredential(member, actorUid)
      .then(async issued => {
        const qr = await QRCode.toDataURL(issued.verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        if (!active) return;
        setQrCodeUrl(qr);
        setCredentialId(issued.credential.id);
        setCredentialExpiresAt(issued.credential.expiresAt);
      })
      .catch(error => console.error('Credential issuance failed:', error));
    return () => {
      active = false;
    };
  }, [actorUid, member]);

  // Generate random avatar color based on member ID for unique branding
  const getAvatarColor = () => {
    return member.avatarUrl || 'bg-amber-500';
  };

  const handlePrintBadge = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 500);
  };

  const handleRevokeCredential = async () => {
    if (!credentialId) return;
    const confirmed = await dialog.confirm({
      title: 'Revoke digital credential?',
      message: 'This QR code will stop verifying immediately. A replacement can be issued when the profile is loaded again.',
      confirmLabel: 'Revoke credential',
      cancelLabel: 'Keep credential',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      setCredentialFeedback('Revoking credential...');
      await revokeCredential(credentialId, actorUid);
      setCredentialId('');
      setQrCodeUrl('');
      setCredentialExpiresAt('');
      setCredentialFeedback('Credential revoked. Reload this profile to issue a new credential.');
    } catch (error) {
      console.error('Credential revocation failed:', error);
      setCredentialFeedback('Credential could not be revoked. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="my-profile-panel">
      {/* Overview Card */}
      <div className="bg-slate-900 text-white p-6 lg:p-8 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {member.photoURL ? (
              <img 
                src={formatBase64ToImageSource(member.photoURL)} 
                alt={member.fullName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-405 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${getAvatarColor()} border-2 border-amber-404 flex items-center justify-center text-2xl font-black text-slate-950 uppercase shrink-0`}>
                {member.firstName[0] || ''}{member.lastName[0] || ''}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-display font-semibold tracking-wide text-white">{member.fullName}</h2>
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {member.membershipClass}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{member.profession} • Parish: {member.parish}</p>
              <p className="text-[10.5px] text-slate-500 font-mono mt-1.5">{member.voxUserId || 'vox-user-not-provisioned'}</p>
            </div>
          </div>

          <button
            onClick={handlePrintBadge}
            disabled={downloading}
            className="px-4 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer border border-transparent shrink-0"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{downloading ? 'Preparing Badge...' : 'Download / Print ID Badge'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Credential Card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Digital Badge Layout */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="printable-badges-profile">
            {/* Watermark Logo */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/5 rounded-full pointer-events-none"></div>
            
            {/* Badge Header */}
            <div className="border-b border-slate-800 pb-4 text-center">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">Digital Directory Badge</span>
              <h3 className="text-sm font-semibold tracking-wider text-slate-100 uppercase mt-1">Archdiocese Clergy Registry</h3>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{member.diocese}</p>
            </div>

            {/* Badge Content */}
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              {member.photoURL ? (
                <img 
                  src={formatBase64ToImageSource(member.photoURL)} 
                  alt={member.fullName} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-amber-400/85 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full ${getAvatarColor()} border-4 border-amber-400/80 p-1 flex items-center justify-center text-2xl font-black text-slate-950 uppercase shadow-inner`}>
                  {member.firstName[0] || ''}{member.lastName[0] || ''}
                </div>
              )}
              
              <div>
                <h4 className="text-base font-bold text-white tracking-wide leading-tight">{member.fullName}</h4>
                <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest mt-1">{member.membershipClass} Leader</p>
                <p className="text-xs text-slate-400 mt-1">{member.parish}</p>
              </div>

              {/* Verified Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clergy Council</span>
              </div>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Secure credential verification QR code"
                  className="size-24 rounded-lg bg-white p-1"
                />
              ) : (
                <div className="grid size-24 place-items-center rounded-lg border border-slate-700 text-slate-500">
                  <QrCode className="size-8" />
                </div>
              )}
            </div>

            {/* Badge Footer */}
            <div className="border-t border-slate-800 pt-4 text-center space-y-1">
              <span className="text-[9px] text-slate-550 font-mono block">
                Credential: {credentialId ? credentialId.slice(0, 12).toUpperCase() : 'Preparing'}
              </span>
              {credentialExpiresAt && (
                <span className="text-[8px] text-slate-500 block">
                  Valid until {new Date(credentialExpiresAt).toLocaleDateString()}
                </span>
              )}
              <span className="text-[8px] text-slate-400 uppercase block tracking-wider font-bold">Cathfluencer League of India</span>
            </div>
          </div>

          {credentialId && (
            <button
              type="button"
              onClick={() => void handleRevokeCredential()}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black uppercase tracking-wider text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              <ShieldX className="size-4" aria-hidden="true" />
              Revoke this credential
            </button>
          )}
          {credentialFeedback && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700"
            >
              {credentialFeedback}
            </p>
          )}

          {/* Quick Stats list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-4">Registration status</h4>
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Data Security Pledge</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">{member.pledgesAccepted ? '✅ Signed & Active' : '⚠ Action Required'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Active Directory Placement</span>
                <span className="text-slate-900">Archdiocese Ledger</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450">Joined Date</span>
                <span className="font-mono text-slate-600">{member.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Personal/Professional Coordinates */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identity & Parish details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h3 className="text-xs font-display font-black uppercase text-slate-950 tracking-widest border-b border-slate-100 pb-3">
              Personal &amp; Parish credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="space-y-3">
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Date of Birth:</strong> 
                  <span className="font-bold text-slate-900">{member.dob || 'Not specified'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Gender:</strong> 
                  <span className="font-bold text-slate-900">{member.gender || 'Not specified'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Relationship Status:</strong> 
                  <span className="font-bold text-slate-900">{member.relationship || 'Not specified'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Blood Group:</strong> 
                  <span className="font-bold font-mono text-rose-600">{member.bloodGroup || 'Not specified'}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Parish Priest:</strong> 
                  <span className="font-bold text-slate-900">{member.parishPriest || 'Not specified'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-105 pb-2">
                  <strong className="text-slate-400">Active Mobile Number:</strong> 
                  <span className="font-bold text-slate-900 font-mono">{member.phone || 'No phone'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Active Email Coordinate:</strong> 
                  <span className="font-bold text-indigo-600 pr-1">{member.email || 'No email'}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-2">
                  <strong className="text-slate-400">Current Residence:</strong> 
                  <span className="font-bold text-slate-900 truncate max-w-[150px]" title={member.currentAddress}>{member.currentAddress || 'No address provided'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Social Profiles coordinates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-display font-black uppercase text-slate-950 tracking-widest border-b border-slate-100 pb-3">
              Social Portals &amp; Media Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <p className="flex justify-between pb-1.5 border-b border-slate-100">
                <strong className="text-slate-400">Instagram Handle:</strong> 
                <span className="font-mono text-indigo-600 font-bold">@{member.instagram || 'Not specified'}</span>
              </p>
              <p className="flex justify-between pb-1.5 border-b border-slate-100">
                <strong className="text-slate-400">Facebook Profile Handle:</strong> 
                <span className="font-mono text-indigo-600 font-bold">{member.facebook || 'Not specified'}</span>
              </p>
              <p className="md:col-span-2 border-b border-slate-100 pb-2">
                <strong className="text-slate-400 block mb-1">Affiliated Instagram Pages:</strong> 
                <span className="text-[11px] font-mono whitespace-pre-wrap">{member.igPages || 'None registered'}</span>
              </p>
              <p className="md:col-span-2 border-b border-slate-100 pb-2">
                <strong className="text-slate-400 block mb-1">Affiliated Facebook &amp; YouTube Channels:</strong> 
                <span className="text-[11px] font-mono whitespace-pre-wrap">{member.fbPages || member.ytChannels || 'None registered'}</span>
              </p>
            </div>
          </div>

          {/* Skillsets & Pastoral Ambitions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h3 className="text-xs font-display font-black uppercase text-slate-950 tracking-widest border-b border-slate-100 pb-3">
              Pastoral Ambitions &amp; Credentials
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <strong className="text-slate-450 uppercase block text-[9.5px] font-bold tracking-wider mb-1.5">Pastoral Ambition</strong>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{member.ambition || 'Evangelization through advanced digital media channels.'}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <strong className="text-slate-450 uppercase block text-[9.5px] font-bold tracking-wider mb-2">Technical Capabilities</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {member.techSkills && member.techSkills.length > 0 ? (
                      member.techSkills.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-250/50 px-2 py-0.5 rounded text-[10.5px] font-bold">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No technical skills declared.</span>
                    )}
                  </div>
                </div>

                <div>
                  <strong className="text-slate-450 uppercase block text-[9.5px] font-bold tracking-wider mb-2">Soft/Interactive Competencies</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {member.softSkills && member.softSkills.length > 0 ? (
                      member.softSkills.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-250/50 px-2 py-0.5 rounded text-[10.5px] font-bold">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No soft skills declared.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
