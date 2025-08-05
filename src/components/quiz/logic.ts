import { UserAnswers, RoleRecommendation } from './types';
import { ROLE_RECOMMENDATIONS } from './data';

export const adjustSalaryForBackground = (
  baseRange: { min: number; max: number }, 
  background: string, 
  techLevel: string
) => {
  let multiplier = 1.0;
  
  // Background adjustments
  if (background === 'it_professional') multiplier += 0.15;
  if (background === 'skilled_trades') multiplier += 0.10;
  if (background === 'military_veteran') multiplier += 0.10;
  if (background === 'recent_graduate') multiplier -= 0.05;
  
  // Technical level adjustments
  if (techLevel === 'expert') multiplier += 0.10;
  if (techLevel === 'professional') multiplier += 0.05;
  if (techLevel === 'beginner') multiplier -= 0.05;
  
  return {
    min: Math.round(baseRange.min * multiplier),
    max: Math.round(baseRange.max * multiplier)
  };
};

export const calculateConfidenceScore = (answers: UserAnswers): number => {
  let confidence = 0.75;
  
  if (['it_professional', 'skilled_trades', 'military_veteran'].includes(answers.q1)) {
    confidence += 0.15;
  }
  
  if (['professional', 'expert'].includes(answers.q2)) {
    confidence += 0.10;
  }
  
  return Math.min(0.95, Math.max(0.65, confidence));
};

export const generateReasoning = (answers: UserAnswers, recommendation: RoleRecommendation): string => {
  const backgroundReasons: Record<string, string> = {
    'it_professional': 'Your IT background gives you a strong foundation in technology systems',
    'skilled_trades': 'Your hands-on technical experience translates perfectly to data center operations',
    'military_veteran': 'Your military experience in mission-critical operations aligns perfectly with data center environments',
    'recent_graduate': 'Your fresh technical knowledge combined with eagerness to learn makes you an excellent candidate',
    'career_changer': 'Your diverse background brings valuable perspective to technical roles'
  };
  
  const trackReasons: Record<string, string> = {
    'servers_network': 'Your interest in servers and networking indicates strong aptitude for IT infrastructure roles',
    'power_cooling': 'Your fascination with power and cooling systems shows natural alignment with facilities engineering'
  };
  
  return `${backgroundReasons[answers.q1]}. ${trackReasons[answers.q3]}.`;
};

export const determineRecommendedRole = (answers: UserAnswers): RoleRecommendation => {
  let roleKey = '';
  
  // Determine role based on quiz path
  if (answers.q3 === 'servers_network') {
    if (answers.q4_it === 'hardware_focus') {
      roleKey = 'data_center_technician';
    } else {
      roleKey = 'production_operations_engineer';
    }
  } else {
    if (answers.q4_facilities === 'mechanical_electrical') {
      roleKey = 'critical_facilities_engineer';
    } else {
      roleKey = 'bms_controls_engineer';
    }
  }
  
  const baseRecommendation = ROLE_RECOMMENDATIONS[roleKey];
  const adjustedSalary = adjustSalaryForBackground(baseRecommendation.salaryRange, answers.q1, answers.q2);
  const confidenceScore = calculateConfidenceScore(answers);
  const reasoning = generateReasoning(answers, baseRecommendation);
  
  return {
    ...baseRecommendation,
    salaryRange: adjustedSalary,
    confidenceScore,
    reasoning
  };
};