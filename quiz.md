# Gigawatt Academy Quiz Flow & Business Logic

## Overview
The Gigawatt Academy quiz is a dynamic 5-question assessment system designed to recommend optimal data center career paths based on candidate backgrounds, technical comfort levels, and interests. The quiz uses deterministic business logic (no LLM integration) to provide personalized role recommendations with salary adjustments.

## Quiz Flow Architecture

### Question Structure
- **Total Questions**: 5 (q1-q5)
- **Flow Type**: Branching logic with conditional paths
- **Question Types**: Linear (all proceed to same next question) and Branching (different paths based on answers)

### Complete Question Flow

#### Question 1: Career Background (Linear → q2)
**Text**: "Which of these best describes your current career situation?"

**Options**:
- `recent_graduate`: Recent Graduate - Recently completed degree/certificate, seeking first major career role
- `it_professional`: IT Professional - Experience in help desk, network support, or system administration
- `skilled_trades`: Skilled Trades Professional - Hands-on experience in electrical, HVAC, mechanical, or general technician work
- `military_veteran`: Military/Veteran - Transitioning from or have prior military service
- `career_changer`: Career Changer - From non-technical field (retail, hospitality) seeking stable tech career

#### Question 2: Technical Comfort Level (Linear → q3)
**Text**: "How would you rate your current hands-on technical comfort level?"

**Options**:
- `beginner`: Beginner - New to technical work but fast learner and eager
- `hobbyist`: Hobbyist/Enthusiast - Comfortable with PC building, home networking, basic repairs
- `professional`: Professional - Regular use of technical skills, tools, or complex procedures
- `expert`: Expert - Highly proficient with complex systems, scripting, diagnostic tools

#### Question 3: Core Interest Area (Branching)
**Text**: "Imagine a massive AI data center. Which of its two core components sparks more of your curiosity?"

**Options**:
- `servers_network`: The Servers & Network (The "Brains") → **Routes to q4_it**
  - Description: Thousands of powerful computers and high-speed network communication
- `power_cooling`: The Power & Cooling (The "Heart & Lungs") → **Routes to q4_facilities**  
  - Description: Massive electrical systems, backup generators, industrial cooling infrastructure

### Branching Path A: IT Track (from servers_network)

#### Question 4A: IT Problem-Solving Approach (Branching)
**Text**: "A single, critical server goes offline. What is your first instinct to solve the problem?"

**Options**:
- `hardware_focus`: Physical Hardware Approach → **Routes to q5_hardware**
  - Description: Physically examine server, diagnose hardware (power supplies, RAM, storage)
- `software_focus`: Remote Software Approach → **Routes to q5_software**
  - Description: Remote command line access to check logs, processes, OS-level errors

#### Question 5A1: Hardware Specialization (Terminal)
**Text**: "Which task sounds more satisfying to you?"

**Options**:
- `rack_installation`: Precision Installation - Perfect server rack installation and cabling
- `troubleshooting`: Expert Troubleshooting - Go-to person for quick hardware failure resolution

#### Question 5A2: Software Specialization (Terminal)  
**Text**: "You need to update the software on 1,000 servers. What's the best approach?"

**Options**:
- `automation_scripting`: Automation & Scripting - Single script for simultaneous updates
- `fleet_management`: Fleet Management Systems - Develop system for 1,000-server fleet health monitoring

### Branching Path B: Facilities Track (from power_cooling)

#### Question 4B: Facilities Problem-Solving Approach (Branching)
**Text**: "A section of the data center is overheating. What aspect of the problem is more interesting to investigate?"

**Options**:
- `mechanical_electrical`: Physical Machinery → **Routes to q5_mechanical**
  - Description: Physical machinery - chillers, pumps, air handlers moving cooling
- `controls_focus`: Automated Control System → **Routes to q5_controls**
  - Description: Automated controls - sensors, logic, software responding to temperature changes

#### Question 5B1: Mechanical Specialization (Terminal)
**Text**: "Which of these high-stakes tasks sounds more engaging?"

**Options**:
- `preventive_maintenance`: Preventive Maintenance - Massive diesel generator maintenance for power outage readiness
- `emergency_response`: Emergency Response - High-voltage switchgear fault troubleshooting

#### Question 5B2: Controls Specialization (Terminal)
**Text**: "You are most comfortable working with:"

**Options**:
- `plc_programming`: PLC Programming - Flowcharts, logic diagrams, industrial controller programming
- `data_analytics`: Data Analytics & Optimization - Sensor data analysis for building efficiency rules

## Role Determination Business Logic

### Primary Decision Tree
```
Q3 Answer → Q4 Answer → Recommended Role
├─ servers_network (IT Track)
│  ├─ hardware_focus → Data Center Technician (DCOps)
│  └─ software_focus → Production Operations Engineer (ProdOps)
└─ power_cooling (Facilities Track)
   ├─ mechanical_electrical → Critical Facilities Engineer (CFE)
   └─ controls_focus → BMS Controls Engineer
```

### Role Recommendations

