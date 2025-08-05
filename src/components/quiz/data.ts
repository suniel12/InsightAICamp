import { Question, RoleRecommendation } from './types';

// Question Flow Data Structure
export const QUESTION_FLOW: Record<string, Question> = {
  'q1': {
    id: 'q1',
    type: 'linear',
    text: 'Which of these best describes your current career situation?',
    options: [
      {
        id: 'recent_graduate',
        text: 'Recent Graduate',
        description: 'I have recently completed a degree or certificate program and am looking for my first major career role.',
        nextQuestionId: 'q2'
      },
      {
        id: 'it_professional',
        text: 'IT Professional', 
        description: 'I have experience in a role like help desk, network support, or system administration and I\'m looking to specialize or advance.',
        nextQuestionId: 'q2'
      },
      {
        id: 'skilled_trades',
        text: 'Skilled Trades Professional',
        description: 'I have hands-on experience in a field like electrical, HVAC, mechanical, or as a general technician.',
        nextQuestionId: 'q2'
      },
      {
        id: 'military_veteran',
        text: 'Military/Veteran',
        description: 'I am transitioning from or have prior military service and am looking to apply my skills in a new field.',
        nextQuestionId: 'q2'
      },
      {
        id: 'career_changer',
        text: 'Career Changer',
        description: 'I\'m from a non-technical field (e.g., retail, hospitality, etc.) and am looking for a stable, high-growth career in tech.',
        nextQuestionId: 'q2'
      }
    ]
  },
  
  'q2': {
    id: 'q2',
    type: 'linear',
    text: 'How would you rate your current hands-on technical comfort level?',
    options: [
      {
        id: 'beginner',
        text: 'Beginner',
        description: 'I\'m new to hands-on technical work but I\'m a fast learner and eager to start.',
        nextQuestionId: 'q3'
      },
      {
        id: 'hobbyist',
        text: 'Hobbyist/Enthusiast',
        description: 'I\'m comfortable with basic technical tasks like building a PC, setting up a home network, or doing my own home/auto repairs.',
        nextQuestionId: 'q3'
      },
      {
        id: 'professional',
        text: 'Professional',
        description: 'I have professional experience where I regularly use technical skills, tools, or follow complex procedures.',
        nextQuestionId: 'q3'
      },
      {
        id: 'expert',
        text: 'Expert',
        description: 'I am highly proficient with complex systems, scripting, or professional-grade diagnostic tools in my current field.',
        nextQuestionId: 'q3'
      }
    ]
  },
  
  'q3': {
    id: 'q3',
    type: 'branching',
    text: 'Imagine a massive AI data center. Which of its two core components sparks more of your curiosity?',
    options: [
      {
        id: 'servers_network',
        text: 'The Servers & Network (The "Brains")',
        description: 'The thousands of powerful computers and the high-speed network that allows them to communicate.',
        nextQuestionId: 'q4_it'
      },
      {
        id: 'power_cooling',
        text: 'The Power & Cooling (The "Heart & Lungs")',
        description: 'The massive electrical systems, backup generators, and industrial cooling infrastructure that supports the computers.',
        nextQuestionId: 'q4_facilities'
      }
    ]
  },
  
  'q4_it': {
    id: 'q4_it',
    type: 'branching',
    text: 'A single, critical server goes offline. What is your first instinct to solve the problem?',
    options: [
      {
        id: 'hardware_focus',
        text: 'Physical Hardware Approach',
        description: 'Physically go to the server, open it up, and diagnose the hardware (e.g., check power supplies, RAM, storage drives).',
        nextQuestionId: 'q5_hardware'
      },
      {
        id: 'software_focus',
        text: 'Remote Software Approach', 
        description: 'Remotely connect to the server\'s command line to check system logs, running processes, and OS-level errors.',
        nextQuestionId: 'q5_software'
      }
    ]
  },
  
  'q4_facilities': {
    id: 'q4_facilities',
    type: 'branching',
    text: 'A section of the data center is overheating. What aspect of the problem is more interesting to investigate?',
    options: [
      {
        id: 'mechanical_electrical',
        text: 'Physical Machinery',
        description: 'The physical machinery itself: the chillers, pumps, and air handlers that are moving the cooling.',
        nextQuestionId: 'q5_mechanical'
      },
      {
        id: 'controls_focus',
        text: 'Automated Control System',
        description: 'The automated control system: the sensors, logic, and software that decided how to respond to the temperature change.',
        nextQuestionId: 'q5_controls'
      }
    ]
  },
  
  'q5_hardware': {
    id: 'q5_hardware',
    type: 'linear',
    text: 'Which task sounds more satisfying to you?',
    options: [
      {
        id: 'rack_installation',
        text: 'Precision Installation',
        description: 'Perfectly installing and cabling a new server rack, ensuring every component is physically secure and organized.'
      },
      {
        id: 'troubleshooting',
        text: 'Expert Troubleshooting',
        description: 'Being the go-to person who can quickly troubleshoot and replace any failed hardware component to get a system back online.'
      }
    ]
  },
  
  'q5_software': {
    id: 'q5_software',
    type: 'linear',
    text: 'You need to update the software on 1,000 servers. What\'s the best approach?',
    options: [
      {
        id: 'automation_scripting',
        text: 'Automation & Scripting',
        description: 'Write and deploy a single script that automates the update across all 1,000 servers simultaneously.'
      },
      {
        id: 'fleet_management',
        text: 'Fleet Management Systems',
        description: 'Develop a system that can reliably manage and monitor the health of the entire 1,000-server fleet to prevent future issues.'
      }
    ]
  },
  
  'q5_mechanical': {
    id: 'q5_mechanical',
    type: 'linear',
    text: 'Which of these high-stakes tasks sounds more engaging?',
    options: [
      {
        id: 'preventive_maintenance',
        text: 'Preventive Maintenance',
        description: 'Performing preventative maintenance on a massive diesel generator to ensure it\'s ready for a power outage.'
      },
      {
        id: 'emergency_response',
        text: 'Emergency Response',
        description: 'Responding to an alert to troubleshoot a fault in a high-voltage switchgear that distributes power to the entire facility.'
      }
    ]
  },
  
  'q5_controls': {
    id: 'q5_controls',
    type: 'linear',
    text: 'You are most comfortable working with:',
    options: [
      {
        id: 'plc_programming',
        text: 'PLC Programming',
        description: 'Flowcharts, logic diagrams, and programming interfaces for industrial controllers (PLCs).'
      },
      {
        id: 'data_analytics',
        text: 'Data Analytics & Optimization',
        description: 'Analyzing data from thousands of sensors to write rules that make a building run more efficiently and safely.'
      }
    ]
  }
};

