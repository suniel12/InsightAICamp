import { Question, RoleDefinition, GridQuestion, MultiSelectQuestion } from './types';

// QUICK ASSESSMENT (Tier 1) - 5 Questions
export const QUICK_ASSESSMENT: Record<string, Question> = {
  'q1': {
    id: 'q1',
    tier: 1,
    type: 'linear',
    text: 'Which best describes your current career situation?',
    options: [
      {
        id: 'recent_graduate',
        text: 'Recent Graduate',
        description: 'Recently completed degree/certificate, seeking first major career role',
        nextQuestionId: 'q2'
      },
      {
        id: 'software_engineer',
        text: 'Software Engineer',
        description: 'Experience in software development, programming, or application development',
        nextQuestionId: 'q2'
      },
      {
        id: 'it_professional',
        text: 'IT Professional',
        description: 'Experience in help desk, network support, or system administration',
        nextQuestionId: 'q2'
      },
      {
        id: 'skilled_trades',
        text: 'Skilled Trades Professional',
        description: 'Hands-on experience in electrical, HVAC, mechanical work',
        nextQuestionId: 'q2'
      },
      {
        id: 'tech_adjacent',
        text: 'Veterans',
        description: 'Military veterans looking to transition to civilian tech careers',
        nextQuestionId: 'q2'
      },
      {
        id: 'others',
        text: 'Others',
        description: 'Career changer or other professional background seeking stable tech career',
        nextQuestionId: 'q2'
      }
    ]
  },

  'q2': {
    id: 'q2',
    tier: 1,
    type: 'linear',
    text: 'What\'s your #1 priority in choosing a new career path?',
    options: [
      {
        id: 'quick_entry',
        text: 'Speed to Employment',
        description: 'Start working and earning as soon as possible',
        nextQuestionId: 'q3'
      },
      {
        id: 'high_salary',
        text: 'Maximum Earnings',
        description: 'Optimize for highest possible salary, even if it takes longer',
        nextQuestionId: 'q3'
      },
      {
        id: 'growth_potential',
        text: 'Career Growth',
        description: 'Clear advancement path and skill development opportunities',
        nextQuestionId: 'q3'
      },
      {
        id: 'work_life',
        text: 'Work-Life Balance',
        description: 'Predictable hours and flexibility',
        nextQuestionId: 'q3'
      }
    ]
  },

  'q3': {
    id: 'q3',
    tier: 1,
    type: 'branching',
    text: 'In a massive AI data center, which aspect fascinates you more?',
    options: [
      {
        id: 'digital_systems',
        text: 'Digital Infrastructure',
        description: 'The servers, networks, and software that process billions of calculations per second',
        nextQuestionId: 'q4_it'
      },
      {
        id: 'physical_systems',
        text: 'Physical Infrastructure',
        description: 'The power systems, cooling towers, and mechanical equipment keeping everything running',
        nextQuestionId: 'q4_facilities'
      }
    ]
  },

  'q4_it': {
    id: 'q4_it',
    tier: 1,
    type: 'branching',
    text: 'A critical system alert appears at 2 AM. What\'s your first instinct?',
    options: [
      {
        id: 'hands_on_fix',
        text: 'Get Hands-On',
        description: 'Head to the data center floor to physically inspect and fix the issue',
        nextQuestionId: 'q5_hardware'
      },
      {
        id: 'remote_diagnosis',
        text: 'Diagnose Remotely',
        description: 'Pull up monitoring dashboards and logs to troubleshoot from anywhere',
        nextQuestionId: 'q5_software'
      }
    ]
  },

  'q4_facilities': {
    id: 'q4_facilities',
    tier: 1,
    type: 'branching',
    text: 'The data center temperature is rising. What interests you more?',
    options: [
      {
        id: 'mechanical_fix',
        text: 'Mechanical Systems',
        description: 'Investigating pumps, compressors, and cooling equipment',
        nextQuestionId: 'q5_mechanical'
      },
      {
        id: 'system_optimization',
        text: 'System Controls',
        description: 'Analyzing sensor data and adjusting automated control systems',
        nextQuestionId: 'q5_controls'
      }
    ]
  },

  'q5_hardware': {
    id: 'q5_hardware',
    tier: 1,
    type: 'linear',
    text: 'Which type of work energizes you most?',
    options: [
      {
        id: 'building',
        text: 'Building & Installing',
        description: 'Setting up new equipment and perfect cable management'
      },
      {
        id: 'fixing',
        text: 'Troubleshooting & Repair',
        description: 'Being the hero who fixes critical failures fast'
      },
      {
        id: 'optimizing',
        text: 'Performance Tuning',
        description: 'Making systems run at peak efficiency'
      }
    ]
  },

  'q5_software': {
    id: 'q5_software',
    tier: 1,
    type: 'linear',
    text: 'You need to manage 10,000 servers. Your approach?',
    options: [
      {
        id: 'automation',
        text: 'Automation Scripts',
        description: 'Write code to manage everything automatically'
      },
      {
        id: 'orchestration',
        text: 'Orchestration Platforms',
        description: 'Use advanced tools like Kubernetes'
      },
      {
        id: 'monitoring',
        text: 'Monitoring & Analytics',
        description: 'Build dashboards to predict and prevent issues'
      }
    ]
  },

  'q5_mechanical': {
    id: 'q5_mechanical',
    tier: 1,
    type: 'linear',
    text: 'What type of critical system work appeals to you?',
    options: [
      {
        id: 'power_systems',
        text: 'Power Systems',
        description: 'Working with generators, UPS, electrical distribution'
      },
      {
        id: 'cooling_systems',
        text: 'Cooling Systems',
        description: 'Managing HVAC, chillers, cooling towers'
      },
      {
        id: 'integrated_systems',
        text: 'Integrated Systems',
        description: 'Coordinating all mechanical systems together'
      }
    ]
  },

  'q5_controls': {
    id: 'q5_controls',
    tier: 1,
    type: 'linear',
    text: 'Your ideal work involves:',
    options: [
      {
        id: 'programming_controls',
        text: 'Programming Logic',
        description: 'Creating control sequences and automation'
      },
      {
        id: 'optimizing_efficiency',
        text: 'Efficiency Analysis',
        description: 'Using data to reduce energy consumption'
      },
      {
        id: 'system_integration',
        text: 'System Integration',
        description: 'Connecting building systems with IT systems'
      }
    ]
  }
};

