import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AdminProfile, Member, MemberStatus } from '../types';
import { Mail, Phone, Calendar, MapPin, X, User, Shield, FileText, Globe, Heart, Award, CheckCircle2, QrCode, Printer, Copy, Check, Download, FileDown, Image as ImageIcon } from 'lucide-react';
import { formatBase64ToImageSource } from '../utils/imageUtils';
import { useDialog } from './ui/DialogProvider';
import { parishDirectionsUrl } from '../features/maps/parishMap';
import { getOrIssueCredential } from '../features/credentials/credentialRepository';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  isAdminMode?: boolean;
  adminProfileList?: AdminProfile[];
  onToggleAdminAccess?: (member: Member) => void;
  isSelf?: boolean;
  actorUid?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSafePrintImageSource(value: string | undefined): string {
  const source = formatBase64ToImageSource(value);
  if (
    /^https?:\/\//i.test(source) ||
    /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(source)
  ) {
    return escapeHtml(source);
  }
  return '';
}

export default function MemberDetailModal({
  member, 
  onClose, 
  onEdit,
  isAdminMode = false,
  adminProfileList = [],
  onToggleAdminAccess,
  isSelf = false,
  actorUid,
}: MemberDetailModalProps) {
  const dialog = useDialog();
  if (!member) return null;

  const [downloading, setDownloading] = useState<string | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [credentialExpiresAt, setCredentialExpiresAt] = useState<string>('');
  const [credentialVerificationUrl, setCredentialVerificationUrl] = useState<string>('');
  const [credentialId, setCredentialId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const hasFullAccess = isAdminMode || isSelf;
  const dossierUrl = credentialVerificationUrl;

  const isAlreadyAdmin = adminProfileList?.some(
    adm => adm.email?.toLowerCase() === member.email?.toLowerCase() || 
           (member.voxUserId && adm.voxId?.trim().toLowerCase() === member.voxUserId.trim().toLowerCase())
  );

  useEffect(() => {
    if (!hasFullAccess || !actorUid) {
      setQrCodeUrl('');
      setCredentialExpiresAt('');
      setCredentialVerificationUrl('');
      setCredentialId('');
      return;
    }

    let active = true;
    void getOrIssueCredential(member, actorUid)
      .then(async credential => {
        const url = await QRCode.toDataURL(credential.verificationUrl, {
          width: 256,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        if (active) {
          setQrCodeUrl(url);
          setCredentialExpiresAt(credential.credential.expiresAt);
          setCredentialVerificationUrl(credential.verificationUrl);
          setCredentialId(credential.credential.id);
        }
      })
      .catch(error => {
        console.error('Failed to issue signed credential:', error);
        if (active) setQrCodeUrl('');
      });
    return () => {
      active = false;
    };
  }, [actorUid, hasFullAccess, member]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dossierUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const element = document.getElementById('digital-badge-card-download');
    if (!element) return;
    setDownloading(format);
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      // Small timeout to allow render stability
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(element, {
        scale: 3, // Ultra HD scaling for beautiful high-quality pixel cards
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.95 : undefined);
      
      const link = document.createElement('a');
      link.download = `${member.fullName.trim().replace(/[\s\W]+/g, '_')}_ID_Card.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(`Failed to download ${format}`, err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('digital-badge-card-download');
    if (!element) return;
    setDownloading('pdf');
    
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Standard CR80 landscape card measures 85.6mm width by 54mm height
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
      pdf.save(`${member.fullName.trim().replace(/[\s\W]+/g, '_')}_ID_Card.pdf`);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setDownloading(null);
    }
  };

  const statusColors: Record<MemberStatus, string> = {
    Affiliated: 'bg-emerald-500 text-white',
    Pending: 'bg-amber-500 text-white',
    Abdicated: 'bg-rose-500 text-white',
    Director: 'bg-purple-600 text-white',
    Inactive: 'bg-slate-400 text-white',
    Active: 'bg-emerald-500 text-white',
    Suspended: 'bg-red-500 text-white',
    'ID card to be provided': 'bg-blue-500 text-white',
    'Data Insufficient': 'bg-slate-400 text-white'
  };

  const getInitials = () => {
    return (member.fullName || 'External')
      .split(' ')
      .map(w => w.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handlePrintIdCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      void dialog.alert({
        title: 'Popup blocked',
        message: 'Allow popups for this site to print the member ID card.',
      });
      return;
    }

    const printName = escapeHtml(member.fullName);
    const printPhoto = getSafePrintImageSource(member.photoURL);
    const printInitials = escapeHtml(getInitials());
    const printVoxId = escapeHtml(member.voxUserId);
    const printMemberId = escapeHtml(credentialId.slice(0, 12).toUpperCase());
    const printDiocese = escapeHtml(member.diocese);
    const printParish = escapeHtml(member.parish || 'No parish listed');
    const printStatus = escapeHtml(member.status);
    const printQrCode = escapeHtml(qrCodeUrl);
    
    const htmlContent = `
      <html>
        <head>
          <title>${printName} - Credential Verification Badge</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              background: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .badge-container {
              width: 530px;
              height: 310px;
              border: 3px double #d97706; /* amber-600 double frame */
              border-radius: 12px;
              padding: 16px;
              box-sizing: border-box;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              color: #ffffff;
              position: relative;
              overflow: hidden;
              display: flex;
              gap: 16px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .badge-bg-pattern {
              position: absolute;
              top: -50px;
              right: -50px;
              width: 150px;
              height: 150px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
              pointer-events: none;
            }
            .badge-left {
              flex: 1.3;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border-right: 1px solid rgba(255,255,255,0.1);
              padding-right: 12px;
            }
            .badge-right {
              flex: 0.8;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .badge-header {
              display: flex;
              align-items: center;
              gap: 8px;
              border-bottom: 2px solid #f59e0b;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .badge-logo {
              font-size: 16px;
            }
            .badge-title-group {
              display: flex;
              flex-direction: column;
            }
            .badge-title {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.5px;
              color: #fbbf24;
              text-transform: uppercase;
              margin: 0;
            }
            .badge-subtitle {
              font-size: 7px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .profile-section {
              display: flex;
              gap: 10px;
              align-items: center;
              margin-bottom: 6px;
            }
            .profile-avatar {
              width: 54px;
              height: 54px;
              border-radius: 50%;
              object-fit: cover;
              border: 1.5px solid #fbbf24;
              background-color: #334155;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
              color: #fbbf24;
            }
            .profile-name {
              font-size: 12px;
              font-weight: 700;
              color: #ffffff;
              margin: 0 0 2px 0;
              text-transform: uppercase;
              letter-spacing: 0.2px;
            }
            .profile-uid {
              font-family: 'JetBrains Mono', monospace;
              font-size: 7.5px;
              color: #f59e0b;
              margin: 0;
            }
            .details-grid {
              font-size: 8px;
              color: #cbd5e1;
              line-height: 1.4;
            }
            .details-row {
              margin-bottom: 3.5px;
            }
            .details-label {
              color: #64748b;
              font-weight: bold;
              text-transform: uppercase;
              display: inline-block;
              width: 60px;
            }
            .details-val {
              color: #cbd5e1;
              font-weight: 500;
            }
            .badge-footer {
              font-size: 6.5px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: auto;
              border-top: 1px solid rgba(255,255,255,0.05);
              padding-top: 4px;
            }
            .qr-image {
              background: white;
              padding: 4px;
              border-radius: 6px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              width: 100px;
              height: 100px;
              margin-bottom: 8px;
            }
            .qr-caption {
              font-size: 7px;
              font-family: 'JetBrains Mono', monospace;
              color: #f59e0b;
              text-transform: uppercase;
              letter-spacing: 0.2px;
              margin: 0;
              font-weight: bold;
            }
            .qr-subcaption {
              font-size: 5.5px;
              color: #64748b;
              margin: 2px 0 0 0;
            }
            .badge-watermark {
              position: absolute;
              bottom: 8px;
              right: 8px;
              opacity: 0.15;
              font-size: 40px;
              pointer-events: none;
            }
            .print-btn-helper {
              display: block;
              margin-bottom: 20px;
              background-color: #1e293b;
              color: white;
              border: none;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              font-family: inherit;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            @media print {
              .print-btn-helper {
                display: none;
              }
              body {
                padding: 0;
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .badge-container {
                box-shadow: none;
                border: 3px double #d97706 !important;
              }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <button class="print-btn-helper" onclick="window.print()">🖨️ Direct Print Member ID Badge</button>
            <div class="badge-container">
              <div class="badge-bg-pattern"></div>
              <span class="badge-watermark">☧</span>
              
              <div class="badge-left">
                <div class="badge-header">
                  <span class="badge-logo">⛪</span>
                  <div class="badge-title-group">
                    <h1 class="badge-title">Archdiocese of Madras - Mylapore</h1>
                    <span class="badge-subtitle">Official Catholic Creator Registry</span>
                  </div>
                </div>
                
                <div class="profile-section">
                  ${printPhoto ? `
                    <img src="${printPhoto}" class="profile-avatar" alt="" />
                  ` : `
                    <div class="profile-avatar">${printInitials}</div>
                  `}
                  <div>
                    <h2 class="profile-name">${printName}</h2>
                    ${printVoxId ? `<p style="font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: #34d399; margin: 0 0 2px 0;">${printVoxId}</p>` : ''}
                    <p class="profile-uid">REGISTRY ID: ${printMemberId}</p>
                  </div>
                </div>
                
                <div class="details-grid">
                  <div class="details-row">
                    <span class="details-label">Diocese:</span>
                    <span class="details-val">${printDiocese}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Parish:</span>
                    <span class="details-val">${printParish}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Signature:</span>
                    <span class="details-val">${printStatus} Catholic Creator</span>
                  </div>
                </div>
                
                <div class="badge-footer">
                  <span>VALIDATED SECURE CARD</span>
                  <span style="font-family: 'JetBrains Mono', monospace;">CATHFLUENCERS v1.0</span>
                </div>
              </div>
              
              <div class="badge-right">
                <img src="${printQrCode}" class="qr-image" alt="Credential verification QR code" />
                <p class="qr-caption">VERIFY CREDS</p>
                <p class="qr-subcaption">Scan to access secure digital dossier</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-0 md:p-4 z-50 animate-fade-in" id="detail-modal-overlay">
      <div 
        className="bg-white rounded-none md:rounded-xl overflow-hidden shadow-xl w-full max-w-2xl border-0 md:border border-slate-200 h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col"
        id={`detail-modal-${member.id}`}
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-4 py-3 md:p-5 text-white flex justify-between items-center relative flex-shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
            {member.photoURL ? (
              <img 
                src={formatBase64ToImageSource(member.photoURL)} 
                alt={member.fullName} 
                className="w-11 h-11 md:w-14 md:h-14 rounded-full object-cover border-2 border-amber-400 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-11 h-11 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-base md:text-xl font-bold shadow-xs shrink-0 ${member.avatarUrl}`}>
                {getInitials()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm md:text-lg font-bold font-display uppercase tracking-wide text-white truncate">{member.fullName}</h3>
              {member.fullNameTa && <p lang="ta" className="text-xs text-amber-300">{member.fullNameTa}</p>}
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">UID: {member.id}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            id="btn-close-detail-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-6 flex-grow bg-white text-slate-800" id="detail-modal-body">
          
          {/* Status & Diocese Banner */}
          <div className="flex flex-wrap gap-2" id="detail-pills-row">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 ${statusColors[member.status]}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>Status: {member.status}</span>
            </span>
            {isAlreadyAdmin && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-emerald-600 shadow-sm animate-pulse-slow">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Authorized Admin</span>
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-amber-200">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{member.diocese}</span>
            </span>
            {member.parish && (
              <a
                href={parishDirectionsUrl({ name: member.parish, diocese: member.diocese })}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 px-3 rounded-lg flex items-center space-x-1 border border-indigo-200"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Parish Map</span>
              </a>
            )}
            <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-slate-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member Since {member.joinedDate}</span>
            </span>
          </div>

          {/* Quick Particulars Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="detail-bento-grid">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Personal Identity</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {member.voxUserId && (
                  <p className="flex items-center gap-1.5">
                    <strong className="text-slate-450 uppercase text-[9px] shrink-0">Vox User ID:</strong> 
                    <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{member.voxUserId}</span>
                  </p>
                )}
                <p><strong className="text-slate-400">Date of Birth:</strong> {hasFullAccess ? (member.dob || 'Not specified') : '•••••••• (Locked for Privacy)'}</p>
                <p><strong className="text-slate-400">Blood Group:</strong> {member.bloodGroup || 'Not specified'}</p>
                <p><strong className="text-slate-400">Gender:</strong> {member.gender || 'Not specified'}</p>
                <p><strong className="text-slate-400">Relationship:</strong> {member.relationship || 'Not specified'}</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Worship & Parish</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <p><strong className="text-slate-400">Parish Church:</strong> {member.parish || 'Not specified'}</p>
                <p><strong className="text-slate-400">Parish Priest:</strong> {member.parishPriest || 'Not specified'}</p>
                <p><strong className="text-slate-400">Contact:</strong> {hasFullAccess ? (member.phone || 'No phone') : '•••••••••• (Locked)'}</p>
                <p><strong className="text-slate-400">Email:</strong> {hasFullAccess ? (member.email || 'No email') : '•••••••••••••••• (Locked)'}</p>
              </div>
            </div>
          </div>

          {/* Digital ID Card & QR Verification segment */}
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border-2 border-dashed border-amber-600/30 p-5 rounded-xl space-y-5 relative overflow-hidden" id="digital-id-card-and-qr-segment">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/5 rounded-full pointer-events-none"></div>
            
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-widest font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                Digital ID Card Credentials
              </span>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight mt-1">
                Authorized Clergy Credential ID &amp; Registry Verification
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl mt-1">
                A secure verifiable Catholic Creator ID card. You can download this credential card below in multiple formats, or print a high-resolution PVC badge for identity checks.
              </p>
            </div>

            {/* LIVE Badge Card Preview on screen */}
            <div className="flex justify-center" id="id-card-viewscreen">
              <div 
                className="w-full max-w-[480px] aspect-[85.6/54] rounded-xl border-2 border-double border-amber-600/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-4 flex gap-3 select-none relative overflow-hidden shadow-md cursor-default transform hover:scale-[1.01] transition-transform duration-200" 
                id="digital-badge-card-live-preview"
              >
                {/* Background watermarks */}
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-radial from-amber-500/10 to-transparent pointer-events-none"></div>
                <span className="absolute bottom-2 right-4 opacity-15 text-5xl font-serif text-amber-500/80 pointer-events-none">☧</span>

                {/* Card Left details side */}
                <div className="flex-1 flex flex-col justify-between border-r border-white/10 pr-3 min-w-0">
                  {/* Header info */}
                  <div className="flex items-center gap-1.5 border-b border-amber-500/80 pb-1.5 mb-1">
                    <span className="text-sm">⛪</span>
                    <div className="flex flex-col min-w-0">
                      <h5 className="text-[8.5px] font-black tracking-wider text-amber-400 uppercase leading-none font-display truncate">Archdiocese of Madras - Mylapore</h5>
                      <span className="text-[6.5px] text-slate-400 uppercase tracking-wider leading-none mt-0.5 whitespace-nowrap">Official Catholic Creator Registry</span>
                    </div>
                  </div>

                  {/* Profile section info */}
                  <div className="flex items-center gap-2 my-1">
                    {member.photoURL ? (
                      <img 
                        src={formatBase64ToImageSource(member.photoURL)} 
                        alt="Profile Avatar" 
                        className="w-11 h-11 rounded-full object-cover border border-amber-400 bg-slate-800 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full border border-amber-400 bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm uppercase flex-shrink-0">
                        {getInitials()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h6 className="text-[10px] font-extrabold uppercase text-white tracking-wide truncate">{member.fullName}</h6>
                      {member.voxUserId && (
                        <p className="text-[6.5px] font-mono text-emerald-400 tracking-tighter truncate leading-none mb-0.5">
                          {member.voxUserId}
                        </p>
                      )}
                      <p className="text-[7px] font-mono text-amber-400/90 tracking-tighter truncate">
                        CRED: {credentialId ? credentialId.slice(0, 12).toUpperCase() : 'PREPARING'}
                      </p>
                    </div>
                  </div>

                  {/* Card rows */}
                  <div className="text-[7.5px] text-slate-300 space-y-0.5 leading-tight">
                    <p className="truncate"><span className="text-slate-500 font-bold uppercase inline-block w-[36px]">Diocese:</span> <span className="font-semibold text-slate-200">{member.diocese}</span></p>
                    <p className="truncate"><span className="text-slate-500 font-bold uppercase inline-block w-[36px]">Parish:</span> <span className="font-semibold text-slate-200">{member.parish || 'No parish listed'}</span></p>
                    <p className="truncate"><span className="text-slate-500 font-bold uppercase inline-block w-[36px]">Status:</span> <span className="font-semibold text-slate-200">{member.status} Creator</span></p>
                  </div>

                  {/* Footer marker */}
                  <div className="text-[6px] text-slate-400 flex justify-between items-center border-t border-white/5 pt-1 mt-1 font-sans font-bold">
                    <span>VALIDATED SECURE CARD</span>
                    <span className="font-mono text-slate-500">v1.0</span>
                  </div>
                </div>

                {/* QR code and scan info */}
                <div className="w-[88px] flex flex-col items-center justify-center text-center flex-shrink-0">
                  <div className="bg-white p-1 rounded shadow-inner mb-1.5 flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Verify QR" className="w-[60px] h-[60px]" />
                    ) : (
                      <div className="w-[60px] h-[60px] grid place-items-center text-[7px] text-slate-500">
                        Secure login required
                      </div>
                    )}
                  </div>
                  <p className="text-[6.5px] font-mono text-amber-400 font-bold tracking-wider leading-none">VERIFY CREDS</p>
                  <p className="text-[5px] text-slate-400 leading-tight mt-0.5">Scan live verification code</p>
                  {credentialExpiresAt && (
                    <p className="text-[5px] text-slate-500 mt-0.5">
                      Expires {new Date(credentialExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Offline fixed-dimension target element hidden off-screen (for html2canvas) */}
            <div className="absolute overflow-hidden" style={{ left: '-9999px', top: '-9999px' }}>
              <div 
                id="digital-badge-card-download" 
                style={{
                  width: '530px',
                  height: '335px',
                  boxSizing: 'border-box',
                  border: '3px double #d97706',
                  borderRadius: '12px',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  gap: '16px',
                  position: 'relative',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                {/* Background watermark icon */}
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  opacity: 0.12,
                  fontSize: '48px',
                  fontFamily: 'serif',
                  color: '#fbbf24',
                  pointerEvents: 'none'
                }}>☧</span>

                {/* Left Side Info */}
                <div style={{
                  flex: 1.3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  paddingRight: '14px',
                  minWidth: '0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '2px solid #f59e0b',
                    paddingBottom: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '18px' }}>⛪</span>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                      <h1 style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        color: '#fbbf24',
                        textTransform: 'uppercase',
                        margin: '0',
                        lineHeight: '1.2',
                        fontFamily: '"Space Grotesk", sans-serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>Archdiocese of Madras - Mylapore</h1>
                      <span style={{
                        fontSize: '7.5px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0'
                      }}>Official Catholic Creator Registry</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    margin: '6px 0'
                  }}>
                    {member.photoURL ? (
                      <img 
                        src={formatBase64ToImageSource(member.photoURL)} 
                        alt="Profile" 
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid #fbbf24',
                          backgroundColor: '#334155'
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#334155',
                        border: '1.5px solid #fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#fbbf24'
                      }}>{getInitials()}</div>
                    )}
                    <div style={{ minWidth: '0', flex: 1 }}>
                      <h2 style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#ffffff',
                        margin: '0 0 2px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{member.fullName}</h2>
                      {member.voxUserId && (
                        <p style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '8.5px',
                          color: '#34d399',
                          margin: '0 0 2px 0'
                        }}>{member.voxUserId}</p>
                      )}
                      <p style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '8px',
                        color: '#f59e0b',
                        margin: '0'
                      }}>CREDENTIAL: {credentialId ? credentialId.slice(0, 12).toUpperCase() : 'PREPARING'}</p>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '8.5px',
                    color: '#cbd5e1',
                    lineHeight: '1.4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ display: 'flex' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', width: '54px', display: 'inline-block' }}>Diocese:</span>
                      <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{member.diocese}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', width: '54px', display: 'inline-block' }}>Parish:</span>
                      <span style={{ color: '#cbd5e1', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{member.parish || 'No parish listed'}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', width: '54px', display: 'inline-block' }}>Status:</span>
                      <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{member.status} Catholic Creator</span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '7px',
                    color: '#94a3b8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '6px'
                  }}>
                    <span>VALIDATED SECURE CARD</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>CATHFLUENCERS v1.0</span>
                  </div>
                </div>

                {/* Right Side QR */}
                <div style={{
                  flex: 0.8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '5px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    width: '100px',
                    height: '100px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" style={{ width: '92px', height: '92px' }} />
                    ) : (
                      <div style={{ width: '92px', height: '92px', backgroundColor: '#e2e8f0' }}></div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '7.5px',
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2px',
                    margin: '0',
                    fontWeight: 'bold'
                  }}>VERIFY CREDS</p>
                  <p style={{
                    fontSize: '5.5px',
                    color: '#64748b',
                    margin: '2px 0 0 0'
                  }}>Scan to access secure digital dossier</p>
                </div>
              </div>
            </div>

            {/* Link clipboard tray */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg text-xs font-mono max-w-full overflow-hidden">
              <span className="text-slate-400 font-bold uppercase select-none text-[10px] tracking-wider shrink-0 bg-slate-200/50 px-1.5 py-0.5 rounded">Dossier Link</span>
              <span className="truncate text-slate-600 flex-grow text-xs">{dossierUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 px-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded font-bold text-[10px] uppercase tracking-wider shrink-0 transition flex items-center gap-1 cursor-pointer"
                id="btn-copy-dossier-clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Multi-Format Download Control center */}
            <div className="space-y-2 pt-1">
              <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-dashed border-slate-200 pb-1.5">
                Download Secure Credential Options
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {/* PNG option */}
                <button
                  type="button"
                  disabled={downloading !== null}
                  onClick={() => handleDownloadImage('png')}
                  className="w-full flex items-center justify-center gap-1.5 p-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-850 font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer text-[11px]"
                  id="btn-download-png"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{downloading === 'png' ? 'Building PNG...' : 'PNG Image'}</span>
                </button>

                {/* JPEG option */}
                <button
                  type="button"
                  disabled={downloading !== null}
                  onClick={() => handleDownloadImage('jpeg')}
                  className="w-full flex items-center justify-center gap-1.5 p-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-850 font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer text-[11px]"
                  id="btn-download-jpeg"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{downloading === 'jpeg' ? 'Building JPG...' : 'JPEG Image'}</span>
                </button>

                {/* PDF option */}
                <button
                  type="button"
                  disabled={downloading !== null}
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-1.5 p-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-850 font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer text-[11px]"
                  id="btn-download-pdf"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>{downloading === 'pdf' ? 'Building PDF...' : 'PDF Document'}</span>
                </button>

                {/* Direct Print option */}
                <button
                  type="button"
                  onClick={handlePrintIdCard}
                  className="w-full flex items-center justify-center gap-1.5 p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg shadow-xs transition-all cursor-pointer text-[11px]"
                  id="btn-print-direct"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print PVC Badge</span>
                </button>
              </div>
            </div>
          </div>

          {/* Education & Profession */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-xs text-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Level</span>
              <p className="font-semibold">{member.education || 'Not Specified'}</p>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Profession</span>
              <p className="font-semibold">{member.profession || 'Not Specified'}</p>
            </div>
          </div>

          {/* Favourite Bible Verse Quote Box */}
          {(member.bibleBook || member.bibleVerseText) && (
            <div className="bg-slate-900 text-white p-6 rounded-xl border border-amber-500/30 relative overflow-hidden shadow-inner">
              <div className="absolute top-1 right-3 text-7xl font-serif text-amber-500/5 select-none">"</div>
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-2 font-display">Favorite Holy Scripture</p>
              <p className="text-sm font-sans italic text-slate-100 leading-relaxed mb-4">
                "{member.bibleVerseText || 'Holy Word of God'}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-grow h-[1px] bg-slate-800"></div>
                <span className="text-xs font-display font-medium text-amber-300 tracking-wider">
                  ✝ {member.bibleBook} {member.bibleChapter ? `${member.bibleChapter}:${member.bibleVerse || ''}` : ''}
                </span>
                <div className="flex-grow h-[1px] bg-slate-800"></div>
              </div>
              {member.bibleVerseWhy && (
                <p className="text-[11px] text-slate-400 italic mt-3 leading-relaxed border-t border-slate-800 pt-3">
                  <strong>Pondering:</strong> "{member.bibleVerseWhy}"
                </p>
              )}
            </div>
          )}

          {/* Social Coordinates */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Social Portals & Handles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <p><strong>Instagram ID:</strong> {hasFullAccess ? (member.instagram ? <a href={`https://instagram.com/${member.instagram}`} target="_blank" className="text-indigo-600 hover:underline">@{member.instagram}</a> : 'Not specified') : '•••••••• (Locked)'}</p>
                <p><strong>Facebook ID:</strong> {hasFullAccess ? (member.facebook ? <a href={`https://facebook.com/${member.facebook}`} target="_blank" className="text-indigo-600 hover:underline">{member.facebook}</a> : 'Not specified') : '•••••••• (Locked)'}</p>
              </div>
              <div className="space-y-1.5">
                <p><strong>Managed IG Pages:</strong> <span className="font-mono text-[11px] text-slate-500">{hasFullAccess ? (member.igPages || 'None') : '•••••••• (Locked)'}</span></p>
                <p><strong>FB/YT Pages:</strong> <span className="font-mono text-[11px] text-slate-500">{hasFullAccess ? (member.fbPages || member.ytChannels || 'None') : '•••••••• (Locked)'}</span></p>
              </div>
            </div>
          </div>

          {/* Skills checklist lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Tools / Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {member.techSkills && member.techSkills.length > 0 ? (
                  member.techSkills.map((s, idx) => (
                    <span key={idx} className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg font-medium">{s}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None specified</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Character Soft Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {member.softSkills && member.softSkills.length > 0 ? (
                  member.softSkills.map((s, idx) => (
                    <span key={idx} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">{s}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Statement, Ambition & Hobbies */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 p-4 space-y-3">
            <div className="text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Volunteering Ambition & Dream</span>
              <p className="text-slate-800 leading-relaxed font-semibold">"{member.ambition || 'No specific ambition detailed.'}"</p>
            </div>
            <div className="text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hobbies & Activities</span>
              <p className="text-slate-600 italic">"{member.hobbies || 'None listed.'}"</p>
            </div>
          </div>

          {/* Covenant Pledges Checked */}
          <div className="space-y-3 bg-amber-50/30 p-4 rounded-xl border border-amber-300/30">
            <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
              Catholic Covenant Pledges Signed
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              <p className="flex items-center gap-2">🟢 Service Commitment {member.pledgesAccepted ? '✅ Signed' : '⚠️ Pending'}</p>
              <p className="flex items-center gap-2">🟢 Youth Ministry & Obedience {member.pledgesAccepted ? '✅ Signed' : '⚠️ Pending'}</p>
              <p className="flex items-center gap-2">🟢 Exemplary Faith Morals {member.pledgesAccepted ? '✅ Signed' : '⚠️ Pending'}</p>
              <p className="flex items-center gap-2">🟢 Data Confidentiality Policy {member.pledgesAccepted ? '✅ Signed' : '⚠️ Pending'}</p>
            </div>
          </div>

          {/* Living Address and Custom Field details */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Current Mailing Residence</h4>
            <p className="text-xs text-slate-800 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 inline text-amber-500 mr-1" />
              {hasFullAccess ? (member.currentAddress || 'No current address provided.') : '•••••••••••••••••••• (Locked for Privacy)'}
            </p>
          </div>

          {/* Notes Card */}
          {hasFullAccess && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 space-y-2" id="detail-notes-card">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 text-indigo-500 mr-2" />
                Administrator Notes &amp; Moderation Remarks
              </span>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                {member.notes ? `"${member.notes}"` : 'No administrative records or comments have been documented for this member.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-xl flex-shrink-0">
          <div>
            {isAdminMode && onToggleAdminAccess && (
              <button
                type="button"
                onClick={() => {
                  onToggleAdminAccess(member);
                }}
                className={`px-4 py-2 font-black rounded-lg text-xs uppercase tracking-wider transition cursor-pointer border ${
                  isAlreadyAdmin 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-550 hover:text-white hover:border-transparent' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-550 hover:text-white hover:border-transparent'
                }`}
                id="btn-toggle-admin-privileges"
              >
                {isAlreadyAdmin ? '⚠️ Revoke Admin Access' : '🔑 Provide Admin Access'}
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              id="btn-detail-close"
            >
              Close Dialog
            </button>
            {isAdminMode && (
              <button
                onClick={() => {
                  onEdit(member);
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
                id="btn-detail-edit"
              >
                Edit Member Records
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