// Role Determination Business Logic
export const ROLE_RECOMMENDATIONS: Record<string, RoleRecommendation> = {
  'data_center_technician': {
    role: 'data_center_technician',
    title: 'Data Center Technician (DCOps)',
    description: 'Front-line IT hardware management specialist responsible for server maintenance, installations, and troubleshooting.',
    salaryRange: { min: 75000, max: 110000 },
    programDuration: '16 weeks',
    confidenceScore: 0.85,
    reasoning: '',
    personalizedInsights: [
      'Perfect for hands-on problem solvers who enjoy working with hardware',
      'High demand role with excellent job security',
      'Clear career progression to senior technical roles'
    ]
  },
  'production_operations_engineer': {
    role: 'production_operations_engineer',
    title: 'Production Operations Engineer (ProdOps)',
    description: 'IT automation specialist managing server fleets at scale through scripting and system administration.',
    salaryRange: { min: 95000, max: 140000 },
    programDuration: '16 weeks', 
    confidenceScore: 0.90,
    reasoning: '',
    personalizedInsights: [
      'Ideal for those who love automation and efficiency',
      'High-growth field with excellent earning potential',
      'Combines technical skills with strategic thinking'
    ]
  },
  'critical_facilities_engineer': {
    role: 'critical_facilities_engineer',
    title: 'Critical Facilities Engineer (CFE)',
    description: 'Guardian of the physical plant managing power, cooling, and safety systems in mission-critical facilities.',
    salaryRange: { min: 85000, max: 130000 },
    programDuration: '16 weeks',
    confidenceScore: 0.85,
    reasoning: '',
    personalizedInsights: [
      'Perfect for those fascinated by large-scale mechanical systems',
      'Mission-critical role with high responsibility and respect',
      'Excellent for candidates with electrical or mechanical backgrounds'
    ]
  },
  'bms_controls_engineer': {
    role: 'bms_controls_engineer',
    title: 'BMS Controls Engineer', 
    description: 'Automation specialist for building management systems, programming and optimizing facility control systems.',
    salaryRange: { min: 90000, max: 135000 },
    programDuration: '16 weeks',
    confidenceScore: 0.88,
    reasoning: '',
    personalizedInsights: [
      'Ideal for analytical minds who enjoy programming and optimization',
      'Growing field as facilities become more automated', 
      'Combines engineering principles with modern technology'
    ]
  }
};