// DETAILED ASSESSMENT (Tier 2) - 15 Additional Questions
export const DETAILED_ASSESSMENT: Record<string, Question | GridQuestion | MultiSelectQuestion> = {
  'da1': {
    id: 'da1',
    tier: 2,
    type: 'grid',
    category: 'technical_skills',
    text: 'Rate your current experience level with these technologies:',
    categories: [
      'Operating Systems (Windows Server, Linux)',
      'Networking (TCP/IP, VLANs, routing)',
      'Virtualization (VMware, Hyper-V, containers)',
      'Cloud Platforms (AWS, Azure, Google Cloud)',
      'Scripting (Python, PowerShell, Bash)',
      'Hardware (Server components, storage systems)',
      'Databases (SQL, NoSQL basics)',
      'Monitoring Tools (Nagios, Zabbix, Grafana)'
    ],
    scaleOptions: ['None', 'Basic', 'Intermediate', 'Advanced'],
    options: []
  } as GridQuestion,

  'da2': {
    id: 'da2',
    tier: 2,
    type: 'linear',
    category: 'work_preferences',
    text: 'Which work environment appeals to you most?',
    options: [
      {
        id: '24x7_ops',
        text: '24/7 Operations Center',
        description: 'Rotating shifts in a mission-critical environment'
      },
      {
        id: 'business_hours',
        text: 'Regular Hours + On-Call',
        description: 'Standard schedule with occasional emergencies'
      },
      {
        id: 'remote_hybrid',
        text: 'Remote/Hybrid',
        description: 'Mix of remote monitoring and on-site work'
      },
      {
        id: 'field_service',
        text: 'Field Service',
        description: 'Travel to different data center locations'
      },
      {
        id: 'project_based',
        text: 'Project-Based',
        description: 'Focus on installations and upgrades'
      }
    ]
  },

  'da3': {
    id: 'da3',
    tier: 2,
    type: 'linear',
    category: 'learning_style',
    text: 'How do you prefer to learn new technical skills?',
    options: [
      {
        id: 'self_paced',
        text: 'Self-Paced Online',
        description: 'Learn independently with video courses and labs'
      },
      {
        id: 'bootcamp',
        text: 'Intensive Bootcamp',
        description: 'Full-time immersive programs'
      },
      {
        id: 'apprenticeship',
        text: 'Apprenticeship',
        description: 'Learn while working alongside experts'
      },
      {
        id: 'classroom',
        text: 'Traditional Classroom',
        description: 'Structured instructor-led training'
      },
      {
        id: 'mixed',
        text: 'Mixed Approach',
        description: 'Combination of methods'
      }
    ]
  },

  'da4': {
    id: 'da4',
    tier: 2,
    type: 'linear',
    category: 'timeline',
    text: 'When do you need to start your new career?',
    options: [
      {
        id: 'asap',
        text: 'ASAP',
        description: 'Need income within 3 months'
      },
      {
        id: '6_months',
        text: '6 Months',
        description: 'Have time for comprehensive training'
      },
      {
        id: '1_year',
        text: 'Within a Year',
        description: 'Can invest in deeper skills'
      },
      {
        id: 'exploring',
        text: 'Just Exploring',
        description: 'Researching options'
      }
    ]
  },

  'da5': {
    id: 'da5',
    tier: 2,
    type: 'linear',
    category: 'geographic',
    text: 'Are you willing to relocate for the right opportunity?',
    options: [
      {
        id: 'anywhere',
        text: 'Yes, Anywhere',
        description: 'Open to any location'
      },
      {
        id: 'region',
        text: 'Within Region',
        description: 'Same geographic region only'
      },
      {
        id: 'commute',
        text: 'Commutable',
        description: 'Within daily driving distance'
      },
      {
        id: 'remote_only',
        text: 'Remote Only',
        description: 'Prefer remote positions'
      },
      {
        id: 'no_relocation',
        text: 'No Relocation',
        description: 'Must be in current city'
      }
    ]
  },

  'da6': {
    id: 'da6',
    tier: 2,
    type: 'multiselect',
    category: 'certifications',
    text: 'Have you earned any of these certifications?',
    maxSelections: 10,
    options: [
      { id: 'comptia_aplus', text: 'CompTIA A+' },
      { id: 'comptia_net', text: 'CompTIA Network+' },
      { id: 'comptia_sec', text: 'CompTIA Security+' },
      { id: 'comptia_server', text: 'CompTIA Server+' },
      { id: 'cisco_any', text: 'Any Cisco certification' },
      { id: 'cloud_any', text: 'Any cloud certification (AWS/Azure/GCP)' },
      { id: 'microsoft_any', text: 'Any Microsoft certification' },
      { id: 'other_it', text: 'Other IT certification' },
      { id: 'none', text: 'None yet' }
    ]
  } as MultiSelectQuestion,

  'da7': {
    id: 'da7',
    tier: 2,
    type: 'linear',
    category: 'physical_demands',
    text: 'How comfortable are you with physical aspects of data center work?',
    options: [
      {
        id: 'very_comfortable',
        text: 'Very Comfortable',
        description: 'Enjoy physical work and don\'t mind loud environments'
      },
      {
        id: 'comfortable',
        text: 'Comfortable',
        description: 'Can handle it as part of the job'
      },
      {
        id: 'neutral',
        text: 'Neutral',
        description: 'Prefer minimal but can adapt'
      },
      {
        id: 'prefer_minimal',
        text: 'Prefer Minimal',
        description: 'Rather work at a desk'
      },
      {
        id: 'avoid',
        text: 'Want to Avoid',
        description: 'Strictly remote/desk work only'
      }
    ]
  },

  'da8': {
    id: 'da8',
    tier: 2,
    type: 'linear',
    category: 'teamwork',
    text: 'What\'s your ideal work style?',
    options: [
      {
        id: 'highly_collaborative',
        text: 'Highly Collaborative',
        description: 'Constant teamwork and communication'
      },
      {
        id: 'team_regular',
        text: 'Regular Team Interaction',
        description: 'Daily collaboration with independent work'
      },
      {
        id: 'mostly_independent',
        text: 'Mostly Independent',
        description: 'Occasional team coordination'
      },
      {
        id: 'fully_independent',
        text: 'Fully Independent',
        description: 'Minimal interaction, solo projects'
      }
    ]
  },

  'da9': {
    id: 'da9',
    tier: 2,
    type: 'linear',
    category: 'problem_solving',
    text: 'When facing a technical problem, you prefer to:',
    options: [
      {
        id: 'systematic',
        text: 'Follow Systematic Procedures',
        description: 'Use checklists and documented processes'
      },
      {
        id: 'analytical',
        text: 'Analyze Root Causes',
        description: 'Deep dive into why problems occur'
      },
      {
        id: 'creative',
        text: 'Find Creative Solutions',
        description: 'Think outside the box'
      },
      {
        id: 'collaborative',
        text: 'Collaborate on Solutions',
        description: 'Brainstorm with team'
      },
      {
        id: 'quick_fix',
        text: 'Quick Fixes First',
        description: 'Get systems running, then investigate'
      }
    ]
  },

  'da10': {
    id: 'da10',
    tier: 2,
    type: 'linear',
    category: 'salary',
    text: 'What are your minimum salary requirements?',
    options: [
      {
        id: 'entry_level',
        text: 'Entry Level ($45-60k)',
        description: 'Focus on getting started'
      },
      {
        id: 'moderate',
        text: 'Moderate ($60-80k)',
        description: 'Balance of pay and opportunity'
      },
      {
        id: 'competitive',
        text: 'Competitive ($80-100k)',
        description: 'Seeking strong compensation'
      },
      {
        id: 'premium',
        text: 'Premium ($100k+)',
        description: 'Only considering high-paying roles'
      }
    ]
  },

  'da11': {
    id: 'da11',
    tier: 2,
    type: 'linear',
    category: 'industry',
    text: 'Which type of data center interests you most?',
    options: [
      {
        id: 'hyperscale',
        text: 'Hyperscale Cloud',
        description: 'Amazon, Google, Microsoft facilities'
      },
      {
        id: 'colocation',
        text: 'Colocation',
        description: 'Multi-tenant data centers'
      },
      {
        id: 'enterprise',
        text: 'Enterprise',
        description: 'Corporate private data centers'
      },
      {
        id: 'edge',
        text: 'Edge Computing',
        description: 'Smaller distributed facilities'
      },
      {
        id: 'specialty',
        text: 'Specialty',
        description: 'AI/ML, cryptocurrency, or HPC focused'
      }
    ]
  },

  'da12': {
    id: 'da12',
    tier: 2,
    type: 'multiselect',
    category: 'technical_interests',
    text: 'Select all technical areas that genuinely interest you:',
    maxSelections: 12,
    options: [
      { id: 'network_architecture', text: 'Network architecture and routing' },
      { id: 'server_hardware', text: 'Server hardware and components' },
      { id: 'linux_admin', text: 'Linux system administration' },
      { id: 'windows_admin', text: 'Windows system administration' },
      { id: 'storage_systems', text: 'Storage systems (SAN/NAS)' },
      { id: 'virtualization', text: 'Virtualization and containers' },
      { id: 'cloud_infrastructure', text: 'Cloud infrastructure' },
      { id: 'security', text: 'Security and compliance' },
      { id: 'automation', text: 'Automation and scripting' },
      { id: 'databases', text: 'Database management' },
      { id: 'monitoring', text: 'Monitoring and observability' },
      { id: 'power_systems', text: 'Power and electrical systems' },
      { id: 'hvac_cooling', text: 'HVAC and cooling systems' },
      { id: 'building_automation', text: 'Building automation systems' }
    ]
  } as MultiSelectQuestion,

  'da13': {
    id: 'da13',
    tier: 2,
    type: 'linear',
    category: 'advancement',
    text: 'Where do you see yourself in 5 years?',
    options: [
      {
        id: 'technical_expert',
        text: 'Technical Expert',
        description: 'Deep expertise in specific technology'
      },
      {
        id: 'team_lead',
        text: 'Team Lead',
        description: 'Managing small technical teams'
      },
      {
        id: 'management',
        text: 'Management',
        description: 'Running data center operations'
      },
      {
        id: 'architect',
        text: 'Architect',
        description: 'Designing data center solutions'
      },
      {
        id: 'entrepreneur',
        text: 'Entrepreneur',
        description: 'Starting own business'
      },
      {
        id: 'flexible',
        text: 'Flexible',
        description: 'Open to various paths'
      }
    ]
  },

  'da14': {
    id: 'da14',
    tier: 2,
    type: 'linear',
    category: 'schedule',
    text: 'What\'s your preferred work schedule?',
    options: [
      {
        id: 'day_shift',
        text: 'Day Shift Only',
        description: 'Traditional 9-5 schedule'
      },
      {
        id: 'any_shift',
        text: 'Any Shift',
        description: 'Flexible for right opportunity'
      },
      {
        id: 'night_preferred',
        text: 'Night Shift Preferred',
        description: 'Enjoy overnight work'
      },
      {
        id: 'rotating',
        text: 'Rotating Shifts',
        description: 'Variety is good'
      },
      {
        id: 'compressed',
        text: 'Compressed Week',
        description: 'Longer days, more days off'
      }
    ]
  },

  'da15': {
    id: 'da15',
    tier: 2,
    type: 'linear',
    category: 'stress_management',
    text: 'How do you handle high-pressure situations?',
    options: [
      {
        id: 'thrive',
        text: 'Thrive Under Pressure',
        description: 'Perform best in critical moments'
      },
      {
        id: 'manage_well',
        text: 'Manage Well',
        description: 'Stay calm and focused'
      },
      {
        id: 'prefer_steady',
        text: 'Prefer Steady',
        description: 'Like predictable environments'
      },
      {
        id: 'learning',
        text: 'Still Learning',
        description: 'Building stress management skills'
      }
    ]
  }
};

