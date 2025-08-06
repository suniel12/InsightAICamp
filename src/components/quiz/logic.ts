import { UserAnswers, QuickAnswers, DetailedAnswers, MultiPathRecommendation, CareerPath, RoleDefinition } from './types';
import { ROLE_DEFINITIONS } from './data';

// V2.0 Multi-Path Recommendation Algorithm

export const calculateSpeedToEmploymentScore = (
  role: RoleDefinition, 
  background: string, 
  motivation: string
): number => {
  let score = 0;
  
  // Base score from training duration (shorter = higher score)
  const maxWeeks = 28;
  const avgWeeks = (role.trainingDuration.min + role.trainingDuration.max) / 2;
  score += (maxWeeks - avgWeeks) / maxWeeks * 40; // 0-40 points
  
  // Background relevance
  const backgroundBonus: Record<string, number> = {
    'it_professional': 30,
    'skilled_trades': 25,
    'military_veteran': 20,
    'tech_adjacent': 15,
    'recent_graduate': 10,
    'career_changer': 5
  };
  score += backgroundBonus[background] || 0;
  
  // Market demand
  const demandBonus = {
    'high': 30,
    'medium': 20,
    'low': 10
  };
  score += demandBonus[role.marketDemand];
  
  // Motivation alignment
  if (motivation === 'quick_entry') score += 10;
  if (motivation === 'stability' && role.marketDemand === 'high') score += 5;
  
  return Math.min(100, score);
};

export const calculateSalaryPotentialScore = (
  role: RoleDefinition,
  background: string,
  motivation: string
): number => {
  let score = 0;
  
  // Base salary range (higher = more points)
  const avgSalary = (role.baseSalaryRange.min + role.baseSalaryRange.max) / 2;
  score += (avgSalary - 45000) / 1000; // roughly 0-95 points for 45k-140k range
  
  // Background salary multiplier
  const backgroundMultiplier: Record<string, number> = {
    'it_professional': 1.15,
    'skilled_trades': 1.10,
    'military_veteran': 1.10,
    'tech_adjacent': 1.05,
    'recent_graduate': 0.95,
    'career_changer': 1.00
  };
  score *= backgroundMultiplier[background] || 1.0;
  
  // Growth trajectory
  const progressionBonus = role.careerProgression.length * 5;
  score += progressionBonus;
  
  // Market demand premium
  if (role.marketDemand === 'high') score += 10;
  
  // Motivation alignment
  if (motivation === 'high_salary') score += 15;
  if (motivation === 'growth_potential') score += 10;
  
  return Math.min(100, score);
};

export const calculateFitScore = (
  role: RoleDefinition,
  answers: QuickAnswers | DetailedAnswers,
  isDetailed = false
): number => {
  let score = 0;
  
  // Core interest alignment (35 points max)
  if (answers.q3 === 'digital_systems' && role.category === 'it_infrastructure') {
    score += 35;
  } else if (answers.q3 === 'physical_systems' && role.category === 'facilities') {
    score += 35;
  } else if (role.category === 'hybrid') {
    score += 25; // Hybrid roles get moderate points regardless
  } else if (role.category === 'security' || role.category === 'analytics') {
    score += 20; // Specialty roles get base points
  }
  
  // Problem-solving style alignment (25 points max)
  const problemSolvingAlignment: Record<string, string[]> = {
    'hands_on_fix': ['data_center_technician', 'critical_facilities_technician'],
    'remote_diagnosis': ['cloud_operations_engineer', 'site_reliability_engineer', 'network_operations_technician'],
    'mechanical_fix': ['critical_facilities_technician'],
    'system_optimization': ['bms_controls_technician', 'capacity_planning_analyst']
  };
  
  const q4Answer = answers.q4_it || answers.q4_facilities;
  if (q4Answer && problemSolvingAlignment[q4Answer]?.includes(role.role)) {
    score += 25;
  }
  
  // Work preference alignment (20 points max)
  if (answers.q2 === 'work_life' && role.physicalDemands === 'low') score += 20;
  if (answers.q2 === 'stability' && role.marketDemand === 'high') score += 15;
  if (answers.q2 === 'growth_potential' && role.careerProgression.length >= 3) score += 15;
  
  // Physical demands match (20 points max)
  if (isDetailed && 'da7' in answers) {
    const physicalComfort = (answers as DetailedAnswers).da7;
    const physicalMatch: Record<string, Record<string, number>> = {
      'very_comfortable': { 'high': 20, 'medium': 15, 'low': 10 },
      'comfortable': { 'high': 15, 'medium': 20, 'low': 15 },
      'neutral': { 'high': 10, 'medium': 15, 'low': 20 },
      'prefer_minimal': { 'high': 5, 'medium': 10, 'low': 20 },
      'avoid': { 'high': 0, 'medium': 5, 'low': 20 }
    };
    score += physicalMatch[physicalComfort]?.[role.physicalDemands] || 0;
  }
  
  return Math.min(100, score);
};

