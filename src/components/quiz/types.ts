// Types for Dynamic Quiz System

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
  type: 'linear' | 'branching';
}

export interface UserAnswers {
  [questionId: string]: string;
}

export interface RoleRecommendation {
  role: string;
  title: string;
  description: string;
  salaryRange: { min: number; max: number };
  programDuration: string;
  confidenceScore: number;
  reasoning: string;
  personalizedInsights: string[];
  alternativeRoles?: string[];
}

export interface QuizState {
  currentQuestionId: string;
  answers: UserAnswers;
  questionPath: string[];
  isComplete: boolean;
}