#### 1. Data Center Technician (DCOps)
- **Path**: servers_network → hardware_focus
- **Base Salary**: $75,000 - $110,000
- **Program Duration**: 16 weeks
- **Description**: Front-line IT hardware management specialist for server maintenance, installations, troubleshooting
- **Key Insights**: Perfect for hands-on problem solvers, high job security, clear career progression

#### 2. Production Operations Engineer (ProdOps)
- **Path**: servers_network → software_focus  
- **Base Salary**: $95,000 - $140,000
- **Program Duration**: 16 weeks
- **Description**: IT automation specialist managing server fleets through scripting and system administration
- **Key Insights**: Ideal for automation lovers, high-growth field, combines technical and strategic thinking

#### 3. Critical Facilities Engineer (CFE)
- **Path**: power_cooling → mechanical_electrical
- **Base Salary**: $85,000 - $130,000
- **Program Duration**: 16 weeks  
- **Description**: Guardian of physical plant managing power, cooling, safety systems in mission-critical facilities
- **Key Insights**: Perfect for large-scale mechanical fascination, mission-critical responsibility, excellent for electrical/mechanical backgrounds

#### 4. BMS Controls Engineer
- **Path**: power_cooling → controls_focus
- **Base Salary**: $90,000 - $135,000
- **Program Duration**: 16 weeks
- **Description**: Automation specialist for building management systems, programming and optimizing facility controls
- **Key Insights**: Ideal for analytical programming minds, growing automation field, combines engineering with modern technology

## Salary Adjustment Algorithm

### Background Multipliers
- `it_professional`: +15% (highest adjustment)
- `skilled_trades`: +10%
- `military_veteran`: +10%
- `recent_graduate`: -5% (entry-level adjustment)
- `career_changer`: No adjustment (1.0x)

### Technical Level Multipliers
- `expert`: +10%
- `professional`: +5%
- `hobbyist`: No adjustment (1.0x)
- `beginner`: -5%

### Calculation Method
```typescript
finalSalary = baseSalary × (backgroundMultiplier + techLevelMultiplier)
```

**Example**: IT Professional + Expert level applying for ProdOps
- Base: $95,000 - $140,000
- Multiplier: 1.0 + 0.15 + 0.10 = 1.25
- Final: $118,750 - $175,000

## Confidence Scoring

### Base Confidence: 75%

### Adjustments
- **Background Boost**: +15% for `it_professional`, `skilled_trades`, `military_veteran`
- **Technical Boost**: +10% for `professional`, `expert` levels
- **Range Constraints**: Final score clamped between 65% - 95%

### Typical Confidence Ranges
- **High Confidence** (85-95%): IT Professional + Professional/Expert level
- **Medium Confidence** (75-84%): Skilled trades or military with good technical level
- **Lower Confidence** (65-74%): Recent graduates or career changers with beginner level

## Personalized Reasoning Generation

The system generates custom reasoning by combining:

### Background-Based Reasoning
- `it_professional`: "Your IT background gives you a strong foundation in technology systems"
- `skilled_trades`: "Your hands-on technical experience translates perfectly to data center operations"
- `military_veteran`: "Your military experience in mission-critical operations aligns perfectly with data center environments"
- `recent_graduate`: "Your fresh technical knowledge combined with eagerness to learn makes you an excellent candidate"
- `career_changer`: "Your diverse background brings valuable perspective to technical roles"

### Track-Based Reasoning
- `servers_network`: "Your interest in servers and networking indicates strong aptitude for IT infrastructure roles"
- `power_cooling`: "Your fascination with power and cooling systems shows natural alignment with facilities engineering"

### Final Reasoning Format
```
"{background_reasoning}. {track_reasoning}."
```

## Integration with Application System

### Quiz-to-Application Flow
1. User completes 5-question quiz
2. Business logic determines recommended role with personalized salary range
3. Quiz results passed to `StreamlinedApplicationForm.tsx` as `recommendedRole` prop
4. Application form displays recommended track in Step 3
5. Background type from Q1 stored in `applications.background_type` field

### Application Form Integration
- **3-Step Process**: Personal Info → Resume/Essays → Background Selection
- **Anonymous Submission**: No authentication required initially
- **Post-Submission**: Optional account creation to track application status
- **Private Resume Storage**: Secure Supabase storage with admin-only access
- **Database Fields**: All quiz insights stored in comprehensive ATS schema

## Technical Implementation

### File Structure
- `src/components/quiz/data.ts`: Question definitions and role data
- `src/components/quiz/logic.ts`: Business logic algorithms
- `src/components/quiz/types.ts`: TypeScript interfaces
- `src/components/forms/StreamlinedApplicationForm.tsx`: Application integration

### Key Features
- **Deterministic Logic**: No API calls, pure business rules
- **TypeScript Safety**: Strong typing throughout
- **Responsive Design**: Mobile-optimized UI
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Comprehensive validation and user feedback
- **Performance**: Optimized rendering with React best practices

This quiz system successfully guides candidates through a personalized assessment journey, resulting in accurate role recommendations that integrate seamlessly with the application and admissions process.