export const calculateConfidenceScore = (
  answers: QuickAnswers | DetailedAnswers,
  isDetailed = false
): number => {
  let confidence = 70; // Base confidence
  
  // Detailed assessment bonus
  if (isDetailed) confidence += 15;
  
  // Relevant background boost
  const experiencedBg = ['it_professional', 'skilled_trades', 'military_veteran'];
  if (experiencedBg.includes(answers.q1)) {
    confidence += 10;
  }
  
  // Clear preferences expressed
  if (answers.q2 && answers.q3) confidence += 5;
  
  // Conflicting responses penalty (simplified check)
  if (answers.q2 === 'work_life' && answers.q3 === 'physical_systems') {
    confidence -= 5; // Wanting work-life balance but interested in physical systems
  }
  
  return Math.min(95, Math.max(55, confidence));
};

export const generateCareerPath = (
  pathType: 'fastest' | 'highest_salary',
  role: RoleDefinition,
  answers: QuickAnswers | DetailedAnswers,
  scores: any, // Updated to accept flexible scoring object
  isDetailed = false
): CareerPath => {
  // Adjust salary for background
  const backgroundMultiplier: Record<string, number> = {
    'it_professional': 1.15,
    'skilled_trades': 1.10,
    'military_veteran': 1.10,
    'tech_adjacent': 1.05,
    'recent_graduate': 0.95,
    'career_changer': 1.00
  };
  
  const multiplier = backgroundMultiplier[answers.q1] || 1.0;
  const adjustedSalary = {
    min: Math.round(role.baseSalaryRange.min * multiplier),
    max: Math.round(role.baseSalaryRange.max * multiplier)
  };
  
  // Generate reasoning based on path type
  const categoryDisplayMap: Record<string, string> = {
    'it_infrastructure': 'IT Infrastructure',
    'facilities': 'Facilities',
    'hybrid': 'Hybrid',
    'security': 'Security',
    'analytics': 'Analytics'
  };
  
  const reasoningMap = {
    'fastest': `Fastest path to employment based on your ${answers.q1.replace('_', ' ')} background and ${role.marketDemand} market demand.`,
    'highest_salary': `Highest earning potential with ${role.careerProgression.length}+ advancement levels and premium skills in ${categoryDisplayMap[role.category] || role.category}.`
  };
  
  // Training duration based on path type
  const durationMap = {
    'fastest': `${role.trainingDuration.min}-${role.trainingDuration.min + 2} weeks`,
    'highest_salary': `${role.trainingDuration.max - 2}-${role.trainingDuration.max} weeks`
  };
  
  return {
    pathType,
    role: role.role,
    title: role.title,
    description: role.description,
    salaryRange: adjustedSalary,
    trainingDuration: durationMap[pathType],
    confidence: Math.round(calculatePathConfidence(scores, pathType, isDetailed)),
    reasoning: reasoningMap[pathType],
    requiredCertifications: role.certificationPaths.slice(0, 2),
    keySkills: role.requiredSkills,
    marketDemand: role.marketDemand,
    physicalDemands: role.physicalDemands,
    nextSteps: generateNextSteps(pathType, role)
  };
};

export const generateNextSteps = (
  pathType: 'fastest' | 'highest_salary',
  role: RoleDefinition
): string[] => {
  const baseSteps = [
    'Complete skills assessment',
    'Apply to Gigawatt Academy',
    'Begin specialized training program'
  ];
  
  const pathSpecificSteps = {
    'fastest': [
      ...baseSteps,
      `Start with ${role.certificationPaths[0]} certification`,
      'Begin job search in final 2 weeks of training'
    ],
    'highest_salary': [
      ...baseSteps,
      'Complete all core certifications',
      `Master advanced ${role.requiredSkills.join(', ')}`,
      'Apply to premium employers in final month'
    ]
  };
  
  return pathSpecificSteps[pathType];
};

