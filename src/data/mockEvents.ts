import { Announcement, CalendarEvent } from '../types';

// Helper to get relative dates in YYYY-MM-DD format
function getRelativeDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Digital Apostolic Decree: Diocesan Registry Launch',
    content: 'We are pleased to introduce the Vox Ecclesiae unified registry, empowering Cathfluencers and content creators to catalog their handles, parish affiliations, and media channels. Let us stand united to elevate local digital media ministry.',
    author: 'Archdiocese Media Advisory',
    createdAt: new Date().toISOString(),
    priority: 'high'
  },
  {
    id: 'ann_2',
    title: 'Upcoming Apologetics Training Series',
    content: 'An intensive virtual training series focusing on Catholic Apologetics in the digital era will commence soon. Designed specifically for social media creators and writers.',
    author: 'Fr. Ritchie Vincent',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    priority: 'medium'
  },
  {
    id: 'ann_3',
    title: 'St. Clare Digital Patronage Feast Day Prep',
    content: 'Preparation is underway for our annual celebration honoring St. Clare of Assisi, the patron saint of television and communications. Content creators are encouraged to submit visual tribute shorts.',
    author: 'Media Commission Team',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    priority: 'low'
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev_1',
    title: 'Archdiocesan Media Commission Meeting',
    description: 'Quarterly review of digital outreach statistics, parish dashboard results, and onboarding policies for new Cathfluencer applicants.',
    date: getRelativeDate(0), // Today
    time: '10:00',
    type: 'meeting',
    category: 'Clergy',
    location: 'Archdiocese Headquarters (Conference Hall B)',
    link: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'ev_2',
    title: 'Solemnity of Corpus Christi Feast',
    description: 'Diocesan Eucharistic Procession and special collaborative media coverage. All registered video creators are invited to assist in the live streaming team.',
    date: getRelativeDate(3), // 3 days from now
    type: 'feast',
    category: 'General',
    location: 'St. Thomas Cathedral Basilica, Santhome'
  },
  {
    id: 'ev_3',
    title: 'Youth Media Commission Workshop',
    description: 'Hands-on bootcamp covering sound design, mobile videography editing, and script writing for faith-focused TikTok/Reels creation.',
    date: getRelativeDate(7), // 7 days from now
    time: '14:30',
    type: 'meeting',
    category: 'Youth',
    location: 'St. Antony\'s Shrine, Avadi (Youth Hall)',
    link: 'https://meet.google.com/xyz-uvwx-123'
  },
  {
    id: 'ev_4',
    title: 'Liturgical Scriptwriting Roundtable',
    description: 'Practical training on translating high liturgical texts into engaging short-form social media copies.',
    date: getRelativeDate(-2), // 2 days ago
    time: '16:00',
    type: 'meeting',
    category: 'Liturgical',
    location: 'Virtual via Zoom',
    link: 'https://zoom.us/j/987654321'
  },
  {
    id: 'ev_5',
    title: 'Digital Evangelization Hackathon',
    description: 'A 24-hour collaborative event to develop interactive modules and widgets for local parish websites across Chennai.',
    date: getRelativeDate(11), // 11 days from now
    time: '09:00',
    type: 'other',
    category: 'Media',
    location: 'Don Bosco Tech Hall, Kannigapuram'
  }
];

