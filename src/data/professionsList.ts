// This file contains a comprehensive list of professions in the world,
// categorized by field and incorporating data matching the raw registration list.

export interface ProfessionGroup {
  industry: string;
  professions: string[];
}

export const WORLD_PROFESSIONS_GROUPS: ProfessionGroup[] = [
  {
    industry: "Media, Communication & Social Media",
    professions: [
      "Reporter - Cathfluencer",
      "Journalist",
      "News Editor",
      "Broadcaster & Anchor",
      "Podcaster & Pod Host",
      "Social Media Manager",
      "Public Relations (PR) Specialist",
      "Communications Coordinator",
      "Media Consultant",
      "Content Writer & Copywriter",
      "Event Planner & Organizer",
      "Presentation Specialist",
      "Vlogger / Video Creator",
      "Script Writer",
      "Information Coordinator"
    ]
  },
  {
    industry: "Information Technology & Software",
    professions: [
      "Software Engineer",
      "Senior Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile App Developer (iOS/Android)",
      "UI/UX Designer",
      "Data Analyst & Analytics Specialist",
      "Senior Data Analyst",
      "Chief Technical Officer (CTO)",
      "Database Administrator (DBA)",
      "Cloud Architect",
      "Systems Administrator",
      "SEO Executive",
      "Digital Marketing Specialist",
      "Product Manager",
      "Scrum Master / Agile Coach",
      "Quality Assurance (QA) Engineer",
      "Technical Engineer",
      "Network Engineer",
      "IT Support Specialist",
      "Risk Consultant",
      "Web Developer"
    ]
  },
  {
    industry: "Creative Arts, Photography & Music",
    professions: [
      "Photographer",
      "Videographer",
      "Camera Operator",
      "Video Editor & Colorist",
      "Graphic Designer",
      "Illustrator & Digital Artist",
      "Singer & Vocalist",
      "Music Producer / Composer",
      "Sound Engineer & Mixer",
      "Animator & Motion Designer",
      "Creative Director",
      "Author",
      "Florist & Art Designer",
      "Visual Editor & Layout Artist",
      "Art Director"
    ]
  },
  {
    industry: "Spiritual, Religious & Ecclesiastical Initiatives",
    professions: [
      "Seminarian",
      "Seminarian (Brother)",
      "Catholic Priest / Clergy",
      "Religious Brother",
      "Religious Sister / Nun",
      "Pastoral Coordinator",
      "Catechist & Faith Educator",
      "Diocesan Liturgical Planner",
      "Parish Office Secretary",
      "Sacristan",
      "Missionary Counselor"
    ]
  },
  {
    industry: "Education, Coaching & Sports",
    professions: [
      "School Teacher",
      "High School Lecturer",
      "College Professor",
      "Assistant Professor",
      "Academic Researcher",
      "Football Coach & Sports Trainer",
      "Physical Education Director (PET)",
      "Librarian",
      "Special Educator",
      "Tutor & Instructor"
    ]
  },
  {
    industry: "Finance, Accounting & Legal Services",
    professions: [
      "Accountant",
      "Senior Accountant",
      "Account Executive",
      "Finance Analyst",
      "Chartered Accountant (CA)",
      "Financial Planner / Auditor",
      "Accounts Clerk / Billing Officer",
      "Advocate / Lawyer",
      "Legal Advisor",
      "Judicial Magistrate",
      "Documentation Specialist",
      "Tax Consultant"
    ]
  },
  {
    industry: "Management, Admin & Human Resources",
    professions: [
      "Office Administrator",
      "Administrative Assistant",
      "Back Office Executive",
      "Executive Secretary",
      "Human Resources (HR) Specialist",
      "HR Manager",
      "Recruiter / Talent Acquisition",
      "Operations Coordinator",
      "Project Manager",
      "Customer Relations Officer",
      "AR Caller / Medical Billing Voice Process"
    ]
  },
  {
    industry: "Engineering, Infrastructure & Manufacturing",
    professions: [
      "Automobile Engineer",
      "Mechanical Engineer",
      "Civil Engineer",
      "Electrical & Electronics Engineer",
      "Electronics & Communication Engineer",
      "Design Engineer",
      "Project Engineer",
      "Production Engineer",
      "Technical Officer",
      "Quality Control Inspector",
      "Research & Development Engineer",
      "Solid Waste Management Engineer"
    ]
  },
  {
    industry: "Healthcare & Social Services",
    professions: [
      "General Physician / Medical Doctor",
      "Surgeon",
      "Dentist",
      "Pharmacist",
      "Staff Nurse",
      "Optometrist",
      "Medical Scribe & Transcriber",
      "Social Worker",
      "Counselor & Therapist",
      "Healthcare Administrator"
    ]
  },
  {
    industry: "Business, Sales, Logistics & Services",
    professions: [
      "Entrepreneur / Startup Founder",
      "Business Owner",
      "Chief Executive Officer (CEO)",
      "Business Development Executive",
      "Sales Analyst",
      "Marketing Executive",
      "Customs Brokerage Professional",
      "Logistics & Export Coordinator",
      "Travel Agent / Tour Operator",
      "Real Estate Broker",
      "Insurance Advisor"
    ]
  },
  {
    industry: "Public safety, Defence & Government Services",
    professions: [
      "Retired Defence Services Officer",
      "Military Officer / Soldier",
      "Police Officer",
      "Government Civil Servant",
      "Postal Inspector",
      "Firefighter"
    ]
  },
  {
    industry: "Academic Pursuit & Status",
    professions: [
      "Student",
      "B.Com. Student",
      "Student of Law / Law Student",
      "Research Scholar & PhD Candidate",
      "Job Seeker / Graduate (Seeking Job)",
      "Homemaker",
      "Retired Professional",
      "Self-Employed"
    ]
  }
];

// Flat list for simple auto-complete combobox lookups
export const WORLD_PROFESSIONS_FLAT: string[] = WORLD_PROFESSIONS_GROUPS.reduce<string[]>((acc, group) => {
  return [...acc, ...group.professions];
}, []).sort((a, b) => a.localeCompare(b));