export const calculatePathConfidence = (scores: any, pathType: 'fastest' | 'highest_salary', isDetailed: boolean): number => {
  // Handle different scoring objects for quick vs detailed assessments
  if (isDetailed) {
    // Detailed assessment uses personalFit, careerAlignment, practicalFit
    const composite = (scores.personalFit * 0.5) + (scores.careerAlignment * 0.3) + (scores.practicalFit * 0.2);
    return Math.min(95, Math.max(65, composite));
  } else {
    // Quick assessment uses quickRelevance, backgroundFit, motivationAlignment
    const composite = (scores.quickRelevance * 0.4) + (scores.backgroundFit * 0.4) + (scores.motivationAlignment * 0.2);
    return Math.min(85, Math.max(60, composite));
  }
};

export const generateMultiPathRecommendation = (
  answers: QuickAnswers | DetailedAnswers,
  isDetailed = false
): MultiPathRecommendation => {
  if (isDetailed) {
    return generateDetailedAssessmentRecommendation(answers as DetailedAnswers);
  } else {
    return generateQuickAssessmentRecommendation(answers as QuickAnswers);
  }
};

// Quick Assessment: Background + Motivation Focused Recommendations
export const generateQuickAssessmentRecommendation = (
  answers: QuickAnswers
): MultiPathRecommendation => {
  const allRoles = Object.values(ROLE_DEFINITIONS);
  
  // Create personalized role pools based on background and motivation
  const personalizedRoles = getPersonalizedRolePool(answers);
  
  // Calculate simplified scores focused on background fit
  const roleScores = personalizedRoles.map(role => ({
    role,
    quickRelevance: calculateQuickRelevanceScore(role, answers),
    backgroundFit: calculateBackgroundFitScore(role, answers.q1),
    motivationAlignment: calculateMotivationAlignment(role, answers.q2)
  }));
  
  // Find best roles for each path, ensuring no overlap
  const { fastestRole, highestSalaryRole } = selectNonOverlappingPaths(roleScores, answers);
  
  // Generate career paths
  const fastestPath = generateCareerPath('fastest', fastestRole.role, answers, fastestRole, false);
  const highestSalaryPath = generateCareerPath('highest_salary', highestSalaryRole.role, answers, highestSalaryRole, false);
  
  const recommendation: MultiPathRecommendation = {
    fastestPath,
    highestSalaryPath,
    overallConfidence: calculateConfidenceScore(answers, false),
    assessmentType: 'quick',
    personalizedInsights: generatePersonalizedInsights(answers, false)
  };
  
  return recommendation;
};

// Detailed Assessment: Comprehensive Personal Fit Analysis
export const generateDetailedAssessmentRecommendation = (
  answers: DetailedAnswers
): MultiPathRecommendation => {
  const allRoles = Object.values(ROLE_DEFINITIONS);
  
  // Calculate comprehensive scores with heavy personal fit weighting
  const roleScores = allRoles.map(role => ({
    role,
    personalFit: calculateComprehensiveFitScore(role, answers), // 60% weight
    careerAlignment: calculateCareerAlignmentScore(role, answers), // 25% weight
    practicalFit: calculatePracticalFitScore(role, answers) // 15% weight
  }));
  
  // Find best roles for each path with detailed logic
  const { fastestRole, highestSalaryRole } = selectDetailedRecommendations(roleScores, answers);
  
  // Generate career paths
  const fastestPath = generateCareerPath('fastest', fastestRole.role, answers, fastestRole, true);
  const highestSalaryPath = generateCareerPath('highest_salary', highestSalaryRole.role, answers, highestSalaryRole, true);
  
  const recommendation: MultiPathRecommendation = {
    fastestPath,
    highestSalaryPath,
    overallConfidence: calculateConfidenceScore(answers, true),
    assessmentType: 'detailed',
    personalizedInsights: generatePersonalizedInsights(answers, true),
    skillsGapAnalysis: generateSkillsGapAnalysis(answers, highestSalaryPath)
  };
  
  return recommendation;
};

// Quick Assessment Helper Functions

