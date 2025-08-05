# Gigawatt Academy Quiz Flow & Business Logic v2.0

## Overview
The Gigawatt Academy quiz is an adaptive two-tier assessment system designed to recommend optimal data center career paths. The system starts with a quick 30-60 second assessment (5 questions) and offers an optional detailed 5-minute assessment (15-20 additional questions) for users seeking more personalized recommendations.

## Assessment Structure

### Tier 1: Quick Assessment (30-60 seconds)
- **Total Questions**: 5 core questions
- **Purpose**: Rapid career path identification
- **Output**: 3 recommended paths (fastest, highest salary, best fit)

### Tier 2: Detailed Assessment (5 minutes)
- **Total Questions**: 15-20 additional questions
- **Purpose**: Refined recommendations with higher confidence
- **Output**: Comprehensive career roadmap with personalized insights

## Quick Assessment Flow (Tier 1)

### Question 1: Career Background (Linear → q2)
**Text**: "Which best describes your current career situation?"

**Options**:
- `recent_graduate`: Recent Graduate - Recently completed degree/certificate, seeking first major career role
- `it_professional`: IT Professional - Experience in help desk, network support, or system administration
- `skilled_trades`: Skilled Trades Professional - Hands-on experience in electrical, HVAC, mechanical work
- `military_veteran`: Military/Veteran - Transitioning from or have prior military service
- `tech_adjacent`: Tech-Adjacent Professional - Work with technology but not core IT (data entry, tech sales, digital marketing)
- `career_changer`: Career Changer - From non-technical field (retail, hospitality, customer service) seeking stable tech career

### Question 2: Primary Career Motivation (Linear → q3)
**Text**: "What's your #1 priority in choosing a new career path?"

**Options**:
- `stability`: Job Security First - Stable employment with good benefits and long-term prospects
- `quick_entry`: Speed to Employment - Start working and earning as soon as possible
- `high_salary`: Maximum Earnings - Optimize for highest possible salary, even if it takes longer
- `growth_potential`: Career Growth - Clear advancement path and skill development opportunities
- `work_life`: Work-Life Balance - Predictable hours and flexibility

### Question 3: Core Technology Interest (Branching)
**Text**: "In a massive AI data center, which aspect fascinates you more?"

**Options**:
- `digital_systems`: Digital Infrastructure → **Routes to q4_it**
  - Description: The servers, networks, and software that process billions of calculations per second
- `physical_systems`: Physical Infrastructure → **Routes to q4_facilities**
  - Description: The power systems, cooling towers, and mechanical equipment keeping everything running

### Question 4A: IT Problem-Solving Style (Branching)
**Text**: "A critical system alert appears at 2 AM. What's your first instinct?"

**Options**:
- `hands_on_fix`: Get Hands-On → **Routes to q5_hardware**
  - Description: Head to the data center floor to physically inspect and fix the issue
- `remote_diagnosis`: Diagnose Remotely → **Routes to q5_software**
  - Description: Pull up monitoring dashboards and logs to troubleshoot from anywhere

### Question 4B: Facilities Problem-Solving Style (Branching)
**Text**: "The data center temperature is rising. What interests you more?"

**Options**:
- `mechanical_fix`: Mechanical Systems → **Routes to q5_mechanical**
  - Description: Investigating pumps, compressors, and cooling equipment
- `system_optimization`: System Controls → **Routes to q5_controls**
  - Description: Analyzing sensor data and adjusting automated control systems

### Question 5A1: Hardware Preference (Terminal)
**Text**: "Which type of work energizes you most?"

**Options**:
- `building`: Building & Installing - Setting up new equipment and perfect cable management
- `fixing`: Troubleshooting & Repair - Being the hero who fixes critical failures fast
- `optimizing`: Performance Tuning - Making systems run at peak efficiency

### Question 5A2: Software Preference (Terminal)
**Text**: "You need to manage 10,000 servers. Your approach?"

**Options**:
- `automation`: Automation Scripts - Write code to manage everything automatically
- `orchestration`: Orchestration Platforms - Use advanced tools like Kubernetes
- `monitoring`: Monitoring & Analytics - Build dashboards to predict and prevent issues

### Question 5B1: Mechanical Preference (Terminal)
**Text**: "What type of critical system work appeals to you?"

**Options**:
- `power_systems`: Power Systems - Working with generators, UPS, electrical distribution
- `cooling_systems`: Cooling Systems - Managing HVAC, chillers, cooling towers
- `integrated_systems`: Integrated Systems - Coordinating all mechanical systems together

### Question 5B2: Controls Preference (Terminal)
**Text**: "Your ideal work involves:"

**Options**:
- `programming_controls`: Programming Logic - Creating control sequences and automation
- `optimizing_efficiency`: Efficiency Analysis - Using data to reduce energy consumption
- `system_integration`: System Integration - Connecting building systems with IT systems

## Progressive Disclosure Decision Point

After completing the quick assessment, users see:

**Text**: "Based on your responses, we've identified 3 career paths for you. Would you like to:"

