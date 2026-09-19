import { EducationLevel } from "@prisma/client";

export const EDUCATION_LEVELS: { id: EducationLevel; label: string; hint: string }[] = [
  { id: "STUDENT", label: "Student", hint: "Class 6–12 or diploma" },
  { id: "GRADUATE", label: "Graduate", hint: "Bachelor’s done or finishing" },
  { id: "POST_GRADUATE", label: "Post-graduate", hint: "Master’s / professional" },
  { id: "WORKING_PROFESSIONAL", label: "Working professional", hint: "Job + exam prep" },
];

export const STANDARDS = [
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "Diploma",
  "College",
];

export const EXAM_GOALS: { id: string; label: string; group: string; track: "SCHOOL" | "COMPETITIVE_EXAM" }[] =
  [
    { id: "boards", label: "Board exams", group: "School", track: "SCHOOL" },
    { id: "school-unit", label: "School / unit tests", group: "School", track: "SCHOOL" },
    { id: "jee", label: "JEE", group: "Entrance", track: "COMPETITIVE_EXAM" },
    { id: "neet", label: "NEET", group: "Entrance", track: "COMPETITIVE_EXAM" },
    { id: "ssc", label: "SSC", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "banking", label: "Banking", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "railways", label: "Railways", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "state-psc", label: "State PSC", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "upsc", label: "UPSC", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "defence", label: "Defence", group: "Government", track: "COMPETITIVE_EXAM" },
    { id: "tet", label: "TET / CTET", group: "Teaching", track: "COMPETITIVE_EXAM" },
    { id: "tat", label: "TAT", group: "Teaching", track: "COMPETITIVE_EXAM" },
    { id: "nat", label: "NAT", group: "Teaching", track: "COMPETITIVE_EXAM" },
    { id: "cat", label: "CAT", group: "MBA", track: "COMPETITIVE_EXAM" },
  ];

export function examLabel(id: string) {
  return EXAM_GOALS.find((goal) => goal.id === id)?.label ?? id;
}

export function educationLabel(level: EducationLevel) {
  return EDUCATION_LEVELS.find((item) => item.id === level)?.label ?? level;
}
