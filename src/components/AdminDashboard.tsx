import React, { useState, useMemo } from 'react';
import { Announcement, CalendarEvent, AdminProfile, Member } from '../types';
import { useDialog } from './ui/DialogProvider';
import { DateInput } from './forms/DateInput';
import { DailyReflectionCard } from '../features/reflections/DailyReflectionCard';
import {
  subscribeEventReminder,
  unsubscribeEventReminder,
} from '../features/events/reminderRepository';
import { INDIAN_HOLIDAYS_2026 } from '../data/mockEvents';
import { 
  Megaphone, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Bell, 
  ExternalLink,
  Sliders,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Cake,
  Gift,
  Search,
  Award,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Heart
} from 'lucide-react';

interface AdminDashboardProps {
  announcements: Announcement[];
  events: CalendarEvent[];
  authenticatedAdmin: AdminProfile | null;
  authenticatedMember?: Member | null;
  memberAvailabilities?: Record<string, 'available' | 'not_available'>;
  onToggleAvailability?: (eventId: string, memberId: string, status: 'available' | 'not_available') => void;
  allMembers?: Member[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onApproveMember?: (id: string) => void;
  onRejectMember?: (id: string) => void;
}

export default function AdminDashboard({
  announcements,
  events,
  authenticatedAdmin,
  authenticatedMember,
  memberAvailabilities,
  onToggleAvailability,
  allMembers,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onAddEvent,
  onDeleteEvent,
  onApproveMember,
  onRejectMember
}: AdminDashboardProps) {
  const dialog = useDialog();
  // Calendar states
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Collapsible Creator Forms State
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [reminderEventIds, setReminderEventIds] = useState<Set<string>>(() => new Set());

  // Announcement Form Fields
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Event Form Fields
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().split('T')[0]);
  const [evtTime, setEvtTime] = useState('10:00');
  const [evtType, setEvtType] = useState<'meeting' | 'holyday' | 'feast' | 'other'>('meeting');
  const [evtCategory, setEvtCategory] = useState<'Clergy' | 'General' | 'Media' | 'Youth' | 'Liturgical'>('General');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtLink, setEvtLink] = useState('');

  // Elite Masterpiece Dashboard states
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);
  const [spiritualQuoteIndex, setSpiritualQuoteIndex] = useState(0);
  const [searchDossierQuery, setSearchDossierQuery] = useState('');

  // Retained only for compatibility with the hidden legacy widget during migration.
  const spiritualQuotes = useMemo(() => [{
    text: '',
    author: '',
    source: '',
  }], []);

  // Spotlight active digital apostles
  const spotlightCreators = useMemo(() => {
    const list = (allMembers || []).filter(m => m.status === 'Affiliated' || m.status === 'Active');
    if (list.length > 0) return list;
    
    // Fallback beautiful items
    return [
      {
        id: 'spot-1',
        fullName: 'Rev. Francis Noel Avinash N',
        parish: "St. Sebastian's Church, Madhavaram",
        diocese: 'Archdiocese of Madras - Mylapore',
        techSkills: ['Podcasting', 'Graphic Design', 'Public Relations'],
        voxUserId: 'avinash_cleric@vox.in',
        email: 'avinash.cleric@gmail.com',
        commissionCategory: 'Clergy / Media Liaison'
      },
      {
        id: 'spot-2',
        fullName: 'Dr. Anita Maria S',
        parish: 'St. Thomas Cathedral, Santhome',
        diocese: 'Archdiocese of Madras - Mylapore',
        techSkills: ['Video Editing', 'Theological Catechism', 'Social Media Management'],
        voxUserId: 'anita_santhome@vox.in',
        email: 'anita.santhome@gmail.com',
        commissionCategory: 'Media & Communications'
      },
      {
        id: 'spot-3',
        fullName: 'Antony Joseph',
        parish: 'Sacred Heart Shrine, Egmore',
        diocese: 'Archdiocese of Madras - Mylapore',
        techSkills: ['Photography', 'Web Development', 'Community Organizing'],
        voxUserId: 'antony_heart@vox.in',
        email: 'joseph.egmore@gmail.com',
        commissionCategory: 'Youth Ministry'
      }
    ];
  }, [allMembers]);

  // Calendar Logic constants
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days array for current monthly view grid
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Weekday starting offset: Sun=0, Mon=1...
    
    const days: (number | null)[] = [];
    
    // Add empty padding slots for offset
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return days;
  }, [currentMonth, currentYear]);

  // Navigate calendar months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Combine custom user-defined events and national/state holidays
  const allEvents = useMemo(() => {
    const merged = [...events];
    const existingIds = new Set(events.map(e => e.id));
    INDIAN_HOLIDAYS_2026.forEach(h => {
      if (!existingIds.has(h.id)) {
        merged.push(h);
      }
    });
    return merged;
  }, [events]);

  // Filter events for the exact selected calendar day
  const selectedDayEvents = useMemo(() => {
    return allEvents.filter(e => e.date === selectedDateStr);
  }, [allEvents, selectedDateStr]);

  // Upcoming meetings list (future dates + type 'meeting')
  const upcomingMeetings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return allEvents
      .filter(e => e.type === 'meeting' && e.date >= todayStr)
      .sort((a, b) => {
        const datetimeA = `${a.date}T${a.time || '00:00'}`;
        const datetimeB = `${b.date}T${b.time || '00:00'}`;
        return datetimeA.localeCompare(datetimeB);
      });
  }, [allEvents]);

  // Map dates with markup flags
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    allEvents.forEach(e => {
      if (!map[e.date]) {
        map[e.date] = [];
      }
      map[e.date].push(e);
    });
    return map;
  }, [allEvents]);

  // Helper to parse DOB strings in various formats
  const parseDOB = (dobString: string): Date | null => {
    if (!dobString) return null;
    let d = new Date(dobString);
    if (!isNaN(d.getTime())) {
      return d;
    }
    const parts = dobString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
    return null;
  };

  const upcomingBirthdays = useMemo(() => {
    if (!allMembers || allMembers.length === 0) return [];
    
    const today = new Date();
    const currentYearNum = today.getFullYear();
    const parsedToday = new Date(currentYearNum, today.getMonth(), today.getDate());
    
    return allMembers
      .map(m => {
        const bdate = parseDOB(m.dob);
        if (!bdate) return null;
        
        let nextBday = new Date(currentYearNum, bdate.getMonth(), bdate.getDate());
        if (nextBday < parsedToday) {
          nextBday.setFullYear(currentYearNum + 1);
        }
        
        const diffTime = nextBday.getTime() - parsedToday.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const age = nextBday.getFullYear() - bdate.getFullYear();
        
        return {
          member: m,
          nextBday,
          diffDays,
          age
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 5);
  }, [allMembers]);

  // Submit announcement
  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      await dialog.alert({
        title: 'Missing announcement details',
        message: 'Please enter a title and text for the advisory.',
      });
      return;
    }

    const newAnn: Announcement = {
      id: `ann_${crypto.randomUUID()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: authenticatedAdmin?.name || 'Authorized Clerical Admin',
      createdAt: new Date().toISOString(),
      priority: annPriority
    };

    onAddAnnouncement(newAnn);
    setAnnTitle('');
    setAnnContent('');
    setAnnPriority('medium');
    setShowAnnForm(false);
  };

  // Submit Calendar Event
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtDescription.trim() || !evtDate) {
      await dialog.alert({
        title: 'Missing event details',
        message: 'Please provide a title, description, and date.',
      });
      return;
    }

    const newEvt: CalendarEvent = {
      id: `ev_${crypto.randomUUID()}`,
      title: evtTitle.trim(),
      description: evtDescription.trim(),
      date: evtDate,
      time: evtTime || undefined,
      type: evtType,
      category: evtCategory,
      location: evtLocation.trim() || undefined,
      link: evtType === 'meeting' && evtLink.trim() ? evtLink.trim() : undefined
    };

    onAddEvent(newEvt);
    setEvtTitle('');
    setEvtDescription('');
    setEvtLocation('');
    setEvtLink('');
    setShowEventForm(false);
  };

  // Helper to resolve specific event indicator colors
  const getEventMarkerClass = (eventTypes: string[]) => {
    if (eventTypes.includes('meeting') && eventTypes.includes('feast')) return 'bg-amber-500';
    if (eventTypes.includes('feast')) return 'bg-yellow-400';
    if (eventTypes.includes('holyday')) return 'bg-purple-500';
    if (eventTypes.includes('meeting')) return 'bg-indigo-500';
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-tab-panel">
      
      {/* 0. PENDING MEMBER INDUCTION CONTROLS */}
      {authenticatedAdmin && allMembers && allMembers.some(m => m.status === 'Pending') && (
        <div className="bg-amber-50 rounded-xl border border-amber-305 p-6 space-y-4 shadow-sm" id="admin-dashboard-pending-reviews">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200/60 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-amber-955">
                  Pending Member Registration Approvals
                </h3>
                <p className="text-[11px] text-amber-800/80">
                  The following Catholic content creators have requested affiliation. Review and action their applications.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-3 py-1 rounded-full uppercase tracking-widest text-[9px]">
              {allMembers.filter(m => m.status === 'Pending').length} Pending Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMembers.filter(m => m.status === 'Pending').map((m) => (
              <div key={m.id} className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${m.avatarUrl || 'bg-slate-400'} flex items-center justify-center font-extrabold text-sm text-white shrink-0 border border-slate-100 uppercase`}>
                    {m.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 truncate">{m.fullName}</h4>
                    <p className="text-[10px] text-slate-550 truncate">{m.email}</p>
                    <p className="text-[9.5px] font-mono text-amber-600 mt-1 select-all font-semibold">{m.voxUserId || `${m.firstName}_${m.lastName}@vox.in`}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[11.5px] text-slate-600 space-y-1 bg-slate-50/50 p-2.5 rounded-lg border">
                  <p className="truncate"><strong>Parish:</strong> <span className="text-slate-800 font-medium">{m.parish}</span></p>
                  <p className="truncate"><strong>Diocese:</strong> <span className="text-slate-800 font-medium">{m.diocese}</span></p>
                  <p className="truncate"><strong>Primary Skills:</strong> <span className="text-slate-800 font-medium">{m.techSkills ? m.techSkills.slice(0, 3).join(', ') : 'None listed'}</span></p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onApproveMember) {
                        onApproveMember(m.id);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    Accept ✓
                  </button>
                  <button
                    onClick={() => {
                      if (onRejectMember) {
                        onRejectMember(m.id);
                      }
                    }}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    Reject ✗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ELITE MASTERCLASS COMMAND HUB: PREMIUM DASHBOARD EXTENSION */}
      <div className="space-y-6" id="elite-clerical-command-hub">
        
        {/* 1. MASTER WELCOME BANNER & CORE TIMESTAMPS */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-950 p-6 lg:p-8 relative overflow-hidden shadow-xl" id="clerical-welcome-banner">
          {/* Subtle Golden Ambient Backdrop light effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none select-none -mr-20 -mt-20"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none select-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Sacred Clerical Commission Console</span>
              </span>
              
              <h1 className="text-xl lg:text-3xl font-display font-extrabold text-slate-100 tracking-tight leading-tight">
                Welcome back, {authenticatedAdmin ? authenticatedAdmin.name : authenticatedMember ? authenticatedMember.fullName : "Reverend Father"}
              </h1>
              
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                You are in complete oversight of the <strong className="text-amber-300">Vox Ecclesiae</strong> digital directory ledger. Verify members, publish announcements councils, schedule upcoming meetings, and map saintly events.
              </p>
            </div>

            {/* Holy Archdiocese Seal Badge */}
            <div className="bg-amber-500/5 hover:bg-amber-500/10 transition border border-amber-500/20 p-4 rounded-xl space-y-1 rounded-xl shrink-0 w-full md:w-auto text-xs min-w-[240px]" id="holy-archdiocese-seal-badge">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Diocesan Directory Authorization</span>
              </div>
              <div className="border-t border-slate-750/50 my-1"></div>
              <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed">
                Registered under the canonical digital oversight of the <span className="font-bold text-amber-300">Archdiocese of Madras - Mylapore</span>.
              </p>
            </div>
          </div>
        </div>

        {/* 2. DUAL BENTO INTERACTIVE CARDS: SPOTLIGHT & MEDITATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="bento-spotlight-and-meditations">
          
          {/* A. DIGITAL APOSTLE SPOTLIGHT WIDGET */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden" id="apostle-spotlight-card">
            {/* Corner Decorative Watermark */}
            <div className="absolute top-4 right-4 text-amber-200/40 select-none pointer-events-none">
              <Award className="w-16 h-16 stroke-[1]" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2 bg-amber-500/10 text-amber-700 text-[10px] font-black rounded uppercase tracking-wider">
                    Member Spotlight
                  </span>
                  <span className="text-slate-400 text-[10.5px] font-medium font-mono">
                    Carousel #{activeSpotlightIndex + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setActiveSpotlightIndex((prev) => (prev - 1 + spotlightCreators.length) % spotlightCreators.length);
                    }}
                    className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded transition border border-slate-200 cursor-pointer text-xs"
                    title="Previous Spotlight"
                  >
                    ⟨
                  </button>
                  <button
                    onClick={() => {
                      setActiveSpotlightIndex((prev) => (prev + 1) % spotlightCreators.length);
                    }}
                    className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded transition border border-slate-200 cursor-pointer text-xs"
                    title="Next Spotlight"
                  >
                    ⟩
                  </button>
                </div>
              </div>

              {/* Spotlight Content with beautiful profile banner layout */}
              {spotlightCreators[activeSpotlightIndex] && (
                <div className="space-y-4 animate-fade-in" key={activeSpotlightIndex}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 font-extrabold text-lg uppercase shrink-0">
                      {spotlightCreators[activeSpotlightIndex].fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                        {spotlightCreators[activeSpotlightIndex].fullName}
                      </h3>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        {spotlightCreators[activeSpotlightIndex].parish || "Parish not listed"}
                      </p>
                      <p className="text-[10px] text-amber-600 font-mono font-bold mt-1">
                        {spotlightCreators[activeSpotlightIndex].diocese}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Evangelical Tech Speciality</div>
                    <div className="flex flex-wrap gap-1.5">
                      {spotlightCreators[activeSpotlightIndex].techSkills && spotlightCreators[activeSpotlightIndex].techSkills.length > 0 ? (
                        spotlightCreators[activeSpotlightIndex].techSkills.map((sk: string, sidx: number) => (
                          <span key={sidx} className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border border-slate-200 shadow-3xs uppercase">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-450 italic">Digital Arts Contributor</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-[11px] text-slate-550">
              <span className="font-bold flex items-center gap-1 text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                Featured Active Cathfluencer
              </span>
              <span className="font-mono text-slate-400 font-bold select-all">
                {spotlightCreators[activeSpotlightIndex]?.voxUserId || "affiliated_member@vox.in"}
              </span>
            </div>
          </div>

          {/* B. SACRED MEDITATIONS & LITURGICAL SPIRITUAL WIDGET */}
          <DailyReflectionCard adminUid={authenticatedAdmin?.uid || authenticatedAdmin?.id} />
          <div className="hidden" aria-hidden="true">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-amber-200/50 pb-2.5">
                <span className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider font-display">
                  <BookOpen className="w-4 h-4 text-amber-600 animate-pulse" />
                  Daily Spiritual Reflection
                </span>
                <span className="text-[10px] text-amber-700/80 font-mono font-bold">
                  Dossier Guide #{spiritualQuoteIndex + 1}
                </span>
              </div>

              {/* Quote body display */}
              <div className="space-y-3 animate-fade-in" key={spiritualQuoteIndex}>
                <p className="text-[13px] text-amber-950 font-medium italic leading-relaxed font-sans block relative">
                  "{spiritualQuotes[spiritualQuoteIndex].text}"
                </p>
                
                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-900 leading-none tracking-wider">
                    — {spiritualQuotes[spiritualQuoteIndex].author}
                  </h4>
                  <p className="text-[10px] text-amber-700 mt-1 font-mono">
                    ({spiritualQuotes[spiritualQuoteIndex].source})
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-amber-200/40 flex justify-between items-center">
              <span className="text-[10.5px] text-amber-900/65 font-medium">Reflect on your cyber apostolate.</span>
              <button
                onClick={() => {
                  setSpiritualQuoteIndex((prev) => (prev + 1) % spiritualQuotes.length);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Next Reflection ⟳
              </button>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE SEARCH CONSOLE & INSTANT SCHEDULER POPUP DRIVER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4" id="dossier-dashboard-search-jump">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wide text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-800" />
                Registry Instant Telemetry & Dossier Quick Lookup
              </h3>
              <p className="text-[11px] text-slate-450">
                Type any name, parish, diocese, or skill keywords to inspect matching dossier cards instantly on the dashboard.
              </p>
            </div>

            {/* Live Counter Pill */}
            <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full uppercase tracking-widest text-[9.5px] shrink-0 font-mono">
              Ledger size: {allMembers ? allMembers.length : 0} members
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchDossierQuery}
              onChange={(e) => setSearchDossierQuery(e.target.value)}
              placeholder="Search member name (e.g. Reverend, Jude, Anita), parish, diocese, or primary skills..."
              className="w-full text-xs pl-10 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-450 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none font-bold placeholder-slate-400 transition"
            />
            {searchDossierQuery && (
              <button
                onClick={() => setSearchDossierQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Real-time Search Drawer results */}
          {searchDossierQuery.trim() !== '' && (
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 animate-fade-in" id="quick-search-results">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-450 tracking-wider">
                <span>Matching Ledger Records ({
                  (allMembers || []).filter((m) => 
                    m.fullName.toLowerCase().includes(searchDossierQuery.toLowerCase()) || 
                    m.parish.toLowerCase().includes(searchDossierQuery.toLowerCase()) || 
                    m.diocese.toLowerCase().includes(searchDossierQuery.toLowerCase()) || 
                    (m.voxUserId && m.voxUserId.toLowerCase().includes(searchDossierQuery.toLowerCase()))
                  ).length
                } Found)</span>
                <span>Press escape or dismiss</span>
              </div>

              {(() => {
                const q = searchDossierQuery.toLowerCase();
                const matched = (allMembers || []).filter((m) => 
                  m.fullName.toLowerCase().includes(q) || 
                  m.parish.toLowerCase().includes(q) || 
                  m.diocese.toLowerCase().includes(q) || 
                  (m.voxUserId && m.voxUserId.toLowerCase().includes(q))
                ).slice(0, 4);

                if (matched.length === 0) {
                  return (
                    <div className="p-4 text-center text-slate-450 text-[11px] italic">
                      No matching registered digital apostles found in the diocese catalog. Try searching "Madhavaram", "rev", or another keyword.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matched.map((m) => (
                      <div key={m.id} className="bg-white p-3.5 border border-slate-200 rounded-lg shadow-3xs hover:border-slate-350 transition flex flex-col justify-between">
                        <div className="flex gap-3">
                          <div className="w-9 h-9 font-extrabold text-[11px] text-white bg-slate-800 rounded-full flex items-center justify-center shrink-0 uppercase">
                            {m.fullName.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 truncate">{m.fullName}</h4>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{m.voxUserId || "affiliated_member@vox.in"}</p>
                            <p className="text-[9.5px] font-bold text-amber-600 mt-0.5 truncate">{m.parish} • {m.diocese}</p>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[8px] uppercase ${
                            m.status === 'Affiliated' || m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            m.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            Status: {m.status || 'Active'}
                          </span>
                          
                          <span className="text-slate-450">
                            Mobile: <span className="font-mono text-slate-700 font-semibold">{m.phone || 'N/A'}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* 4. REAL-TIME MULTI-DATA ANALYTICS snapshots GAUGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="digital-gauges-grid">
          
          {/* Gauge 1: Dossiers Completion Target */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Indexed Database Target</span>
                <h4 className="text-lg font-display font-extrabold text-slate-900 mt-1 uppercase">Dossier Index Limit</h4>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 p-1 rounded">2026 Target</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-650">Apostles Registered: {allMembers ? allMembers.length : 0}</span>
                <span className="text-amber-700 font-mono">{Math.round(((allMembers ? allMembers.length : 0) / 150) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round(((allMembers ? allMembers.length : 0) / 150) * 100))}%` }}
                ></div>
              </div>
              <p className="text-[9.5px] text-slate-450">Target is 150 registered digital theologians for Chennai diocese directory.</p>
            </div>
          </div>

          {/* Gauge 2: Verification dispatched Ratio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Admitted Dioceses Ledger</span>
                <h4 className="text-lg font-display font-extrabold text-slate-900 mt-1 uppercase">Affiliated Ratio</h4>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 p-1 rounded">Dossier verified</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-650">Approved Accounts: {allMembers ? allMembers.filter((m) => m.status === 'Affiliated' || m.status === 'Active').length : 0}</span>
                <span className="text-indigo-700 font-mono">
                  {allMembers && allMembers.length > 0 
                    ? Math.round((allMembers.filter((m) => m.status === 'Affiliated' || m.status === 'Active').length / allMembers.length) * 100) 
                    : 100}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${allMembers && allMembers.length > 0 ? (allMembers.filter((m) => m.status === 'Affiliated' || m.status === 'Active').length / allMembers.length) * 100 : 100}%` }}
                ></div>
              </div>
              <p className="text-[9.5px] text-slate-450">Reflects proportion of active/approved creators in general registry.</p>
            </div>
          </div>

          {/* Gauge 3: Liturgical Campaigns Mobilization Ratio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Evangelical Reach Indexes</span>
                <h4 className="text-lg font-display font-extrabold text-slate-900 mt-1 uppercase">Commission Mobilization</h4>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 p-1 rounded">Weekly Active</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-650">Campaign Participation</span>
                <span className="text-purple-700 font-mono">88% Capacity</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[9.5px] text-slate-450">Active digital apostles mobilization factor under Synod direction guidelines.</p>
            </div>
          </div>

        </div>

      </div>

      {/* MASTER DASHBOARD RECONFIGURED GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: ANNOUNCEMENTS & CALENDAR (Span 2) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* LATEST ADVISORIES & LITURGICAL DECREES */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">Liturgical Advisories &amp; Digital Decrees</h3>
                  <p className="text-[11px] text-slate-400">Broadcasting updates to Vox Ecclesiae council and digital directory stakeholders.</p>
                </div>
              </div>

              {authenticatedAdmin && (
                <button
                  onClick={() => setShowAnnForm(!showAnnForm)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn-trigger-announcement-form"
                >
                  {showAnnForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAnnForm ? "Close Form" : "Publish Announcement"}</span>
                </button>
              )}
            </div>

            {/* EXPANDABLE ANNOUNCEMENT FORM */}
            {showAnnForm && (
              <form onSubmit={handleSubmitAnnouncement} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 space-y-4 animate-fade-in" id="announcement-publication-form">
                <div className="border-b border-slate-200/80 pb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Advisory Publication Panel</span>
                  <span className="text-[9px] text-slate-400 font-mono">Operator: {authenticatedAdmin?.name}</span>
                </div>
                
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Decree Title *</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. Mandatory Guidelines on Social Catechesis Coverage"
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Priority Grade</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as Announcement['priority'])}
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold cursor-pointer font-sans"
                      >
                        <option value="low">Standard Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">Urgent Decree</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Advisory Body / Content Draft *</label>
                    <textarea
                      required
                      rows={4}
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Input the full textual instructions of this advisory decree or event callouts here... Use clear canonical and humble terminology."
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAnnForm(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg uppercase tracking-wider text-[10px]"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg uppercase tracking-wider text-[10px] flex items-center gap-1.5 animate-pulse"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Post Advisory Decree</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ANNOUNCEMENT RECORDS INDEX */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto mt-4 pr-1 space-y-4">
              {announcements.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400">
                  <Megaphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No active liturgical advisories are listed on the dashboard.</p>
                </div>
              ) : (
                announcements.map((ann) => {
                  const isHigh = ann.priority === 'high';
                  return (
                    <div key={ann.id} className="relative group p-5 bg-slate-50 hover:bg-white rounded-xl border border-slate-150 transition space-y-3" id={`announcement-${ann.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[8.5px] font-black uppercase tracking-widest ${
                              ann.priority === 'high' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                              ann.priority === 'medium' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                              'bg-slate-300/10 text-slate-500 border border-slate-300/10'
                            }`}>
                              {ann.priority} priority
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono select-none">
                              {new Date(ann.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <h4 className="font-display font-extrabold text-sm text-slate-900 leading-tight uppercase tracking-wide">
                            {ann.title}
                          </h4>
                        </div>

                        {authenticatedAdmin && (
                          <button
                            onClick={async () => {
                              if (await dialog.confirm({
                                title: 'Remove announcement?',
                                message: 'This advisory will be permanently removed from the registry feed.',
                                confirmLabel: 'Remove advisory',
                                destructive: true,
                              })) {
                                onDeleteAnnouncement(ann.id);
                              }
                            }}
                            className="p-1 px-1.5 self-start text-slate-350 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded transition cursor-pointer"
                            title="Retract advisory decree"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-650 leading-relaxed max-w-2xl select-all">
                        {ann.content}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        <span>Issued by Authority of: </span>
                        <span className="font-bold text-slate-700 font-mono">{ann.author}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ARCHDIOCESE LITURGICAL CALENDAR REGISTRY */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <CalendarIcon className="w-5 h-5 focus:outline-hidden" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">Archdiocese Liturgical Calendar Registry</h3>
                  <p className="text-[11px] text-slate-400">Click dates flagged with colored markup markers to inspect daily schedules, assemblies, or feasts.</p>
                </div>
              </div>

              {/* MONTH SWITCHER PANEL CONTROLS */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl" id="calendar-controls">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 px-1.5 hover:bg-white rounded transition text-slate-600 hover:text-slate-950 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs uppercase font-display font-bold tracking-wider px-3 select-none text-slate-800">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 px-1.5 hover:bg-white rounded transition text-slate-600 hover:text-slate-950 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CALENDAR ROW GRID */}
            <div className="grid grid-cols-7 gap-1.5 select-none" id="sacred-calendar-days-grid">
              {/* Weekday headers list */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                <div key={wd} className="text-center font-display font-bold text-[10px] text-slate-400 p-2 uppercase tracking-widest border-b border-slate-100">
                  {wd}
                </div>
              ))}

              {/* Cal-grid items mapping */}
              {daysInMonth.map((day, idx) => {
                if (day === null) {
                  return (
                    <div key={`empty-${idx}`} className="aspect-square bg-slate-200/20 p-2 rounded-lg border border-slate-100/10"></div>
                  );
                }

                const formattedDay = String(day).padStart(2, '0');
                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;

                const dayEventsList = eventsByDate[dateKey] || [];
                const hasEvents = dayEventsList.length > 0;
                const hasMeetings = dayEventsList.some(e => e.type === 'meeting');
                const hasFeasts = dayEventsList.some(e => e.type === 'feast');
                const hasHolydays = dayEventsList.some(e => e.type === 'holyday');

                const isSelected = selectedDateStr === dateKey;
                const isToday = new Date().toISOString().split('T')[0] === dateKey;

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`relative min-h-[92px] sm:min-h-[110px] w-full p-1.5 rounded-xl flex flex-col justify-between items-stretch group transition-all cursor-pointer border ${
                      isSelected ? 'bg-amber-500 border-amber-600 text-slate-950 font-black shadow-md scale-102 ring-2 ring-amber-500/35' :
                      isToday ? 'bg-slate-900 border-slate-950 text-white font-black' :
                      hasEvents ? 'bg-[#FAF9F5] border-amber-400/35 hover:border-amber-400 text-slate-800 font-bold' :
                      'bg-slate-50 border-slate-150 hover:bg-slate-100/50 hover:border-slate-300 text-slate-500 font-medium'
                    }`}
                  >
                    {/* Cal Day digit text & indicator */}
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[11px] sm:text-xs font-mono font-bold leading-none">{day}</span>
                      {hasEvents && !isSelected && (
                        <span className={`text-[8.5px] font-bold opacity-60 font-mono ${isToday ? 'text-slate-300' : 'text-slate-500'}`}>
                          {dayEventsList.length}
                        </span>
                      )}
                    </div>

                    {/* Dynamic Event Labels inside Date Cells */}
                    {hasEvents ? (
                      <div className="w-full mt-1.5 space-y-1.5 overflow-hidden flex-grow flex flex-col justify-end">
                        {dayEventsList.slice(0, 3).map((e, eidx) => {
                          let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
                          if (e.type === 'holyday') {
                            badgeBg = 'bg-purple-100 text-purple-700 border-purple-200';
                          } else if (e.type === 'feast') {
                            badgeBg = 'bg-amber-100 text-amber-800 border-amber-250';
                          } else if (e.type === 'meeting') {
                            badgeBg = 'bg-indigo-100/80 text-indigo-750 border-indigo-250';
                          }

                          // Customize when selected or today
                          if (isSelected) {
                            badgeBg = 'bg-amber-600 text-white border-transparent';
                          } else if (isToday) {
                            badgeBg = 'bg-slate-800 text-slate-200 border-transparent';
                          }

                          // Flags for national and Tamil Nadu state holidays
                          const isNational = e.id.startsWith('h_');
                          if (isNational && !isSelected && !isToday) {
                            badgeBg = e.type === 'feast'
                              ? 'bg-amber-100 text-amber-850 border-amber-300'
                              : 'bg-emerald-100 text-emerald-850 border-emerald-300';
                          }

                          return (
                            <div 
                              key={e.id || eidx}
                              className={`text-[8px] sm:text-[9.5px] leading-tight px-1 py-0.5 rounded-[4px] truncate w-full text-left font-sans font-medium border ${badgeBg}`}
                              title={e.title}
                            >
                              <span className="block truncate font-semibold">
                                {isNational ? '🇮🇳 ' : ''}{e.title}
                              </span>
                            </div>
                          );
                        })}
                        {dayEventsList.length > 3 && (
                          <div className={`text-[7.5px] sm:text-[8.5px] text-right font-mono pr-0.5 font-bold ${isSelected ? 'text-amber-950' : isToday ? 'text-slate-400' : 'text-slate-450'}`}>
                            +{dayEventsList.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-grow"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-[10px] text-slate-400 select-none">
              <span className="hidden sm:inline font-bold">LEGEND INDICATORS:</span>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>Assembly meetings</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span>Saints Feasts</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Holy days of obligation</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-450"></span>
                  <span>Other events</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8.5px] font-bold rounded border border-emerald-250 font-mono">🇮🇳 IND / TN</span>
                  <span>Public Holidays</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TIMELINE REGISTER, BIRTHDAYS, & EVENT SCHEDULER (Span 1) */}
        <div className="space-y-8">
          
          {/* UPCOMING ASSEMBLY MEETINGS */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                <Video className="w-5 h-5 focus:outline-hidden" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">Upcoming Assembly Meetings</h3>
                <p className="text-[11px] text-slate-400">Chronological registry of virtual / physical commission panels.</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {upcomingMeetings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No upcoming assembly meetings have been scheduled.</p>
                </div>
              ) : (
                upcomingMeetings.map((mtg) => (
                  <div key={mtg.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl hover:bg-white hover:border-amber-500/30 transition shadow-xs flex flex-col justify-between space-y-3" id={`meeting-${mtg.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 tracking-wider">
                          {mtg.category} Commission Session
                        </span>
                        <h4 className="font-bold text-xs font-display text-slate-900 uppercase tracking-wide">
                          {mtg.title}
                        </h4>
                      </div>

                      {authenticatedAdmin && (
                        <button
                          onClick={async () => {
                            if (await dialog.confirm({
                              title: 'Cancel meeting?',
                              message: `Remove the scheduled meeting "${mtg.title}"?`,
                              confirmLabel: 'Cancel meeting',
                              destructive: true,
                            })) {
                              onDeleteEvent(mtg.id);
                            }
                          }}
                          className="p-1 text-slate-350 hover:text-rose-600 rounded transition cursor-cmd cursor-pointer"
                          title="Cancel meeting event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed truncate-2-lines">
                      {mtg.description}
                    </p>

                    <div className="space-y-1 text-[10px] text-slate-400 border-t border-slate-100/80 pt-2.5 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                        <span className="font-bold font-mono text-slate-600">{mtg.date}</span>
                        {mtg.time && (
                          <span className="bg-slate-200/50 px-1.5 py-0.4 rounded font-mono text-[9px] text-slate-600 font-bold shrink-0">{mtg.time} Hours</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                        <span className="truncate max-w-[200px] text-slate-550">{mtg.location || 'Online Assembly Panel'}</span>
                      </div>
                    </div>

                    {mtg.link && (
                      <a
                        href={mtg.link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-1.5 bg-indigo-50 hover:bg-indigo-605 text-indigo-700 border border-indigo-150 font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3 h-3" />
                        <span>Launch Google Meet Panel</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UPCOMING BIRTHDAYS PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col" id="upcoming-birthdays-card">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-600">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">Upcoming Birthdays</h3>
                <p className="text-[11px] text-slate-400">Celebrating milestones of our active digital creators.</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {upcomingBirthdays.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400">
                  <Gift className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No active contributor birthdays registered in directory.</p>
                </div>
              ) : (
                upcomingBirthdays.map((item) => {
                  const isToday = item.diffDays === 0;
                  return (
                    <div 
                      key={item.member.id} 
                      id={`birthday-item-${item.member.id}`}
                      className={`p-3.5 border rounded-xl transition flex justify-between items-center ${
                        isToday 
                          ? 'bg-pink-50/50 border-pink-300 shadow-sm animate-pulse' 
                          : 'bg-slate-50/50 border-slate-150 hover:bg-white hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs uppercase shrink-0 ${
                          isToday 
                            ? 'bg-gradient-to-tr from-pink-500 to-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.member.firstName[0]}{item.member.lastName ? item.member.lastName[0] : ''}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {item.member.fullName}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            Turns <span className="font-bold text-pink-600">{item.age}</span> • {item.member.diocese}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isToday 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'bg-slate-200/60 text-slate-600'
                        }`}>
                          {isToday ? '🎂 Today!' : `In ${item.diffDays} day${item.diffDays === 1 ? '' : 's'}`}
                        </span>
                        <p className="text-[9px] font-mono font-semibold text-slate-400 mt-1 uppercase">
                          {parseDOB(item.member.dob)?.toLocaleString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SELECTED DATE VIEW & DYNAMIC SCHEDULING PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Date Schedule View</span>
                  <h4 className="text-xs font-display font-black text-slate-900 font-mono mt-0.5">{selectedDateStr}</h4>
                </div>
                
                {authenticatedAdmin && (
                  <button
                    onClick={() => {
                      setEvtDate(selectedDateStr);
                      setShowEventForm(!showEventForm);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    id="btn-trigger-event-form"
                  >
                    {showEventForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Schedule Event</span>
                  </button>
                )}
              </div>
            </div>

            {/* EVENT CREATION FORM BLOCK */}
            {showEventForm && (
              <form onSubmit={handleSubmitEvent} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3 animate-fade-in" id="event-scheduler-form">
                <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block font-display">Event Scheduler Wizard</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      placeholder="e.g. Media Commission General Synod"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Event Type</label>
                      <select
                        value={evtType}
                        onChange={(e) => setEvtType(e.target.value as CalendarEvent['type'])}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer font-bold"
                      >
                        <option value="meeting">Assembly meeting</option>
                        <option value="feast">Saints Feast</option>
                        <option value="holyday">Holy day of obligation</option>
                        <option value="other">Other calendar event</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Event Category</label>
                      <select
                        value={evtCategory}
                        onChange={(e) => setEvtCategory(e.target.value as CalendarEvent['category'])}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer font-bold"
                      >
                        <option value="General">General Commission</option>
                        <option value="Clergy">Priests &amp; Clergy</option>
                        <option value="Media">Media &amp; Designs</option>
                        <option value="Youth">Youth Commission</option>
                        <option value="Liturgical">Liturgical Ministry</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DateInput
                      label="Select date"
                      value={evtDate}
                      onChange={setEvtDate}
                      required
                    />

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Time (Optional)</label>
                      <input
                        type="time"
                        value={evtTime}
                        onChange={(e) => setEvtTime(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description *</label>
                    <textarea
                      required
                      rows={2}
                      value={evtDescription}
                      onChange={(e) => setEvtDescription(e.target.value)}
                      placeholder="Input the core details or liturgical notes on this feast day or assembly meeting agenda..."
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Acreage Location (Optional)</label>
                    <input
                      type="text"
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      placeholder="e.g. St. Bede's Hall, Santhome, or Virtual via Zoom"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  {evtType === 'meeting' && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-indigo-500 uppercase tracking-widest font-mono">Virtual Commission Link (Optional)</label>
                      <input
                        type="url"
                        value={evtLink}
                        onChange={(e) => setEvtLink(e.target.value)}
                        placeholder="e.g. https://meet.google.com/abc-defg-hij"
                        className="w-full text-xs p-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-400 font-mono text-indigo-700 font-bold"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowEventForm(false)}
                      className="px-3.5 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-lg text-[10px] uppercase cursor-pointer"
                    >
                      Enact Event
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* SELECTION EVENT DETAILS SUMMARY CONTAINER */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-400" id="calendar-day-empty">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No liturgical feasts or assembly sessions are filed on this date.</p>
                </div>
              ) : (
                selectedDayEvents.map((evt) => (
                  <div key={evt.id} className="p-4 bg-[#FAF9F5] border border-amber-500/25 rounded-xl space-y-3" id={`selected-day-detail-${evt.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-1.5 py-0.4 rounded text-[8px] font-black uppercase tracking-wider ${
                          evt.type === 'feast' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          evt.type === 'holyday' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          evt.type === 'meeting' ? 'bg-indigo-100 text-indigo-700 border border-indigo-250' :
                          'bg-slate-100 text-slate-650'
                        }`}>
                          {evt.type} • {evt.category}
                        </span>
                        
                        <h4 className="font-display font-extrabold text-xs text-slate-900 uppercase">
                          {evt.title}
                        </h4>
                      </div>

                      {authenticatedAdmin && !evt.id.startsWith('h_') && (
                        <button
                          onClick={async () => {
                            if (await dialog.confirm({
                              title: 'Remove event?',
                              message: `Remove the calendar event "${evt.title}"?`,
                              confirmLabel: 'Remove event',
                              destructive: true,
                            })) {
                              onDeleteEvent(evt.id);
                            }
                          }}
                          className="p-1 text-slate-350 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {evt.id.startsWith('h_') && (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded select-none">
                          🇮🇳 PUBLIC HOLIDAY / FESTIVAL
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed border-t border-slate-150/40 pt-2 font-sans select-all">
                      {evt.description}
                    </p>

                    <div className="space-y-1.4 text-[10px] text-slate-400 font-sans">
                      {evt.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 font-mono" />
                          <span className="font-extrabold font-mono text-slate-600">{evt.time} Hours (LOCAL INDIA)</span>
                        </div>
                      )}
                      
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-550 font-medium">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    {evt.link && (
                      <a
                        href={evt.link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] uppercase tracking-widest rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3 h-3 text-indigo-650" />
                        <span>Launch Virtual Assembly Pane</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    {authenticatedMember && (
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 mt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">My Event Status:</span>
                        <div className="flex gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!authenticatedMember.ownerUid) return;
                              const next = new Set(reminderEventIds);
                              if (next.has(evt.id)) {
                                await unsubscribeEventReminder(evt.id, authenticatedMember.ownerUid);
                                next.delete(evt.id);
                              } else {
                                await subscribeEventReminder(evt.id, authenticatedMember.ownerUid);
                                next.add(evt.id);
                              }
                              setReminderEventIds(next);
                            }}
                            className="min-h-11 flex-1 sm:flex-none text-[9px] font-bold uppercase tracking-wider px-2.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800"
                          >
                            <Bell className="mr-1 inline h-3 w-3" />
                            {reminderEventIds.has(evt.id) ? 'Reminder On' : 'Remind Me'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleAvailability?.(evt.id, authenticatedMember.id, 'available')}
                            className={`flex-1 sm:flex-none text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border transition flex items-center justify-center gap-1 cursor-pointer ${
                              memberAvailabilities?.[`${evt.id}_${authenticatedMember.id}`] === 'available'
                                ? 'bg-emerald-600 text-white border-transparent'
                                : 'bg-slate-50 text-slate-750 border-slate-250 hover:bg-slate-100'
                            }`}
                          >
                            <span>Available 🟢</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleAvailability?.(evt.id, authenticatedMember.id, 'not_available')}
                            className={`flex-1 sm:flex-none text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border transition flex items-center justify-center gap-1 cursor-pointer ${
                              memberAvailabilities?.[`${evt.id}_${authenticatedMember.id}`] === 'not_available'
                                ? 'bg-rose-600 text-white border-transparent'
                                : 'bg-slate-50 text-slate-750 border-slate-250 hover:bg-slate-100'
                            }`}
                          >
                            <span>Not Available 🔴</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {allMembers && (
                      <div className="pt-2 border-t border-slate-200/50 mt-2" id={`avail-list-${evt.id}`}>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Attendee Status Listing
                        </span>
                        {(() => {
                          const matchingAvails = Object.entries(memberAvailabilities || {})
                            .filter(([key]) => key.startsWith(`${evt.id}_`))
                            .map(([key, value]) => {
                              const mId = key.split('_')[1];
                              const mObj = allMembers.find(m => m.id === mId);
                              return { mObj, status: value };
                            })
                            .filter(item => item.mObj);

                          if (matchingAvails.length === 0) {
                            return <p className="text-[8.5px] text-slate-400 italic">No members have marked their availability yet.</p>;
                          }

                          return (
                            <div className="flex flex-wrap gap-1">
                              {matchingAvails.map(({ mObj, status }, idx) => (
                                <span 
                                  key={idx} 
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-semibold border ${
                                    status === 'available' 
                                      ? 'bg-emerald-55 text-emerald-800 border-emerald-150' 
                                      : 'bg-rose-55 text-rose-800 border-rose-150'
                                  }`}
                                  title={mObj.fullName}
                                >
                                  <span className={`w-1 h-1 rounded-full ${status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span>{mObj.fullName}</span>
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