**Options**:
- `view_quick`: View My Results Now (30 seconds) - See your top 3 recommended career paths
- `detailed_assessment`: Take Detailed Assessment (5 minutes) - Get more personalized recommendations with higher confidence
- `compare_all`: Compare All Options - See how different priorities affect your career options

## Detailed Assessment Flow (Tier 2)

### DA1: Current Technical Skills Assessment
**Text**: "Rate your current experience level with these technologies:"

**Format**: Grid selection (None / Basic / Intermediate / Advanced)
- Operating Systems (Windows Server, Linux)
- Networking (TCP/IP, VLANs, routing)
- Virtualization (VMware, Hyper-V, containers)
- Cloud Platforms (AWS, Azure, Google Cloud)
- Scripting (Python, PowerShell, Bash)
- Hardware (Server components, storage systems)
- Databases (SQL, NoSQL basics)
- Monitoring Tools (Nagios, Zabbix, Grafana)

### DA2: Work Environment Preference
**Text**: "Which work environment appeals to you most?"

**Options**:
- `24x7_ops`: 24/7 Operations Center - Rotating shifts in a mission-critical environment
- `business_hours`: Regular Hours + On-Call - Standard schedule with occasional emergencies
- `remote_hybrid`: Remote/Hybrid - Mix of remote monitoring and on-site work
- `field_service`: Field Service - Travel to different data center locations
- `project_based`: Project-Based - Focus on installations and upgrades

### DA3: Learning Style
**Text**: "How do you prefer to learn new technical skills?"

**Options**:
- `self_paced`: Self-Paced Online - Learn independently with video courses and labs
- `bootcamp`: Intensive Bootcamp - Full-time immersive programs
- `apprenticeship`: Apprenticeship - Learn while working alongside experts
- `classroom`: Traditional Classroom - Structured instructor-led training
- `mixed`: Mixed Approach - Combination of methods

### DA4: Career Timeline
**Text**: "When do you need to start your new career?"

**Options**:
- `asap`: ASAP - Need income within 3 months
- `6_months`: 6 Months - Have time for comprehensive training
- `1_year`: Within a Year - Can invest in deeper skills
- `exploring`: Just Exploring - Researching options

### DA5: Geographic Flexibility
**Text**: "Are you willing to relocate for the right opportunity?"

**Options**:
- `anywhere`: Yes, Anywhere - Open to any location
- `region`: Within Region - Same geographic region only
- `commute`: Commutable - Within daily driving distance
- `remote_only`: Remote Only - Prefer remote positions
- `no_relocation`: No Relocation - Must be in current city

### DA6: Certification Readiness
**Text**: "Have you earned any of these certifications?"

**Format**: Multi-select checkboxes
- CompTIA A+
- CompTIA Network+
- CompTIA Security+
- CompTIA Server+
- Any Cisco certification
- Any cloud certification (AWS/Azure/GCP)
- Any Microsoft certification
- Other IT certification

### DA7: Physical Demands Comfort
**Text**: "How comfortable are you with physical aspects of data center work?"

**Options**:
- `very_comfortable`: Very Comfortable - Enjoy physical work and don't mind loud environments
- `comfortable`: Comfortable - Can handle it as part of the job
- `neutral`: Neutral - Prefer minimal but can adapt
- `prefer_minimal`: Prefer Minimal - Rather work at a desk
- `avoid`: Want to Avoid - Strictly remote/desk work only

### DA8: Team vs Independent Work
**Text**: "What's your ideal work style?"

**Options**:
- `highly_collaborative`: Highly Collaborative - Constant teamwork and communication
- `team_regular`: Regular Team Interaction - Daily collaboration with independent work
- `mostly_independent`: Mostly Independent - Occasional team coordination
- `fully_independent`: Fully Independent - Minimal interaction, solo projects

### DA9: Problem-Solving Preference
**Text**: "When facing a technical problem, you prefer to:"

**Options**:
- `systematic`: Follow Systematic Procedures - Use checklists and documented processes
- `analytical`: Analyze Root Causes - Deep dive into why problems occur
- `creative`: Find Creative Solutions - Think outside the box
- `collaborative`: Collaborate on Solutions - Brainstorm with team
- `quick_fix`: Quick Fixes First - Get systems running, then investigate

### DA10: Salary Expectations
**Text**: "What are your minimum salary requirements?"

**Options**:
- `entry_level`: Entry Level ($45-60k) - Focus on getting started
- `moderate`: Moderate ($60-80k) - Balance of pay and opportunity
- `competitive`: Competitive ($80-100k) - Seeking strong compensation
- `premium`: Premium ($100k+) - Only considering high-paying roles

### DA11: Industry Interest
**Text**: "Which type of data center interests you most?"

**Options**:
- `hyperscale`: Hyperscale Cloud - Amazon, Google, Microsoft facilities
- `colocation`: Colocation - Multi-tenant data centers
- `enterprise`: Enterprise - Corporate private data centers
- `edge`: Edge Computing - Smaller distributed facilities
- `specialty`: Specialty - AI/ML, cryptocurrency, or HPC focused