// EXPANDED ROLE POOL - 8 Career Paths
export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  'data_center_technician': {
    role: 'data_center_technician',
    title: 'Data Center Technician',
    description: 'Front-line IT hardware specialist responsible for server maintenance, installations, and troubleshooting in mission-critical environments.',
    baseSalaryRange: { min: 65000, max: 95000 },
    category: 'it_infrastructure',
    requiredSkills: ['Hardware troubleshooting', 'Basic networking', 'Linux basics', 'Safety protocols'],
    optionalSkills: ['Scripting', 'Cloud platforms', 'Automation tools'],
    physicalDemands: 'high',
    typicalSchedule: '24/7 rotating shifts',
    careerProgression: ['Senior Technician', 'Lead Technician', 'Operations Manager'],
    marketDemand: 'high',
    trainingDuration: { min: 8, max: 12 },
    certificationPaths: ['CompTIA A+', 'CompTIA Server+', 'CompTIA Network+']
  },

  'network_operations_technician': {
    role: 'network_operations_technician',
    title: 'Network Operations Technician',
    description: 'Network-focused operations specialist managing data center connectivity, monitoring network performance, and resolving connectivity issues.',
    baseSalaryRange: { min: 70000, max: 100000 },
    category: 'it_infrastructure',
    requiredSkills: ['TCP/IP networking', 'VLAN configuration', 'Network monitoring', 'Routing protocols'],
    optionalSkills: ['Cisco certifications', 'Network automation', 'Security protocols'],
    physicalDemands: 'medium',
    typicalSchedule: '24/7 rotating shifts or business hours + on-call',
    careerProgression: ['Senior Network Tech', 'Network Engineer', 'Network Architect'],
    marketDemand: 'high',
    trainingDuration: { min: 12, max: 16 },
    certificationPaths: ['CompTIA Network+', 'Cisco CCNA', 'CompTIA Security+']
  },

  'cloud_operations_engineer': {
    role: 'cloud_operations_engineer',
    title: 'Cloud Operations Engineer',
    description: 'Cloud infrastructure specialist managing virtualized environments, container orchestration, and cloud service deployments.',
    baseSalaryRange: { min: 85000, max: 125000 },
    category: 'it_infrastructure',
    requiredSkills: ['Cloud platforms (AWS/Azure/GCP)', 'Containerization', 'Infrastructure as Code', 'Monitoring'],
    optionalSkills: ['Kubernetes', 'DevOps practices', 'CI/CD pipelines'],
    physicalDemands: 'low',
    typicalSchedule: 'Business hours + on-call rotation',
    careerProgression: ['Senior Cloud Engineer', 'Cloud Architect', 'DevOps Lead'],
    marketDemand: 'high',
    trainingDuration: { min: 16, max: 24 },
    certificationPaths: ['AWS Solutions Architect', 'Azure Administrator', 'Google Cloud Associate']
  },

  'site_reliability_engineer': {
    role: 'site_reliability_engineer',
    title: 'Site Reliability Engineer (SRE)',
    description: 'System reliability specialist focused on automation, performance optimization, and maintaining high-availability systems at scale.',
    baseSalaryRange: { min: 95000, max: 140000 },
    category: 'it_infrastructure',
    requiredSkills: ['Programming (Python/Go)', 'System administration', 'Monitoring & alerting', 'Automation'],
    optionalSkills: ['Machine learning', 'Capacity planning', 'Incident response'],
    physicalDemands: 'low',
    typicalSchedule: 'Business hours + on-call rotation',
    careerProgression: ['Senior SRE', 'Staff SRE', 'Engineering Manager'],
    marketDemand: 'high',
    trainingDuration: { min: 20, max: 28 },
    certificationPaths: ['Google SRE Certification', 'AWS DevOps Engineer', 'Kubernetes certifications']
  },

  'critical_facilities_technician': {
    role: 'critical_facilities_technician',
    title: 'Critical Facilities Technician',
    description: 'Mechanical and electrical systems specialist managing power distribution, cooling systems, and facility infrastructure.',
    baseSalaryRange: { min: 70000, max: 105000 },
    category: 'facilities',
    requiredSkills: ['Electrical systems', 'HVAC systems', 'Power distribution', 'Safety protocols'],
    optionalSkills: ['PLC programming', 'Building automation', 'Energy management'],
    physicalDemands: 'high',
    typicalSchedule: '24/7 rotating shifts',
    careerProgression: ['Senior Facilities Tech', 'Facilities Engineer', 'Facilities Manager'],
    marketDemand: 'high',
    trainingDuration: { min: 12, max: 18 },
    certificationPaths: ['Electrical certifications', 'HVAC certifications', 'Facilities management']
  },

  'bms_controls_technician': {
    role: 'bms_controls_technician',
    title: 'BMS Controls Technician',
    description: 'Building management systems specialist programming and optimizing automated facility control systems for maximum efficiency.',
    baseSalaryRange: { min: 75000, max: 110000 },
    category: 'facilities',
    requiredSkills: ['BMS programming', 'Control systems', 'Sensors & instrumentation', 'Energy optimization'],
    optionalSkills: ['PLC programming', 'SCADA systems', 'IoT integration'],
    physicalDemands: 'medium',
    typicalSchedule: 'Business hours + on-call',
    careerProgression: ['Senior Controls Tech', 'Controls Engineer', 'Automation Manager'],
    marketDemand: 'medium',
    trainingDuration: { min: 14, max: 20 },
    certificationPaths: ['Building automation certifications', 'Control systems certifications']
  },

  'data_center_security_specialist': {
    role: 'data_center_security_specialist',
    title: 'Data Center Security Specialist',
    description: 'Physical and cybersecurity specialist managing access controls, surveillance systems, and security protocols for mission-critical facilities.',
    baseSalaryRange: { min: 80000, max: 115000 },
    category: 'security',
    requiredSkills: ['Physical security systems', 'Access control', 'Surveillance technology', 'Security protocols'],
    optionalSkills: ['Cybersecurity', 'Risk assessment', 'Compliance frameworks'],
    physicalDemands: 'medium',
    typicalSchedule: '24/7 rotating shifts',
    careerProgression: ['Senior Security Specialist', 'Security Manager', 'Chief Security Officer'],
    marketDemand: 'medium',
    trainingDuration: { min: 10, max: 16 },
    certificationPaths: ['CompTIA Security+', 'Physical security certifications', 'CISSP']
  },

  'capacity_planning_analyst': {
    role: 'capacity_planning_analyst',
    title: 'Capacity Planning Analyst',
    description: 'Data center growth and optimization specialist analyzing utilization patterns, forecasting needs, and optimizing resource allocation.',
    baseSalaryRange: { min: 85000, max: 120000 },
    category: 'analytics',
    requiredSkills: ['Data analysis', 'Capacity modeling', 'Performance monitoring', 'Reporting'],
    optionalSkills: ['Machine learning', 'Business intelligence', 'Financial modeling'],
    physicalDemands: 'low',
    typicalSchedule: 'Business hours',
    careerProgression: ['Senior Analyst', 'Capacity Planning Manager', 'Operations Director'],
    marketDemand: 'medium',
    trainingDuration: { min: 16, max: 24 },
    certificationPaths: ['Data analysis certifications', 'Business intelligence tools', 'Project management']
  }
};