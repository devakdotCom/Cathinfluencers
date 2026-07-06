import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface ReflectionContent {
  gospel: string;
  reflection: string;
  prayer: string;
  saintQuote: string;
  action: string;
}

export interface DailyReflection {
  date: string;
  en: ReflectionContent;
  ta: ReflectionContent;
  source: 'curated' | 'admin';
  updatedAt: string;
  updatedBy?: string;
}

const curated: Array<Omit<DailyReflection, 'date' | 'updatedAt'>> = [
  {
    source: 'curated',
    en: {
      gospel: '“You are the light of the world.” — Matthew 5:14',
      reflection: 'Christ does not ask us to manufacture light, but to let his light pass through our words, choices, and digital presence.',
      prayer: 'Lord Jesus, make my communication truthful, gentle, and capable of leading others toward hope.',
      saintQuote: '“Preach the Gospel at all times; when necessary, use words.” — commonly attributed to Saint Francis of Assisi',
      action: 'Encourage one person today without seeking attention or recognition.',
    },
    ta: {
      gospel: '“நீங்கள் உலகிற்கு ஒளியாயிருக்கிறீர்கள்.” — மத்தேயு 5:14',
      reflection: 'நாம் ஒளியை உருவாக்க வேண்டும் என்று கிறிஸ்து கேட்பதில்லை; அவரது ஒளி நமது சொற்கள், செயல்கள் மற்றும் இணையப் பயன்பாட்டின் வழியாகப் பிரகாசிக்க அனுமதிக்கச் சொல்கிறார்.',
      prayer: 'ஆண்டவர் இயேசுவே, என் தொடர்புகள் உண்மையுடனும் கனிவுடனும் நம்பிக்கையை வளர்ப்பதாகவும் இருக்க அருள்தாரும்.',
      saintQuote: '“எப்போதும் நற்செய்தியை அறிவியுங்கள்; தேவைப்படும்போது சொற்களைப் பயன்படுத்துங்கள்.” — புனித பிரான்சிஸ் அசிசியாருக்கு வழங்கப்படும் மொழி',
      action: 'பாராட்டை எதிர்பார்க்காமல் இன்று ஒருவரை ஊக்கப்படுத்துங்கள்.',
    },
  },
  {
    source: 'curated',
    en: {
      gospel: '“Remain in me, as I remain in you.” — John 15:4',
      reflection: 'Fruitful ministry begins in communion with Christ. Activity without prayer becomes noise; prayer gives service its direction.',
      prayer: 'Jesus, keep me close to you so that everything I create may bear patient and lasting fruit.',
      saintQuote: '“Prayer is the place of refuge for every worry.” — Saint John Chrysostom',
      action: 'Begin your next task with one quiet minute of prayer.',
    },
    ta: {
      gospel: '“என்னில் நிலைத்திருங்கள்; நானும் உங்களில் நிலைத்திருப்பேன்.” — யோவான் 15:4',
      reflection: 'பலனளிக்கும் திருப்பணி கிறிஸ்துவுடனான ஒன்றிப்பில் தொடங்குகிறது. ஜெபமில்லாத செயல்பாடு சத்தமாகிவிடும்; ஜெபம் சேவைக்கு திசை தருகிறது.',
      prayer: 'இயேசுவே, நான் உருவாக்கும் அனைத்தும் பொறுமையான நிலையான பலன் தருமாறு என்னை உம்மோடு இணைத்தருளும்.',
      saintQuote: '“ஒவ்வொரு கவலைக்கும் புகலிடம் ஜெபமே.” — புனித யோவான் கிறிசோஸ்தோம்',
      action: 'உங்கள் அடுத்த பணியை ஒரு நிமிட அமைதியான ஜெபத்துடன் தொடங்குங்கள்.',
    },
  },
  {
    source: 'curated',
    en: {
      gospel: '“Blessed are the peacemakers.” — Matthew 5:9',
      reflection: 'A Christian digital witness refuses outrage as a strategy. We can defend truth firmly while preserving the dignity of every person.',
      prayer: 'Prince of Peace, guard my reactions and teach me to speak truth without contempt.',
      saintQuote: '“If we have no peace, it is because we have forgotten that we belong to each other.” — Saint Teresa of Calcutta',
      action: 'Pause before replying to a difficult message and remove any unnecessary harshness.',
    },
    ta: {
      gospel: '“சமாதானம் செய்வோர் பேறுபெற்றோர்.” — மத்தேயு 5:9',
      reflection: 'கிறிஸ்தவ இணையச் சாட்சி கோபத்தை ஒரு உத்தியாகப் பயன்படுத்தாது. ஒவ்வொருவரின் மாண்பையும் காத்து உண்மையை உறுதியாகச் சொல்ல முடியும்.',
      prayer: 'சமாதானத்தின் அரசரே, என் எதிர்வினைகளை காத்து இகழ்ச்சியின்றி உண்மையைப் பேச கற்றுத்தாரும்.',
      saintQuote: '“நாம் ஒருவருக்கொருவர் சொந்தமானவர்கள் என்பதை மறந்ததால் சமாதானம் இல்லாமல் போகிறது.” — புனித அன்னை தெரசா',
      action: 'கடினமான செய்திக்கு பதிலளிக்கும் முன் நிதானித்து தேவையற்ற கடுமையை நீக்குங்கள்.',
    },
  },
];

const cacheKey = (date: string) => `vox-daily-reflection:${date}`;

export function getCuratedReflection(date: string): DailyReflection {
  const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  const selected = curated[Math.abs(dayNumber) % curated.length];
  return {
    ...selected,
    date,
    updatedAt: `${date}T00:00:00.000Z`,
  };
}

export async function getDailyReflection(date = new Date().toISOString().slice(0, 10)) {
  const cached = window.localStorage.getItem(cacheKey(date));
  if (cached) {
    try {
      return JSON.parse(cached) as DailyReflection;
    } catch {
      window.localStorage.removeItem(cacheKey(date));
    }
  }

  let reflection = getCuratedReflection(date);
  if (db) {
    try {
      const snapshot = await getDoc(doc(db, 'dailyReflections', date));
      if (snapshot.exists()) reflection = snapshot.data() as DailyReflection;
    } catch (error) {
      console.warn('Daily reflection override unavailable; curated reflection used.', error);
    }
  }
  window.localStorage.setItem(cacheKey(date), JSON.stringify(reflection));
  return reflection;
}

export async function saveDailyReflection(reflection: DailyReflection, adminUid: string) {
  if (!db) throw new Error('Firestore is not configured.');
  const saved: DailyReflection = {
    ...reflection,
    source: 'admin',
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
  };
  await setDoc(doc(db, 'dailyReflections', reflection.date), saved);
  window.localStorage.setItem(cacheKey(reflection.date), JSON.stringify(saved));
  return saved;
}
