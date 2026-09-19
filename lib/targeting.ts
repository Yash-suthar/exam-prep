import { EducationLevel } from "@prisma/client";

export type Audience = {
  educationLevel?: EducationLevel | null;
  standard?: string | null;
  examGoals?: string[];
};

export type Targetable = {
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
};

export function matchesAudience(item: Targetable, audience: Audience) {
  const levels = item.targetEducationLevels;
  const standards = item.targetStandards;
  const goals = item.targetExamGoals;
  if (levels.length === 0 && standards.length === 0 && goals.length === 0) {
    return true;
  }
  if (audience.educationLevel && levels.includes(audience.educationLevel)) {
    return true;
  }
  if (audience.standard && standards.includes(audience.standard)) {
    return true;
  }
  if (audience.examGoals?.some((goal) => goals.includes(goal))) {
    return true;
  }
  return false;
}

export function scoreAudience(item: Targetable, audience: Audience, activeGoal?: string | null) {
  let score = 0;
  if (activeGoal && item.targetExamGoals.includes(activeGoal)) score += 8;
  if (audience.examGoals?.some((goal) => item.targetExamGoals.includes(goal))) score += 4;
  if (audience.standard && item.targetStandards.includes(audience.standard)) score += 2;
  if (audience.educationLevel && item.targetEducationLevels.includes(audience.educationLevel)) {
    score += 1;
  }
  return score;
}
