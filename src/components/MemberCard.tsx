import { Member, MemberStatus } from '../types';
import { Mail, Phone, Calendar, ArrowUpRight, Edit2, Trash2, MapPin, Lock, Sparkles } from 'lucide-react';
import { formatBase64ToImageSource } from '../utils/imageUtils';

interface MemberCardProps {
  member: Member;
  onViewDetails: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
  isAdmin?: boolean;
}

export default function MemberCard({ member, onViewDetails, onEdit, onDelete, isAdmin = false }: MemberCardProps) {
  // Styles based on Cathfluencer status
  const statusBadges: Record<MemberStatus, string> = {
    Affiliated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Abdicated: 'bg-rose-50 text-rose-700 border-rose-100',
    Director: 'bg-purple-100 text-purple-800 border-purple-250',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Suspended: 'bg-rose-50 text-rose-750 border-rose-250',
    'ID card to be provided': 'bg-blue-50 text-blue-700 border-blue-200',
    'Data Insufficient': 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const getInitials = () => {
    return (member.fullName || 'External')
      .split(' ')
      .map(w => w.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div 
      className="bg-white rounded-2xl border-2 border-slate-100 hover:border-amber-400 bg-gradient-to-b from-white to-slate-50/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 md:p-6 flex flex-col justify-between group h-full relative overflow-hidden"
      id={`member-card-${member.id}`}
    >
      {/* Delicate Watermark cross/saintly glow background */}
      <div className="absolute -right-3 -top-3 text-slate-100/50 group-hover:text-amber-500/5 transition duration-300 pointer-events-none select-none">
        <Sparkles className="w-24 h-24 stroke-[1]" />
      </div>

      <div>
        {/* Header Badges with premium colors */}
        <div className="flex justify-between items-start gap-2 mb-4">
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-slate-900 text-amber-300 shadow-3xs">
            {member.profession || 'Catholic Content Creator'}
          </span>
          <span className={`text-[9.5px] font-bold border-2 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 ${statusBadges[member.status || 'Pending']}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              member.status === 'Affiliated' || member.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
              member.status === 'Pending' ? 'bg-amber-500 animate-ping' :
              member.status === 'Director' ? 'bg-purple-600 animate-pulse' :
              member.status === 'ID card to be provided' ? 'bg-blue-500 animate-pulse' :
              member.status === 'Data Insufficient' ? 'bg-slate-400' : 'bg-rose-500'
            }`}></span>
            <span>{member.status || 'Pending'}</span>
          </span>
        </div>

        {/* Profile Image / Initials Row */}
        <div className="flex items-center space-x-3.5 mb-4">
          {member.photoURL ? (
            <div className="relative shrink-0">
              <img 
                src={formatBase64ToImageSource(member.photoURL)} 
                alt={member.fullName} 
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-full object-cover border-3 border-amber-300 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white text-[8px] font-bold">
                ✓
              </span>
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md relative shrink-0 ${member.avatarUrl || 'bg-indigo-650'}`}>
              {getInitials()}
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white text-[8px] font-bold">
                +
              </span>
            </div>
          )}

          <div className="overflow-hidden">
            <h4 className="font-display font-extrabold text-slate-950 group-hover:text-amber-800 transition truncate text-sm uppercase tracking-wide">
              {member.fullName}
            </h4>
            {member.voxUserId && (
              <p className="text-[10px] font-mono text-amber-600 font-bold truncate leading-none mt-1">
                {member.voxUserId}
              </p>
            )}
            <div className="flex items-center text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
              <MapPin className="w-3 text-amber-500 mr-1 flex-shrink-0" />
              <span className="truncate">{member.parish || 'Parish not selected'}</span>
            </div>
          </div>
        </div>

        {/* Diocesan Canopy Banner */}
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-lg p-2 mb-3 select-none">
          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Diocesan Canopy</div>
          <p className="text-[11px] text-slate-700 font-bold line-clamp-1">
            {member.diocese ? member.diocese : 'Archdiocese of Madras - Mylapore'}
          </p>
        </div>

        {/* Dynamic Display of favorite Scripture if present — Pure Canonical Elegance */}
        {member.bibleBook && member.bibleVerseText && (
          <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg mb-3 select-none italic text-[11px] text-amber-955 leading-relaxed relative">
            <span className="text-amber-300 font-serif text-lg leading-none absolute left-1 top-0 opacity-40">“</span>
            <p className="pl-3 pr-2 font-serif text-slate-800 font-medium">
              {member.bibleVerseText.length > 85 ? `${member.bibleVerseText.substring(0, 85)}...` : member.bibleVerseText}
            </p>
            <span className="block text-right text-[10px] uppercase tracking-wider font-sans font-bold text-amber-800 mt-1 font-mono">
              — {member.bibleBook} {member.bibleChapter}:{member.bibleVerse}
            </span>
          </div>
        )}

        {/* Tech Talents Pill Grid */}
        <div className="flex flex-wrap gap-1 mb-4 pl-0.5" id="card-skill-pills">
          {(member.techSkills || []).slice(0, 3).map((skill, index) => (
            <span key={index} className="text-[9px] font-bold uppercase bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 shadow-3xs">
              {skill}
            </span>
          ))}
          {(member.techSkills || []).length > 3 && (
            <span className="text-[9.5px] text-amber-700 font-bold px-1.5 py-0.5 bg-amber-50 rounded border border-amber-100">
              +{(member.techSkills || []).length - 3} More
            </span>
          )}
        </div>

        {/* Contacts details with Lock options */}
        <div className="space-y-2 border-t border-slate-100 pt-3 my-3" id="card-contact-lines">
          {isAdmin ? (
            <div className="space-y-1.5">
              <a 
                href={`mailto:${member.email}`} 
                className="flex items-center text-xs text-slate-600 hover:text-amber-700 transition truncate font-medium font-sans"
                onClick={(e) => e.stopPropagation()}
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
              {member.phone && (
                <a 
                  href={`https://wa.me/${member.phone}`} 
                  target="_blank"
                  className="flex items-center text-xs text-slate-650 hover:text-emerald-700 font-medium transition"
                  onClick={(e) => e.stopPropagation()}
                  title="WhatsApp Connect"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" />
                  <span>{member.phone}</span>
                </a>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 select-none">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Contact Credentials Cloaked</span>
            </div>
          )}
          <div className="flex items-center text-[9.5px] text-slate-400 justify-end pt-1 font-mono font-medium">
            <Calendar className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
            <span>Onboarded {member.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100/70">
        <button
          onClick={() => onViewDetails(member)}
          className="text-[11px] font-black uppercase tracking-wider text-slate-900 hover:text-white flex items-center space-x-1 cursor-pointer bg-slate-100 hover:bg-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl transition-all duration-150 shadow-3xs"
          id={`btn-view-${member.id}`}
        >
          <span>Dossier file</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {/* Clerical Administrative Edits */}
        {isAdmin && (
          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(member)}
              className="p-2 hover:bg-amber-100/50 text-slate-400 hover:text-amber-700 rounded-xl transition cursor-pointer border border-transparent hover:border-amber-250"
              title="Edit Dossier"
              id={`btn-card-edit-${member.id}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(member.id)}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-700 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-250 animate-hover"
              title="Purge Record"
              id={`btn-card-delete-${member.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