### DA12: Specific Technical Interests
**Text**: "Select all technical areas that genuinely interest you:"

**Format**: Multi-select checkboxes
- Network architecture and routing
- Server hardware and components
- Linux system administration
- Windows system administration
- Storage systems (SAN/NAS)
- Virtualization and containers
- Cloud infrastructure
- Security and compliance
- Automation and scripting
- Database management
- Monitoring and observability
- Power and electrical systems
- HVAC and cooling systems
- Building automation systems

### DA13: Advancement Goals
**Text**: "Where do you see yourself in 5 years?"

**Options**:
- `technical_expert`: Technical Expert - Deep expertise in specific technology
- `team_lead`: Team Lead - Managing small technical teams
- `management`: Management - Running data center operations
- `architect`: Architect - Designing data center solutions
- `entrepreneur`: Entrepreneur - Starting own business
- `flexible`: Flexible - Open to various paths

### DA14: Work Shift Preference
**Text**: "What's your preferred work schedule?"

**Options**:
- `day_shift`: Day Shift Only - Traditional 9-5 schedule
- `any_shift`: Any Shift - Flexible for right opportunity
- `night_preferred`: Night Shift Preferred - Enjoy overnight work
- `rotating`: Rotating Shifts - Variety is good
- `compressed`: Compressed Week - Longer days, more days off

### DA15: Stress Management
**Text**: "How do you handle high-pressure situations?"

**Options**:
- `thrive`: Thrive Under Pressure - Perform best in critical moments
- `manage_well`: Manage Well - Stay calm and focused
- `prefer_steady`: Prefer Steady - Like predictable environments
- `learning`: Still Learning - Building stress management skills

## Multi-Path Career Recommendations

Based on quiz responses, the system generates three distinct career paths:

### 1. Fastest Path to Employment
**Optimization**: Minimum time to first paycheck
**Factors**: 
- Shortest training requirements
- High demand/low competition roles
- Entry-level positions available
- Minimal prerequisites

### 2. Highest Salary Potential
**Optimization**: Maximum earning potential
**Factors**:
- Premium skill requirements
- Specialized certifications
- High-demand expertise areas
- Clear advancement trajectory

### 3. Best Personal Fit
**Optimization**: Alignment with interests and strengths
**Factors**:
- Interest alignment score
- Background compatibility
- Work style preferences
- Long-term satisfaction predictors

## Recommendation Algorithm

### Primary Roles Pool
1. **Data Center Technician** - Entry IT hardware role
2. **Network Operations Technician** - Network-focused operations
3. **Cloud Operations Engineer** - Cloud infrastructure management
4. **Site Reliability Engineer** - System reliability and automation
5. **Critical Facilities Technician** - Mechanical/electrical systems
6. **BMS Controls Technician** - Building automation systems
7. **Data Center Security Specialist** - Physical and cyber security
8. **Capacity Planning Analyst** - Growth and optimization planning

### Scoring Factors

**Speed to Employment Score**:
- Current background relevance (0-40 points)
- Required training hours (0-30 points)
- Market demand (0-30 points)

**Salary Potential Score**:
- Base salary range (0-40 points)
- Growth trajectory (0-30 points)
- Market premium for skills (0-30 points)

**Fit Score**:
- Interest alignment (0-35 points)
- Work style match (0-25 points)
- Values alignment (0-20 points)
- Physical/environmental match (0-20 points)

### Confidence Calculation

**Base Confidence**: 70%

**Adjustments**:
- Detailed assessment completed: +15%
- Relevant background: +10%
- Clear preferences expressed: +5%
- Conflicting responses: -10%
- Limited technical experience: -5%

**Final Range**: 55% - 95%

## Output Format

### Quick Assessment Results
```
Based on your background as a [background] with interest in [core_area], 
here are your top 3 data center career paths:

1. FASTEST PATH (8-12 weeks)
   Role: [Role Name]
   Starting Salary: $[X]k-$[Y]k
   First Certification: [Cert Name]
   Why: [Reason based on market demand]

2. HIGHEST SALARY (16-24 weeks)
   Role: [Role Name]
   Starting Salary: $[X]k-$[Y]k
   Required Training: [Key certifications]
   Why: [Reason based on premium skills]

3. BEST FIT FOR YOU (12-16 weeks)
   Role: [Role Name]
   Starting Salary: $[X]k-$[Y]k
   Confidence: [X]%
   Why: [Personalized reasoning based on responses]

[Take Detailed Assessment] [Apply Now] [Download Career Guide]
```

### Detailed Assessment Results
Includes everything above plus:
- Detailed skills gap analysis
- Personalized learning path with timeline
- Specific certification roadmap
- Company recommendations
- Geographic opportunities
- Peer success stories
- Next steps checklist

## Technical Notes

- All paths assume full-time training commitment
- Salary ranges based on national averages, adjusted by location
- Confidence scores use Bayesian inference from response patterns
- Role recommendations updated quarterly based on market data
- Question adaptive logic reduces redundant questions in detailed assessment