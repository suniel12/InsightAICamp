# Gigawatt Academy Assessment Business Logic - High Level Summary

## Overview
The system recommends **2 career paths** based on user responses: **Fastest Path** and **Highest Salary**. Each recommendation uses different scoring algorithms to optimize for speed vs. salary.

## Scoring System (0-100 points each)

### 1. Speed to Employment Score
**Purpose**: Find roles that get users employed fastest

**Scoring Factors**:
- **Training Duration** (40 points max): Shorter training = higher score
  - 8 weeks = 40 points, 28 weeks = 0 points
- **Background Relevance** (30 points max):
  - IT Professional: 30 points
  - Skilled Trades: 25 points  
  - Military Veteran: 20 points
  - Tech Adjacent: 15 points
  - Recent Graduate: 10 points
  - Career Changer: 5 points
- **Market Demand** (30 points max):
  - High demand: 30 points
  - Medium demand: 20 points
  - Low demand: 10 points

**Additional Bonuses**:
- If motivation = "quick_entry": +10 points
- If motivation = "stability" AND role has high demand: +5 points

### 2. Salary Potential Score  
**Purpose**: Find roles with highest earning potential

**Scoring Factors**:
- **Base Salary** (95 points max): Higher average salary = more points
  - $45k average = 0 points, $140k average = 95 points
- **Background Salary Multiplier**:
  - IT Professional: +15% salary boost
  - Skilled Trades: +10% salary boost
  - Military Veteran: +10% salary boost
  - Tech Adjacent: +5% salary boost
  - Recent Graduate: -5% salary penalty
  - Career Changer: No change
- **Career Growth** (25 points max): More advancement levels = higher score
- **Market Premium** (10 points max): High demand roles get bonus

**Additional Bonuses**:
- If motivation = "high_salary": +15 points
- If motivation = "growth_potential": +10 points

## Role Selection Logic

### Available Roles (8 total):
1. **Data Center Technician** - $65k-$95k, 8-12 weeks, High demand
2. **Network Operations Technician** - $70k-$100k, 12-16 weeks, High demand  
3. **Cloud Operations Engineer** - $85k-$125k, 16-24 weeks, High demand
4. **Site Reliability Engineer** - $95k-$140k, 20-28 weeks, High demand
5. **Critical Facilities Technician** - $70k-$105k, 12-18 weeks, High demand
6. **BMS Controls Technician** - $75k-$110k, 14-20 weeks, Medium demand
7. **Data Center Security Specialist** - $80k-$115k, 10-16 weeks, Medium demand
8. **Capacity Planning Analyst** - $85k-$120k, 16-24 weeks, Medium demand

### Selection Process:
1. **Calculate scores** for all 8 roles using both algorithms
2. **Fastest Path**: Role with highest Speed score
3. **Highest Salary**: Role with highest Salary score

## Quick vs Detailed Assessment

### Quick Assessment (5 questions):
- **Base confidence**: 70%
- **Adjustments**:
  - Relevant background (IT/Trades/Military): +10%
  - Clear preferences: +5%
  - **Final range**: 75-85%

### Detailed Assessment (15 additional questions):
- **Base confidence**: 70%
- **Adjustments**:
  - Detailed assessment completed: +15%
  - Relevant background: +10%  
  - Clear preferences: +5%
  - **Final range**: 85-95%

## Key Business Logic Questions

### Does This Make Sense?

**Potential Issues**:
1. **Role Overlap**: Some roles might always score higher (e.g., Cloud Ops Engineer might always win "Highest Salary")
2. **Background Bias**: IT Professionals get significant advantages in both speed and salary
3. **Market Demand**: All high-paying roles also have high demand, so they might dominate both categories
4. **Training Duration**: Shorter training might not correlate with market reality

**Questions for Review**:
1. **Should Background affect Salary scores?** IT Professionals already get salary multipliers - should they also get scoring bonuses?
2. **Are the point allocations realistic?** Is 40 points for training duration vs 30 for market demand the right balance?
3. **Should high-demand roles get bonuses in both categories?** This might make them always win.
4. **Is the 8-role pool diverse enough?** Do we have clear differentiation between fast/high-salary paths?

## Specific Concerns

### Speed Score Issues:
- **Data Center Technician** (8-12 weeks, high demand) will likely always win fastest path
- Other short-training roles might never be recommended

### Salary Score Issues:  
- **Site Reliability Engineer** ($95k-$140k, high demand) will likely always win highest salary
- Mid-tier roles might never be recommended

### Recommendation Diversity:
- System might always recommend the same 2 roles regardless of user input
- User preferences might not significantly impact results

## Suggested Review Questions:
1. Should we cap the advantages that certain backgrounds get?
2. Should we weight user interests/preferences more heavily?
3. Are the salary ranges and training durations realistic?
4. Should we ensure role diversity by preventing the same role from winning both categories?