import React, { useEffect, useState, useMemo } from 'react';
import { Member, MemberStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, CartesianGrid
} from 'recharts';
import { 
  Users, UserCheck, Clock, Archive, Sparkles, MapPin, Award, BookOpen, Filter, Search, RotateCcw, 
  ArrowRight, ShieldCheck, Heart, HeartHandshake, Smile, ListCollapse, Bookmark, Compass, Baby, HelpCircle
} from 'lucide-react';

interface AnalyticsProps {
  members: Member[];
}

export default function Analytics({ members }: AnalyticsProps) {
  // --- STATE FOR ADVANCED DYNAMIC FILTERS ---
  const [selectedDiocese, setSelectedDiocese] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMarital, setSelectedMarital] = useState<string>('ALL');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Sourced active filter selections
  const diocesesList = useMemo(() => {
    const list = new Set<string>();
    members.forEach(m => {
      if (m.diocese) list.add(m.diocese);
    });
    return Array.from(list).sort();
  }, [members]);

  // Safe Age calculation helper
  const calculateAge = (dobStr?: string): number | null => {
    if (!dobStr) return null;
    try {
      const timeMs = Date.parse(dobStr);
      if (isNaN(timeMs)) return null;
      const birthDate = new Date(timeMs);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 && age < 120 ? age : null;
    } catch {
      return null;
    }
  };

  const getAgeGroupLabel = (age: number): string => {
    if (age < 21) return 'Under 21';
    if (age <= 28) return '21-28 (Gen Z & Youth)';
    if (age <= 38) return '29-38 (Young Professionals)';
    if (age <= 48) return '39-48 (Experienced Leads)';
    return '49+ (Senior Advisors)';
  };

  // --- FILTERED DATA SET ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // 1. Diocese Filter
      if (selectedDiocese !== 'ALL' && m.diocese !== selectedDiocese) return false;
      
      // 2. Gender Filter
      if (selectedGender !== 'ALL') {
        const uGender = (m.gender || '').toUpperCase();
        if (selectedGender === 'MALE' && !uGender.startsWith('M')) return false;
        if (selectedGender === 'FEMALE' && !uGender.startsWith('F')) return false;
        if (selectedGender === 'OTHER' && (uGender.startsWith('M') || uGender.startsWith('F'))) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;

      // 4. Marital status (relationship)
      if (selectedMarital !== 'ALL' && (m.relationship || '').toUpperCase() !== selectedMarital.toUpperCase()) return false;

      // 5. Age category
      if (selectedAgeGroup !== 'ALL') {
        const age = calculateAge(m.dob);
        if (age === null) return false;
        if (selectedAgeGroup === 'UNDER_21' && age >= 21) return false;
        if (selectedAgeGroup === '21_28' && (age < 21 || age > 28)) return false;
        if (selectedAgeGroup === '29_38' && (age < 29 || age > 38)) return false;
        if (selectedAgeGroup === '39_48' && (age < 39 || age > 48)) return false;
        if (selectedAgeGroup === '49_UP' && age < 49) return false;
      }

      // 6. Local text search matching
      if (localSearch.trim() !== '') {
        const query = localSearch.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(query);
        const matchesParish = (m.parish || '').toLowerCase().includes(query);
        const matchesDiocese = (m.diocese || '').toLowerCase().includes(query);
        const matchesSkills = (m.techSkills || []).some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesParish && !matchesDiocese && !matchesSkills) return false;
      }

      return true;
    });
  }, [members, selectedDiocese, selectedGender, selectedStatus, selectedMarital, selectedAgeGroup, localSearch]);

  const hasActiveFilters = useMemo(() => {
    return selectedDiocese !== 'ALL' || 
           selectedGender !== 'ALL' || 
           selectedStatus !== 'ALL' || 
           selectedMarital !== 'ALL' || 
           selectedAgeGroup !== 'ALL' || 
           localSearch !== '';
  }, [selectedDiocese, selectedGender, selectedStatus, selectedMarital, selectedAgeGroup, localSearch]);

  const resetFilters = () => {
    setSelectedDiocese('ALL');
    setSelectedGender('ALL');
    setSelectedStatus('ALL');
    setSelectedMarital('ALL');
    setSelectedAgeGroup('ALL');
    setLocalSearch('');
  };

  // --- DERIVE STATISTICS FROM FILTERED DATA SET ---
  const counts = useMemo(() => {
    const total = filteredMembers.length;
    const affiliated = filteredMembers.filter(m => m.status === 'Affiliated' || m.status === 'Active').length;
    const pending = filteredMembers.filter(m => m.status === 'Pending').length;
    const abdicated = filteredMembers.filter(m => m.status === 'Abdicated' || m.status === 'Inactive' || m.status === 'Suspended').length;
    const others = total - affiliated - pending - abdicated;

    const rate = total > 0 ? Math.round((affiliated / total) * 100) : 0;

    // Gender division
    let males = 0;
    let females = 0;
    let undisclosedGender = 0;
    filteredMembers.forEach(m => {
      const g = (m.gender || '').toUpperCase();
      if (g.startsWith('M')) males++;
      else if (g.startsWith('F')) females++;
      else undisclosedGender++;
    });

    // Unique represented count
    const uniqueDioceses = new Set(filteredMembers.map(m => m.diocese).filter(Boolean));
    const uniqueParishes = new Set(filteredMembers.map(m => m.parish).filter(Boolean));

    return {
      total,
      affiliated,
      pending,
      abdicated,
      others,
      rate,
      males,
      females,
      undisclosedGender,
      diocesesCount: uniqueDioceses.size,
      parishesCount: uniqueParishes.size
    };
  }, [filteredMembers]);

  // --- COMPILING GRAPH DATA ---

  // 1. Status Colors & Data
  const statusColors: Record<string, string> = {
    Affiliated: '#10b981', // Emerald
    Active: '#10b981',
    Pending: '#f59e0b',    // Amber / Gold
    Abdicated: '#f43f5e',  // Rose
    Inactive: '#64748b',   // Slate
    'ID card to be provided': '#3b82f6', // Blue
    'Data Insufficient': '#a855f7', // Purple
  };

  const statusPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMembers.forEach(m => {
      const s = m.status || 'Pending';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.keys(map).map(key => ({
      name: key,
      value: map[key],
      color: statusColors[key] || '#475569'
    }));
  }, [filteredMembers]);

  // 2. Dioceses high-density ranking
  const dioceseRankData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMembers.forEach(m => {
      let d = m.diocese || 'Other Dioceses';
      // Shorten for aesthetics
      d = d.replace('Archdiocese of ', 'Arch. ').replace('Diocese of ', 'Dioc. ');
      map[d] = (map[d] || 0) + 1;
    });
    return Object.keys(map).map(key => ({
      name: key,
      value: map[key]
    })).sort((a,b) => b.value - a.value).slice(0, 10);
  }, [filteredMembers]);

  // 3. Technical Skills horizontal list
  const skillsRankData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMembers.forEach(m => {
      (m.techSkills || []).forEach(skill => {
        map[skill] = (map[skill] || 0) + 1;
      });
    });
    return Object.keys(map).map(key => ({
      name: key,
      value: map[key]
    })).sort((a,b) => b.value - a.value).slice(0, 8);
  }, [filteredMembers]);

  // 4. Scripture references frequency
  const scripturePieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMembers.forEach(m => {
      if (m.bibleBook) {
        map[m.bibleBook] = (map[m.bibleBook] || 0) + 1;
      }
    });
    return Object.keys(map).map(key => ({
      name: key,
      value: map[key]
    })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [filteredMembers]);

  // 5. Age Demographics Cohorts
  const ageCohortsData = useMemo(() => {
    const cohorts = {
      'Under 21': 0,
      '21-28 (Youth)': 0,
      '29-38 (Pro)': 0,
      '39-48 (Lead)': 0,
      '49+ (Senior)': 0,
      'Unknown DOB': 0
    };

    filteredMembers.forEach(m => {
      const age = calculateAge(m.dob);
      if (age === null) {
        cohorts['Unknown DOB']++;
      } else if (age < 21) {
        cohorts['Under 21']++;
      } else if (age <= 28) {
        cohorts['21-28 (Youth)']++;
      } else if (age <= 38) {
        cohorts['29-38 (Pro)']++;
      } else if (age <= 48) {
        cohorts['39-48 (Lead)']++;
      } else {
        cohorts['49+ (Senior)']++;
      }
    });

    return Object.keys(cohorts).map(key => ({
      name: key,
      value: cohorts[key as keyof typeof cohorts]
    })).filter(c => c.value > 0);
  }, [filteredMembers]);

  // 6. Parishes Leaderboard ranking data
  const parishesLeaderboard = useMemo(() => {
    const map: Record<string, { count: number; diocese: string }> = {};
    filteredMembers.forEach(m => {
      if (m.parish) {
        const parishKey = m.parish.trim();
        if (!map[parishKey]) {
          map[parishKey] = { count: 0, diocese: m.diocese || 'Unknown' };
        }
        map[parishKey].count++;
      }
    });

    return Object.keys(map).map(name => ({
      name,
      count: map[name].count,
      diocese: map[name].diocese
    })).sort((a,b) => b.count - a.count).slice(0, 6);
  }, [filteredMembers]);

  // --- EXTRACT ACTUAL SCRIPTURES FOR AN ELEGANT CARD CAROUSEL ---
  const memberScriptures = useMemo(() => {
    return filteredMembers.filter(m => m.bibleBook && m.bibleVerseText).map(m => ({
      id: m.id,
      name: m.fullName,
      parish: m.parish,
      diocese: m.diocese,
      book: m.bibleBook,
      chapter: m.bibleChapter,
      verse: m.bibleVerse,
      text: m.bibleVerseText,
      why: m.bibleVerseWhy || 'Inspires constant digital evangelical outreach and pastoral commitment.'
    }));
  }, [filteredMembers]);

  const [activeScriptureIndex, setActiveScriptureIndex] = useState(0);

  const displayedScripture = useMemo(() => {
    if (memberScriptures.length === 0) {
      return {
        name: 'Ecclasia Clergy Center',
        parish: 'Holy Apostles Digital Secretariat',
        diocese: 'Rome',
        book: 'Mark',
        chapter: '16',
        verse: '15',
        text: 'Go into all the world and proclaim the gospel to the whole creation.',
        why: 'The ultimate divine mandate empowering our Cathfluencers digital commission.'
      };
    }
    return memberScriptures[activeScriptureIndex % memberScriptures.length];
  }, [memberScriptures, activeScriptureIndex]);

  const handleNextScripture = () => {
    if (memberScriptures.length > 0) {
      setActiveScriptureIndex(prev => (prev + 1) % memberScriptures.length);
    }
  };

  const handlePrevScripture = () => {
    if (memberScriptures.length > 0) {
      setActiveScriptureIndex(prev => (prev - 1 + memberScriptures.length) % memberScriptures.length);
    }
  };

  // --- INTERACTIVE TALENT SCOUT SKILL SELECTION ---
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<string | null>(null);

  // Auto-select top skill if none selected
  useEffect(() => {
    if (!selectedSkillForDetail && skillsRankData.length > 0) {
      setSelectedSkillForDetail(skillsRankData[0].name);
    }
  }, [skillsRankData, selectedSkillForDetail]);

  const skillDetailedMembers = useMemo(() => {
    if (!selectedSkillForDetail) return [];
    return filteredMembers.filter(m => (m.techSkills || []).includes(selectedSkillForDetail)).slice(0, 6);
  }, [filteredMembers, selectedSkillForDetail]);

  return (
    <div className="space-y-6" id="analytics-container">
      
      {/* 1. ANALYTICS COMMAND PANEL: DYNAMIC INTERACTIVE FILTERS */}
      <div className="bg-[#FCFBF8] border-2 border-amber-500/10 rounded-2xl p-6 shadow-xs space-y-4" id="analytics-control-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Metrics Intelligence Console</h3>
              <p className="text-[10px] text-slate-400 font-medium">Dynamically configure queries to calculate custom sub-demographics &amp; talent groups.</p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-lg hover:bg-rose-100 text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Config
            </button>
          )}
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" id="analytics-filter-selects">
          
          {/* Diocese */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 select-none">Diocese Jurisdiction</label>
            <select
              value={selectedDiocese}
              onChange={(e) => setSelectedDiocese(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-sans font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400"
            >
              <option value="ALL">All Dioceses ({diocesesList.length})</option>
              {diocesesList.map(item => (
                <option key={item} value={item}>{item.replace('Archdiocese of ', 'Arch. ').replace('Diocese of ', 'Dioc. ')}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 select-none">Registry Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-sans font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400"
            >
              <option value="ALL">All Records Categories</option>
              <option value="Affiliated">🟢 Affiliated</option>
              <option value="Active">🟢 Active State</option>
              <option value="Pending">🟡 Pending Verification</option>
              <option value="Abdicated">🔴 Former / Abdicated</option>
              <option value="Inactive">⚫ Inactive Storage</option>
              <option value="ID card to be provided">🔵 ID Card Pending</option>
              <option value="Data Insufficient">🟣 Data Insufficient</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 select-none">Gender Group</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-sans font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male Creators</option>
              <option value="FEMALE">Female Creators</option>
              <option value="OTHER">Undisclosed / Other</option>
            </select>
          </div>

          {/* Marital status */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 select-none">Marital Status</label>
            <select
              value={selectedMarital}
              onChange={(e) => setSelectedMarital(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-sans font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400"
            >
              <option value="ALL">All Relationships</option>
              <option value="Unmarried">Unmarried (Single)</option>
              <option value="Married">Married State</option>
              <option value="Celibate">Consecrated / Celibate</option>
            </select>
          </div>

          {/* Age Demographics */}
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 select-none">Age Demographics</label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-sans font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400"
            >
              <option value="ALL">All Age Pools</option>
              <option value="UNDER_21">Under 21 Years</option>
              <option value="21_28">21 - 28 (Gen Z Focus)</option>
              <option value="29_38">29 - 38 (Millennials)</option>
              <option value="39_48">39 - 48 (Core Leaders)</option>
              <option value="49_UP">49 Years and Up</option>
            </select>
          </div>

        </div>

        {/* Dynamic Search Box Input inside Console */}
        <div className="relative pt-2">
          <Search className="absolute left-3.5 top-5 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search matching results by name, parish church, diocese or skill tags... (Real-time recalculation)"
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all placeholder-slate-400 text-slate-700"
          />
        </div>

        {/* Calculations Match Header Pill */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 select-none bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-150">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Matched dossiers for query:</span>
          <span className="text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-mono text-xs font-black">
            {filteredMembers.length}
          </span>
          <span>out of</span>
          <span className="text-slate-700 font-mono text-xs font-bold">{members.length}</span>
          <span>total dossier files. ({Math.round(members.length > 0 ? (filteredMembers.length / members.length) * 100 : 0)}% of database)</span>
        </div>
      </div>

      {/* 2. KPI BENTO METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="analytics-bento-metrics">
        
        {/* Metric Total */}
        <div className="bg-[#FCFBF8] p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition duration-150" id="metric-kpi-total">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Dossiers Selected</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none font-display">{counts.total}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              🧔 {counts.males} Males
            </span>
            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              👩 {counts.females} Females
            </span>
          </div>
        </div>

        {/* Metric Affiliated Standing */}
        <div className="bg-[#FCFBF8] p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition duration-150" id="metric-kpi-affiliated">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Accredited Standing</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none font-display">{counts.affiliated}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
              <span>Induction Ratio</span>
              <span>{counts.rate}% verified</span>
            </div>
            <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-505" 
                style={{ width: `${counts.rate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric Pending Standby */}
        <div className="bg-[#FCFBF8] p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition duration-150" id="metric-kpi-pending">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pending Clergy Review</span>
              <Clock className={`w-4 h-4 ${counts.pending > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-350'}`} />
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none font-display">{counts.pending}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
            {counts.pending > 0 ? (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 animate-pulse flex items-center gap-1">
                ⚠️ action recommended
              </span>
            ) : (
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded flex items-center gap-1 uppercase text-[9px] tracking-wider">
                ✓ Queue clear
              </span>
            )}
            <span className="font-mono text-[9px] text-slate-440 font-bold">Verification Waiting list</span>
          </div>
        </div>

        {/* Metric Footprint Location */}
        <div className="bg-[#FCFBF8] p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition duration-150" id="metric-kpi-footprint">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ecclesial Coverage</span>
              <MapPin className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-none font-display">{counts.diocesesCount}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              ⛪ {counts.parishesCount} Parishes
            </span>
            <span className="text-[9px] text-indigo-600 uppercase tracking-wide">Represented</span>
          </div>
        </div>

      </div>

      {/* 3. INTERACTIVE TALENT SCOUT & SKILLS EXPLORER CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="interactive-talent-scout">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Interactive Talent Scout &amp; Skills Matrix</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Click on any core skillset below to inspect matching creators dynamically.</p>
          </div>
        </div>

        {skillsRankData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No core skills found in search filters matched datasets.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Skills distribution list */}
            <div className="lg:col-span-5 space-y-2.5">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 block">Talent Count by Specialty</span>
              <div className="space-y-2 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {skillsRankData.map((skill, idx) => {
                  const isSelected = selectedSkillForDetail === skill.name;
                  const maxCount = Math.max(...skillsRankData.map(s => s.value));
                  const percentage = maxCount > 0 ? (skill.value / maxCount) * 100 : 0;
                  
                  return (
                    <button
                      key={skill.name}
                      onClick={() => setSelectedSkillForDetail(skill.name)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer duration-150 select-none flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-purple-50/70 border-purple-300 shadow-3xs scale-[1.01]' 
                          : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className={`truncate ${isSelected ? 'text-purple-900 font-bold' : 'text-slate-800'}`}>
                          {idx + 1}. {skill.name}
                        </span>
                        <span className={`text-[10px] px-1.5 rounded font-mono ${isSelected ? 'bg-purple-100 text-purple-800 font-black' : 'bg-slate-200 text-slate-700'}`}>
                          {skill.value} Profiles
                        </span>
                      </div>
                      
                      {/* Horizontal custom bar progress */}
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-purple-600' : 'bg-slate-400'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Scout card list for selected skill */}
            <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200/65 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 block mb-2.5">
                  🔍 Spotlighting Specialists: <span className="text-purple-700 normal-case font-black border-b-2 border-purple-200 font-sans">{selectedSkillForDetail} ({skillDetailedMembers.length} listed)</span>
                </span>
                
                {skillDetailedMembers.length === 0 ? (
                  <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <p>No verified creators found for selected skillset.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-55 overflow-y-auto pr-1">
                    {skillDetailedMembers.map(m => (
                      <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-150 flex flex-col justify-between shadow-3xs">
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">{m.fullName}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate leading-tight">ID: {m.id}</p>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-[9px] text-slate-600 font-medium">
                              <span className="text-emerald-600">⛪</span>
                              <span className="truncate">{m.parish || 'Parish unspecified'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-500">
                              <span>🗺️</span>
                              <span className="truncate text-slate-400">{m.diocese ? m.diocese.replace('Archdiocese of ', 'Arch. ').replace('Diocese of ', 'Dioc. ') : 'No Diocese'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase tracking-wider font-bold truncate max-w-28">
                            🎂 {m.dob ? getAgeGroupLabel(calculateAge(m.dob) || 25) : 'Young Creator'}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${
                            m.status === 'Affiliated' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 text-right bg-white p-2 rounded-lg border border-slate-150 flex items-center justify-between text-[9px] font-bold text-slate-450">
                <span>Tip: Use search filters above to refine this creator pool.</span>
                <span className="text-purple-700 font-mono flex items-center shrink-0">
                  Total skillsets: {Object.keys(members.reduce((acc, m) => {
                    (m.techSkills || []).forEach(s => acc[s] = (acc[s] || 0) + 1);
                    return acc;
                  }, {} as Record<string, number>)).length} listed
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 4. CHARTS VISUAL SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-visual-charts">
        
        {/* Status Distribution Breakdown */}
        <div className="bg-[#FCFBF8] border border-slate-200 p-6 rounded-2xl shadow-2xs hover:shadow-xs transition duration-150" id="visual-chart-cohorts">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Status Category Distribution</h4>
                <p className="text-[9px] text-slate-400 mt-1 font-medium select-none">Record division in the matched registry pool.</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 font-mono bg-slate-200/50 px-2.5 py-0.5 rounded-lg border border-slate-300">
              {statusPieData.length} active brackets
            </span>
          </div>

          {statusPieData.length === 0 ? (
            <div className="h-68 flex items-center justify-center text-slate-400 text-sm italic">No status data to populate charts</div>
          ) : (
            <div className="h-68 flex flex-col justify-between">
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px', border: 'none' }}
                      itemStyle={{ color: '#fbbf24' }}
                      formatter={(value) => [`${value} Creators`, 'Registry Volume']} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Modern Grid Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9px] font-bold mt-2 pt-2 border-t border-slate-100">
                {statusPieData.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100/60 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }}></span>
                    <span className="truncate text-slate-600 uppercase max-w-28">{e.name}: {e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Age Demographics Vertical Bar */}
        <div className="bg-[#FCFBF8] border border-slate-200 p-6 rounded-2xl shadow-2xs hover:shadow-xs transition duration-150" id="visual-chart-age-groups">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Age cohorts analysis</h4>
                <p className="text-[9px] text-slate-400 mt-1 font-medium select-none">Chronological talent clusters calculated from DOB data.</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 bg-amber-100/60 text-amber-905 px-2.5 py-0.5 rounded-lg border border-amber-200">
              Generations Split
            </span>
          </div>

          {ageCohortsData.length === 0 ? (
            <div className="h-68 flex items-center justify-center text-slate-400 text-sm italic">No birthday records provided to map generation splits.</div>
          ) : (
            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageCohortsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px', border: 'none' }}
                    cursor={{ fill: 'rgba(124, 92, 191, 0.04)' }}
                    formatter={(value) => [`${value} Creators`, 'Size of Cohort']} 
                  />
                  <Bar dataKey="value" fill="#7C5CBF" radius={[4, 4, 0, 0]}>
                    {ageCohortsData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={['#3E2E7E', '#7C5CBF', '#C9A84C', '#10b981', '#ef4444', '#64748b'][idx % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* 5. LOCATIONAL DIOCESES DIVISION & EXECUTIVE LEADERBOARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Diocese Distribution chart rank */}
        <div className="lg:col-span-7 bg-[#FCFBF8] border border-slate-200 p-6 rounded-2xl shadow-2xs flex flex-col justify-between" id="visual-dioceses-coverages">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Locations &amp; Diocesan Registry Concentration</h4>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium select-none">Top 10 diocese concentrations by active registrar volume.</p>
                </div>
              </div>
            </div>

            {dioceseRankData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-slate-400 text-sm italic">No geographic location metadata found.</div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dioceseRankData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={110} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px', border: 'none' }}
                      formatter={(value) => [`${value} Writers`, 'Density']} 
                    />
                    <Bar dataKey="value" fill="#C9A84C" radius={[0, 4, 4, 0]}>
                      {dioceseRankData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#10b981' : '#3E2E7E'} fillOpacity={0.88} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard panel on top active parishes */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs flex flex-col justify-between" id="parish-leaderboards">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Top Parish Registrars</h4>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium select-none">Active churches representing high registry density.</p>
                </div>
              </div>
            </div>

            {parishesLeaderboard.length === 0 ? (
              <div className="h-50 flex items-center justify-center text-slate-400 text-xs italic">No matching ecclesiastical parishes found.</div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parishesLeaderboard.map((p, index) => (
                  <div 
                    key={p.name} 
                    className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-6 h-6 bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center rounded-lg border border-amber-200/50 shrink-0 shadow-3xs select-none">
                        {index + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-950 truncate">{p.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{p.diocese.replace('Archdiocese of ', 'Arch. ').replace('Diocese of ', 'Dioc. ')}</p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-805 border border-amber-200/40 px-2 py-0.5 rounded-md font-mono shrink-0">
                      {p.count} Creators
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2 text-[9px] font-bold text-slate-450 text-center select-none">
            Ecclesial registries monitored • Auto replicated Cache active
          </div>
        </div>

      </div>

      {/* 6. LITURGICAL HOLY SCRIPTURE CHRONICLE TESTIMONIAL DISPLAY */}
      <div className="bg-[#FAF9F5] border-2 border-amber-500/15 rounded-3xl p-6 shadow-sm relative overflow-hidden" id="liturgical-scripture-spotlight">
        {/* Custom holy art decoration details */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-305/5 rounded-full blur-2xl -mr-10 -mt-10 select-none pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-305/5 rounded-full blur-3xl -ml-20 -mb-20 select-none pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0 select-none">📜</span>
            <div>
              <h4 className="text-xs font-black uppercase text-amber-900 tracking-widest font-display">Scripture Chronology Spotlight</h4>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Empowering faith testimonies and motivational scriptures of verified Cathfluencers.</p>
            </div>
          </div>

          {memberScriptures.length > 0 && (
            <div className="flex items-center gap-1.5 self-end">
              <button
                onClick={handlePrevScripture}
                className="p-1 px-2.5 text-xs font-black uppercase bg-white border border-amber-500/10 hover:border-amber-500 text-amber-800 rounded-lg shadow-3xs cursor-pointer transition"
                title="Previous testimony"
              >
                ◀ Back
              </button>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200/50 rounded-md select-none">
                Dossier {activeScriptureIndex + 1} of {memberScriptures.length}
              </span>
              <button
                onClick={handleNextScripture}
                className="p-1 px-2.5 text-xs font-black uppercase bg-white border border-amber-500/10 hover:border-amber-500 text-amber-800 rounded-lg shadow-3xs cursor-pointer transition"
                title="Next testimony"
              >
                Next ▶
              </button>
            </div>
          )}
        </div>

        {/* Scripture Content Presentation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 space-y-4">
            <div className="relative">
              <span className="text-5xl text-amber-600/10 font-serif absolute -left-4 -top-6 select-none" id="holy-open-quote">“</span>
              <blockquote className="text-sm font-semibold italic text-slate-800 leading-relaxed pl-5 font-serif select-text">
                {displayedScripture.text}
              </blockquote>
              <span className="text-5xl text-amber-600/10 font-serif absolute right-0 bottom-0 leading-none select-none" id="holy-close-quote">”</span>
            </div>

            {/* Citation reference */}
            <div className="flex items-center gap-2 pl-5">
              <span className="h-0.5 w-6 bg-amber-500/80"></span>
              <span className="text-xs uppercase font-black text-amber-905 tracking-widest font-display">
                ✝ {displayedScripture.book} {displayedScripture.chapter ? `${displayedScripture.chapter}:${displayedScripture.verse || ''}` : ''}
              </span>
            </div>

            {/* Why inspiring explanation custom block */}
            <div className="bg-white/60 p-3.5 rounded-xl border border-amber-500/10 text-xs md:ml-5 leading-relaxed font-sans text-slate-650 shadow-3xs">
              <span className="text-[9px] uppercase font-black tracking-widest text-amber-805 block mb-1">Creators motivation &amp; calling</span>
              <p className="italic select-text">"{displayedScripture.why}"</p>
            </div>
          </div>

          {/* Sourced Author metadata card */}
          <div className="md:col-span-4 bg-white border border-amber-500/10 p-4 rounded-2xl flex flex-col justify-between h-full shadow-2xs">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2 select-none">Registrar Dossier Sourced</span>
              <p className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-1.5 leading-tight">{displayedScripture.name}</p>
              
              <div className="mt-3 space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-600">⛪</span>
                  <span className="truncate">{displayedScripture.parish || 'Saint Peter Secretariat'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600">🗺️</span>
                  <span className="truncate text-slate-500">{displayedScripture.diocese || 'Archdiocese of Madras-Mylapore'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-bold text-amber-805 bg-amber-50/50 p-2 rounded-lg">
              <span className="flex items-center gap-1">
                🏆 Evangelical Messenger
              </span>
              <span className="font-mono text-[9px] text-slate-450 uppercase">Cathfluencer</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
