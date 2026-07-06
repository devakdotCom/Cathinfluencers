import React, { useState, useEffect, FormEvent } from 'react';
import { Member, MemberStatus, MembershipClass, CustomField } from '../types';
import { X, Globe, Sparkles, BookOpen, User, MapPin, CheckCircle2, Bookmark, ChevronDown, Search, Upload, Image } from 'lucide-react';
import { ROMAN_CATHOLIC_CHURCHES_TN } from '../data/parishesList';
import { getParishesByDiocese, ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES } from '../data/diocesesParishes';
import { COLLEGE_COURSES_FLAT } from '../data/coursesList';
import { WORLD_PROFESSIONS_FLAT } from '../data/professionsList';
import { AVATAR_COLOR_PRESETS } from '../data/avatarColors';
import { useDialog } from './ui/DialogProvider';
import {
  draftBiography,
  type BiographyDrafts,
} from '../features/ai/biographyService';
import { DateInput } from './forms/DateInput';
import { useTranslation } from 'react-i18next';
import {
  isCloudinaryUploadConfigured,
  uploadProfileImage,
} from '../services/imageHosting';

// Constant Bible Quick Picks
const QUICK_VERSES: Record<string, string> = {
  'John 3:16': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  'Jeremiah 29:11': '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
  'Philippians 4:13': 'I can do all this through him who gives me strength.',
  'Psalm 23:1': 'The Lord is my shepherd, I lack nothing.',
  'Romans 8:28': 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
  'Matthew 5:9': 'Blessed are the peacemakers, for they will be called children of God.',
  'Isaiah 40:31': 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.',
  'Proverbs 3:5-6': 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
  '1 Corinthians 13:13': 'And now these three remain: faith, hope and love. But the greatest of these is love.',
  'Matthew 28:19': 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.'
};

const CREATIVE_TECH_SKILLS = [
  "Video Editing", "Graphic Design", "Photography", "Videography", 
  "Social Media Management", "Content Writing & Blogging", "Podcast Hosting", 
  "Public Speaking", "Event Planning & Organizing", "Music Production & Editing", 
  "Scriptwriting & Storyboarding", "Digital Marketing & SEO", "UI/UX Design", 
  "Website Development", "Live Streaming & Hosting", "Data Analytics", "Illustration & Digital Art"
];

const SOFT_SKILLS_LIST = [
  "Leadership", "Teamwork", "Communication", "Creativity", "Problem-Solving", 
  "Adaptability", "Empathy", "Networking", "Time Management", "Critical Thinking", "Multitasking"
];

const WORLDWIDE_DREAM_AMBITIONS = [
  // Catholic & Apostolic
  "Catholic Leader & Evangelizer",
  "Catechist & Faith Educator",
  "Youth Mentor & Animator",
  "Catholic Content Creator & Podcaster",
  "Parish Ministry Coordinator",
  "Social Entrepreneur & Community Builder",
  "Missionary & Outreach Worker",
  "Digital Evangelist & Media Producer",
  "Liturgy & Sacred Music Director",
  "Apostolic Writer & Journalist",
  "Apologist & Faith Defender",
  // Professional & Technical
  "Software Engineer & Tech Leader",
  "AI & Data Science Specialist",
  "Web Developer & UI/UX Designer",
  "Cloud Solutions Architect",
  "Teacher & School Educator",
  "Professor & Academic Researcher",
  "Doctor & Medical Practitioner",
  "Nurse & Healthcare Worker",
  "Business Consultant & Entrepreneur",
  "Marketing Analyst & Manager",
  "Human Resources Specialist",
  "Financial Analyst & Accountant",
  "Social Worker & Humanitarian",
  // Creative & Artistic
  "Professional Video Editor & Filmmaker",
  "Graphic Designer & Illustrator",
  "Music Producer & Sound Engineer",
  "Public Speaker & Coach",
  "Author & Creative Writer",
  "Professional Photographer & Videographer",
  "Singer & Recording Artist",
  "Chef & Culinary Entrepreneur"
];

const WORLDWIDE_HOBBIES = [
  // Spiritual & Intellectual
  "Reading Spiritual Books & Theology",
  "Apologetics & Scripture Study",
  "Faith-Based Writing & Blogging",
  "Volunteering & Social Ministry",
  "Catechism & Teaching Children",
  "Pilgrimage & Sacred Art Travel",
  // Creative & Artistic
  "Playing Keyboard / Piano",
  "Playing Violin & Classical Music",
  "Playing Acoustic Guitar",
  "Baking & Culinary Arts",
  "Photography & Editing",
  "Videography & Short Films",
  "Painting, Sketching & Calligraphy",
  "Graphic Designing & Digital Art",
  "Podcast Hosting & Speaking",
  "Music Production & Songwriting",
  // Active, Sports & Outdoors
  "Playing Badminton & Tennis",
  "Playing Chess & Board Games",
  "Gardening & Floriculture",
  "Sustainable Living & Organic Farming",
  "Hiking & Nature Exploration",
  "Cooking & Gastronomy",
  "Running & Marathon Training",
  "Swimming & Athletics",
  "Table Tennis & Billiards",
  "Martial Arts & Self-Defense"
];