export const getPersonalizedRolePool = (answers: QuickAnswers): RoleDefinition[] => {
  const allRoles = Object.values(ROLE_DEFINITIONS);
  
  // Create role pools based on background and motivation
  const backgroundRolePools: Record<string, string[]> = {
    'software_engineer': ['site_reliability_engineer', 'cloud_operations_engineer', 'capacity_planning_analyst', 'network_operations_technician'],
    'it_professional': ['cloud_operations_engineer', 'site_reliability_engineer', 'network_operations_technician', 'data_center_technician'],
    'skilled_trades': ['critical_facilities_technician', 'bms_controls_technician', 'data_center_technician', 'network_operations_technician'],
    'tech_adjacent': ['network_operations_technician', 'cloud_operations_engineer', 'capacity_planning_analyst', 'data_center_technician'],
    'recent_graduate': ['data_center_technician', 'network_operations_technician', 'cloud_operations_engineer', 'capacity_planning_analyst'],
    'others': ['data_center_technician', 'critical_facilities_technician', 'data_center_security_specialist', 'bms_controls_technician']
  };
  
  const backgroundPool = backgroundRolePools[answers.q1] || Object.keys(ROLE_DEFINITIONS);
  
  // Further filter by motivation if needed
  const motivationAdjustments: Record<string, (roles: string[]) => string[]> = {
    'quick_entry': (roles) => roles.filter(role => ROLE_DEFINITIONS[role].trainingDuration.min <= 16),
    'high_salary': (roles) => roles.filter(role => ROLE_DEFINITIONS[role].baseSalaryRange.max >= 100000),
    'stability': (roles) => roles.filter(role => ROLE_DEFINITIONS[role].marketDemand === 'high'),
    'growth_potential': (roles) => roles.filter(role => ROLE_DEFINITIONS[role].careerProgression.length >= 3),
    'work_life': (roles) => roles.filter(role => ROLE_DEFINITIONS[role].physicalDemands === 'low' || ROLE_DEFINITIONS[role].physicalDemands === 'medium')
  };
  
  const adjustmentFn = motivationAdjustments[answers.q2];
  const finalRoleIds = adjustmentFn ? adjustmentFn(backgroundPool) : backgroundPool;
  
  // Ensure we have at least 4 roles to choose from
  if (finalRoleIds.length < 4) {
    return allRoles;
  }
  
  return finalRoleIds.map(roleId => ROLE_DEFINITIONS[roleId]);
};

export const calculateQuickRelevanceScore = (role: RoleDefinition, answers: QuickAnswers): number => {
  let score = 50; // Base score
  
  // Background compatibility (40 points max)
  const backgroundCompatibility: Record<string, Record<string, number>> = {
    'software_engineer': {
      'site_reliability_engineer': 40,
      'cloud_operations_engineer': 35,
      'capacity_planning_analyst': 30,
      'network_operations_technician': 25
    },
    'it_professional': {
      'cloud_operations_engineer': 40,
      'site_reliability_engineer': 35,
      'network_operations_technician': 30,
      'data_center_technician': 25
    },
    'skilled_trades': {
      'critical_facilities_technician': 40,
      'bms_controls_technician': 35,
      'data_center_technician': 30,
      'network_operations_technician': 20
    },
    'others': {
      'data_center_technician': 40,
      'critical_facilities_technician': 35,
      'data_center_security_specialist': 35,
      'bms_controls_technician': 25
    }
  };
  
  const bgScore = backgroundCompatibility[answers.q1]?.[role.role] || 20;
  score += bgScore;
  
  // Interest alignment (30 points max)
  if (answers.q3 === 'digital_systems' && role.category === 'it_infrastructure') score += 30;
  if (answers.q3 === 'physical_systems' && role.category === 'facilities') score += 30;
  if (role.category === 'hybrid') score += 20; // Hybrid roles get moderate points
  
  return Math.min(100, score);
};

export const calculateBackgroundFitScore = (role: RoleDefinition, background: string): number => {
  const backgroundMultipliers: Record<string, Record<string, number>> = {
    'software_engineer': {
      'site_reliability_engineer': 1.3,
      'cloud_operations_engineer': 1.2,
      'capacity_planning_analyst': 1.1,
      'network_operations_technician': 1.0
    },
    'it_professional': {
      'cloud_operations_engineer': 1.3,
      'site_reliability_engineer': 1.2,
      'network_operations_technician': 1.1,
      'data_center_technician': 1.0
    },
    'skilled_trades': {
      'critical_facilities_technician': 1.3,
      'bms_controls_technician': 1.2,
      'data_center_technician': 1.1,
      'network_operations_technician': 0.9
    },
    'others': {
      'data_center_security_specialist': 1.3,
      'data_center_technician': 1.2,
      'critical_facilities_technician': 1.1,
      'bms_controls_technician': 1.0
    }
  };
  
  const multiplier = backgroundMultipliers[background]?.[role.role] || 1.0;
  return Math.round(70 * multiplier); // Base score of 70, adjusted by fit
};

