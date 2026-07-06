const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  return result;
}

// Read the three parts
console.log('Reading raw CSV parts...');
const raw1 = fs.readFileSync(path.join(__dirname, 'raw_1.csv'), 'utf8');
const raw2 = fs.readFileSync(path.join(__dirname, 'raw_2.csv'), 'utf8');
const raw3 = fs.readFileSync(path.join(__dirname, 'raw_3.csv'), 'utf8');

// Combine parts. Notice raw_2 and raw_3 do not have header rows
const lines1 = parseCSV(raw1);
const lines2 = parseCSV(raw2);
const lines3 = parseCSV(raw3);

// Concat lines
const allLines = [...lines1, ...lines2, ...lines3];
console.log(`Total lines parsed: ${allLines.length}`);

// We will generate sequential IDs for users without IDs, starting from 250315
let baseGeneratedId = 250315;

const members = [];
const avatarColors = [
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500'
];

function formatDate(raw) {
  if (!raw) return '2025-03-13';
  // Check if formatted like 3/13/2025 18:25:21
  const m = raw.match(/^(\d+)\/(\d+)\/(\d+)/);
  if (m) {
    const month = m[1].padStart(2, '0');
    const day = m[2].padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  return '2025-03-13';
}

function formatDOB(raw) {
  if (!raw) return '2000-01-01';
  // If formatted like Oct 24, 2002 or Jan 22, 1988
  // Just return the raw string or format cleanly
  return raw.replace(/^"|"$/g, '').trim();
}

for (let i = 0; i < allLines.length; i++) {
  const cells = allLines[i];
  if (cells.length < 10) continue;
  
  const email = cells[2];
  if (!email || !email.includes('@') || email === 'Email Address') continue;
  
  // Extract and clean raw data
  let id = cells[1] ? cells[1].trim() : '';
  if (!id) {
    id = String(baseGeneratedId++);
  }
  
  const fullName = cells[3] ? cells[3].replace(/^"|"$/g, '').trim() : 'Anonymous';
  const nameParts = fullName.split(/\s+/);
  let firstName = fullName;
  let lastName = '';
  if (nameParts.length > 1) {
    firstName = nameParts.slice(0, -1).join(' ');
    lastName = nameParts[nameParts.length - 1];
  }
  
  const dob = formatDOB(cells[4]);
  const bloodGroup = cells[5] || 'O +ve';
  const phone = cells[6] ? cells[6].replace(/\D/g, '').slice(-10) : ''; 
  const currentAddress = cells[8] ? cells[8].replace(/^"|"$/g, '').replace(/\s+/g, ' ').trim() : 'No address provided';
  const permanentAddress = cells[9] ? cells[9].replace(/^"|"$/g, '').replace(/\s+/g, ' ').trim() : currentAddress;
  const country = cells[10] || 'India';
  const education = cells[11] || 'Graduate';
  const profession = cells[12] || cells[43] || 'Reporter - Cathfluencer';
  const diocese = cells[13] || 'Archdiocese of Madras - Mylapore';
  const parish = cells[14] || 'Sacred Heart Parish';
  const parishPriest = cells[15] || 'Rev. Fr. Lawrence Raj PJ';
  
  const instagram = cells[16] || '';
  const facebook = cells[17] || '';
  const igPages = cells[18] || '';
  const fbPages = cells[19] || '';
  const ytChannels = cells[20] || '';
  
  const ambition = cells[21] || 'Evangelize through digital media channels';
  const hobbies = cells[22] || 'Volunteering';
  const fiveYears = cells[23] || '';
  const achievements = cells[24] || '';
  
  const techSkills = cells[25] ? cells[25].split(',').map(s => s.trim()).filter(Boolean) : ['Social Media Management'];
  const softSkills = cells[26] ? cells[26].split(',').map(s => s.trim()).filter(Boolean) : ['Communication'];
  const goals = cells[27] ? cells[27].split(',').map(s => s.trim()).filter(Boolean) : [];
  const support = cells[28] ? cells[28].split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const frequency = cells[29] || 'Weekly';
  const mode = cells[30] || 'Both';
  const ideas = cells[32] || '';
  const roles = cells[31] || '';
  
  const gender = cells[39] || 'Male';
  const relationship = cells[40] || 'Unmarried';
  const joinedDate = formatDate(cells[0]);
  const status = cells[43] || 'Affiliated'; // Last status col is at index 43
  
  // Clean designation or status
  const finalStatus = (status === 'Affiliated' || status === 'Abdicated' || status === 'ID card to be provided' || status === 'Data Insufficient' || status === 'Director') 
    ? status 
    : 'Pending';

  const avatarUrl = avatarColors[members.length % avatarColors.length];
  
  const notes = `Profession: ${profession}. Primary goal: ${ambition}`;
  
  // Format member address safely
  const addressParts = currentAddress.split(',');
  const street = addressParts[0] || 'Chennai';
  const city = addressParts[1] || 'Chennai';
  const state = 'Tamil Nadu';
  const zipCode = currentAddress.match(/\b\d{6}\b/) ? currentAddress.match(/\b\d{6}\b/)[0] : '600001';
  
  members.push({
    id: `CF-${id}`,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    dob,
    gender,
    relationship,
    bloodGroup,
    diocese,
    parish,
    parishPriest,
    country,
    currentAddress,
    permanentAddress,
    address: {
      street,
      city,
      state,
      zipCode,
      country
    },
    membershipClass: (cells[42] === 'Director' || cells[42] === 'Director of Operations') ? 'Director' : 'Active',
    education,
    profession,
    instagram,
    facebook,
    igPages,
    fbPages,
    ytChannels,
    ambition,
    hobbies,
    fiveYears,
    achievements,
    techSkills,
    softSkills,
    goals,
    support,
    frequency,
    mode,
    ideas,
    roles,
    pledgesAccepted: true,
    joinedDate,
    status: finalStatus,
    avatarUrl,
    notes,
    customFields: [
      { key: "Designation", value: cells[42] || "Reporter - Cathfluencer" },
      { key: "Required Docs Recd", value: cells[41] || "No" }
    ],
    lastActive: new Date().toISOString()
  });
}

console.log(`Mapping logic generated ${members.length} clean high-fidelity members!`);

// Generate Output string
let outStr = `import { Member } from './types';\n\nexport const INITIAL_MEMBERS: Member[] = [\n`;

members.forEach((m, idx) => {
  outStr += `  {\n`;
  outStr += `    id: ${JSON.stringify(m.id)},\n`;
  outStr += `    firstName: ${JSON.stringify(m.firstName)},\n`;
  outStr += `    lastName: ${JSON.stringify(m.lastName)},\n`;
  outStr += `    fullName: ${JSON.stringify(m.fullName)},\n`;
  outStr += `    email: ${JSON.stringify(m.email)},\n`;
  outStr += `    phone: ${JSON.stringify(m.phone)},\n`;
  outStr += `    dob: ${JSON.stringify(m.dob)},\n`;
  outStr += `    gender: ${JSON.stringify(m.gender)},\n`;
  outStr += `    relationship: ${JSON.stringify(m.relationship)},\n`;
  outStr += `    bloodGroup: ${JSON.stringify(m.bloodGroup)},\n`;
  outStr += `    diocese: ${JSON.stringify(m.diocese)},\n`;
  outStr += `    parish: ${JSON.stringify(m.parish)},\n`;
  outStr += `    parishPriest: ${JSON.stringify(m.parishPriest)},\n`;
  outStr += `    country: ${JSON.stringify(m.country)},\n`;
  outStr += `    currentAddress: ${JSON.stringify(m.currentAddress)},\n`;
  outStr += `    permanentAddress: ${JSON.stringify(m.permanentAddress)},\n`;
  outStr += `    address: {\n`;
  outStr += `      street: ${JSON.stringify(m.address.street)},\n`;
  outStr += `      city: ${JSON.stringify(m.address.city)},\n`;
  outStr += `      state: ${JSON.stringify(m.address.state)},\n`;
  outStr += `      zipCode: ${JSON.stringify(m.address.zipCode)},\n`;
  outStr += `      country: ${JSON.stringify(m.address.country)}\n`;
  outStr += `    },\n`;
  outStr += `    membershipClass: ${JSON.stringify(m.membershipClass)},\n`;
  outStr += `    education: ${JSON.stringify(m.education)},\n`;
  outStr += `    profession: ${JSON.stringify(m.profession)},\n`;
  outStr += `    instagram: ${JSON.stringify(m.instagram)},\n`;
  outStr += `    facebook: ${JSON.stringify(m.facebook)},\n`;
  outStr += `    igPages: ${JSON.stringify(m.igPages)},\n`;
  outStr += `    fbPages: ${JSON.stringify(m.fbPages)},\n`;
  outStr += `    ytChannels: ${JSON.stringify(m.ytChannels)},\n`;
  outStr += `    ambition: ${JSON.stringify(m.ambition)},\n`;
  outStr += `    hobbies: ${JSON.stringify(m.hobbies)},\n`;
  outStr += `    fiveYears: ${JSON.stringify(m.fiveYears)},\n`;
  outStr += `    achievements: ${JSON.stringify(m.achievements)},\n`;
  outStr += `    techSkills: ${JSON.stringify(m.techSkills)},\n`;
  outStr += `    softSkills: ${JSON.stringify(m.softSkills)},\n`;
  outStr += `    goals: ${JSON.stringify(m.goals)},\n`;
  outStr += `    support: ${JSON.stringify(m.support)},\n`;
  outStr += `    frequency: ${JSON.stringify(m.frequency)},\n`;
  outStr += `    mode: ${JSON.stringify(m.mode)},\n`;
  outStr += `    ideas: ${JSON.stringify(m.ideas)},\n`;
  outStr += `    roles: ${JSON.stringify(m.roles)},\n`;
  outStr += `    pledgesAccepted: true,\n`;
  outStr += `    joinedDate: ${JSON.stringify(m.joinedDate)},\n`;
  outStr += `    status: ${JSON.stringify(m.status)},\n`;
  outStr += `    avatarUrl: ${JSON.stringify(m.avatarUrl)},\n`;
  outStr += `    notes: ${JSON.stringify(m.notes)},\n`;
  outStr += `    customFields: [\n`;
  m.customFields.forEach((cf, cfIdx) => {
    outStr += `      { key: ${JSON.stringify(cf.key)}, value: ${JSON.stringify(cf.value)} }${cfIdx < m.customFields.length - 1 ? ',' : ''}\n`;
  });
  outStr += `    ],\n`;
  outStr += `    lastActive: ${JSON.stringify(m.lastActive)}\n`;
  outStr += `  }${idx < members.length - 1 ? ',' : ''}\n`;
});

outStr += `];\n\n`;

outStr += `export const AVATAR_COLOR_PRESETS = [
  { name: 'Emerald', value: 'bg-emerald-500 text-white' },
  { name: 'Indigo', value: 'bg-indigo-500 text-white' },
  { name: 'Rose', value: 'bg-rose-500 text-white' },
  { name: 'Amber', value: 'bg-amber-500 text-white' },
  { name: 'Purple', value: 'bg-purple-500 text-white' },
  { name: 'Cyan', value: 'bg-cyan-500 text-white' },
  { name: 'Orange', value: 'bg-orange-500 text-white' },
  { name: 'Pink', value: 'bg-pink-500 text-white' }
];\n`;

fs.writeFileSync(path.join(__dirname, 'mockData.ts'), outStr, 'utf8');
console.log('Saved processed typesafe data back to mockData.ts successfully!');
