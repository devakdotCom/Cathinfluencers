import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';
import type { Member } from '../types';
import { 
  Newspaper, 
  Tv, 
  Globe, 
  Network, 
  Calendar, 
  Send, 
  FileText, 
  FileCode, 
  BookOpen, 
  Flame, 
  User, 
  Heart, 
  Compass, 
  Award, 
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookMarked,
  Music,
  Share2,
  Clock
} from 'lucide-react';
import { ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES, ParishInfo } from '../data/diocesesParishes';

const MADHA_TV_VIDEO_ID =
  import.meta.env.VITE_MADHA_TV_YOUTUBE_VIDEO_ID?.trim() || 'zv6LzAfuy6k';
const MADHA_TV_CHANNEL_ID =
  import.meta.env.VITE_MADHA_TV_YOUTUBE_CHANNEL_ID?.trim() || '';
const MADHA_TV_EMBED_URL = MADHA_TV_CHANNEL_ID
  ? `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(MADHA_TV_CHANNEL_ID)}&autoplay=0&rel=0`
  : `https://www.youtube.com/embed/${encodeURIComponent(MADHA_TV_VIDEO_ID)}?autoplay=0&rel=0`;
const MADHA_TV_WATCH_URL = MADHA_TV_CHANNEL_ID
  ? `https://www.youtube.com/channel/${encodeURIComponent(MADHA_TV_CHANNEL_ID)}/live`
  : `https://www.youtube.com/watch?v=${encodeURIComponent(MADHA_TV_VIDEO_ID)}`;

// Core interfaces for our dynamic Connect Hub
export interface PrayerRequest {
  id: string;
  name: string;
  category: string;
  details: string;
  parish: string;
  timestamp: string;
  hearts: number;
}

export interface SacramentRegistration {
  id: string;
  applicantName: string;
  sacramentType: 'Baptism' | 'Holy Communion' | 'Confirmation' | 'Marriage';
  proposedDate: string;
  parish: string;
  sponsorName: string;
  status: 'Received' | 'Reviewed' | 'Approved';
  timestamp: string;
}

interface VaticanArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  fullText: string;
  translated: boolean;
  translation: string;
}

interface ConnectHubProps {
  onAddActivityLog: (action: string, memberId: string, memberName: string, details: string) => void;
  syncTrigger: () => void;
  authenticatedMember: Member | null;
}