export const INDIAN_HOLIDAYS_2026: CalendarEvent[] = [
  // January 2026
  {
    id: 'h_newyear',
    title: 'New Year\'s Day',
    description: 'International celebration welcoming 2026. General winter holiday.',
    date: '2026-01-01',
    type: 'other',
    category: 'General',
    location: 'National'
  },
  {
    id: 'h_bhogi',
    title: 'Bhogi Pandigai (Pongal Eve)',
    description: 'Tamil Nadu harvest festival preparation day. Discarding old clutter and burning redundant items in bonfires.',
    date: '2026-01-14',
    type: 'holyday',
    category: 'General',
    location: 'Tamil Nadu'
  },
  {
    id: 'h_pongal',
    title: 'Thai Pongal',
    description: 'The principal harvest festival of Tamil Nadu. Boiling sweet rice in pots with cries of "Pongalo Pongal!"',
    date: '2026-01-15',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_mattu_pongal',
    title: 'Maatu Pongal & Thiruvalluvar Day',
    description: 'Honoring agricultural cattle and celebrating the profound Tamil philosopher-poet, author of Thirukkural.',
    date: '2026-01-16',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_kaanum_pongal',
    title: 'Uzhavar Thirunal / Kaanum Pongal',
    description: 'Day of family reunions, sightseeing, and paying respect to farmers (Uzhavar) in Tamil Nadu.',
    date: '2026-01-17',
    type: 'holyday',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_republic',
    title: 'Republic Day of India',
    description: 'National Holiday celebrating the adoption of the Constitution of India in 1950.',
    date: '2026-01-26',
    type: 'holyday',
    category: 'General',
    location: 'All India'
  },
  // February 2026
  {
    id: 'h_shivaratri',
    title: 'Maha Shivaratri',
    description: 'Major Indian festival in honor of Lord Shiva. Celebrated with overnight vigils and fasting.',
    date: '2026-02-15',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  // March 2026
  {
    id: 'h_holi',
    title: 'Holi Festival',
    description: 'The colorful Hindu spring festival of joy, unity, and friendship.',
    date: '2026-03-03',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  {
    id: 'h_eid_fitr',
    title: 'Eid al-Fitr (Ramzan)',
    description: 'Holy Muslim festival marking the conclusion of the Ramadan fasting month.',
    date: '2026-03-20',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  // April 2026
  {
    id: 'h_good_friday',
    title: 'Good Friday',
    description: 'Christian holy day commemorating the passion, crucifixion, and death of Jesus Christ.',
    date: '2026-04-03',
    type: 'holyday',
    category: 'Liturgical',
    location: 'Tamil Nadu State & National Holiday'
  },
  {
    id: 'h_easter',
    title: 'Easter Sunday',
    description: 'The Resurrection of Jesus Christ. Principal feast of the liturgical year.',
    date: '2026-04-05',
    type: 'feast',
    category: 'Liturgical',
    location: 'Global Celebration'
  },
  {
    id: 'h_tamil_ny',
    title: 'Tamil New Year (Puthandu)',
    description: 'Chithirai Vishu - Celebrated as Tamil New Year Day in Tamil Nadu with public feasts and fresh beginnings.',
    date: '2026-04-14',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_ambedkar',
    title: 'Dr. Ambedkar Jayanti',
    description: 'Commemorating the birthday of Dr. B. R. Ambedkar, the father of the Indian Constitution.',
    date: '2026-04-14',
    type: 'holyday',
    category: 'General',
    location: 'All India'
  },
  // May 2026
  {
    id: 'h_mayday',
    title: 'May Day (Labor Day)',
    description: 'International Workers\' Day celebrated with state holiday status in Tamil Nadu.',
    date: '2026-05-01',
    type: 'other',
    category: 'General',
    location: 'Tamil Nadu & India'
  },
  {
    id: 'h_bakrid',
    title: 'Eid al-Adha (Bakrid)',
    description: 'Islamic festival of sacrifice, celebrated with prayers and feasts.',
    date: '2026-05-27',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  // June 2026
  {
    id: 'h_muharram',
    title: 'Muharram (Islamic New Year)',
    description: 'The first month of the Islamic calendar, commemorated with state holiday status in Tamil Nadu.',
    date: '2026-06-26',
    type: 'holyday',
    category: 'General',
    location: 'Tamil Nadu & National'
  },
  // August 2026
  {
    id: 'h_independence',
    title: 'Independence Day of India',
    description: 'National Landmark Holiday celebrating the independence from British rule in 1947.',
    date: '2026-08-15',
    type: 'holyday',
    category: 'General',
    location: 'All India'
  },
  // September 2026
  {
    id: 'h_janmashtami',
    title: 'Krishna Janmashtami',
    description: 'Hindu festival celebrating the birth of Lord Krishna, with devotional songs and human pyramids.',
    date: '2026-09-04',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  {
    id: 'h_vinayagar',
    title: 'Vinayagar Chaturthi',
    description: 'Tamil Nadu celebration in honor of Ganesha, installing clay idols in public stands and offering modaks.',
    date: '2026-09-14',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_prophet_bday',
    title: 'Milad-un-Nabi (Milad)',
    description: 'Prophet Muhammad\'s birthday, marked by nationwide prayers and public charity.',
    date: '2026-09-25',
    type: 'feast',
    category: 'General',
    location: 'All India'
  },
  // October 2026
  {
    id: 'h_gandhi',
    title: 'Gandhi Jayanti',
    description: 'National landmark celebrating Mahatma Gandhi\'s birthday; International Day of Non-Violence.',
    date: '2026-10-02',
    type: 'holyday',
    category: 'General',
    location: 'All India'
  },
  {
    id: 'h_ayudha_pooja',
    title: 'Ayudha Pooja',
    description: 'Part of Navratri festival where Tamilians worship tools, laptops, records, vehicles and instruments.',
    date: '2026-10-19',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  {
    id: 'h_vijayadashami',
    title: 'Vijayadashami / Dussahara',
    description: 'Celebrating the victory of good over evil. Highly standard day of admissions and starting new ventures.',
    date: '2026-10-20',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu State Holiday'
  },
  // November 2026
  {
    id: 'h_diwali',
    title: 'Deepavali (Diwali Festival of Lights)',
    description: 'Narakasura Vadham festival celebrated in Tamil Nadu with early morning oil baths, crackers, and sweets.',
    date: '2026-11-08',
    type: 'feast',
    category: 'General',
    location: 'Tamil Nadu & National'
  },
  // December 2026
  {
    id: 'h_christmas',
    title: 'Christmas Day',
    description: 'Nationwide public holiday and principal Christian celebration of the birth of Jesus Christ.',
    date: '2026-12-25',
    type: 'feast',
    category: 'Liturgical',
    location: 'All India & Global'
  }
];