export const calculateMotivationAlignment = (role: RoleDefinition, motivation: string): number => {
  const motivationScores: Record<string, Record<string, number>> = {
    'quick_entry': {
      'data_center_technician': 30, // 8-12 weeks
      'critical_facilities_technician': 25, // 12-18 weeks
      'network_operations_technician': 20, // 12-16 weeks
      'bms_controls_technician': 15 // 14-20 weeks
    },
    'high_salary': {
      'site_reliability_engineer': 30, // $95k-$140k
      'cloud_operations_engineer': 25, // $85k-$125k
      'capacity_planning_analyst': 20, // $85k-$120k
      'data_center_security_specialist': 15 // $80k-$115k
    },
    'stability': {
      'data_center_technician': 30, // High demand
      'network_operations_technician': 30, // High demand
      'critical_facilities_technician': 30, // High demand
      'cloud_operations_engineer': 25 // High demand
    },
    'growth_potential': {
      'site_reliability_engineer': 30, // 4+ progression levels
      'cloud_operations_engineer': 25, // 3+ progression levels
      'network_operations_technician': 25, // 3+ progression levels
      'capacity_planning_analyst': 20 // 3+ progression levels
    },
    'work_life': {
      'cloud_operations_engineer': 30, // Low physical, remote possible
      'capacity_planning_analyst': 30, // Low physical, analytics focus
      'site_reliability_engineer': 25, // Low physical, some remote
      'data_center_security_specialist': 20 // Medium physical
    }
  };
  
  return motivationScores[motivation]?.[role.role] || 10;
};

export const selectNonOverlappingPaths = (
  roleScores: Array<{ role: RoleDefinition; quickRelevance: number; backgroundFit: number; motivationAlignment: number }>,
  answers: QuickAnswers
): { fastestRole: any; highestSalaryRole: any } => {
  // Calculate combined scores for path selection
  const scoredRoles = roleScores.map(rs => ({
    ...rs,
    speedScore: calculateSpeedPathScore(rs, answers),
    salaryScore: calculateSalaryPathScore(rs, answers)
  }));
  
  // Sort by speed score for fastest path
  const speedSorted = [...scoredRoles].sort((a, b) => b.speedScore - a.speedScore);
  const fastestRole = speedSorted[0];
  
  // For salary path, exclude the fastest role to prevent overlap
  const salaryFiltered = scoredRoles.filter(rs => rs.role.role !== fastestRole.role.role);
  const salarySorted = salaryFiltered.sort((a, b) => b.salaryScore - a.salaryScore);
  const highestSalaryRole = salarySorted[0] || speedSorted[1]; // Fallback to second-best speed if needed
  
  return { fastestRole, highestSalaryRole };
};

const calculateSpeedPathScore = (
  roleScore: { role: RoleDefinition; quickRelevance: number; backgroundFit: number; motivationAlignment: number },
  answers: QuickAnswers
): number => {
  // Prioritize quick training + background fit
  const trainingSpeed = (20 - roleScore.role.trainingDuration.min) * 3; // Shorter = higher score
  const relevance = roleScore.quickRelevance * 0.5;
  const backgroundFit = roleScore.backgroundFit * 0.3;
  
  // Bonus for motivation alignment
  const motivationBonus = answers.q2 === 'quick_entry' ? roleScore.motivationAlignment : 0;
  
  return trainingSpeed + relevance + backgroundFit + motivationBonus;
};

const calculateSalaryPathScore = (
  roleScore: { role: RoleDefinition; quickRelevance: number; backgroundFit: number; motivationAlignment: number },
  answers: QuickAnswers
): number => {
  // Prioritize high salary + career growth
  const salaryScore = (roleScore.role.baseSalaryRange.max - 60000) / 1000; // Higher salary = higher score
  const relevance = roleScore.quickRelevance * 0.4;
  const backgroundFit = roleScore.backgroundFit * 0.4;
  
  // Bonus for motivation alignment
  const motivationBonus = answers.q2 === 'high_salary' ? roleScore.motivationAlignment : 0;
  
  return salaryScore + relevance + backgroundFit + motivationBonus;
};

