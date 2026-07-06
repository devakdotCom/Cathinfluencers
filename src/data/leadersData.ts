export interface Leader {
  id: string;
  title: string;
  name: string;
  role: string;
  subRole?: string;
  image: string;
  fallbackImage: string;
  bgColor?: string;
}

const popeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%" style="border-radius: 12px; background: linear-gradient(135deg, #4c0519, #881337);">
  <!-- Vatican/Sanctuary Light Radial Glow -->
  <circle cx="150" cy="115" r="90" fill="#fef08a" fill-opacity="0.1" filter="blur(25px)" />

  <!-- Background Balcony Drapes on Left and Right -->
  <path d="M 0,0 C 35,50 35,250 0,300 Z" fill="#2d0610" opacity="0.8" />
  <path d="M 300,0 C 265,50 265,250 300,300 Z" fill="#2d0610" opacity="0.8" />

  <!-- Pope Body / Crimson Red Mozzetta over White Cassock -->
  <!-- Base White Cassock shape -->
  <path d="M 70,285 C 70,205 105,190 150,190 C 195,190 230,205 230,285" fill="#ffffff" />
  
  <!-- Red Mozzetta shape -->
  <path d="M 85,210 C 85,185 110,180 150,180 C 190,180 215,185 215,210 C 215,250 195,268 150,268 C 105,268 85,250 85,210 Z" fill="#b91c1c" />
  <!-- Mozzetta middle border / Gold Buttons -->
  <line x1="150" y1="180" x2="150" y2="265" stroke="#fbbf24" stroke-width="2" />
  <circle cx="150" cy="200" r="3" fill="#d97706" />
  <circle cx="150" cy="216" r="3" fill="#d97706" />
  <circle cx="150" cy="232" r="3" fill="#d97706" />
  <circle cx="150" cy="248" r="3" fill="#d97706" />

  <!-- Pure White Cassock Collar -->
  <path d="M 125,180 C 135,177 165,177 175,180 L 175,186 C 165,188 135,188 125,186 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5" />

  <!-- Gorgeous Liturgical Stole on Left & Right with Red Crosses -->
  <!-- Left Column -->
  <path d="M 116,190 L 126,275 L 108,275 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
  <path d="M 112,215 H 120 M 116,211 V 219" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 113,248 H 121 M 117,244 V 252" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Right Column -->
  <path d="M 184,190 L 174,275 L 192,275 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
  <path d="M 180,215 H 188 M 184,211 V 219" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 179,248 H 187 M 183,244 V 252" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" />

  <!-- Ornate Golden Pectoral Cross with red gemstone -->
  <path d="M 132,185 C 138,206 162,206 168,185" fill="none" stroke="#fbbf24" stroke-width="2.2" />
  <path d="M 150,205 L 150,234 M 138,215 L 162,215" stroke="#fbbf24" stroke-width="5" stroke-linecap="round" fill="none" />
  <path d="M 150,205 L 150,234 M 138,215 L 162,215" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <circle cx="150" cy="215" r="2" fill="#ef4444" />

  <!-- Face and Graceful Neck -->
  <path d="M 130,150 L 130,185 L 170,185 L 170,150 Z" fill="#fddfbc" />
  <circle cx="150" cy="130" r="39" fill="#fddfbc" />

  <!-- Wise Old Man grey/white side hair -->
  <path d="M 111,122 C 107,125 106,138 110,143" stroke="#f1f5f9" stroke-width="7" stroke-linecap="round" fill="none" />
  <path d="M 189,122 C 193,125 194,138 190,143" stroke="#f1f5f9" stroke-width="7" stroke-linecap="round" fill="none" />
  <path d="M 115,110 C 122,95 178,95 185,110" stroke="#f8fafc" stroke-width="11" stroke-linecap="round" fill="none" />

  <!-- Pure White Papal Zucchetto (Skullcap) -->
  <path d="M 118,97 C 118,78 182,78 182,97 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />

  <!-- Gold thin-rimmed glasses -->
  <rect x="122" y="112" width="21" height="14" rx="4" fill="none" stroke="#fbbf24" stroke-width="1.8" />
  <rect x="157" y="112" width="21" height="14" rx="4" fill="none" stroke="#fbbf24" stroke-width="1.8" />
  <path d="M 143,119 H 157" stroke="#fbbf24" stroke-width="1.8" />
  
  <!-- Gentle focused eyes -->
  <circle cx="132.5" cy="119" r="2.5" fill="#1e293b" />
  <circle cx="167.5" cy="119" r="2.5" fill="#1e293b" />

  <!-- Smiling expression & classic cheek outlines -->
  <path d="M 132,142 C 138,151 162,151 168,142" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round" />
  <path d="M 125,137 C 127,140 129,141 131,140" fill="none" stroke="#9a3412" stroke-width="1.2" />
  <path d="M 175,137 C 173,140 171,141 169,140" fill="none" stroke="#9a3412" stroke-width="1.2" />
  <!-- Nose outline -->
  <path d="M 150,121 L 150,133 Q 146,136 143,136" fill="none" stroke="#9a3412" stroke-width="2" stroke-linecap="round" />

  <!-- Signature Dual Raised Waving Hands of Blessing -->
  <!-- Left Hand sleeve & hand waving -->
  <path d="M 85,225 Q 40,180 50,135 L 72,143 Q 62,180 85,210 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <path d="M 50,135 L 72,143" stroke="#fbbf24" stroke-width="3" />
  <path d="M 44,136 C 42,122 46,110 50,108 C 51,107 54,115 54,124 L 57.5,104 C 59.5,103 61,114 60.5,124 L 64.5,107 C 66.5,107 67,116 66.5,125 L 71,112 C 73,112 74,123 71,131 Q 67,143 55,140 Z" fill="#fed7aa" stroke="#e7a57a" stroke-width="0.8" />

  <!-- Right Hand sleeve & hand waving -->
  <path d="M 215,225 Q 260,180 250,135 L 228,143 Q 238,180 215,210 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <path d="M 250,135 L 228,143" stroke="#fbbf24" stroke-width="3" />
  <path d="M 256,136 C 258,122 254,110 250,108 C 249,107 246,115 246,124 L 242.5,104 C 240.5,103 239,114 239.5,124 L 235.5,107 C 233.5,107 233,116 233.5,125 L 229,112 C 227,112 226,123 229,131 Q 233,143 245,140 Z" fill="#fed7aa" stroke="#e7a57a" stroke-width="0.8" />
</svg>`;

const archbishopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%" style="border-radius: 12px; background: linear-gradient(135deg, #0f172a, #1e3a8a);">
  <!-- Archbishop Canopy/Cathedral Light -->
  <path d="M 150,10 L 280,110 L 280,290 L 20,290 L 20,110 Z" fill="none" stroke="#2563eb" stroke-opacity="0.1" stroke-width="3" />
  <circle cx="150" cy="110" r="80" fill="#3b82f6" fill-opacity="0.1" filter="blur(25px)" />

  <!-- Golden Pulpit Desk / Ambo at bottom -->
  <path d="M 50,290 L 80,240 L 220,240 L 250,290 Z" fill="#d97706" />
  <path d="M 80,240 L 150,220 L 220,240 M 150,220 L 150,240" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" />
  <!-- Microphones -->
  <path d="M 100,240 L 135,195" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="135" cy="195" r="4" fill="#0f172a" />
  <path d="M 200,240 L 165,195" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="165" cy="195" r="4" fill="#0f172a" />

  <!-- Archbishop Body / White Chasuble -->
  <path d="M 70,280 C 70,205 105,190 150,190 C 195,190 230,205 230,280" fill="#ffffff" />
  
  <!-- Pectoral Cross (Crucifix) with Green cord -->
  <path d="M 125,190 C 135,215 165,215 175,190" fill="none" stroke="#16a34a" stroke-width="2.5" />
  <path d="M 150,205 L 150,230 M 140,213 L 160,213" stroke="#fbbf24" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <circle cx="150" cy="213" r="2" fill="#ef4444" />

  <!-- Face with Golden Glasses -->
  <path d="M 110,130 C 110,90 190,90 190,130 C 190,170 110,170 110,130 Z" fill="#eb8d70" />
  
  <!-- Eyes & Smiling expression -->
  <circle cx="135" cy="120" r="11" fill="none" stroke="#fbbf24" stroke-width="2" />
  <circle cx="165" cy="120" r="11" fill="none" stroke="#fbbf24" stroke-width="2" />
  <path d="M 146,120 L 154,120" stroke="#fbbf24" stroke-width="2" />
  <circle cx="135" cy="120" r="3" fill="#1e293b" />
  <circle cx="165" cy="120" r="3" fill="#1e293b" />
  
  <!-- Nose & friendly broad smile -->
  <path d="M 150,122 L 150,136 Q 146,140 143,140" fill="none" stroke="#9a3412" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 132,148 C 138,158 162,158 168,148" fill="none" stroke="#7f1d1d" stroke-width="3" stroke-linecap="round" />
  <path d="M 120,148 Q 150,165 180,148" fill="none" stroke="#1e3a8a" stroke-width="1.5" />

  <!-- Dark Hair on temples and side -->
  <path d="M 108,120 C 105,125 105,140 109,145" stroke="#1e293b" stroke-width="6" stroke-linecap="round" fill="none" />
  <path d="M 192,120 C 195,125 195,140 191,145" stroke="#1e293b" stroke-width="6" stroke-linecap="round" fill="none" />

  <!-- Tall Hierarchical Archbishop Mitre -->
  <path d="M 108,98 L 150,15 L 192,98 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <path d="M 108,98 C 120,106 180,106 192,98 L 192,94 L 108,94 Z" fill="#fbbf24" />
  <!-- Golden Embroideries -->
  <path d="M 150,18 L 150,94 M 138,45 L 162,45" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
  <path d="M 143,92 L 143,18 M 157,92 L 157,18" stroke="#fbbf24" stroke-width="2" />
  <circle cx="150" cy="18" r="4" fill="#fbbf24" />
</svg>`;

const priestSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%" style="border-radius: 12px; background: linear-gradient(135deg, #064e3b, #111827);">
  <!-- Foliage / Green Tree Arch Background -->
  <path d="M 20,300 C 40,120 260,120 280,300" fill="none" stroke="#10b981" stroke-opacity="0.08" stroke-width="30" stroke-linecap="round" />
  <circle cx="150" cy="120" r="70" fill="#059669" fill-opacity="0.1" filter="blur(25px)" />

  <!-- Priest Body / Cassock & Roman Collar -->
  <path d="M 70,285 C 70,215 105,195 150,195 C 195,195 230,215 230,285 Z" fill="#0c0a09" />
  
  <!-- Clergy band / White Collar -->
  <path d="M 125,198 H 175 V 212 H 125 Z" fill="#0c0a09" />
  <path d="M 138,198 H 162 V 210 H 138 Z" fill="#ffffff" /> <!-- White Insert tab -->
  
  <!-- Face with Beard & Mustache -->
  <path d="M 110,132 C 110,95 190,95 190,132 C 190,172 110,172 110,132 Z" fill="#fbcfe8" fill-opacity="0.1" />
  <path d="M 110,132 C 110,92 190,92 190,132 C 190,172 110,172 110,132 Z" fill="#fcd34d" fill-opacity="0.2" />
  <path d="M 110,132 C 110,92 190,92 190,132 Z" fill="#fbcfe8" />
  
  <!-- Beard and Mustache details -->
  <!-- Beard shadow overlay -->
  <path d="M 110,132 C 110,178 190,178 190,132 C 190,178 110,178 110,132" fill="#1e293b" />
  <path d="M 115,130 C 115,170 185,170 185,130 C 185,160 115,160 115,130" fill="#0f172a" />
  
  <!-- Face details -->
  <path d="M 118,125 C 118,100 182,100 182,125" fill="#fbcfe8" />
  <circle cx="136" cy="118" r="3" fill="#0f172a" />
  <circle cx="164" cy="118" r="3" fill="#0f172a" />
  <path d="M 130,110 C 135,108 142,108 144,111" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
  <path d="M 170,110 C 165,108 158,108 156,111" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />

  <!-- Nose & Smile in beard -->
  <path d="M 150,118 L 150,130 Q 147,133 144,133" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
  <path d="M 135,142 C 142,148 158,148 165,142" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /> <!-- white teeth smile -->

  <!-- Well-groomed black hair -->
  <path d="M 110,95 C 125,75 175,75 190,95 C 195,105 192,118 190,122 M 110,95 C 105,105 108,118 110,122" fill="none" stroke="#0f172a" stroke-width="12" stroke-linecap="round" />
  <path d="M 118,90 Q 150,75 182,90" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round" />
</svg>`;

const operationsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%" style="border-radius: 12px; background: linear-gradient(135deg, #1e293b, #0f172a);">
  <!-- Technical Grid background -->
  <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="0" y1="100" x2="300" y2="100" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="0" y1="150" x2="300" y2="150" stroke="#334155" stroke-opacity="0.3" stroke-width="1.5" />
  <line x1="0" y1="200" x2="300" y2="200" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="0" y1="250" x2="300" y2="250" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  
  <line x1="50" y1="0" x2="50" y2="300" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="100" y1="0" x2="100" y2="300" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="150" y1="0" x2="150" y2="300" stroke="#334155" stroke-opacity="0.3" stroke-width="1.5" />
  <line x1="200" y1="0" x2="200" y2="300" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />
  <line x1="250" y1="0" x2="250" y2="300" stroke="#334155" stroke-opacity="0.2" stroke-width="1" />

  <!-- Gear Vector symbol in top-right -->
  <circle cx="240" cy="60" r="16" fill="none" stroke="#f59e0b" stroke-opacity="0.15" stroke-width="3" />
  <circle cx="240" cy="60" r="6" fill="#f59e0b" fill-opacity="0.15" />

  <!-- Body / Stylish Black Collared Shirt -->
  <path d="M 65,280 C 65,215 100,195 150,195 C 200,195 235,215 235,280 Z" fill="#1e1b4b" />
  <path d="M 120,195 L 150,230 L 180,195 C 180,195 150,210 120,195 Z" fill="#0f172a" /> <!-- Collar Cut -->
  <line x1="150" y1="230" x2="150" y2="280" stroke="#312e81" stroke-width="3" stroke-linecap="round" />
  
  <!-- Gold chain necklace -->
  <path d="M 115,200 C 130,225 170,225 185,200" fill="none" stroke="#f59e0b" stroke-width="2.5" />

  <!-- Smiling face, clean-cut, good beard -->
  <path d="M 110,130 C 110,90 190,90 190,130 C 190,170 110,170 110,130 Z" fill="#ffedd5" />
  
  <!-- Subtle Designer Beard shadow -->
  <path d="M 110,130 C 110,172 190,172 190,130 C 190,176 110,176 110,130" fill="#334155" fill-opacity="0.3" />
  <path d="M 125,152 C 135,158 165,158 175,152" fill="none" stroke="#334155" stroke-width="4" stroke-linecap="round" />

  <!-- Eyes and beautiful friendly smile -->
  <circle cx="136" cy="118" r="3.5" fill="#0f172a" />
  <circle cx="164" cy="118" r="3.5" fill="#0f172a" />
  <path d="M 130,108 Q 138,105 142,109" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
  <path d="M 170,108 Q 162,105 158,109" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
  <path d="M 150,119 L 150,129 Q 146,132 143,132" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round" />
  <path d="M 132,143 C 140,154 160,154 168,143" fill="none" stroke="#991b1b" stroke-width="3.5" stroke-linecap="round" fill-opacity="0.1" />
  <!-- Glistening White Smile -->
  <path d="M 134,142 Q 150,152 166,142" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />

  <!-- Modern Styled hair -->
  <path d="M 106,120 V 100 Q 110,80 150,80 Q 190,80 194,100 V 120" stroke="#0f172a" stroke-width="12" stroke-linecap="round" fill="none" />
  <path d="M 125,82 Q 150,70 175,82" stroke="#0f172a" stroke-width="16" stroke-linecap="round" fill="none" />
</svg>`;

const ctoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%" style="border-radius: 12px; background: linear-gradient(135deg, #1e1b4b, #312e81);">
  <!-- Digital lines / grid in cyber theme -->
  <path d="M 0,100 Q 150,150 300,100 M 0,200 Q 150,150 300,200" fill="none" stroke="#6366f1" stroke-opacity="0.15" stroke-width="2" />
  <circle cx="60" cy="220" r="2" fill="#818cf8" stroke="#818cf8" stroke-width="4" stroke-opacity="0.5" />
  <circle cx="240" cy="180" r="2" fill="#818cf8" stroke="#818cf8" stroke-width="4" stroke-opacity="0.5" />
  <line x1="60" y1="220" x2="240" y2="180" stroke="#818cf8" stroke-opacity="0.1" stroke-width="1" />

  <!-- Body / Business Suit, White Shirt & Red Tie -->
  <path d="M 60,280 C 60,215 95,195 150,195 C 205,195 240,215 240,280 Z" fill="#475569" /> <!-- Grey suit jacket -->
  <path d="M 105,195 L 150,280 L 195,195 Z" fill="#ffffff" /> <!-- White inner shirt -->
  
  <!-- Red Tie -->
  <path d="M 142,220 L 158,220 L 154,275 L 146,275 Z" fill="#dc2626" />
  <path d="M 141,208 L 159,208 L 152,222 L 148,222 Z" fill="#b91c1c" /> <!-- Tie Knot -->
  
  <!-- Suit lapels -->
  <path d="M 105,195 L 138,245" stroke="#334155" stroke-width="12" stroke-linecap="round" />
  <path d="M 195,195 L 162,245" stroke="#334155" stroke-width="12" stroke-linecap="round" />

  <!-- Handsome face with dark hair, smart beard -->
  <path d="M 110,130 C 110,90 190,90 190,130 C 190,170 110,170 110,130 Z" fill="#fed7aa" />
  
  <!-- Neat beard and mustache -->
  <path d="M 110,130 C 110,174 190,174 190,130 C 190,178 110,178 110,130" fill="#1e293b" />
  <path d="M 115,130 C 115,166 185,166 185,130 C 185,158 115,158 115,130" fill="#0f172a" />
  
  <path d="M 118,125 C 118,102 182,102 182,125" fill="#fed7aa" />
  
  <!-- Eyes -->
  <circle cx="136" cy="118" r="3.5" fill="#0f172a" />
  <circle cx="164" cy="118" r="3.5" fill="#0f172a" />
  <path d="M 128,108 Q 136,105 142,108" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 172,108 Q 164,105 158,108" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" />

  <!-- Nose & Smile -->
  <path d="M 150,119 L 150,129 Q 146,132 143,132" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
  <path d="M 134,142 C 142,148 158,148 166,142" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /> <!-- friendly white teeth smile -->

  <!-- Perfect beard sideburns / hair -->
  <path d="M 106,120 V 100 Q 110,75 150,75 Q 190,75 194,100 V 120" stroke="#0f172a" stroke-width="12" stroke-linecap="round" fill="none" />
  <path d="M 125,78 Q 150,65 175,78" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round" />
</svg>`;

// Convert inline SVGs into safe, offline-capable base64 data URLs
const toBase64Uri = (svgStr: string) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;

export const leadersList: Leader[] = [
  {
    id: "pope",
    title: "His Holiness",
    name: "Pope Leo XIV",
    role: "Head of the Catholic Church",
    image: "/leaders/pope.webp",
    fallbackImage: toBase64Uri(popeSvg),
    bgColor: "from-amber-500/10 to-transparent"
  },
  {
    id: "archbishop",
    title: "His Grace",
    name: "Abp. Dr. George Antonysamy",
    role: "Archbishop & Chairman",
    subRole: "Archdiocese of Madras - Mylapore",
    image: "/leaders/archbishop.webp",
    fallbackImage: toBase64Uri(archbishopSvg),
    bgColor: "from-blue-500/10 to-transparent"
  },
  {
    id: "priest",
    title: "Reverend",
    name: "Fr. Ritchie Vincent A",
    role: "Secretary - Commission for",
    subRole: "Social Communications",
    image: "/leaders/priest.webp",
    fallbackImage: toBase64Uri(priestSvg),
    bgColor: "from-emerald-500/10 to-transparent"
  },
  {
    id: "operations",
    title: "",
    name: "Er. Maria Irudaya Regilan J",
    role: "Director of Operations",
    subRole: "Vox Ecclesiae",
    image: "/leaders/operations.webp",
    fallbackImage: toBase64Uri(operationsSvg),
    bgColor: "from-amber-600/10 to-transparent"
  },
  {
    id: "cto",
    title: "",
    name: "Mr. Phillip Amal Antony",
    role: "Chief Technical Officer",
    subRole: "Vox Ecclesiae",
    image: "/leaders/cto.webp",
    fallbackImage: toBase64Uri(ctoSvg),
    bgColor: "from-indigo-500/10 to-transparent"
  }
];