interface MemberFormProps {
  member: Member | null; // null if adding new member
  onClose: () => void;
  onSave: (member: Member) => void;
}

type FormTab = 'identity' | 'location' | 'socials' | 'scripture' | 'pledge';

export default function MemberForm({ member, onClose, onSave }: MemberFormProps) {
  const dialog = useDialog();
  const { t } = useTranslation();
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('identity');

  // Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullNameTa, setFullNameTa] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ta'>('en');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('Unmarried');
  const [bloodGroup, setBloodGroup] = useState('');
  const [diocese, setDiocese] = useState('');
  const [parish, setParish] = useState('');
  const [showParishDropdown, setShowParishDropdown] = useState(false);
  const [parishPriest, setParishPriest] = useState('');
  const [country, setCountry] = useState('India');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [education, setEducation] = useState('');
  const [showEduDropdown, setShowEduDropdown] = useState(false);
  const [profession, setProfession] = useState('');
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [igPages, setIgPages] = useState('');
  const [fbPages, setFbPages] = useState('');
  const [ytChannels, setYtChannels] = useState('');
  const [ambition, setAmbition] = useState('');
  const [biographyDraft, setBiographyDraft] = useState('');
  const [biographyDrafts, setBiographyDrafts] = useState<BiographyDrafts | null>(null);
  const [biographyFeedback, setBiographyFeedback] = useState('');
  const [isDraftingBiography, setIsDraftingBiography] = useState(false);
  const [showAmbitionDropdown, setShowAmbitionDropdown] = useState(false);
  const [hobbies, setHobbies] = useState('');
  const [showHobbiesDropdown, setShowHobbiesDropdown] = useState(false);
  const [fiveYears, setFiveYears] = useState('');
  const [achievements, setAchievements] = useState('');
  const [ideas, setIdeas] = useState('');
  const [roles, setRoles] = useState('');

  // Scripture Quote Fields
  const [bibleBook, setBibleBook] = useState('');
  const [bibleChapter, setBibleChapter] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [bibleVerseText, setBibleVerseText] = useState('');
  const [bibleVerseWhy, setBibleVerseWhy] = useState('');

  // Checklists
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [support, setSupport] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('Weekly');
  const [mode, setMode] = useState('Both');

  // Administrative / General
  const [status, setStatus] = useState<MemberStatus>('Pending');
  const [avatarUrl, setAvatarUrl] = useState('bg-indigo-500');
  const [notes, setNotes] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [photoURL, setPhotoURL] = useState('');
  const [voxUserId, setVoxUserId] = useState('');

  // Pledges
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const [p3, setP3] = useState(false);
  const [p4, setP4] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Hydrate fields if editing existing member
  useEffect(() => {
    if (member) {
      setFirstName(member.firstName || '');
      setLastName(member.lastName || '');
      setFullNameTa(member.fullNameTa || '');
      setPreferredLanguage(member.preferredLanguage || 'en');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setDob(member.dob || '');
      setGender(member.gender || 'Select…');
      setRelationship(member.relationship || 'Unmarried');
      setBloodGroup(member.bloodGroup || '');
      setDiocese(member.diocese || '');
      setParish(member.parish || '');
      setParishPriest(member.parishPriest || '');
      setCountry(member.country || 'India');
      setCurrentAddress(member.currentAddress || '');
      setPermanentAddress(member.permanentAddress || '');
      setEducation(member.education || '');
      setProfession(member.profession || '');
      setInstagram(member.instagram || '');
      setFacebook(member.facebook || '');
      setIgPages(member.igPages || '');
      setFbPages(member.fbPages || '');
      setYtChannels(member.ytChannels || '');
      setAmbition(member.ambition || '');
      setBiographyDraft(member.biographyDraft || '');
      setBiographyDrafts(member.biographyDrafts
        ? { ...member.biographyDrafts, source: 'ai' }
        : null);
      setHobbies(member.hobbies || '');
      setFiveYears(member.fiveYears || '');
      setAchievements(member.achievements || '');
      setIdeas(member.ideas || '');
      setRoles(member.roles || '');

      setBibleBook(member.bibleBook || '');
      setBibleChapter(member.bibleChapter || '');
      setBibleVerse(member.bibleVerse || '');
      setBibleVerseText(member.bibleVerseText || '');
      setBibleVerseWhy(member.bibleVerseWhy || '');

      setTechSkills(member.techSkills || []);
      setSoftSkills(member.softSkills || []);
      setGoals(member.goals || []);
      setSupport(member.support || []);
      setFrequency(member.frequency || 'Weekly');
      setMode(member.mode || 'Both');

      setStatus(member.status);
      setAvatarUrl(member.avatarUrl);
      setPhotoURL(member.photoURL || '');
      setNotes(member.notes || '');
      setCustomFields(member.customFields || []);
      setVoxUserId(member.voxUserId || `${member.firstName.trim().replace(/[\s\W]+/g, '')}_${member.lastName.trim().replace(/[\s\W]+/g, '')}@vox.in`);

      setP1(member.pledgesAccepted);
      setP2(member.pledgesAccepted);
      setP3(member.pledgesAccepted);
      setP4(member.pledgesAccepted);
    }
  }, [member]);

  useEffect(() => {
    if (!member) {
      const fClean = firstName.trim().replace(/[\s\W]+/g, '');
      const lClean = lastName.trim().replace(/[\s\W]+/g, '');
      setVoxUserId(fClean || lClean ? `${fClean}_${lClean}@vox.in` : '');
    }
  }, [firstName, lastName, member]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    try {
      setErrorMsg('Uploading profile image...');
      setPhotoURL(await uploadProfileImage(file));
      setErrorMsg('');
    } catch (error) {
      console.error('Profile image upload failed:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Image upload failed.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handlePhotoUpload(e.target.files[0]);
    }
  };

  const getInitials = () => {
    const fnChar = firstName ? firstName.trim().charAt(0) : '';
    const lnChar = lastName ? lastName.trim().charAt(0) : '';
    return `${fnChar}${lnChar}`.toUpperCase() || 'CF';
  };

  const handleTechSkillToggle = (val: string) => {
    setTechSkills(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleSoftSkillToggle = (val: string) => {
    setSoftSkills(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleGoalToggle = (val: string) => {
    setGoals(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleSupportToggle = (val: string) => {
    setSupport(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleQuickVerseSelect = (ref: string) => {
    const parts = ref.match(/^([\w\s]+)\s(\d+):(\d+(?:-\d+)?)$/);
    if (parts) {
      setBibleBook(parts[1].trim());
      setBibleChapter(parts[2]);
      setBibleVerse(parts[3]);
    }
    if (QUICK_VERSES[ref]) {
      setBibleVerseText(QUICK_VERSES[ref]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First Name and Last Name are required.');
      setActiveFormTab('identity');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please specify a valid email address.');
      setActiveFormTab('identity');
      return;
    }

    if (!parish.trim() || !diocese) {
      setErrorMsg('Please enter your Parish Church name and select your Diocese.');
      setActiveFormTab('location');
      return;
    }

    if (!p1 || !p2 || !p3 || !p4) {
      setErrorMsg('You must sign and accept all covenant pledges before filing the affiliation.');
      setActiveFormTab('pledge');
      return;
    }

    const resolvedPhotoURL = photoURL.trim();

    const savedMember: Member = {
      id: member ? member.id : `CF-${crypto.randomUUID()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      fullNameTa: fullNameTa.trim() || undefined,
      preferredLanguage,
      email: email.trim(),
      phone: phone.trim(),
      dob,
      gender,
      relationship,
      bloodGroup,
      diocese,
      parish: parish.trim(),
      parishPriest: parishPriest.trim(),
      country,
      currentAddress: currentAddress.trim(),
      permanentAddress: permanentAddress.trim() || currentAddress.trim(),
      education: education.trim(),
      profession: profession.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      igPages: igPages.trim(),
      fbPages: fbPages.trim(),
      ytChannels: ytChannels.trim(),
      ambition: ambition.trim(),
      biographyDraft: biographyDraft.trim() || undefined,
      biographyDrafts: biographyDrafts
        ? {
            short: biographyDrafts.short.trim(),
            professional: biographyDrafts.professional.trim(),
            ministry: biographyDrafts.ministry.trim(),
            tamil: biographyDrafts.tamil.trim(),
          }
        : undefined,
      hobbies: hobbies.trim(),
      fiveYears: fiveYears.trim(),
      achievements: achievements.trim(),
      ideas: ideas.trim(),
      roles: roles.trim(),
      bibleBook: bibleBook.trim(),
      bibleChapter: bibleChapter.trim(),
      bibleVerse: bibleVerse.trim(),
      bibleVerseText: bibleVerseText.trim(),
      bibleVerseWhy: bibleVerseWhy.trim(),
      techSkills,
      softSkills,
      goals,
      support,
      frequency,
      mode,
      photoURL: resolvedPhotoURL,
      pledgesAccepted: p1 && p2 && p3 && p4,
      joinedDate: member ? member.joinedDate : new Date().toISOString().substring(0, 10),
      status,
      avatarUrl,
      notes: notes.trim(),
      customFields,
      address: member ? member.address : {
        street: currentAddress.trim(),
        city: parish.trim(),
        state: diocese,
        zipCode: '',
        country: country
      },
      membershipClass: member ? member.membershipClass : 'Active',
      voxUserId: voxUserId.trim() ? (voxUserId.trim().endsWith('@vox.in') ? voxUserId.trim() : voxUserId.trim() + '@vox.in') : `${firstName.trim().replace(/[\s\W]+/g, '')}_${lastName.trim().replace(/[\s\W]+/g, '')}@vox.in`,
      lastActive: new Date().toISOString()
    };

    onSave(savedMember);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-0 md:p-4 z-50 overflow-y-auto" id="member-form-overlay">
      <div 
        className="bg-white rounded-none md:rounded-xl w-full max-w-3xl border-0 md:border border-slate-200 flex flex-col shadow-xl h-[100dvh] md:h-auto md:max-h-[90vh] overflow-hidden animate-fade-in"
        id="member-form-container"
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-4 py-3 md:p-5 text-white flex justify-between items-center flex-shrink-0 border-b border-amber-500/25 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs md:text-sm font-bold font-display uppercase tracking-wider text-white">
              {member ? 'Modify Cathfluencer Particulars' : 'Apply for Vox Ecclesiae Affiliation'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
            id="btn-close-form-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Wizard Selectors */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex space-x-1 overflow-x-auto select-none flex-shrink-0">
          {(['identity', 'location', 'socials', 'scripture', 'pledge'] as FormTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFormTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${activeFormTab === tab ? 'bg-slate-900 text-amber-200' : 'text-slate-550 hover:bg-slate-100'}`}
            >
              {tab === 'identity' && '👤 Personal'}
              {tab === 'location' && '📍 Church & Res'}
              {tab === 'socials' && '📱 Digital Space'}
              {tab === 'scripture' && '📖 Faith & Skills'}
              {tab === 'pledge' && '🤝 Pledge & Sign'}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden" id="member-payload-form">
          <div className="overflow-y-auto p-4 md:p-8 space-y-6 flex-grow">
            
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 text-xs font-bold" id="form-error-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* TAB 1: Particulars */}
            {activeFormTab === 'identity' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center">
                  <User className="w-4 h-4 mr-1 text-slate-900" />
                  Primary Identity particulars
                </h4>

                {/* Profile Photo Upload Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center" id="photo-upload-container">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    {photoURL ? (
                      <div className="relative group w-20 h-20">
                        <img 
                          src={photoURL} 
                          alt="Profile Preview" 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoURL('')}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className={`w-20 h-20 rounded-full ${avatarUrl || 'bg-slate-400'} flex items-center justify-center text-white text-2xl font-black shadow-inner border border-slate-200 uppercase`}>
                        {getInitials()}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Preview</span>
                  </div>

                  <div className="flex-grow w-full space-y-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                    
                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1.5 ${dragActive ? 'bg-amber-50/50 border-amber-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                      id="photo-drag-zone"
                    >
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="photo-file-input"
                      />
                      <Upload className={`w-5 h-5 ${dragActive ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-slate-700">
                        {dragActive ? 'Drop your image file here' : 'Drag & drop image file or click to browse'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports JPG, PNG, WebP up to 2MB
                        {isCloudinaryUploadConfigured() ? ' via free Cloudinary hosting' : ''}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="photo-url-input" className="block text-[10px] font-bold text-slate-500 mb-1">
                        Or paste an HTTPS image URL
                      </label>
                      <input
                        id="photo-url-input"
                        type="url"
                        inputMode="url"
                        value={photoURL}
                        onChange={(event) => setPhotoURL(event.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Firestore stores only the HTTPS image URL, never the image file or Base64 data.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Maria J"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Bosco"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      Tamil Display Name
                    </label>
                    <input
                      type="text"
                      lang="ta"
                      value={fullNameTa}
                      onChange={(event) => setFullNameTa(event.target.value)}
                      placeholder="தமிழ் பெயர்"
                      className="w-full min-h-11 text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(event) => setPreferredLanguage(event.target.value as 'en' | 'ta')}
                      className="w-full min-h-11 text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ்</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Email Coordinates *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="catholicCreator@gmail.com"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">WhatsApp Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9840XXXXXX"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Create Vox User ID *</label>
                  <div className="flex rounded-lg shadow-xs">
                    <input
                      type="text"
                      required
                      value={voxUserId}
                      onChange={(e) => setVoxUserId(e.target.value)}
                      placeholder="FirstName_LastName@vox.in"
                      className="w-full text-xs p-3 bg-amber-500/5 focus:bg-white border border-amber-500/30 focus:border-amber-500 rounded-lg outline-none font-mono font-bold text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Dedicated identity identifier (defaults to FirstName_LastName@vox.in, must end with @vox.in)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DateInput
                    className="md:col-span-2"
                    label={t('form.dateOfBirth')}
                    value={dob}
                    onChange={setDob}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
                    >
                      <option value="">Choose…</option>
                      <option>A +ve</option><option>A -ve</option><option>B +ve</option><option>B -ve</option>
                      <option>O +ve</option><option>O -ve</option><option>AB +ve</option><option>AB -ve</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                    >
                      <option value="">Choose…</option>
                      <option>Male</option><option>Female</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                    >
                      <option>Unmarried</option><option>Married</option><option>Celibate</option>
                    </select>
                  </div>
                  {/* Admin notes Status and Preset avatar choosing (visible in admin view) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Status Mode</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MemberStatus)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold text-purple-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Affiliated">Affiliated</option>
                      <option value="Abdicated">Abdicated</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Church & Location */}
            {activeFormTab === 'location' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-slate-900" />
                  Worship parish & Residence addresses
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Diocese *</label>
                    <select
                      required
                      value={diocese}
                      onChange={(e) => setDiocese(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
                    >
                      <option value="">Select Diocese…</option>
                      <option>Archdiocese of Madras – Mylapore</option>
                      <option>Diocese of Chengalpattu</option>
                      <option>Diocese of Tuticorin</option>
                      <option>Diocese of Vellore</option>
                      <option>Diocese of Salem</option>
                      <option>Diocese of Dharmapuri</option>
                      <option>Diocese of Coimbatore</option>
                      <option>Diocese of Ootacamund (Ooty)</option>
                      <option>Diocese of Tiruchirapalli (Trichy)</option>
                      <option>Diocese of Thanjavur</option>
                      <option>Diocese of Dindigul</option>
                      <option>Diocese of Sivagangai</option>
                      <option>Diocese of Palayamkottai</option>
                      <option>Diocese of Kottar</option>
                      <option>Other Dioceses</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Parish Name with Location *</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={parish}
                        onChange={(e) => {
                          setParish(e.target.value);
                          setShowParishDropdown(true);
                        }}
                        onFocus={() => setShowParishDropdown(true)}
                        onBlur={() => {
                          // safe timeout to allow clicking and selecting suggestions
                          setTimeout(() => setShowParishDropdown(false), 250);
                        }}
                        placeholder="Search or type Parish name..."
                        className="w-full text-xs p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                        id="form-parish-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParishDropdown(!showParishDropdown)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        id="toggle-parish-dropdown"
                      >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showParishDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showParishDropdown && (() => {
                      // Get diocese-based parishes or default to full RC list
                      const matchesDiocese = !!diocese;
                      const dioceseParishes = matchesDiocese ? getParishesByDiocese(diocese) : [];
                      
                      // Filter lists based on text search
                      const formatParishLabel = (item: { name: string; location?: string }) => 
                        item.location ? `${item.name} – ${item.location}` : item.name;

                      let searchResults: Array<{ name: string; location?: string; deanery?: string; formattedName: string }> = [];

                      if (matchesDiocese && dioceseParishes.length > 0) {
                        searchResults = dioceseParishes
                          .map(p => ({ ...p, formattedName: formatParishLabel(p) }))
                          .filter(p => p.formattedName.toLowerCase().includes(parish.toLowerCase()));
                      } else {
                        // Fallback to plain text list
                        searchResults = ROMAN_CATHOLIC_CHURCHES_TN
                          .map(p => ({ name: p, formattedName: p }))
                          .filter(p => p.formattedName.toLowerCase().includes(parish.toLowerCase()));
                      }

                      // Group diocese parishes alphabetically by location if we have diocese data
                      let renderedElements: React.ReactNode[] = [];

                      if (matchesDiocese && dioceseParishes.length > 0) {
                        // Alphabetical grouping logic by location's first letter
                        const sectionsMap: Record<string, typeof searchResults> = {};
                        searchResults.forEach(item => {
                          const loc = item.location || "";
                          const firstLetter = loc.trim().charAt(0).toUpperCase();
                          let sectionKey = "Other Locations";
                          if (firstLetter >= 'W' && firstLetter <= 'Z') {
                            sectionKey = "W – Z";
                          } else if (firstLetter >= 'A' && firstLetter <= 'V') {
                            sectionKey = firstLetter;
                          }
                          
                          if (!sectionsMap[sectionKey]) {
                            sectionsMap[sectionKey] = [];
                          }
                          sectionsMap[sectionKey].push(item);
                        });

                        // Sort the section keys alphabetically (A-V, then W-Z, then Other Locations)
                        const sortedKeys = Object.keys(sectionsMap).sort((a, b) => {
                          if (a === "W – Z") return 1;
                          if (b === "W – Z") return -1;
                          if (a === "Other Locations") return 1;
                          if (b === "Other Locations") return -1;
                          return a.localeCompare(b);
                        });

                        sortedKeys.forEach((sectionName) => {
                          renderedElements.push(
                            <div key={sectionName} className="bg-slate-100/80 px-3 py-1.5 text-[10px] font-bold text-amber-900 tracking-wider font-sans uppercase">
                              📌 {sectionName}
                            </div>
                          );
                          
                          // Sort items within each active section alphabetically by location, then name
                          const sortedItems = [...sectionsMap[sectionName]].sort((a, b) => {
                            const locA = a.location || "";
                            const locB = b.location || "";
                            if (locA !== locB) {
                              return locA.localeCompare(locB);
                            }
                            return a.name.localeCompare(b.name);
                          });

                          sortedItems.forEach((item) => {
                            renderedElements.push(
                              <button
                                key={item.formattedName}
                                type="button"
                                onClick={() => {
                                  setParish(item.formattedName);
                                  setShowParishDropdown(false);
                                }}
                                className="w-full text-left px-5 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                              >
                                <span className="text-amber-500 text-[10px]">⛪</span>
                                <span className="font-medium">{item.name}</span>
                                {item.location && (
                                  <span className="text-slate-400 text-[11px] font-normal italic ml-auto">— {item.location}</span>
                                )}
                              </button>
                            );
                          });
                        });
                      } else {
                        // Single list of parishes mapping for flat static lists
                        searchResults.forEach((item) => {
                          renderedElements.push(
                            <button
                              key={item.formattedName}
                              type="button"
                              onClick={() => {
                                setParish(item.formattedName);
                                  setShowParishDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-amber-500 text-[10px]">⛪</span>
                              <span className="font-medium">{item.name}</span>
                              {item.location && (
                                <span className="text-slate-400 text-[11px] font-normal italic ml-auto">— {item.location}</span>
                              )}
                            </button>
                          );
                        });
                      }

                      return (
                        <div 
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100" 
                          id="parish-combobox-dropdown"
                        >
                          {renderedElements.length > 0 ? (
                            renderedElements
                          ) : (
                            <div className="px-4 py-3 text-xs text-slate-500 italic flex flex-col gap-1">
                              <span>No exact match found in registry.</span>
                              <span className="text-[10px] text-slate-400 font-sans">Keep typing your custom Parish Name to save it below!</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Name of Parish Priest</label>
                    <input
                      type="text"
                      value={parishPriest}
                      onChange={(e) => setParishPriest(e.target.value)}
                      placeholder="e.g. Rev. Fr. Lawrence Raj PJ"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Country of Residence *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Current Living Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="e.g. No. 8A, SRM Garden 2nd Cross, J.B. Estate, Avadi, Chennai – 600054"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Permanent Address</label>
                  <input
                    type="text"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="leave empty if same as current living address"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Social Handle Portals */}
            {activeFormTab === 'socials' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center">
                  <Globe className="w-4 h-4 mr-1 text-slate-900" />
                  Social media links & Education details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Instagram ID</label>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 items-center">
                      <span className="bg-slate-200 p-2.5 text-xs text-slate-650 font-semibold border-r border-gray-200 select-none">instagram.com/</span>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="your_handle"
                        className="flex-1 text-xs p-2 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Facebook Profile link</label>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 items-center">
                      <span className="bg-slate-200 p-2.5 text-xs text-slate-650 font-semibold border-r border-gray-200 select-none">facebook.com/</span>
                      <input
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="your.profile"
                        className="flex-1 text-xs p-2 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Educational Level (college)</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => {
                          setEducation(e.target.value);
                          setShowEduDropdown(true);
                        }}
                        onFocus={() => setShowEduDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowEduDropdown(false), 250);
                        }}
                        placeholder="Search or type Degree/Course..."
                        className="w-full text-xs p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                        id="form-education-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEduDropdown(!showEduDropdown)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        id="toggle-education-dropdown"
                      >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showEduDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showEduDropdown && (
                      <div 
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100" 
                        id="education-combobox-dropdown"
                      >
                        {COLLEGE_COURSES_FLAT.filter(c => 
                          c.toLowerCase().includes(education.toLowerCase())
                        ).length > 0 ? (
                          COLLEGE_COURSES_FLAT.filter(c => 
                            c.toLowerCase().includes(education.toLowerCase())
                          ).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setEducation(item);
                                setShowEduDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-emerald-500 text-[10px]">🎓</span>
                              <span className="font-medium">{item}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500 italic flex flex-col gap-1">
                            <span>No exact match found in registry.</span>
                            <span className="text-[10px] text-slate-400 font-sans">Keep typing your custom course/degree to save it!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Current Profession</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => {
                          setProfession(e.target.value);
                          setShowProfDropdown(true);
                        }}
                        onFocus={() => setShowProfDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowProfDropdown(false), 250);
                        }}
                        placeholder="Search or type Current Profession..."
                        className="w-full text-xs p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                        id="form-profession-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfDropdown(!showProfDropdown)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        id="toggle-profession-dropdown"
                      >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showProfDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showProfDropdown && (
                      <div 
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100" 
                        id="profession-combobox-dropdown"
                      >
                        {WORLD_PROFESSIONS_FLAT.filter(p => 
                          p.toLowerCase().includes(profession.toLowerCase())
                        ).length > 0 ? (
                          WORLD_PROFESSIONS_FLAT.filter(p => 
                            p.toLowerCase().includes(profession.toLowerCase())
                          ).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setProfession(item);
                                setShowProfDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-amber-500 text-[10px]">💼</span>
                              <span className="font-medium">{item}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500 italic flex flex-col gap-1">
                            <span>No exact match found in registry.</span>
                            <span className="text-[10px] text-slate-400 font-sans">Keep typing your custom profession to save it!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Instagram Pages You Admin</label>
                    <input
                      type="text"
                      value={igPages}
                      onChange={(e) => setIgPages(e.target.value)}
                      placeholder="e.g. avadi_stantonys_shrine, madhamedia (comma separated)"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Facebook Pages You Admin</label>
                      <input
                        type="text"
                        value={fbPages}
                        onChange={(e) => setFbPages(e.target.value)}
                        placeholder="e.g. catholic_creators_tamil"
                        className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">YouTube Channels You Manage</label>
                      <input
                        type="text"
                        value={ytChannels}
                        onChange={(e) => setYtChannels(e.target.value)}
                        placeholder="e.g. VoxEcclesiaeLive, ParishRadio"
                        className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Scripture Verses & Tech Skills */}
            {activeFormTab === 'scripture' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1 text-slate-900" />
                  The Book that guides your steps
                </h4>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 block w-full uppercase tracking-widest">Scripture Quick Picker (fills fields):</span>
                  {Object.keys(QUICK_VERSES).map(ref => (
                    <button
                      key={ref}
                      type="button"
                      onClick={() => handleQuickVerseSelect(ref)}
                      className="text-[10px] font-bold font-display bg-white px-2 py-1 border border-slate-250 hover:bg-slate-900 hover:text-amber-200 rounded"
                    >
                      {ref}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Bible Book Reference *</label>
                    <input
                      type="text"
                      required
                      value={bibleBook}
                      onChange={(e) => setBibleBook(e.target.value)}
                      placeholder="e.g. Philippians"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Chapter</label>
                    <input
                      type="text"
                      value={bibleChapter}
                      onChange={(e) => setBibleChapter(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Verse</label>
                    <input
                      type="text"
                      value={bibleVerse}
                      onChange={(e) => setBibleVerse(e.target.value)}
                      placeholder="e.g. 13"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Verse Quote text</label>
                  <textarea
                    rows={2}
                    value={bibleVerseText}
                    onChange={(e) => setBibleVerseText(e.target.value)}
                    placeholder="Type the actual text quote..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none italic leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Why does this verse inspire you?</label>
                  <input
                    type="text"
                    value={bibleVerseWhy}
                    onChange={(e) => setBibleVerseWhy(e.target.value)}
                    placeholder="Share what this sentence means to your faith walk..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-600 mb-1 uppercase tracking-widest border-b border-gray-100 pb-1.5">Creative &amp; Technical tools</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CREATIVE_TECH_SKILLS.map(skill => {
                        const isChecked = techSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleTechSkillToggle(skill)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all transform cursor-pointer border ${isChecked ? 'bg-slate-900 text-amber-400 border-slate-900 scale-102' : 'bg-slate-50 border-slate-200 text-slate-550'}`}
                          >
                            {isChecked ? '★ ' : ''}{skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-600 mb-1 uppercase tracking-widest border-b border-gray-100 pb-1.5">Mental Soft Skills</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SOFT_SKILLS_LIST.map(skill => {
                        const isChecked = softSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSoftSkillToggle(skill)}
                            className={`px-3 py-1 rounded-full text-[11px] transition cursor-pointer border ${isChecked ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-555'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Dream Ambition *</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={ambition}
                        onChange={(e) => {
                          setAmbition(e.target.value);
                          setShowAmbitionDropdown(true);
                        }}
                        onFocus={() => setShowAmbitionDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowAmbitionDropdown(false), 250);
                        }}
                        placeholder="What is your creative or apostolic dream?"
                        className="w-full text-xs p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAmbitionDropdown(!showAmbitionDropdown)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showAmbitionDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showAmbitionDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
                        {WORLDWIDE_DREAM_AMBITIONS.filter(a => 
                          a.toLowerCase().includes(ambition.toLowerCase())
                        ).length > 0 ? (
                          WORLDWIDE_DREAM_AMBITIONS.filter(a => 
                            a.toLowerCase().includes(ambition.toLowerCase())
                          ).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setAmbition(item);
                                setShowAmbitionDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-amber-500 text-[10px]">✨</span>
                              <span className="font-medium">{item}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500 italic flex flex-col gap-1">
                            <span>No exact match found.</span>
                            <span className="text-[10px] text-slate-400 font-sans">Keep typing your custom ambition to save it!</span>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isDraftingBiography || !firstName.trim() || !ambition.trim()}
                      onClick={async () => {
                        setIsDraftingBiography(true);
                        setBiographyFeedback('');
                        setErrorMsg('');
                        try {
                          const drafts = await draftBiography({
                            name: `${firstName} ${lastName}`.trim(),
                            parish,
                            diocese,
                            profession,
                            ambition,
                            ministry: roles,
                            experience: fiveYears || achievements,
                            interests: hobbies,
                            skills: techSkills,
                          });
                          setBiographyDrafts(drafts);
                          setBiographyDraft(drafts.ministry);
                          setBiographyFeedback(
                            drafts.source === 'ai'
                              ? t('form.biographyReady')
                              : t('form.biographyFallback'),
                          );
                        } catch (error) {
                          console.error('Biography drafting failed:', error);
                          setErrorMsg('Biography drafting could not be completed. Please try again.');
                        } finally {
                          setIsDraftingBiography(false);
                        }
                      }}
                      className="mt-2 min-h-11 rounded-xl border border-amber-300 bg-amber-50 px-3 text-[10px] font-black uppercase tracking-wide text-amber-800 disabled:opacity-50"
                    >
                      {isDraftingBiography ? t('form.drafting') : t('form.draftWithAI')}
                    </button>
                    {biographyFeedback && (
                      <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">
                        {biographyFeedback}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Hobbies *</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={hobbies}
                        onChange={(e) => {
                          setHobbies(e.target.value);
                          setShowHobbiesDropdown(true);
                        }}
                        onFocus={() => setShowHobbiesDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowHobbiesDropdown(false), 250);
                        }}
                        placeholder="e.g. Violin, Photography, Apologetics"
                        className="w-full text-xs p-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowHobbiesDropdown(!showHobbiesDropdown)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showHobbiesDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showHobbiesDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
                        {WORLDWIDE_HOBBIES.filter(h => 
                          h.toLowerCase().includes(hobbies.toLowerCase())
                        ).length > 0 ? (
                          WORLDWIDE_HOBBIES.filter(h => 
                            h.toLowerCase().includes(hobbies.toLowerCase())
                          ).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setHobbies(item);
                                setShowHobbiesDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 transition font-sans flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-emerald-500 text-[10px]">🌸</span>
                              <span className="font-medium">{item}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500 italic flex flex-col gap-1">
                            <span>No exact match found.</span>
                            <span className="text-[10px] text-slate-400 font-sans">Keep typing your custom hobbies to save it!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t('form.reviewBeforeSubmit')}
                  </p>
                  {(biographyDrafts
                    ? [
                        ['short', t('form.shortBio')],
                        ['professional', t('form.professionalBio')],
                        ['ministry', t('form.ministryBio')],
                        ['tamil', t('form.tamilBio')],
                      ] as const
                    : [['ministry', t('form.ministryBio')] as const]
                  ).map(([field, label]) => (
                    <label key={field} className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {label}
                      </span>
                      <textarea
                        value={biographyDrafts ? biographyDrafts[field] : biographyDraft}
                        lang={field === 'tamil' ? 'ta' : 'en'}
                        onChange={event => {
                          if (!biographyDrafts) {
                            setBiographyDraft(event.target.value);
                            return;
                          }
                          const value = event.target.value;
                          setBiographyDrafts(current => current ? { ...current, [field]: value } : current);
                          if (field === 'ministry') setBiographyDraft(value);
                        }}
                        rows={field === 'short' ? 2 : 4}
                        maxLength={5000}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Pledges & Onboarding Expectations */}
            {activeFormTab === 'pledge' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-slate-900" />
                  Spiritual commitments & Expectations
                </h4>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 p-4">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Expected Support from the Commission</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Training & Workshops", "Technical Assistance", "Content Ideas & Resources", 
                      "Promotion & Exposure", "Guidance on Faith Content", "Networking with Other Creators"
                    ].map(sup => {
                      const isChecked = support.includes(sup);
                      return (
                        <button
                          key={sup}
                          type="button"
                          onClick={() => handleSupportToggle(sup)}
                          className={`text-slate-650 cursor-pointer border px-3 py-1.5 rounded-lg text-left text-[11px] font-semibold transition ${isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-850' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                        >
                          {isChecked ? '🔵 ' : '⚪ '}{sup}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 p-4">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">What do you hope to gain?</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Spiritual Growth", "Community & Networking1", "Skill Development", 
                      "Opportunities to Collaborate", "Mentorship & Guidance", "Recognition & Visibility", "Evangelization & Outreach"
                    ].map(g => {
                      const isChecked = goals.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleGoalToggle(g)}
                          className={`text-slate-650 cursor-pointer border px-3 py-1.5 rounded-lg text-left text-[11px] font-semibold transition ${isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-850' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                        >
                          {isChecked ? '🔵 ' : '⚪ '}{g.replace('1','')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Engagement Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
                    >
                      <option>Weekly</option><option>Bi-Weekly</option><option>Monthly</option><option>Occasionally</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Preferred Participation mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
                    >
                      <option>Both</option><option>Online</option><option>In Person</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Ideas / Suggestion for Vox Ecclesiae</label>
                    <input
                      type="text"
                      value={ideas}
                      onChange={(e) => setIdeas(e.target.value)}
                      placeholder="e.g. Organizing a Diocesan Hackathon, Creative Vlogs"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Roles or Responsibilities you'd love to take</label>
                    <input
                      type="text"
                      value={roles}
                      onChange={(e) => setRoles(e.target.value)}
                      placeholder="e.g. Choral Master, Live Stream tech, Graphic Artist"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mt-4">Required Volunteer Covenant Pledges</span>
                <div className="space-y-2" id="pledges-checkboxes-deck">
                  <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={p1} onChange={(e) => setP1(e.target.checked)} className="mt-0.5" />
                    <span><strong>✝ Service:</strong> I agree to serve the Catholic Church through media initiatives under Church leadership guidelines.</span>
                  </label>
                  <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={p2} onChange={(e) => setP2(e.target.checked)} className="mt-0.5" />
                    <span><strong>✝ Ministry:</strong> I commit to assisting parishes, visiting, and photographing ecclesiastical activities.</span>
                  </label>
                  <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={p3} onChange={(e) => setP3(e.target.checked)} className="mt-0.5" />
                    <span><strong>✝ Moral Obedience:</strong> I pledge to live an exemplary Catholic Christian life in sync with the Archbishop instructions.</span>
                  </label>
                  <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={p4} onChange={(e) => setP4(e.target.checked)} className="mt-0.5" />
                    <span><strong>✝ Data Privacy:</strong> I authorize Vox Ecclesiae to analyze provided metrics confidently for ministry analysis.</span>
                  </label>
                </div>
              </div>
            )}

            {/* General Admin Notes and Custom Attribute Columns (Always editable in Scripture tab) */}
            {activeFormTab === 'scripture' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Moderation Notes / Remarks (Admin only)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Include credentials, recommendation source, etc."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Fixed Save Footer */}
          <div className="p-3 md:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-50 border-t border-slate-200 flex justify-between space-x-3 flex-shrink-0 animate-fade-in">
            {/* Quick validation indicator */}
            <div className="text-[10px] text-slate-400 hidden md:flex items-center">
              * denotes mandatory data elements
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
                id="btn-form-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-200 font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-sm cursor-pointer border border-amber-500/30"
                id="btn-form-commit"
              >
                Save Affiliation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