// Detailed Assessment Helper Functions

export const calculateComprehensiveFitScore = (role: RoleDefinition, answers: DetailedAnswers): number => {
  let score = 0;
  
  // Core interest alignment (25 points)
  if (answers.q3 === 'digital_systems' && role.category === 'it_infrastructure') score += 25;
  if (answers.q3 === 'physical_systems' && role.category === 'facilities') score += 25;
  if (role.category === 'hybrid') score += 15;
  
  // Technical skills alignment (20 points)
  if (answers.da1_skills) {
    const relevantSkills = role.requiredSkills.filter(skill => {
      return Object.entries(answers.da1_skills).some(([userSkill, level]) => 
        userSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0]) && 
        (level === 'Intermediate' || level === 'Advanced')
      );
    });
    score += Math.min(20, relevantSkills.length * 5);
  }
  
  // Work environment preference (15 points)
  const environmentMatch: Record<string, Record<string, number>> = {
    '24x7_ops': {
      'data_center_technician': 15,
      'network_operations_technician': 15,
      'critical_facilities_technician': 15
    },
    'business_hours': {
      'capacity_planning_analyst': 15,
      'bms_controls_technician': 12,
      'data_center_security_specialist': 10
    },
    'remote_hybrid': {
      'cloud_operations_engineer': 15,
      'site_reliability_engineer': 15,
      'capacity_planning_analyst': 12
    },
    'project_based': {
      'bms_controls_technician': 15,
      'critical_facilities_technician': 12,
      'data_center_technician': 10
    }
  };
  score += environmentMatch[answers.da2_environment]?.[role.role] || 5;
  
  // Physical demands comfort (20 points)
  const physicalMatch: Record<string, Record<string, number>> = {
    'very_comfortable': { 'high': 20, 'medium': 15, 'low': 10 },
    'comfortable': { 'high': 15, 'medium': 20, 'low': 15 },
    'neutral': { 'high': 10, 'medium': 15, 'low': 20 },
    'prefer_minimal': { 'high': 5, 'medium': 10, 'low': 20 },
    'avoid': { 'high': 0, 'medium': 5, 'low': 20 }
  };
  score += physicalMatch[answers.da7_physical]?.[role.physicalDemands] || 10;
  
  // Team vs independent work style (10 points)
  const workStyleMatch: Record<string, Record<string, number>> = {
    'highly_collaborative': {
      'network_operations_technician': 10,
      'data_center_technician': 8,
      'critical_facilities_technician': 8
    },
    'mostly_independent': {
      'site_reliability_engineer': 10,
      'cloud_operations_engineer': 10,
      'capacity_planning_analyst': 8
    }
  };
  score += workStyleMatch[answers.da8_teamwork]?.[role.role] || 5;
  
  // Industry interest alignment (10 points)
  const industryMatch: Record<string, string[]> = {
    'hyperscale': ['cloud_operations_engineer', 'site_reliability_engineer', 'network_operations_technician'],
    'colocation': ['data_center_technician', 'critical_facilities_technician', 'data_center_security_specialist'],
    'enterprise': ['network_operations_technician', 'data_center_security_specialist', 'capacity_planning_analyst'],
    'edge': ['network_operations_technician', 'data_center_technician', 'bms_controls_technician']
  };
  if (industryMatch[answers.da11_industry]?.includes(role.role)) score += 10;
  
  return Math.min(100, score);
};

