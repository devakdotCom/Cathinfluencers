import React, { useState } from 'react';
import type { Member } from '../types';
import { useDialog } from './ui/DialogProvider';
import { 
  BookOpen, 
  FileText, 
  Globe, 
  Scale, 
  ExternalLink, 
  Download, 
  Search, 
  CheckCircle, 
  Inbox, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Instagram,
  FileCheck,
  BookMarked,
  Sparkles,
  Award,
  Shield
} from 'lucide-react';

interface ResourcesLibraryProps {
  onAddActivityLog: (action: string, memberId: string, memberName: string, details: string) => void;
  authenticatedMember: Member | null;
}

export default function ResourcesLibrary({ onAddActivityLog, authenticatedMember }: ResourcesLibraryProps) {
  const dialog = useDialog();
  const [activeSegment, setActiveSegment] = useState<'liturgy' | 'forms' | 'catechism' | 'canon_law'>('liturgy');
  
  // Interactive search for forms
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const [selectedFormFields, setSelectedFormFields] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState<string | null>(null);

  // Liturgy reflection lookup state
  const [liturgySeason, setLiturgySeason] = useState<'ordinary' | 'lent' | 'advent' | 'easter'>('ordinary');

  // Liturgy and Instagram handle details
  const officialInstagramUrl = "https://www.instagram.com/admmliturgy/";
  const officialFormsUrl = "https://archdioceseofmadrasmylapore.in/forms/";
  const officialCatechismUrl = "https://www.vatican.va/archive/ENG0015/_INDEX.HTM";
  const officialCanonLawUrl = "https://www.vatican.va/archive/cdc/index.htm";

  const handleResourceClick = (resourceName: string) => {
    onAddActivityLog(
      'View Resource',
      authenticatedMember?.id || 'public_user',
      authenticatedMember?.fullName || 'Guest Explorer',
      `Accessed digital reference links for "${resourceName}"`
    );
  };

  const formsList = [
    { id: 'f_bapt', name: 'M-M Baptism Certificate Registration Request', code: 'FORM-02-BAPT', category: 'Sacramental', desc: 'Pre-requisite application for canonical registration of Infant/Adult Holy Baptism.' },
    { id: 'f_marriage', name: 'Holy Matrimony Banns Publication Application', code: 'FORM-07-MATR', category: 'Sacramental', desc: 'Banns publication query required minimum 3 weeks prior to parish sacramental wedding.' },
    { id: 'f_choir', name: 'Diocesan Liturgical Choir Auditions Entry Form', code: 'FORM-19-CHOI', category: 'Ministry', desc: 'Audition coordinate submission for Chennai choir members and organists.' },
    { id: 'f_apologetics', name: 'Cathfluencer Affiliation Credential Request', code: 'FORM-01-VOX', category: 'Registry', desc: 'Official digital media credentials request to register as affiliated local apologist.' }
  ];

  const filteredForms = formsList.filter(f => 
    f.name.toLowerCase().includes(formSearchQuery.toLowerCase()) || 
    f.code.toLowerCase().includes(formSearchQuery.toLowerCase())
  );

  const handleRequestDownload = (formName: string) => {
    onAddActivityLog(
      'Form Request',
      authenticatedMember?.id || 'public_user',
      authenticatedMember?.fullName || 'Guest Explorer',
      `Initiated offline printable dossier draft for: "${formName}"`
    );
    void dialog.alert({
      title: 'Official form source',
      message: `${formName} is available from the Archdiocese forms section. Simulated downloads have been disabled.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="resources-library-mainframe">
      {/* Upper Title Panel */}
      <div className="bg-slate-900/65 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-sans font-bold text-amber-500 uppercase tracking-widest">
              Liturgy &amp; Canon Law
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-wide uppercase">
            Curia &amp; Liturgy Resource Desk
          </h2>
          <p className="text-xs text-slate-450 max-w-2xl leading-relaxed">
            Accessing standard canonical documents, Sunday Liturgical directives, official administrative archdiocesan forms, and Vatican guidelines.
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Compendium Lex</span>
          <span className="text-[11px] font-mono font-bold text-emerald-500">Official Gazettes Indexed</span>
        </div>
      </div>

      {/* Dropdown Menu Representation & Grid Segment Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Dropdown Sidebar List */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
          <span className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest px-1">
            Browse Curia Library
          </span>

          <nav className="space-y-1 flex flex-col">
            <button
              type="button"
              onClick={() => setActiveSegment('liturgy')}
              className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition cursor-pointer border ${
                activeSegment === 'liturgy'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-slate-900/20 border-transparent hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wide">Sunday Liturgy</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSegment('forms')}
              className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition cursor-pointer border ${
                activeSegment === 'forms'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-slate-900/20 border-transparent hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wide">Important Forms</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSegment('catechism')}
              className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition cursor-pointer border ${
                activeSegment === 'catechism'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-slate-900/20 border-transparent hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wide">Catechism of the Church</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSegment('canon_law')}
              className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition cursor-pointer border ${
                activeSegment === 'canon_law'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-slate-900/20 border-transparent hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wide">Canon Law</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>

          {/* Quick Informational Blurb */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 text-[10px] text-slate-500 space-y-1.5 leading-normal">
            <span className="font-bold text-amber-500 uppercase tracking-widest block font-mono">Curia Statement</span>
            <p>Our digital registry operates in perfect fidelity to the Code of Canon Law and the liturgical guidelines of the Madras-Mylapore Archdiocese.</p>
          </div>
        </div>

        {/* Central Display View Stage */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-900/60 rounded-3xl p-5 md:p-7 min-h-[460px]">

          {/* SEGMENT I: SUNDAY LITURGY PAGE */}
          {activeSegment === 'liturgy' && (
            <div className="space-y-6 animate-fade-in" id="liturgy-compendium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Sunday Liturgy guidelines</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">Liturgical Commission &amp; Rites</h3>
                </div>
                
                <a
                  href={officialInstagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleResourceClick('Sunday Liturgy (Instagram)')}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10.5px] text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <Instagram className="w-4 h-4 text-purple-400" />
                  <span>@admmliturgy Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl flex flex-col md:flex-row gap-5 items-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 text-amber-400">
                  <Instagram className="w-6 h-6 text-pink-500" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-350">
                  <h4 className="font-bold text-white uppercase">Liturgical Commission Media Portal</h4>
                  <p className="leading-relaxed">
                    Official announcements, training modules for choir masters and lectors, liturgical colors schedules, and Holy Week order codes are periodically posted on the commission’s verified Instagram feed.
                  </p>
                  <div className="pt-1.5">
                    <a 
                      href={officialInstagramUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-amber-500 hover:underline font-bold text-[10.5px]"
                    >
                      Follow @admmliturgy for active Madras liturgy updates →
                    </a>
                  </div>
                </div>
              </div>

              {/* Liturgical season selector for custom notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Liturgical Season Notes</h4>
                <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-xl">
                  {(['ordinary', 'lent', 'advent', 'easter'] as const).map((season) => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => setLiturgySeason(season)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        liturgySeason === season
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 text-xs">
                  {liturgySeason === 'ordinary' && (
                    <div className="space-y-1 animate-fade-in">
                      <p className="font-bold text-emerald-400 font-mono text-[10px] uppercase">Ordinary Time (Liturgy Color: Green)</p>
                      <p className="text-slate-400 leading-relaxed">
                        Centered on the public ministry of Christ. Choir directors must match processional and communion hymns with standard biblical lectionary verses. Speculative guitar arrangements and theatrical variations are not permitted off-sanctuary.
                      </p>
                    </div>
                  )}
                  {liturgySeason === 'lent' && (
                    <div className="space-y-1 animate-fade-in">
                      <p className="font-bold text-purple-400 font-mono text-[10px] uppercase">Lenten Devotions (Liturgy Color: Violet)</p>
                      <p className="text-slate-400 leading-relaxed">
                        Time of solemn prayer and fasting. Organ accompaniment should remain strictly background-supportive. The singing of "Gloria" and "Alleluia" is canonicaly omitted to reinforce spiritual contemplation.
                      </p>
                    </div>
                  )}
                  {liturgySeason === 'advent' && (
                    <div className="space-y-1 animate-fade-in">
                      <p className="font-bold text-violet-400 font-mono text-[10px] uppercase">Advent Expectation (Liturgy Color: Violet/Rose)</p>
                      <p className="text-slate-400 leading-relaxed">
                        Preparation for the incarnation of the Word. Focus on hope. Traditional Gregorian melodies such as "O Come, O Come, Emmanuel" are highly recommended for local digital streams and choir rosters.
                      </p>
                    </div>
                  )}
                  {liturgySeason === 'easter' && (
                    <div className="space-y-1 animate-fade-in">
                      <p className="font-bold text-amber-400 font-mono text-[10px] uppercase">Easter Triduum &amp; Resurrection (Liturgy Color: White/Gold)</p>
                      <p className="text-slate-400 leading-relaxed">
                        Solemn triumph. High SATB choruses praise the risen Lord with joyful orchestration. Online live feeds of the Easter Vigil from Mylapore Cathedral serve as the primary spiritual broadcast for the region.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEGMENT II: IMPORTANT FORMS */}
          {activeSegment === 'forms' && (
            <div className="space-y-6 animate-fade-in" id="forms-compendium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Downlodable forms &amp; applications</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">Clergy Office Printable Dossiers</h3>
                </div>
                
                <a
                  href={officialFormsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleResourceClick('Important Forms (Diocese)')}
                  className="bg-amber-500 hover:bg-amber-600 border border-amber-400 text-[10.5px] text-slate-950 font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Archdiocese Forms Desk</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#000]" />
                </a>
              </div>

              {/* Forms interactive search */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 px-3.5 py-1.5 rounded-xl">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formSearchQuery}
                  onChange={(e) => setFormSearchQuery(e.target.value)}
                  placeholder="Search Baptism banns, choir, or media registration cards..."
                  className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredForms.map((frm) => (
                  <div key={frm.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between hover:border-slate-800 transition">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono font-bold px-1 rounded bg-[#a284e6]/10 text-[#a284e6]">
                          {frm.code}
                        </span>
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest">{frm.category}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-200 pt-1 leading-tight">{frm.name}</h4>
                      <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans mt-1">{frm.desc}</p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-900 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRequestDownload(frm.name)}
                        className="flex-1 bg-slate-900 border border-slate-800 hover:border-amber-500 text-[10px] text-amber-400 hover:text-white py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-amber-500" />
                        <span>Pre-fill Draft</span>
                      </button>

                      <a
                        href={officialFormsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900 border border-slate-850 text-[10px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Official</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEGMENT III: CATECHISM OF THE CHURCH */}
          {activeSegment === 'catechism' && (
            <div className="space-y-6 animate-fade-in" id="catechism-compendium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Catechismus Catholicae Ecclesiae</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">Doctrine &amp; Apostles' Creeds</h3>
                </div>
                
                <a
                  href={officialCatechismUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleResourceClick('Catechism of the Church')}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10.5px] text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Vatican Catechism Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

              {/* Informative Compendium of faith structure */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The Catechism of the Catholic Church (CCC) represents the dogmatic core of our theological apologetics. Catholic content creators must ensure all visual slides, writings, and sound snippets remain rigorously aligned with the four pillars:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { pillar: "Pillar I", title: "The Creed (Faith)", details: "Apostles' Creed and Nicene-Constantinopolitan theological formulations. The foundational articles of Christian belief." },
                    { pillar: "Pillar II", title: "Sacraments (Liturgy)", details: "Efficacy of Holy Mysteries (Baptism, Confirmation, Matrimony, Eucharist, Ordination, Confession, Anointing) channeling Divine Grace." },
                    { pillar: "Pillar III", title: "Decalogue (Life)", details: "The Ten Commandments and Beatitudes guiding Christian behavior and social-concord ethics in digital workspaces." },
                    { pillar: "Pillar IV", title: "Lord's Prayer (Prayer)", details: "Spiritual pathways, standard prayer codes, liturgical cycles, and communion with the Holy Saints." }
                  ].map((pl, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-4 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[8.5px] font-mono text-amber-500 font-black uppercase tracking-widest">{pl.pillar}</span>
                      <h4 className="text-xs font-black text-white uppercase">{pl.title}</h4>
                      <p className="text-[10.5px] text-slate-400 leading-normal font-sans">{pl.details}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] text-slate-300">Read the official Vatican translations of all CCC chapters online.</span>
                  </div>
                  <a
                    href={officialCatechismUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-white text-[10.5px] font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Browse Libreria Editrice</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SEGMENT IV: CANON LAW */}
          {activeSegment === 'canon_law' && (
            <div className="space-y-6 animate-fade-in" id="canonlaw-compendium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Codex Iuris Canonici</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">Canon Law &amp; Curia Decrees</h3>
                </div>
                
                <a
                  href={officialCanonLawUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleResourceClick('Canon Law')}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10.5px] text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>Vatican Code of Canon Law</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

              {/* Curia Code layout */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The Code of Canon Law governs the legal, spiritual, and administrative structures of the Roman Catholic Church. In our Chennai digital media apostolates, specific canons guide creator permissions:
                </p>

                <div className="space-y-3.5">
                  {[
                    { canon: "Canon 216", title: "Apostolic Initiatives", desc: "All the Christian faithful have the right to promote or sustain apostolic action by their own undertakings, but no undertaking is to claim the name Catholic without the consent of competent ecclesiastical authority." },
                    { canon: "Canon 822", title: "Social Communication Media", desc: "Pastors of the Church, using a right proper to the Church, are to endeavor to make use of instruments of social communication to fulfill their office. Apologists must present doctrine with authentic precision." },
                    { canon: "Canon 823", title: "Vigilance of Church Authority", desc: "To preserve the integrity of the truths of faith and morals, the pastors of the Church have the duty and the right to require that writings of the christian faithful touching upon faith or morals be submitted to their judgment." }
                  ].map((can, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-1.5 border-l-2 border-l-amber-500">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono font-bold text-amber-400 uppercase tracking-wider">{can.canon}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Compendium of Law</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">{can.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-normal font-sans italic">"{can.desc}"</p>
                    </div>
                  ))}
                </div>

                {/* Aesthetic Seal compliance indicator */}
                <div className="bg-[#0b0614] border border-[#a284e6]/10 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#9370db]/10 flex items-center justify-center border border-[#9370db]/20 shrink-0 text-[#9370db]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-400">
                    <h5 className="font-bold text-slate-300 uppercase leading-none">Vox Ecclesiae canonical compliance</h5>
                    <p className="leading-relaxed text-[10.5px]">
                      By filing your media coordinates in our registry and obtaining the Archbishop’s digital credentials check, you comply with the mandate of Canon 216 regarding competent ecclesiastical coordination.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
