export type SyllabusSubject = {
  subject: string;
  topics: string[];
};

const SSC: SyllabusSubject[] = [
  {
    subject: "Quantitative Aptitude",
    topics: [
      "Number system",
      "Percentages",
      "Ratio and proportion",
      "Profit and loss",
      "Time, speed and distance",
      "Time and work",
      "Averages",
      "Simple and compound interest",
      "Mensuration",
      "Data interpretation",
    ],
  },
  {
    subject: "Reasoning",
    topics: [
      "Analogy",
      "Series",
      "Coding-decoding",
      "Blood relations",
      "Syllogism",
      "Direction sense",
      "Seating arrangement",
      "Non-verbal reasoning",
    ],
  },
  {
    subject: "English",
    topics: [
      "Error spotting",
      "Fill in the blanks",
      "Synonyms and antonyms",
      "Idioms and phrases",
      "Cloze test",
      "Reading comprehension",
      "Active and passive voice",
    ],
  },
  {
    subject: "General Awareness",
    topics: [
      "Indian polity",
      "History",
      "Geography",
      "Economy",
      "General science",
      "Static GK",
      "Current affairs",
    ],
  },
];

const BANKING: SyllabusSubject[] = [
  {
    subject: "Quantitative Aptitude",
    topics: [
      "Simplification and approximation",
      "Number series",
      "Quadratic equations",
      "Data interpretation",
      "Arithmetic word problems",
      "Data sufficiency",
    ],
  },
  {
    subject: "Reasoning Ability",
    topics: [
      "Puzzles",
      "Seating arrangement",
      "Syllogism",
      "Inequality",
      "Input-output",
      "Blood relations",
      "Coding-decoding",
    ],
  },
  {
    subject: "English Language",
    topics: [
      "Reading comprehension",
      "Cloze test",
      "Para jumbles",
      "Error detection",
      "Sentence improvement",
      "Vocabulary",
    ],
  },
  {
    subject: "Banking Awareness",
    topics: [
      "RBI and monetary policy",
      "Banking terms",
      "Financial institutions",
      "Government schemes",
      "Current banking affairs",
    ],
  },
];

const JEE: SyllabusSubject[] = [
  {
    subject: "Physics",
    topics: [
      "Kinematics",
      "Laws of motion",
      "Work, energy and power",
      "Rotational motion",
      "Thermodynamics",
      "Electrostatics",
      "Current electricity",
      "Magnetism",
      "Optics",
      "Modern physics",
    ],
  },
  {
    subject: "Chemistry",
    topics: [
      "Mole concept",
      "Atomic structure",
      "Chemical bonding",
      "Thermodynamics",
      "Equilibrium",
      "Periodic table",
      "Coordination compounds",
      "Hydrocarbons",
      "Aldehydes and ketones",
      "Biomolecules",
    ],
  },
  {
    subject: "Mathematics",
    topics: [
      "Quadratic equations",
      "Sequences and series",
      "Trigonometry",
      "Straight lines",
      "Circles",
      "Conic sections",
      "Limits and continuity",
      "Differentiation",
      "Integration",
      "Probability",
    ],
  },
];

const NEET: SyllabusSubject[] = [
  {
    subject: "Biology",
    topics: [
      "Cell structure",
      "Plant physiology",
      "Human physiology",
      "Genetics and evolution",
      "Reproduction",
      "Ecology",
      "Biotechnology",
      "Human health and disease",
    ],
  },
  {
    subject: "Physics",
    topics: [
      "Kinematics",
      "Laws of motion",
      "Work, energy and power",
      "Thermodynamics",
      "Electrostatics",
      "Current electricity",
      "Optics",
      "Modern physics",
    ],
  },
  {
    subject: "Chemistry",
    topics: [
      "Mole concept",
      "Atomic structure",
      "Chemical bonding",
      "Equilibrium",
      "Periodic table",
      "Organic basics",
      "Hydrocarbons",
      "Biomolecules",
    ],
  },
];

const BOARDS: SyllabusSubject[] = [
  {
    subject: "Mathematics",
    topics: [
      "Relations and functions",
      "Algebra",
      "Calculus",
      "Vectors and 3D geometry",
      "Probability",
      "Linear programming",
    ],
  },
  {
    subject: "Science",
    topics: [
      "Physics — electricity and magnetism",
      "Physics — optics",
      "Chemistry — chemical reactions",
      "Chemistry — organic compounds",
      "Biology — life processes",
      "Biology — heredity",
    ],
  },
  {
    subject: "Language",
    topics: ["Prose", "Poetry", "Grammar", "Writing skills", "Literature reader"],
  },
  {
    subject: "Social Science",
    topics: ["History", "Geography", "Civics", "Economics", "Map work"],
  },
];