export const calculateCareerAlignmentScore = (role: RoleDefinition, answers: DetailedAnswers): number => {
  let score = 0;
  
  // Salary expectations alignment (40 points)
  const roleMaxSalary = role.baseSalaryRange.max;
  const salaryAlignment: Record<string, number> = {
    'entry_level': roleMaxSalary >= 60000 ? 40 : 20,
    'moderate': roleMaxSalary >= 80000 ? 40 : 20,
    'competitive': roleMaxSalary >= 100000 ? 40 : 10,
    'premium': roleMaxSalary >= 120000 ? 40 : 0
  };
  score += salaryAlignment[answers.da10_salary];
  
  // Timeline alignment (30 points)
  const timelineAlignment: Record<string, number> = {
    'asap': role.trainingDuration.min <= 12 ? 30 : 10,
    '6_months': role.trainingDuration.max <= 20 ? 30 : 15,
    '1_year': role.trainingDuration.max <= 28 ? 30 : 20,
    'exploring': 25
  };
  score += timelineAlignment[answers.da4_timeline];
  
  // Advancement goals alignment (30 points)
  const advancementMatch: Record<string, Record<string, number>> = {
    'technical_expert': {
      'site_reliability_engineer': 30,
      'cloud_operations_engineer': 25,
      'bms_controls_technician': 20
    },
    'team_lead': {
      'network_operations_technician': 30,
      'data_center_technician': 25,
      'critical_facilities_technician': 25
    },
    'management': {
      'capacity_planning_analyst': 30,
      'data_center_security_specialist': 25,
      'critical_facilities_technician': 20
    },
    'architect': {
      'site_reliability_engineer': 30,
      'cloud_operations_engineer': 30,
      'bms_controls_technician': 25
    }
  };
  score += advancementMatch[answers.da13_advancement]?.[role.role] || 15;
  
  return Math.min(100, score);
};

export const calculatePracticalFitScore = (role: RoleDefinition, answers: DetailedAnswers): number => {
  let score = 50; // Base score
  
  // Geographic flexibility (25 points)
  const geographicBonus: Record<string, number> = {
    'anywhere': 25,
    'region': 20,
    'commute': 15,
    'remote_only': role.physicalDemands === 'low' ? 25 : 5,
    'no_relocation': 10
  };
  score += geographicBonus[answers.da5_geographic];
  
  // Schedule preference alignment (25 points)
  const scheduleMatch: Record<string, Record<string, number>> = {
    'day_shift': {
      'capacity_planning_analyst': 25,
      'bms_controls_technician': 20,
      'data_center_security_specialist': 15
    },
    'any_shift': {
      'data_center_technician': 25,
      'network_operations_technician': 25,
      'critical_facilities_technician': 20
    },
    'night_preferred': {
      'data_center_technician': 25,
      'network_operations_technician': 20,
      'site_reliability_engineer': 15
    }
  };
  score += scheduleMatch[answers.da14_schedule]?.[role.role] || 10;
  
  return Math.min(100, score);
};

export const selectDetailedRecommendations = (
  roleScores: Array<{ role: RoleDefinition; personalFit: number; careerAlignment: number; practicalFit: number }>,
  answers: DetailedAnswers
): { fastestRole: any; highestSalaryRole: any } => {
  // Calculate composite scores with different weightings for each path
  const scoredRoles = roleScores.map(rs => ({
    ...rs,
    speedComposite: calculateDetailedSpeedScore(rs, answers),
    salaryComposite: calculateDetailedSalaryScore(rs, answers)
  }));
  
  // Sort by composite scores
  const speedSorted = [...scoredRoles].sort((a, b) => b.speedComposite - a.speedComposite);
  const fastestRole = speedSorted[0];
  
  // For salary path, exclude the fastest role to prevent overlap
  const salaryFiltered = scoredRoles.filter(rs => rs.role.role !== fastestRole.role.role);
  const salarySorted = salaryFiltered.sort((a, b) => b.salaryComposite - a.salaryComposite);
  const highestSalaryRole = salarySorted[0] || speedSorted[1];
  
  return { fastestRole, highestSalaryRole };
};

const calculateDetailedSpeedScore = (
  roleScore: { role: RoleDefinition; personalFit: number; careerAlignment: number; practicalFit: number },
  answers: DetailedAnswers
): number => {
  // Weight: 50% personal fit, 30% career alignment, 20% practical fit
  const composite = (roleScore.personalFit * 0.5) + (roleScore.careerAlignment * 0.3) + (roleScore.practicalFit * 0.2);
  
  // Apply speed bonus for shorter training
  const speedBonus = (20 - roleScore.role.trainingDuration.min) * 2;
  
  // Timeline urgency bonus
  const urgencyBonus = answers.da4_timeline === 'asap' ? 20 : 0;
  
  return composite + speedBonus + urgencyBonus;
};

const calculateDetailedSalaryScore = (
  roleScore: { role: RoleDefinition; personalFit: number; careerAlignment: number; practicalFit: number },
  answers: DetailedAnswers
): number => {
  // Weight: 60% personal fit, 25% career alignment, 15% practical fit
  const composite = (roleScore.personalFit * 0.6) + (roleScore.careerAlignment * 0.25) + (roleScore.practicalFit * 0.15);
  
  // Apply salary bonus for higher earning potential
  const salaryBonus = (roleScore.role.baseSalaryRange.max - 70000) / 2000;
  
  // Growth potential bonus
  const growthBonus = roleScore.role.careerProgression.length * 5;
  
  return composite + salaryBonus + growthBonus;
};

