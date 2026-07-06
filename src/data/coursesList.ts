// This file contains a comprehensive list of college courses from Bachelor's to Doctorate
// including entries matching the raw CSV registration data.

export interface CourseGroup {
  category: string;
  courses: string[];
}

export const COLLEGE_COURSES_GROUPS: CourseGroup[] = [
  {
    category: "Bachelor's Degrees (Arts, Humanities & Social Sciences)",
    courses: [
      "B.A. English Literature",
      "B.A. Economics",
      "B.A. History",
      "B.A. Sociology",
      "B.A. Psychology",
      "B.A. Political Science",
      "B.A. Journalism & Mass Communication",
      "B.A. Philosophy",
      "B.A. Theology",
      "B.A. English and Communication Skills",
      "B.A. Tamil Literature",
      "B.A. French",
      "B.A. Social Work (BSW)"
    ]
  },
  {
    category: "Bachelor's Degrees (Commerce & Management)",
    courses: [
      "B.Com. General",
      "B.Com. Corporate Secretaryship",
      "B.Com. Information Systems Management (ISM)",
      "B.Com. Accounting & Finance",
      "B.Com. Computer Applications",
      "B.Com. Banking & Insurance",
      "B.Com. Honors",
      "B.B.A. General",
      "B.B.A. Financial Planning",
      "B.B.A. Marketing",
      "B.B.A. Human Resource Management",
      "B.B.A. International Business"
    ]
  },
  {
    category: "Bachelor's Degrees (Science & Mathematics)",
    courses: [
      "B.Sc. Visual Communication",
      "B.Sc. Computer Science",
      "B.Sc. Information Technology",
      "B.Sc. Mathematics",
      "B.Sc. Physics",
      "B.Sc. Chemistry",
      "B.Sc. Statistics",
      "B.Sc. Biotechnology",
      "B.Sc. Microbiology",
      "B.Sc. Biochemistry",
      "B.Sc. Optometry",
      "B.Sc. Aviation",
      "B.Sc. Nutrition & Dietetics",
      "B.Sc. Psychology",
      "B.Sc. Multimedia & Animation"
    ]
  },
  {
    category: "Bachelor's Degrees (Engineering & Technology)",
    courses: [
      "B.E. Computer Science & Engineering",
      "B.E. Information Technology",
      "B.E. Mechanical Engineering",
      "B.E. Electrical & Electronics Engineering (EEE)",
      "B.E. Electronics & Communication Engineering (ECE)",
      "B.E. Electronics & Instrumentation Engineering",
      "B.E. Civil Engineering",
      "B.E. Biomedical Engineering",
      "B.Tech. Artificial Intelligence & Data Science",
      "B.Tech. Artificial Intelligence & Machine Learning",
      "B.Tech. Information Technology",
      "B.Tech. Chemical Engineering",
      "B.Tech. Biotechnology"
    ]
  },
  {
    category: "Professional Bachelor's Degrees (Law, Education, Medicine & others)",
    courses: [
      "B.C.A. (Bachelor of Computer Applications)",
      "B.Ed. (Bachelor of Education)",
      "LL.B. (Bachelor of Laws)",
      "B.A. LL.B. (Integrated Law)",
      "B.B.A. LL.B. (Integrated Law)",
      "M.B.B.S. (Bachelor of Medicine, Bachelor of Surgery)",
      "B.D.S. (Bachelor of Dental Surgery)",
      "B.Pharm. (Bachelor of Pharmacy)",
      "B.S.M.S. (Siddha Medicine & Surgery)",
      "B.Arch. (Bachelor of Architecture)",
      "B.P.T. (Bachelor of Physiotherapy)"
    ]
  },
  {
    category: "Master's Degrees (Arts, Humanities & Social Sciences)",
    courses: [
      "M.A. English Literature",
      "M.A. Economics",
      "M.A. History",
      "M.A. Sociology",
      "M.A. Psychology",
      "M.A. Mass Communication & Journalism",
      "M.A. Philosophy",
      "M.A. Theology & Religious Studies",
      "M.A. Sacred Scriptures",
      "M.S.W. (Master of Social Work - HR, Medical & Psychiatry)",
      "M.A. Public Administration"
    ]
  },
  {
    category: "Master's Degrees (Commerce & Management)",
    courses: [
      "M.Com. General",
      "M.Com. Corporate Secretaryship",
      "M.B.A. General",
      "M.B.A. Human Resource Management",
      "M.B.A. Finance",
      "M.B.A. Systems & IT",
      "M.B.A. Marketing",
      "M.B.A. Media & Entertainment",
      "M.B.A. International Business",
      "M.B.A. Data Analytics"
    ]
  },
  {
    category: "Master's Degrees (Science, Technology & Computing)",
    courses: [
      "M.Sc. Computer Science",
      "M.Sc. Information Technology",
      "M.Sc. Physics",
      "M.Sc. Chemistry",
      "M.Sc. Mathematics",
      "M.Sc. Statistics",
      "M.Sc. Biotechnology",
      "M.Sc. Data Analytics",
      "M.Sc. Visual Communication",
      "M.Sc. Electronic Media",
      "M.C.A. (Master of Computer Applications)"
    ]
  },
  {
    category: "Master's Degrees (Engineering & Higher Professional)",
    courses: [
      "M.E. Computer Science & Engineering",
      "M.E. Mechanical Engineering",
      "M.E. Applied Electronics",
      "M.E. Structural Engineering",
      "M.Tech. Information Technology",
      "M.Tech. Biotechnology",
      "LL.M. (Master of Laws)",
      "M.Ed. (Master of Education)",
      "M.Pharm. (Master of Pharmacy)",
      "M.Arch. (Master of Architecture)"
    ]
  },
  {
    category: "Doctorate Programs",
    courses: [
      "Ph.D. in Computer Science",
      "Ph.D. in English Literature",
      "Ph.D. in Economics",
      "Ph.D. in Commerce & Management",
      "Ph.D. in Physics",
      "Ph.D. in Chemistry",
      "Ph.D. in Mathematics",
      "Ph.D. in Theology & Canon Law",
      "Ph.D. in Media & Communication",
      "Ph.D. in Social Work",
      "Ph.D. in Engineering",
      "Ph.D. in Education",
      "Ph.D. in Biotechnology",
      "Ph.D. in Law",
      "Doctor of Sacred Theology (S.T.D.)",
      "M.Phil. English",
      "M.Phil. Economics",
      "M.Phil. Commerce",
      "M.Phil. Mathematics"
    ]
  },
  {
    category: "Diplomas & Other Qualifications",
    courses: [
      "Diploma in Visual Communication",
      "Diploma in Computer Applications (DCA)",
      "Diploma in Graphic & Web Designing",
      "Diploma in Communications & Media",
      "Diploma in Mechanical Engineering (DME)",
      "Diploma in Electrical & Electronics Engineering",
      "Diploma in Print Technology",
      "Diploma in Bible Studies",
      "Higher Secondary Education (+2 / Class 12)",
      "Post Graduate Diploma in Human Rights Law",
      "Post Graduate Diploma in Journalism"
    ]
  }
];

// Flat list for search filtering and simple lookups
export const COLLEGE_COURSES_FLAT: string[] = COLLEGE_COURSES_GROUPS.reduce<string[]>((acc, group) => {
  return [...acc, ...group.courses];
}, []).sort((a, b) => a.localeCompare(b));
