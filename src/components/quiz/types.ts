// Types for Dynamic Quiz System v2.0 - Two-Tier Assessment

export interface QuestionOption {
  id: string;
  text: string;
  description?: string;
  nextQuestionId?: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  type: 'linear' | 'branching' | 'grid' | 'multiselect';
  tier: 1 | 2; // 1 = Quick Assessment, 2 = Detailed Assessment
  category?: string;
}

export interface GridQuestion extends Question {
  type: 'grid';
  categories: string[];
  scaleOptions: string[];
}

export interface MultiSelectQuestion extends Question {
  type: 'multiselect';
  maxSelections?: number;
}

export interface UserAnswers {
  [questionId: string]: string | string[] | Record<string, string>;
}

export interface QuickAnswers {
  q1: string; // career background
  q2: string; // primary motivation
  q3: string; // core interest
  q4_it?: string; // IT problem solving
  q4_facilities?: string; // facilities problem solving
  q5_hardware?: string; // hardware preference
  q5_software?: string; // software preference
  q5_mechanical?: string; // mechanical preference
  q5_controls?: string; // controls preference
}

export interface DetailedAnswers extends QuickAnswers {
  da1_skills: Record<string, string>; // technical skills grid
  da2_environment: string; // work environment
  da3_learning: string; // learning style
  da4_timeline: string; // career timeline
  da5_geographic: string; // geographic flexibility
  da6_certs: string[]; // certifications
  da7_physical: string; // physical demands
  da8_teamwork: string; // team vs independent
  da9_problemsolving: string; // problem solving style
  da10_salary: string; // salary expectations
  da11_industry: string; // industry interest
  da12_interests: string[]; // technical interests
  da13_advancement: string; // advancement goals
  da14_schedule: string; // work shift preference
  da15_stress: string; // stress management
}

export interface CareerPath {
  pathType: 'fastest' | 'highest_salary';
  role: string;
  title: string;
  description: string;
  salaryRange: { min: number; max: number };
  trainingDuration: string;
  confidence: number;
  reasoning: string;
  requiredCertifications?: string[];
  keySkills: string[];
  marketDemand: 'high' | 'medium' | 'low';
  physicalDemands: 'high' | 'medium' | 'low';
  nextSteps: string[];
}

export interface MultiPathRecommendation {
  fastestPath: CareerPath;
  highestSalaryPath: CareerPath;
  overallConfidence: number;
  assessmentType: 'quick' | 'detailed';
  personalizedInsights: string[];
  skillsGapAnalysis?: {
    currentSkills: string[];
    requiredSkills: string[];
    trainingRecommendations: string[];
  };
}

export interface AssessmentState {
  tier: 1; // Only quick assessment now
  currentQuestionId: string;
  answers: UserAnswers;
  questionPath: string[];
}

export interface RoleDefinition {
  role: string;
  title: string;
  description: string;
  baseSalaryRange: { min: number; max: number };
  category: 'it_infrastructure' | 'facilities' | 'hybrid' | 'security' | 'analytics';
  requiredSkills: string[];
  optionalSkills: string[];
  physicalDemands: 'high' | 'medium' | 'low';
  typicalSchedule: string;
  careerProgression: string[];
  marketDemand: 'high' | 'medium' | 'low';
  trainingDuration: { min: number; max: number }; // weeks
  certificationPaths: string[];
}