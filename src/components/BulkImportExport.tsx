import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Member, MembershipClass, MemberStatus } from '../types';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Database, 
  FileSpreadsheet, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  UserPlus
} from 'lucide-react';

interface BulkImportExportProps {
  members: Member[];
  onImport: (newMembers: Member[]) => void;
  addActivityLog: (action: string, memberId: string, memberName: string, details: string) => void;
}

export default function BulkImportExport({ members, onImport, addActivityLog }: BulkImportExportProps) {
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate a random string ID
  const generateId = () => `imported_user_${crypto.randomUUID()}`;

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 
      'Membership Class', 'Status', 'Date Joined', 
      'Street Address', 'City', 'State', 'Zip Code', 'Country', 'Notes'
    ];

    const rows = members.map(m => [
      m.firstName || '',
      m.lastName || '',
      m.email || '',
      m.phone || '',
      m.membershipClass || 'Active',
      m.status || 'Active',
      m.joinedDate || '',
      m.address?.street || '',
      m.address?.city || '',
      m.address?.state || '',
      m.address?.zipCode || '',
      m.address?.country || '',
      `"${(m.notes || '').replace(/"/g, '""')}"` // escape quotes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `diocesan_registry_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addActivityLog('Export CSV', 'system', 'Admin', `Exported ${members.length} members to CSV file.`);
  };

  // JSON Exporter
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(members, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `diocesan_registry_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addActivityLog('Export JSON', 'system', 'Admin', `Exported ${members.length} members to JSON database backup.`);
  };

  // Process raw text string loaded from file
  const processLoadedText = (text: string, fileName: string) => {
    setImportText(text);
    if (fileName.endsWith('.json')) {
      setImportFormat('json');
    } else {
      setImportFormat('csv');
    }
  };

  // CSV / JSON File Loader Helper
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processLoadedText(text, file.name);
    };
    reader.readAsText(file);
  };

  // Drag and Drop files handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processLoadedText(text, file.name);
    };
    reader.readAsText(file);
  };

  // Import Action Handler
  const handleImport = () => {
    if (!importText.trim()) {
      setImportResult({ success: false, message: 'Please provide CSV or JSON structured text or drag in a file.' });
      return;
    }

    try {
      if (importFormat === 'json') {
        const parsed = JSON.parse(importText);
        const parsedArray = Array.isArray(parsed) ? parsed : [parsed];
        const validated: Member[] = [];

        for (const item of parsedArray) {
          if (!item.firstName || !item.lastName || !item.email) {
            throw new Error(`Invalid member element: missing required fields (First Name, Last Name, or Email).`);
          }

          validated.push({
            id: item.id || generateId(),
            firstName: String(item.firstName),
            lastName: String(item.lastName),
            fullName: item.fullName || `${String(item.firstName)} ${String(item.lastName)}`,
            email: String(item.email),
            phone: String(item.phone || ''),
            dob: item.dob || '2000-01-01',
            gender: item.gender || 'Male',
            relationship: item.relationship || 'Unmarried',
            bloodGroup: item.bloodGroup || 'O +ve',
            diocese: item.diocese || 'Archdiocese of Madras - Mylapore',
            parish: item.parish || 'Sacred Heart Parish',
            parishPriest: item.parishPriest || 'Rev. Fr. Lawrence Raj PJ',
            country: item.country || 'India',
            currentAddress: item.currentAddress || String(item.address?.street || ''),
            permanentAddress: item.permanentAddress || '',
            membershipClass: (item.membershipClass || 'Active') as MembershipClass,
            status: (item.status || 'Active') as MemberStatus,
            joinedDate: String(item.joinedDate || new Date().toISOString().slice(0, 10)),
            avatarUrl: String(item.avatarUrl || 'bg-amber-600'),
            address: {
              street: String(item.address?.street || ''),
              city: String(item.address?.city || ''),
              state: String(item.address?.state || ''),
              zipCode: String(item.address?.zipCode || ''),
              country: String(item.address?.country || '')
            },
            notes: String(item.notes || ''),
            customFields: Array.isArray(item.customFields) ? item.customFields : [],
            lastActive: String(item.lastActive || new Date().toISOString()),
            ambition: item.ambition || 'Evangelize through digital media channels',
            hobbies: item.hobbies || 'Volunteering',
            techSkills: Array.isArray(item.techSkills) ? item.techSkills : ['Social Media Management'],
            softSkills: Array.isArray(item.softSkills) ? item.softSkills : ['Communication'],
            goals: Array.isArray(item.goals) ? item.goals : [],
            support: Array.isArray(item.support) ? item.support : [],
            pledgesAccepted: item.pledgesAccepted !== undefined ? !!item.pledgesAccepted : true
          });
        }

        onImport(validated);
        setImportResult({ success: true, message: 'Successfully parsed and merged records into the main Diocesan Directory.', count: validated.length });
        setImportText('');
        addActivityLog('Import JSON', 'system', 'Admin', `Successfully imported ${validated.length} dossiers via JSON raw file block.`);
      } else {
        // CSV Parser
        const lines = importText.split('\n');
        if (lines.length < 2) {
          throw new Error('CSV text does not contain headers or recognized record guidelines.');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const validated: Member[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cells: string[] = [];
          let currentCell = '';
          let insideQuotes = false;

          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              cells.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell.trim());

          if (cells.length < 3) continue;

          const getValue = (keyName: string, defaultValue = '') => {
            const colIdx = headers.indexOf(keyName.toLowerCase());
            return colIdx !== -1 && colIdx < cells.length ? cells[colIdx] : defaultValue;
          };

          const firstName = getValue('first name') || getValue('firstname');
          const lastName = getValue('last name') || getValue('lastname');
          const email = getValue('email');

          if (!firstName || !lastName || !email) {
            continue;
          }

          validated.push({
            id: generateId(),
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            phone: getValue('phone'),
            dob: '2000-01-01',
            gender: getValue('gender') || 'Male',
            relationship: 'Unmarried',
            bloodGroup: 'B +ve',
            diocese: getValue('diocese') || 'Archdiocese of Madras - Mylapore',
            parish: getValue('parish') || 'Local Shrine Parish',
            parishPriest: 'Rev. Fr. Lawrence Raj PJ',
            country: getValue('country') || 'India',
            currentAddress: getValue('street address') || getValue('street') || 'Chennai',
            permanentAddress: getValue('street address') || getValue('street') || 'Chennai',
            membershipClass: (getValue('membership class') || getValue('membershipclass') || 'Active') as MembershipClass,
            status: (getValue('status') || 'Active') as MemberStatus,
            joinedDate: getValue('date joined') || getValue('joineddate') || new Date().toISOString().slice(0, 10),
            avatarUrl: 'bg-amber-600',
            address: {
              street: getValue('street address') || getValue('street'),
              city: getValue('city') || 'Chennai',
              state: getValue('state') || 'Tamil Nadu',
              zipCode: getValue('zip code') || getValue('zipcode'),
              country: getValue('country') || 'India'
            },
            notes: getValue('notes').replace(/^"|"$/g, ''), 
            customFields: [],
            lastActive: new Date().toISOString(),
            ambition: 'Evangelize through digital media channels',
            hobbies: 'Volunteering',
            techSkills: ['Social Media Management'],
            softSkills: ['Communication'],
            goals: [],
            support: [],
            pledgesAccepted: true
          });
        }

        if (validated.length === 0) {
          throw new Error('No valid rows matched the mandatory fields (First Name, Last Name, Email).');
        }

        onImport(validated);
        setImportResult({ success: true, message: 'Successfully integrated canonical CSV table rows into core memory.', count: validated.length });
        setImportText('');
        addActivityLog('Import CSV', 'system', 'Admin', `Successfully imported ${validated.length} dossiers via CSV batch list.`);
      }
    } catch (e: unknown) {
      setImportResult({
        success: false,
        message: e instanceof Error ? e.message : 'Error occurred while decoding structured source.',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="bulk-utility-box">
      
      {/* EXPORTER CARD - ULTRA POLISHED SLATE/GOLD THEME */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between" id="exporter-card">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-650 block">Canonical Backup</span>
                <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wide">Secure Registry Export</h3>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-550 border border-slate-200 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
              {members.length} dossiers safe
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Safeguard and download backups of the entire digital directory. These exports can be analyzed in spreadsheet editors (such as Excel or LibreOffice) and re-imported back securely.
          </p>

          {/* Action buttons */}
          <div className="space-y-3.5 mb-6">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100U hover:from-white hover:to-white hover:border-amber-400 border border-slate-150 rounded-2xl transition duration-200 group shadow-3xs cursor-pointer"
              id="btn-export-csv"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl group-hover:bg-slate-900 group-hover:text-amber-300 transition duration-350">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-xs text-slate-950 uppercase tracking-wide">Generate CSV Ledger spreadsheet</span>
                  <span className="text-[10px] text-slate-450">Perfect for clerical reviews in Sheets, Excel or Numbers</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-450 group-hover:text-amber-800 transition" />
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100U hover:from-white hover:to-white hover:border-indigo-400 border border-slate-150 rounded-2xl transition duration-200 group shadow-3xs cursor-pointer"
              id="btn-export-json"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition duration-350">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-black text-xs text-slate-950 uppercase tracking-wide">Generate JSON raw database snapshot</span>
                  <span className="text-[10px] text-slate-450">Contains all nested object structures and advanced state blocks</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-450 group-hover:text-indigo-600 transition" />
            </button>
          </div>
        </div>

        {/* Informative Security tips */}
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 select-none">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-700 leading-relaxed">
            <span className="font-extrabold uppercase tracking-wider text-amber-850 block mb-1">Clerical Custody Protocol</span>
            Exported registers contain secure contact details. Keep files stored inside encrypted storage. Revoke authorization for secondary agents once tasks are complete.
          </div>
        </div>
      </div>

      {/* IMPORTER CARD - HIGH-DENSITY INTERACTIVE WITH DRAG & DROP */}
      <div 
        className={`bg-white rounded-3xl border-2 transition-all duration-300 p-6 flex flex-col h-full ${
          isDragging ? 'border-amber-400 bg-amber-500/[0.01]' : 'border-slate-205 shadow-xs'
        }`}
        id="importer-card"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600 block">Directory Merging</span>
              <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wide">Integrated Batch Importer</h3>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            id="btn-trigger-upload"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select File</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, .txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Drop a CSV or JSON file onto this dropzone, or paste raw text values directly inside the console canvas below for immediate integration.
        </p>

        {/* Format selectors tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 self-start" id="importer-tabs-bar">
          <button
            type="button"
            onClick={() => { setImportFormat('csv'); setImportResult(null); }}
            className={`py-1.5 px-3 font-bold text-[10.5px] rounded-lg uppercase tracking-wider transition cursor-pointer ${importFormat === 'csv' ? 'bg-white text-slate-950 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            CSV plaintext
          </button>
          <button
            type="button"
            onClick={() => { setImportFormat('json'); setImportResult(null); }}
            className={`py-1.5 px-3 font-bold text-[10.5px] rounded-lg uppercase tracking-wider transition cursor-pointer ${importFormat === 'json' ? 'bg-white text-slate-950 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            JSON Raw list
          </button>
        </div>

        {/* Input Textarea Block */}
        <div className="relative group flex-grow mb-4">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={importFormat === 'csv' 
              ? "First Name, Last Name, Email, Membership Class, Status\nMarie, Joseph, marie.j@vegvox.in, Active, Active\nLawrence, Raj, lawraj@vox.in, Priest, Affiliated"
              : `[\n  {\n    "firstName": "Marie",\n    "lastName": "Joseph",\n    "email": "marie.j@vegvox.in",\n    "membershipClass": "Active",\n    "status": "Active"\n  }\n]`
            }
            className="w-full h-40 p-4 text-[11px] font-mono border border-slate-205 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 bg-slate-50/40 focus:bg-white transition duration-200"
            id="textarea-import-raw"
          />
          {importText === '' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-40">
              <div className="text-center">
                <FileText className="w-10 h-10 text-slate-350 mx-auto stroke-[1] mb-2 animate-bounce" />
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">Drop File / Paste Raw Data</span>
              </div>
            </div>
          )}
        </div>

        {/* Validation / Execution responses - Premium design */}
        {importResult && (
          <div className={`p-4 rounded-2xl border-2 mb-4 flex items-start gap-3 text-xs animate-fade-in ${
            importResult.success 
              ? 'bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-950' 
              : 'bg-rose-500/[0.03] border-rose-500/20 text-rose-950'
          }`} id="import-report">
            {importResult.success ? (
              <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 bg-rose-100 rounded-lg text-rose-700 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="font-extrabold uppercase tracking-wide text-xs block mb-0.5">
                {importResult.success ? 'Import process validated' : 'Dossier parsing aborted'}
              </span>
              <p className="text-slate-600 pr-2 leading-relaxed">
                {importResult.message} {importResult.count && `Integrated exactly ${importResult.count} canonical profile dossiers.`}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleImport}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 border border-slate-950 text-amber-300 hover:text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition duration-150 flex items-center justify-center gap-2 group"
          id="btn-commit-import"
        >
          <UserPlus className="w-4 h-4 text-amber-400 group-hover:scale-110 transition duration-150" />
          <span>Ingest &amp; Authorize Dossiers</span>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-150" />
        </button>
      </div>

    </div>
  );
}