const UPSC: SyllabusSubject[] = [
  {
    subject: "General Studies I",
    topics: [
      "Ancient and medieval history",
      "Modern Indian history",
      "Art and culture",
      "Indian geography",
      "World geography",
      "Indian society",
    ],
  },
  {
    subject: "General Studies II",
    topics: [
      "Indian Constitution",
      "Parliament and judiciary",
      "Governance and transparency",
      "Social justice schemes",
      "International relations",
    ],
  },
  {
    subject: "General Studies III",
    topics: [
      "Indian economy",
      "Agriculture",
      "Science and technology",
      "Environment and ecology",
      "Internal security",
      "Disaster management",
    ],
  },
  {
    subject: "CSAT",
    topics: ["Comprehension", "Logical reasoning", "Basic numeracy", "Data interpretation"],
  },
];

const RAILWAYS: SyllabusSubject[] = [
  {
    subject: "Mathematics",
    topics: [
      "Number system",
      "BODMAS and simplification",
      "Percentage",
      "Time and work",
      "Time and distance",
      "Mensuration",
      "Data interpretation",
    ],
  },
  {
    subject: "General Intelligence",
    topics: [
      "Analogies",
      "Coding-decoding",
      "Syllogism",
      "Venn diagrams",
      "Statement and conclusion",
      "Data sufficiency",
    ],
  },
  {
    subject: "General Science",
    topics: ["Physics basics", "Chemistry basics", "Life science", "Environment"],
  },
  {
    subject: "General Awareness",
    topics: ["Current affairs", "Indian polity", "Economics", "Sports and awards"],
  },
];

const CAT: SyllabusSubject[] = [
  {
    subject: "VARC",
    topics: [
      "Reading comprehension",
      "Para jumbles",
      "Para summary",
      "Odd sentence out",
      "Critical reasoning",
    ],
  },
  {
    subject: "DILR",
    topics: [
      "Bar and line graphs",
      "Tables and caselets",
      "Arrangements",
      "Games and tournaments",
      "Venn diagram sets",
    ],
  },
  {
    subject: "Quant",
    topics: [
      "Arithmetic",
      "Algebra",
      "Geometry",
      "Number system",
      "Modern maths",
    ],
  },
];

const TEACHING: SyllabusSubject[] = [
  {
    subject: "Child Development and Pedagogy",
    topics: [
      "Development and learning",
      "Inclusive education",
      "Learning theories",
      "Assessment and evaluation",
    ],
  },
  {
    subject: "Language I & II",
    topics: ["Comprehension", "Grammar", "Language pedagogy", "Teaching methods"],
  },
  {
    subject: "Mathematics",
    topics: ["Number system", "Geometry", "Data handling", "Mathematics pedagogy"],
  },
  {
    subject: "Environmental Studies",
    topics: ["Family and friends", "Food and shelter", "Water and travel", "EVS pedagogy"],
  },
];

const DEFENCE: SyllabusSubject[] = [
  {
    subject: "Mathematics",
    topics: ["Algebra", "Trigonometry", "Geometry", "Mensuration", "Statistics"],
  },
  {
    subject: "General Ability",
    topics: ["English grammar", "Vocabulary", "Physics", "Chemistry", "History", "Geography"],
  },
  {
    subject: "Physical and SSB prep",
    topics: ["Running and endurance", "Officer-like qualities", "Group tasks", "Interview practice"],
  },
];

const GENERIC: SyllabusSubject[] = [
  {
    subject: "Core subject",
    topics: ["Fundamentals", "Practice set 1", "Practice set 2", "Revision"],
  },
  {
    subject: "General awareness",
    topics: ["Current affairs", "Static GK"],
  },
];

const TEMPLATES: Record<string, SyllabusSubject[]> = {
  ssc: SSC,
  banking: BANKING,
  jee: JEE,
  neet: NEET,
  boards: BOARDS,
  "school-unit": BOARDS,
  upsc: UPSC,
  "state-psc": UPSC,
  railways: RAILWAYS,
  cat: CAT,
  tet: TEACHING,
  tat: TEACHING,
  nat: TEACHING,
  defence: DEFENCE,
};

export function syllabusTemplate(examTag?: string | null): SyllabusSubject[] {
  if (!examTag) return GENERIC;
  return TEMPLATES[examTag] ?? GENERIC;
}

export function templateTopicCount(examTag?: string | null) {
  return syllabusTemplate(examTag).reduce(
    (sum, subject) => sum + subject.topics.length,
    0,
  );
}

export function defaultMilestones(examTag: string | null | undefined, targetDate: Date | null) {
  const template = syllabusTemplate(examTag);
  const base = template.slice(0, 3).map((subject) => ({
    title: `Finish first pass of ${subject.subject}`,
    dueDate: null as Date | null,
  }));

  if (targetDate) {
    const revision = new Date(targetDate.getTime() - 30 * 86_400_000);
    const finalSprint = new Date(targetDate.getTime() - 7 * 86_400_000);
    base.push({ title: "Full syllabus revision round", dueDate: revision });
    base.push({ title: "Final week: only mocks and error notes", dueDate: finalSprint });
  } else {
    base.push({ title: "Full syllabus revision round", dueDate: null });
  }

  return base;
}