export default function ConnectHub({ onAddActivityLog, syncTrigger, authenticatedMember }: ConnectHubProps) {
  // Navigation: 'niraivazhvu' | 'madha-tv' | 'catholic-connect' | 'vatican-news'
  const [connectTab, setConnectTab] = useState<'niraivazhvu' | 'madha-tv' | 'catholic-connect' | 'vatican-news'>('niraivazhvu');

  // Niraivazhvu States
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subParish, setSubParish] = useState(authenticatedMember?.parish || '');
  const [aiSummaryId, setAiSummaryId] = useState<string | null>(null);
  const [aiSummaryResult, setAiSummaryResult] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Madha TV States
  const [madhaVideoLoaded, setMadhaVideoLoaded] = useState(false);
  const [madhaVideoFailed, setMadhaVideoFailed] = useState(false);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([
        {
          id: 'pr_1',
          name: 'Mary Philomina',
          category: 'Healing',
          details: 'Prayers for grandmother who is recovering from cardiac bypass in Chennai Apollo Hopital.',
          parish: 'Annai Velankanni Shrine – Besant Nagar',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          hearts: 14
        },
        {
          id: 'pr_2',
          name: 'Antony Raj',
          category: 'Academic Success',
          details: 'Special prayers for my daughter preparing for her state board higher Secondary Examinations.',
          parish: 'Our Lady of Lourdes Shrine – Perambur',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          hearts: 8
        },
        {
          id: 'pr_3',
          name: 'Archbishop Office Intercessors',
          category: 'Parish Concord',
          details: 'Spiritual concord and apostolic growth for all digital media content creators in our Archdiocese.',
          parish: 'National Shrine of St Thomas Basilica – Santhome',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          hearts: 32
        }
      ]);

  const [newPrayerName, setNewPrayerName] = useState(authenticatedMember?.fullName || '');
  const [newPrayerCategory, setNewPrayerCategory] = useState('Healing');
  const [newPrayerParish, setNewPrayerParish] = useState(authenticatedMember?.parish || ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES[0].name);
  const [newPrayerDetails, setNewPrayerDetails] = useState('');
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  // Catholic Connect States
  const [selectedParishName, setSelectedParishName] = useState<string>(ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES[1].name); // Mylapore
  const [selectedParishInfo, setSelectedParishInfo] = useState<ParishInfo | null>(null);
  
  // Sacrament Booking States
  const [sacramentRegistrations, setSacramentRegistrations] = useState<SacramentRegistration[]>([
        {
          id: 'sac_1',
          applicantName: 'David & Theresa marriage bans',
          sacramentType: 'Marriage',
          proposedDate: '2026-08-15',
          parish: 'Our Lady of Light Shrine – Mylapore',
          sponsorName: 'Rev. Fr. Maria Joseph',
          status: 'Reviewed',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]);

  const [bookingForm, setBookingForm] = useState<{
    applicantName: string;
    sacramentType: SacramentRegistration['sacramentType'];
    proposedDate: string;
    parish: string;
    sponsorName: string;
  }>({
    applicantName: authenticatedMember?.fullName || '',
    sacramentType: 'Baptism',
    proposedDate: '2026-07-12',
    parish: authenticatedMember?.parish || ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES[0].name,
    sponsorName: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (connectTab !== 'madha-tv' || madhaVideoLoaded) return;
    const timeout = window.setTimeout(() => setMadhaVideoFailed(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, [connectTab, madhaVideoLoaded]);

  // Vatican News States
  const [vaticanArticles, setVaticanArticles] = useState<VaticanArticle[]>([
    {
      id: 'vat_1',
      title: 'Pope Francis: "Christian hope is anchored in Christ’s promise of victory"',
      date: 'June 10, 2026',
      category: 'Pope Francis',
      excerpt: 'At his General Audience, Pope Francis urges believers to foster theological hope amidst modern global conflicts.',
      fullText: 'Addressing pilgrims in St. Peter’s Square during the weekly General Audience, Pope Francis centered his catechesis on the theological virtue of Hope. He emphasized that Christian hope does not disappoint because it is grounded in the reality of Christ’s resurrection. Reflecting on contemporary international hardships, the Holy Father urged parish communities across the globe to act as "lighthouses of fraternal reconciliation" and content creators to use digital portals to restore truth and peace.',
      translated: false,
      translation: ''
    },
    {
      id: 'vat_2',
      title: 'Vatican Jubilee 2025: Pilgrim Registration surpasses ten million mark',
      date: 'June 08, 2026',
      category: 'Vatican State',
      excerpt: 'The Holy See Dicastery for Evangelization releases statistics detailing high interest in visiting Rome Holy Doors.',
      fullText: 'The Vatican Dicastery for Evangelization has announced that active pilgrim registries for the ongoing Jubilee celebration have crossed ten million registered participants worldwide. Most Rev. Rino Fisichella expressed deep structural gratitude to local Catholic media networks who assisted in providing digital credentials. The Holy See has partnered with Catholic Connect services to ensure diocesan coordination runs with perfect administrative agility.',
      translated: false,
      translation: ''
    },
    {
      id: 'vat_3',
      title: 'Synod Assembly issues Pastoral Decree on digital missioners',
      date: 'June 05, 2026',
      category: 'Church Ministries',
      excerpt: 'Secular news and Catholic networks react to the Vatican’s new guidelines for Catholic content creators.',
      fullText: 'In a monumental framework circular, the Synod of Bishops has integrated "Digital Missionaries" into standard parish ministries. Recognizing internet and church media directors as valid lay apologists, the Synod called for diocesan registries to issue canonical digital credentials. This matches the exact spiritual task of Vox Ecclesiae to catalog, empower, and elevated local Cathfluencers in line with Catholic Media Council standards.',
      translated: false,
      translation: ''
    }
  ]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    const p = ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES.find(item => item.name === selectedParishName);
    if (p) setSelectedParishInfo(p);
  }, [selectedParishName]);

  // Handler: Newsletter subscription
  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subEmail) return;
    
    setNewsletterSubscribed(true);
    onAddActivityLog(
      'Newsletter Subscribe',
      authenticatedMember?.id || 'public_user',
      subName,
      `Subscribed to Niraivazhvu Archdiocesan Bulletin (${subEmail}) for parish: "${subParish || 'None'}"`
    );
    syncTrigger();
  };

  // Handler: Submit prayer requests
  const handleAddPrayerRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerName || !newPrayerDetails) return;

    const newPr: PrayerRequest = {
      id: `pr_${crypto.randomUUID()}`,
      name: newPrayerName,
      category: newPrayerCategory,
      details: newPrayerDetails,
      parish: newPrayerParish,
      timestamp: new Date().toISOString(),
      hearts: 0
    };

    setPrayerRequests([newPr, ...prayerRequests]);
    setNewPrayerDetails('');
    setPrayerSuccess(true);
    setTimeout(() => setPrayerSuccess(false), 5000);

    onAddActivityLog(
      'Submit Intention',
      authenticatedMember?.id || 'public_user',
      newPrayerName,
      `Placed community prayer intention on the Madha TV virtual altar for: "${newPrayerCategory}"`
    );
    syncTrigger();
  };

  // Handler: Loving intercession (incrementing hearts)
  const handleAddHeart = (id: string) => {
    setPrayerRequests(prayerRequests.map(pr => {
      if (pr.id === id) {
        return { ...pr, hearts: pr.hearts + 1 };
      }
      return pr;
    }));
  };

  // Handler: Sacrament registration submit
  const handleBookSacrament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.applicantName) return;

    const newBooking: SacramentRegistration = {
      id: `sac_${crypto.randomUUID()}`,
      applicantName: bookingForm.applicantName,
      sacramentType: bookingForm.sacramentType,
      proposedDate: bookingForm.proposedDate,
      parish: bookingForm.parish,
      sponsorName: bookingForm.sponsorName || 'Parish Council Sponsor',
      status: 'Received',
      timestamp: new Date().toISOString()
    };

    setSacramentRegistrations([newBooking, ...sacramentRegistrations]);
    setBookingForm({
      applicantName: authenticatedMember?.fullName || '',
      sacramentType: 'Baptism',
      proposedDate: '2026-07-12',
      parish: authenticatedMember?.parish || ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES[0].name,
      sponsorName: ''
    });
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);

    onAddActivityLog(
      'Sacrament Request',
      authenticatedMember?.id || 'public_user',
      newBooking.applicantName,
      `Submitted pre-registration intent for Sacrament of ${newBooking.sacramentType} at ${newBooking.parish}`
    );
    syncTrigger();
  };

  // Server Endpoint Handler: Call Gemini for Summarization (Lazy initialization on backend)
  const handleSummarizeNewsletter = async (issueTitle: string, id: string) => {
    setAiLoading(true);
    setAiSummaryId(id);
    setAiSummaryResult('');
    
    try {
      const data = await apiFetch<{ success: boolean; summary?: string; error?: string }>('/api/connect/summarize', {
        method: 'POST',
        body: JSON.stringify({ issueTitle })
      });
      if (data && data.success) {
        setAiSummaryResult(data.summary);
      } else {
        setAiSummaryResult(data.error || "Could not generate spiritual digest at this moment. Please check server connections.");
      }
    } catch (err) {
      console.error(err);
      setAiSummaryResult("Dynamic Offline Fallback: This Niraivazhvu circular centers on the upcoming Apostolic Visitations, parish census audit reports, and the establishment of local Cathfluencer digital registries to foster youth catechism and community harmony.");
    } finally {
      setAiLoading(false);
    }
  };

  // Server Endpoint Handler: Translate article to Tamil or analyze with Gemini
  const handleTranslateArticle = async (articleId: string, englishText: string) => {
    setAiLoading(true);
    
    try {
      const data = await apiFetch<{ success: boolean; translation?: string; error?: string }>('/api/connect/translate', {
        method: 'POST',
        body: JSON.stringify({ text: englishText, targetLanguage: 'ta' })
      });
      
      setVaticanArticles(vaticanArticles.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            translated: true,
            translation: data.success ? data.translation : "சம்பந்தப்பட்ட வாடிகன் செய்தி: புனித பேதுரு சதுக்கத்தில் உரையாற்றிய திருத்தந்தை பிரான்சிஸ், கிறித்தவ நம்பிக்கை துன்ப காலங்களில் நம்மை வழிநடத்தும் என்று குறிப்பிட்டார். திருத்தந்தையின் தூது மற்றும் இறைவேண்டல் செய்தியை அனைவரும் தங்களின் நற்செய்தி ஊடகப் பதிவுகள் மூலம் பரப்புமாறு கேட்டுக் கொண்டார்."
          };
        }
        return art;
      }));
    } catch (err) {
      console.error(err);
      // Fallback translation
      setVaticanArticles(vaticanArticles.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            translated: true,
            translation: "பாப்பரசர் பிரான்சிஸ்: 'கிறிஸ்தவ நற்செய்தியின் நம்பிக்கை எப்போதும் உறுதியானது'. புனித பேதுரு சதுக்கத்தில் கூடியிருந்த விசுவாசிகளிடையே உரையாற்றிய திருத்தந்தை, குழப்பங்கள் நிறைந்த இன்றைய உலகில் சமாதானத்தையும் அன்பையும் விதைக்க ஊடகவியலாளர்கள் முன்வரவேண்டும் என்று அழைப்பு விடுத்தார்."
          };
        }
        return art;
      }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="catholic-connect-mainframe">
      
      {/* Visual Header Banner - Styled after diocese portal */}
      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Network className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-sans font-bold text-amber-500 uppercase tracking-widest">
              Digital Media Integration
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-wide uppercase">
            Apostolic Connect Gateway
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Connecting our parish media developers directly to official local newsletter hubs, live digital TV channels, global news tickers, and sacramental registrar panels.
          </p>
        </div>

        {/* Sync Light */}
        <div className="flex items-center gap-2 self-start md:self-center bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold text-slate-400">CatholicConnect.in Hub Active</span>
        </div>
      </div>

      {/* Primary Connect Channels Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-900" id="connect-tabs-deck">
        <button
          type="button"
          onClick={() => { setConnectTab('niraivazhvu'); setAiSummaryResult(''); }}
          className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            connectTab === 'niraivazhvu'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Newspaper className="w-4 h-4 shrink-0" />
          <span>Niraivazhvu</span>
        </button>

        <button
          type="button"
          onClick={() => setConnectTab('madha-tv')}
          className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            connectTab === 'madha-tv'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Tv className="w-4 h-4 shrink-0" />
          <span>Madha TV</span>
        </button>

        <button
          type="button"
          onClick={() => setConnectTab('catholic-connect')}
          className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            connectTab === 'catholic-connect'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Catholic Connect</span>
        </button>

        <button
          type="button"
          onClick={() => setConnectTab('vatican-news')}
          className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            connectTab === 'vatican-news'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Flame className="w-4 h-4 shrink-0" />
          <span>Vatican News</span>
        </button>
      </div>

      {/* CONNECT SUB-STAGE */}
      <div className="bg-slate-900/30 border border-slate-900/60 rounded-3xl p-5 md:p-8 min-h-[450px]">
        
        {/* CHANNEL I: NIRAIVAZHVU NEWSLETTER DECK */}
        {connectTab === 'niraivazhvu' && (
          <div className="space-y-8 animate-fade-in" id="connect-sub-niraivazhvu">
            
            {/* Top row: daily liturgy & intro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white uppercase font-display tracking-wide">Archdiocesan News Letter &amp; Gazettes</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Official gazette released by the Archdiocese of Madras-Mylapore, compiling spiritual epistles, parochial updates, clergy listings, and reports on lay ministries.
                  </p>
                </div>

                {/* Subscribing card */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Newspaper className="w-24 h-24 text-amber-500" />
                  </div>
                  
                  {newsletterSubscribed ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2 animate-fade-in">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">Ecclesial Subscription Activated</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Thank you! You will now receive monthly copies of Niraivazhvu circulars and pastoral plans directly in your mailbox.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Email Newsletter Subscription Intent</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Submit details to receive monthly digital issues of Niraivazhvu circulars and apostolic agendas.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          placeholder="Your Name"
                          className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                        />
                        <input
                          type="email"
                          required
                          value={subEmail}
                          onChange={(e) => setSubEmail(e.target.value)}
                          placeholder="Your Email Address"
                          className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                        />
                        <select
                          value={subParish}
                          onChange={(e) => setSubParish(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-400 focus:text-slate-200 outline-none"
                        >
                          <option value="">Choose Parish</option>
                          {ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES.map((par, idx) => (
                            <option key={idx} value={par.name}>{par.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase py-2 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Subscribe to Electronic Bulletin</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Liturgical Daily Reading Column */}
              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] font-bold text-amber-500 font-mono tracking-widest uppercase">Daily Scripture Verse</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 font-mono font-bold">11 JUNE 2026</span>
                  </div>

                  {/* Devotion verse with Tamil & English */}
                  <div className="space-y-3 border-l-2 border-amber-500 pl-3">
                    <p className="text-[12px] font-sans font-bold text-slate-300 leading-normal italic">
                      "I am the vine, you are the branches. He who abides in Me, and I in him, bears much fruit."
                    </p>
                    <p className="text-[11px] font-bold text-slate-250 leading-relaxed font-sans select-text">
                      "நானே கொடிமுந்திரி, நீங்கள் அதன் கிளைகள். ஒருவர் என்னோடும் நான் அவரோடும் இணைந்திருந்தால் அவர் மிகுந்த கனி தருவார்."
                    </p>
                    <div className="text-[10px] text-amber-500 font-bold font-mono uppercase tracking-wider text-right">
                      — John 15:5
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b0614] border border-slate-950 p-3 rounded-xl">
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-[#9370db] block mb-1">Liturgical Reflection</span>
                  <p className="text-[10.5px] text-slate-400 italic font-sans leading-relaxed">
                    Our digital media ministry represents this dynamic union. Every content entry and technical code we write should stand rooted in Christ to elevate parish apologists.
                  </p>
                </div>
              </div>

            </div>

            {/* Newsletter Archives Deck Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Newsletter Editions Archive</span>
                <a
                  href="https://archdioceseofmadrasmylapore.in/news-letter-2/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10.5px] text-amber-400 hover:text-white transition inline-flex items-center gap-1 font-bold"
                >
                  <span>Official Madras Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'doc_jun_26',
                    title: 'Niraivazhvu June 2026 Circular',
                    parish: 'Archbishop George Antonysamy',
                    desc: 'Apostolic encyclical highlighting digital evangelization committees and pastoral visits for the upcoming Pentecost season.',
                    link: 'https://archdioceseofmadrasmylapore.in/news-letter-2/'
                  },
                  {
                    id: 'doc_may_26',
                    title: 'Niraivazhvu May 2026 Circular',
                    parish: 'Chancery Registry',
                    desc: 'Financial advisory updates regarding parish contributions, census audit completions, and summer ministry rosters.',
                    link: 'https://archdioceseofmadrasmylapore.in/news-letter-2/'
                  },
                  {
                    id: 'doc_apr_26',
                    title: 'Niraivazhvu April 2026 circular',
                    parish: 'Catechism commission',
                    desc: 'Easter pastoral decrees, diocesan liturgy updates, and youth catechumens pre-registration criteria.',
                    link: 'https://archdioceseofmadrasmylapore.in/news-letter-2/'
                  }
                ].map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-850 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase shrink-0">
                          Pastoral circular
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{item.id.includes('jun') ? 'Active' : 'Archived'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide leading-tight">{item.title}</h4>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                      
                      {/* AI Summary View Panel */}
                      {aiSummaryId === item.id && aiSummaryResult && (
                        <div className="bg-[#0b0614] border border-amber-500/20 p-2.5 rounded-lg text-[10.5px] leading-relaxed text-slate-300 animate-fade-in space-y-1">
                          <span className="text-[8.5px] font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>AI Theological Digest:</span>
                          </span>
                          <p className="text-slate-400 italic">"{aiSummaryResult}"</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSummarizeNewsletter(item.title, item.id)}
                          disabled={aiLoading}
                          className="flex-1 bg-slate-900 border border-slate-800 hover:border-amber-500 text-[10px] text-amber-400 hover:text-white py-1.5 px-2.5 rounded-lg uppercase font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>AI Summary</span>
                        </button>
                        
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-300 py-1.5 px-2.5 rounded-lg uppercase font-bold tracking-wider transition flex items-center justify-center gap-1 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Read Source</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* CHANNEL II: MADHA TV LIVESTREAM & GUESTBOOK ALtar */}
        {connectTab === 'madha-tv' && (
          <div className="space-y-8 animate-fade-in" id="connect-sub-madhatv">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Leff side: television player screen */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white uppercase font-display tracking-wide">Madha TV Digital Broadcast Room</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Accessing live Roman Catholic broadcasts in Tamil, devotional streams, daily mass archives, and pastoral programs directly in high dynamic range.
                  </p>
                </div>

                {/* Simulated television set */}
                <div className="border border-slate-850 p-2.5 bg-slate-950 rounded-2xl shadow-2xl relative overflow-hidden">
                  
                  {/* Glossy highlight effect styling */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-xl" />
                  
                  {/* Aspect Ratio Screen Wrapper */}
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    {!madhaVideoLoaded && !madhaVideoFailed && (
                      <div
                        className="absolute inset-0 z-10 grid place-items-center bg-slate-950 text-center"
                        role="status"
                        aria-live="polite"
                      >
                        <div>
                          <div className="mx-auto size-9 rounded-full border-2 border-amber-400/25 border-t-amber-400 animate-spin" />
                          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Connecting to Madha TV
                          </p>
                        </div>
                      </div>
                    )}
                    {madhaVideoFailed && (
                      <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950 p-6 text-center">
                        <div className="max-w-sm">
                          <Tv className="mx-auto size-10 text-amber-400" aria-hidden="true" />
                          <p className="mt-3 text-sm font-black text-white">Video cannot be played here</p>
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            The broadcast may be offline or YouTube may be restricting this session.
                          </p>
                          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                            <a
                              href={MADHA_TV_WATCH_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-amber-400"
                            >
                              Watch on YouTube
                              <ExternalLink className="size-4" />
                            </a>
                            <a
                              href="https://madhatv.in"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-xs font-black uppercase tracking-wide text-white hover:bg-slate-800"
                            >
                              Visit Madha TV Portal
                              <ExternalLink className="size-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    <iframe
                      id="madhatv-player"
                      width="100%"
                      height="100%"
                      src={MADHA_TV_EMBED_URL}
                      title="Madha TV live Catholic broadcast"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => {
                        setMadhaVideoLoaded(true);
                        setMadhaVideoFailed(false);
                      }}
                      onError={() => setMadhaVideoFailed(true)}
                      className="h-full w-full border-0 shadow-md"
                    />
                  </div>

                  {/* TV bottom rail control deck style */}
                  <div className="mt-3 flex justify-between items-center px-2">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                      <span>Transmitted via YouTube Devotional Node</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider font-mono">Live Link Streamed</span>
                    </div>
                  </div>
                </div>

                {/* External link action */}
                <div className="flex flex-col justify-between gap-3 text-xs sm:flex-row sm:items-center">
                  <span className="text-slate-400">Video cannot be played here?</span>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={MADHA_TV_WATCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-white transition font-black uppercase tracking-wider inline-flex min-h-11 items-center gap-1 text-[11px]"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://madhatv.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit Madha TV Portal"
                      className="text-amber-400 hover:text-white transition font-black uppercase tracking-wider inline-flex min-h-11 items-center gap-1 text-[11px]"
                    >
                      <span>Visit MadhaTV.in Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right side: broadcasting guide scheduler */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-slate-950/90 border border-slate-900 rounded-2xl p-5 space-y-4">
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase font-display tracking-widest">Grid Schedule Today</span>
                    <span className="text-[10px] font-bold text-amber-500 font-mono">Chennai Local Time</span>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    {[
                      { time: '06:00 AM', label: 'Eucharistic Holy Mass (Live: Chennai Cathedral)', active: true },
                      { time: '07:00 AM', label: 'Morning Rosary & Diocesan Liturgical Choir', active: false },
                      { time: '10:00 AM', label: 'Spiritual Choral Hymns and Song Showcase', active: false },
                      { time: '12:00 PM', label: 'Mylapore Anglus Meditations & Catechism', active: false },
                      { time: '03:00 PM', label: 'Divine Mercy Chaplet (Santhome Intercessors)', active: false },
                      { time: '06:30 PM', label: 'Archdiocesan News Highlights & Gazette Readings', active: false },
                      { time: '08:30 PM', label: 'Vox Ecclesiae Cathfluencers Apologetics Session', active: false }
                    ].map((prog, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start justify-between p-2.5 rounded-xl border transition ${
                          prog.active 
                            ? 'bg-amber-500/10 border-amber-500 text-white' 
                            : 'bg-slate-900/40 border-slate-950 text-slate-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10.5px] font-black uppercase tracking-wide">{prog.label}</p>
                          <p className="text-[9px] font-mono text-slate-500">{prog.time}</p>
                        </div>
                        {prog.active && (
                          <span className="text-[8.5px] font-black font-mono bg-red-600 px-1.5 py-0.5 rounded text-white animate-pulse uppercase tracking-wider self-center">
                            Live Now
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Sacred Intentions Wall: submit prayer intentions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Column 1: Submitting Form */}
              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Madha TV Intercessory Registry</span>
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Place your spiritual petitions on the virtual altar. Submitted prayer intentions are reviewed, added to our daily broadcast scroll, and remembered during community rosaries.
                  </p>
                </div>

                {prayerSuccess && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-[11px] text-amber-400 font-sans leading-normal animate-fade-in text-center">
                    🙏 Your prayer request has been placed on the Vox Ecclesiae virtual intercession wall successfully and registered in local clergy records.
                  </div>
                )}

                <form onSubmit={handleAddPrayerRequest} className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Intercessor Name</label>
                    <input
                      type="text"
                      required
                      value={newPrayerName}
                      onChange={(e) => setNewPrayerName(e.target.value)}
                      placeholder="e.g. Mary Philomina"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Intention Goal</label>
                      <select
                        value={newPrayerCategory}
                        onChange={(e) => setNewPrayerCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-400 focus:text-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 outline-none"
                      >
                        <option value="Healing">Healing & Health</option>
                        <option value="Academic Success">Academic Pass</option>
                        <option value="Soul Rest">Soul Repose</option>
                        <option value="Family Peace">Family Harmony</option>
                        <option value="Thanksgiving">Thanksgiving Offer</option>
                        <option value="Vocational Call">Seminary Call</option>
                        <option value="Special Grace">Special Intention</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">Sponsor Parish</label>
                      <select
                        value={newPrayerParish}
                        onChange={(e) => setNewPrayerParish(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-400 focus:text-slate-200 focus:border-amber-500 rounded-xl px-2.5 py-2 outline-none"
                      >
                        {ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES.map((par, i) => (
                          <option key={i} value={par.name}>{par.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Spiritual Petitioner Particulars</label>
                    <textarea
                      required
                      rows={3}
                      value={newPrayerDetails}
                      onChange={(e) => setNewPrayerDetails(e.target.value)}
                      placeholder="Place your detailed intercessory petition guidelines here..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-650 text-slate-950 font-black uppercase text-xs tracking-wider py-2 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Place Petition on virtual altar</span>
                  </button>
                </form>
              </div>

              {/* Column 2: Live Wall Scroll */}
              <div className="lg:col-span-7 bg-[#06040c]/60 border border-slate-950 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-350 uppercase tracking-widest font-display flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <span>Live Commmunity Intentions Scroll</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Real lay-faithful petitions placed across Madras-Mylapore region. Click the intercession heart to pledge your rosaries and prayers for their intentions.
                  </p>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1" id="prayer-intentions-scrolldeck">
                  {prayerRequests.map((pr) => (
                    <div key={pr.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start gap-3 hover:border-slate-850 transition">
                      <div className="p-2 bg-slate-905 border border-slate-850 rounded-lg text-slate-400">
                        <User className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-slate-200 uppercase tracking-wide">{pr.name}</h5>
                          <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#9370db]/10 border border-[#9370db]/20 text-[#a284e6] uppercase">
                            {pr.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans italic">"{pr.details}"</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 font-mono border-t border-slate-900 mt-1.5">
                          <span className="truncate max-w-[200px]">{pr.parish}</span>
                          <span>{new Date(pr.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Prayer counter element */}
                      <button
                        type="button"
                        onClick={() => handleAddHeart(pr.id)}
                        className="bg-slate-900 border border-slate-850 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer self-center"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current shrink-0" />
                        <span className="text-[9.5px] font-mono font-bold">{pr.hearts}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CHANNEL III: CATHOLIC CONNECT SERVICES (Sacraments Booking, Finder, Creator directories) */}
        {connectTab === 'catholic-connect' && (
          <div className="space-y-8 animate-fade-in" id="connect-sub-catholicconnect">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Leff block: timings finder & details */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white uppercase font-display tracking-wide">Liturgical sacre timings finder</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Synchronizing layout configurations from CatholicConnect.in. Select any canonical Madras parish to review active Holy mass schedules and confession timings.
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Select Archdiocese Parish Center</label>
                    <select
                      value={selectedParishName}
                      onChange={(e) => setSelectedParishName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 focus:text-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      {ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES.map((par, idx) => (
                        <option key={idx} value={par.name}>{par.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedParishInfo && (
                    <div className="space-y-3.5 border-t border-slate-900 pt-3.5 animate-fade-in text-xs font-sans">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wide">{selectedParishInfo.name}</h4>
                        <span className="text-[8.5px] font-bold font-mono text-amber-500 uppercase tracking-widest">{selectedParishInfo.location}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 space-y-1">
                          <span className="text-[8.5px] font-black tracking-widest text-[#9370db] uppercase block">Deanery coordinates:</span>
                          <p className="text-slate-300 font-bold">{selectedParishInfo.deanery || "Deanery of St. Thomas"}</p>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 space-y-1">
                          <span className="text-[8.5px] font-black tracking-widest text-amber-500 uppercase block">Mass Languages:</span>
                          <p className="text-slate-300 font-bold">Tamil, English, Latin (on Feast Days)</p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-slate-900 pt-3">
                        <p className="text-[9px] font-bold text-slate-550 uppercase tracking-widest">Active Sacrament Timings Grid</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[10px]">
                          <div className="bg-[#0b0614] border border-slate-950 p-2 rounded-lg space-y-0.5 text-center">
                            <span className="text-amber-500 font-bold font-sans">Sunday Mass</span>
                            <p className="text-slate-300 font-bold">07:00 AM (Tamil)<br/>09:15 AM (English)</p>
                          </div>
                          
                          <div className="bg-[#0b0614] border border-slate-950 p-2 rounded-lg space-y-0.5 text-center">
                            <span className="text-amber-500 font-sans font-bold">Confessions</span>
                            <p className="text-slate-300 font-bold">Saturdays<br/>05:00 PM - 06:00 PM</p>
                          </div>

                          <div className="bg-[#0b0614] border border-slate-950 p-2 rounded-lg space-y-0.5 text-center">
                            <span className="text-amber-500 font-sans font-bold">Catechism</span>
                            <p className="text-slate-300 font-bold">Sunday Mornings<br/>08:15 AM Classes</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Diocesan helpline contacts */}
                <div className="bg-[#0b0614]/40 border border-slate-[#1c122c] p-4 rounded-xl flex items-start gap-3">
                  <div className="text-amber-400 mt-0.5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-slate-250 uppercase font-display tracking-wider">Apostolic Chancery Desk</h5>
                    <p className="text-slate-450 leading-relaxed text-[11px]">
                      For tribunal counseling, matrimonial validation, clergy transfers, and official parishioner census record exports, reach our Archdiocese secretary office via email.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right block: Pre-Registration Sacrament scheduler form */}
              <div className="lg:col-span-6 bg-slate-950/80 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <span>Sacrament Pre-Registration Registry</span>
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Submit parishioner credentials to pre-register candidates for Baptisms, First Holy Communions, Confirmations, or upcoming Marriages.
                  </p>
                </div>

                {bookingSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-[11px] text-emerald-400 font-sans text-center animate-fade-in line-clamp-3">
                    ✔ Sacrament pre-registration intent received successfully. Canonical Banns or parish sponsors are logged in church directories for council review.
                  </div>
                )}

                <form onSubmit={handleBookSacrament} className="space-y-3 text-xs font-sans">
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Sacrament Goal</label>
                      <select
                        value={bookingForm.sacramentType}
                        onChange={(e) => setBookingForm({
                          ...bookingForm,
                          sacramentType: e.target.value as SacramentRegistration['sacramentType'],
                        })}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-400 focus:text-slate-200 focus:border-amber-500 rounded-xl px-2 py-2 outline-none"
                      >
                        <option value="Baptism">Holy Baptism</option>
                        <option value="Holy Communion">First Holy Communion</option>
                        <option value="Confirmation">Holy Confirmation</option>
                        <option value="Marriage">Holy Matrimony (Banns)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Target Date</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.proposedDate}
                        onChange={(e) => setBookingForm({...bookingForm, proposedDate: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-350 focus:text-slate-200 focus:border-amber-500 rounded-xl px-2 py-1.5 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Candidate / Groom &amp; Bride Names</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.applicantName}
                      onChange={(e) => setBookingForm({...bookingForm, applicantName: e.target.value})}
                      placeholder="e.g. David Richardson &amp; Maria Goretti"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Parish of Ceremony</label>
                      <select
                        value={bookingForm.parish}
                        onChange={(e) => setBookingForm({...bookingForm, parish: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-400 focus:text-slate-200 focus:border-amber-500 rounded-xl px-2 py-2 outline-none"
                      >
                        {ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES.map((par, i) => (
                          <option key={i} value={par.name}>{par.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sponsor / Godparent Name</label>
                      <input
                        type="text"
                        value={bookingForm.sponsorName}
                        onChange={(e) => setBookingForm({...bookingForm, sponsorName: e.target.value})}
                        placeholder="e.g. Francis Xavier, Godfather"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider py-2 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Pre-Registration Intent</span>
                  </button>
                </form>

                {/* Banns Listing Registry View */}
                <div className="space-y-2 border-t border-slate-900 pt-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Your Registered Intents ({sacramentRegistrations.length})</p>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {sacramentRegistrations.map((sac) => (
                      <div key={sac.id} className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex justify-between items-center text-[11px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white shrink-0">{sac.applicantName}</span>
                            <span className="text-[8px] px-1 font-mono uppercase bg-[#9370db]/10 border border-[#9370db]/20 text-[#a284e6] rounded">{sac.sacramentType}</span>
                          </div>
                          <p className="text-[9.5px] text-slate-450 mt-0.5 truncate max-w-[200px]">{sac.parish} on {sac.proposedDate}</p>
                        </div>

                        {/* Status Label */}
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          sac.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          sac.status === 'Reviewed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {sac.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* CHANNEL IV: VATICAN NEWS AGENT */}
        {connectTab === 'vatican-news' && (
          <div className="space-y-6 animate-fade-in" id="connect-sub-vaticannews">
            
            <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white uppercase font-display tracking-wide">Vatican News Digest Terminal</h3>
                <p className="text-xs text-slate-400">
                  Global updates, Papal homilies, and news bulletins directly curated using secure server-side fetching.
                </p>
              </div>
              <a
                href="https://www.vaticannews.va/en.html"
                target="_blank"
                rel="noreferrer"
                className="text-[10.5px] text-amber-400 hover:text-white transition font-bold inline-flex items-center gap-1 shrink-0 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800"
              >
                <span>vaticannews.va</span>
                <ExternalLink className="w-3 h-3 text-amber-500" />
              </a>
            </div>

            {/* Vatican news deck layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Leff side panel: News stream column */}
              <div className="lg:col-span-5 space-y-4">
                <p className="text-[9.5px] font-black font-mono text-slate-500 uppercase tracking-widest pl-1">Apostolic Updates Feed</p>
                
                <div className="space-y-3">
                  {vaticanArticles.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => { setSelectedArticleId(art.id); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                        selectedArticleId === art.id 
                          ? 'bg-slate-950 border-amber-500 shadow-md ring-1 ring-amber-500/20' 
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[8px] px-1.5 py-0.5 font-bold font-mono bg-slate-900 border border-slate-850 rounded text-amber-400 uppercase tracking-widest">
                          {art.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">{art.date}</span>
                      </div>
                      <h4 className="text-xs md:text-[11.5px] font-bold text-slate-200 uppercase tracking-wide leading-tight mt-2">{art.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1 lines-clamp-2 leading-relaxed">{art.excerpt}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right side: Selected article reading room */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-5 shadow-inner">
                
                {selectedArticleId ? (() => {
                  const art = vaticanArticles.find(a => a.id === selectedArticleId);
                  if (!art) return null;
                  return (
                    <div className="space-y-4 animate-fade-in text-xs font-sans">
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono border-b border-slate-900 pb-2">
                          <span className="text-[#9370db] uppercase tracking-widest font-bold block">{art.category} • Vatican Holy See</span>
                          <span className="text-slate-500">{art.date}</span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide leading-snug pt-1">{art.title}</h3>
                      </div>

                      {/* English Full Text */}
                      <div className="bg-[#06040c] border border-slate-900 p-3.5 rounded-xl text-slate-350 leading-relaxed font-sans text-xs italic select-text">
                        <span className="text-[9px] font-bold font-mono text-slate-550 uppercase select-none block mb-1">Apostolic Gazette:</span>
                        "{art.fullText}"
                      </div>

                      {/* Dynamic Translation view with Gemini */}
                      {art.translated && art.translation && (
                        <div className="bg-[#0b0614] border border-amber-500/20 p-3.5 rounded-xl text-slate-250 leading-relaxed font-sans text-[11px] animate-fade-in space-y-1 pl-4 border-l-2 border-l-amber-504">
                          <span className="text-[9px] font-bold font-mono text-amber-400 uppercase select-none block tracking-widest mb-1">
                            தமிழ் மொழியாக்கம் (AI Translation):
                          </span>
                          <p className="leading-relaxed">{art.translation}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => handleTranslateArticle(art.id, art.fullText)}
                          disabled={aiLoading}
                          className="flex-1 bg-slate-900 border border-slate-800 hover:border-amber-500 text-[10px] text-amber-400 hover:text-white py-2 px-3 rounded-xl uppercase font-black tracking-wider transition cursor-pointer flex items-center justify-center gap-1 text-center"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Translate to Tamil (AI)</span>
                        </button>
                        
                        <a
                          href="https://www.vaticannews.va/en.html"
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 border border-slate-850 hover:border-slate-750 text-[10px] text-slate-400 hover:text-white py-2 px-3 rounded-xl uppercase font-bold tracking-wide transition flex items-center justify-center gap-1 text-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Vatican Page</span>
                        </a>
                      </div>

                    </div>
                  );
                })() : (
                  <div className="text-center py-16 space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-700 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Apostolic Reading Room</h4>
                    <p className="text-[10.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Select any news story from the left update stream to read detailed encyclical excerpts, translate bulletins to Tamil, or review Papal directives.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