export const generatePersonalizedInsights = (
  answers: QuickAnswers | DetailedAnswers,
  isDetailed = false
): string[] => {
  const insights: string[] = [];
  
  // Background-specific insights
  const backgroundInsights: Record<string, string> = {
    'software_engineer': 'Your programming experience gives you a strong foundation for Site Reliability Engineering and Cloud Operations roles',
    'it_professional': 'Your IT background gives you a significant advantage in data center roles',
    'skilled_trades': 'Your hands-on experience translates perfectly to data center operations',
    'tech_adjacent': 'Your tech exposure provides a solid foundation for deeper technical roles',
    'recent_graduate': 'Your fresh knowledge and adaptability are valuable assets',
    'others': 'Your diverse background brings unique perspective and problem-solving skills to technical roles'
  };
  
  insights.push(backgroundInsights[answers.q1]);
  
  // Motivation-specific insights
  const motivationInsights: Record<string, string> = {
    'quick_entry': 'Entry-level positions are available with focused 8-12 week training programs',
    'high_salary': 'Senior data center roles command $100K+ salaries with clear advancement paths',
    'growth_potential': 'The data center field offers multiple career progression opportunities',
    'work_life': 'Many roles offer predictable schedules with remote monitoring capabilities'
  };
  
  insights.push(motivationInsights[answers.q2]);
  
  // Interest-specific insights
  if (answers.q3 === 'digital_systems') {
    insights.push('Your interest in digital infrastructure aligns with high-growth cloud operations roles');
  } else {
    insights.push('Your fascination with physical systems matches the critical facilities engineering track');
  }
  
  // Add detailed assessment insights
  if (isDetailed) {
    const detailedAnswers = answers as DetailedAnswers;
    
    if (detailedAnswers.da4 === 'asap') {
      insights.push('Your urgent timeline makes entry-level technician roles ideal for quick employment');
    }
    
    if (detailedAnswers.da5 === 'anywhere') {
      insights.push('Your geographic flexibility opens opportunities at major data center hubs nationwide');
    }
    
    if (detailedAnswers.da7 === 'very_comfortable') {
      insights.push('Your comfort with physical work qualifies you for hands-on operational roles');
    }
  }
  
  return insights;
};

export const generateSkillsGapAnalysis = (
  answers: DetailedAnswers,
  bestFitPath: CareerPath
): { currentSkills: string[]; requiredSkills: string[]; trainingRecommendations: string[] } => {
  const currentSkills: string[] = [];
  const roleDefinition = ROLE_DEFINITIONS[bestFitPath.role];
  
  // Analyze technical skills from DA1
  if (answers.da1_skills) {
    Object.entries(answers.da1_skills).forEach(([skill, level]) => {
      if (level === 'Intermediate' || level === 'Advanced') {
        currentSkills.push(skill);
      }
    });
  }
  
  // Add certification skills from DA6
  if (answers.da6_certs && !answers.da6_certs.includes('none')) {
    currentSkills.push(...answers.da6_certs.map(cert => `${cert} certified`));
  }
  
  // Determine skill gaps
  const requiredSkills = roleDefinition.requiredSkills;
  const skillGaps = requiredSkills.filter(skill => 
    !currentSkills.some(current => current.toLowerCase().includes(skill.toLowerCase().split(' ')[0]))
  );
  
  // Generate training recommendations
  const trainingRecommendations: string[] = [];
  
  if (skillGaps.length > 0) {
    trainingRecommendations.push(`Focus on: ${skillGaps.slice(0, 3).join(', ')}`);
  }
  
  if (roleDefinition.certificationPaths.length > 0) {
    trainingRecommendations.push(`Pursue ${roleDefinition.certificationPaths[0]} certification first`);
  }
  
  if (answers.da3_learning === 'apprenticeship') {
    trainingRecommendations.push('Consider apprenticeship programs for hands-on learning');
  } else if (answers.da3_learning === 'bootcamp') {
    trainingRecommendations.push('Intensive bootcamp format will accelerate your progress');
  }
  
  return {
    currentSkills,
    requiredSkills,
    trainingRecommendations
  };
};