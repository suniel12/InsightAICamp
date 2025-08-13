#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface MediaOpportunity {
  slideNumber: number;
  type: 'image' | 'video';
  prompt: string;
  purpose: string;
  timing: string;
  priority: 'high' | 'medium' | 'low';
  narrationContext?: string;
}

interface MediaPlan {
  totalImages: number;
  totalVideos: number;
  opportunities: MediaOpportunity[];
  rationale: string;
  estimatedCost: {
    images: string;
    videos: string;
  };
}

async function testStage5MediaPlanning() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎬 Testing Stage 5: Script with Media Planning'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found'));
    process.exit(1);
  }

  try {
    // Load session
    const session = new PipelineSession(sessionId);
    await session.load();
    
    // Get Stage 3 analysis
    const stage3Output = await session.getStageOutput(3);
    const analysis = stage3Output.analysis;
    const userContext = stage3Output.userContext;
    
    console.log(chalk.cyan('📊 Loaded Stage 3 Analysis'));
    console.log(chalk.gray(`  Slides analyzed: ${analysis.totalSlides}`));
    console.log(chalk.gray(`  User: ${userContext.background}`));
    console.log('');

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create prompt for media planning
    const prompt = `Based on this presentation analysis, identify opportunities for AI-generated media (images and videos).

PRESENTATION OVERVIEW:
${analysis.presentationOverview}

USER CONTEXT:
- Background: ${userContext.background}
- Expertise: ${userContext.expertise}
- Goals: ${userContext.goals}

SLIDE DETAILS:
${analysis.slides.map((s: any) => `
Slide ${s.slideNumber}: ${s.title}
Key Points: ${s.keyPoints.join('; ')}
Biological Analogies: ${s.biologicalAnalogies?.join('; ') || 'None'}
Narrative Focus: ${s.narrativeFocus}
`).join('\n')}

GUIDELINES:
1. IMAGES: Generate as many as needed to illustrate concepts, especially biological analogies
   - Visual comparisons (e.g., data center vs biological system)
   - Diagrams and infographics
   - Conceptual illustrations
   - Supporting visuals for each key point

2. VIDEOS: Only 2-3 short videos for KEY moments where motion adds unique value
   - Showing processes in action
   - Demonstrating scale or complexity
   - Visualizing data flow or system operations

3. For each opportunity provide:
   - Slide number
   - Type (image/video)
   - Detailed prompt for generation
   - Purpose/rationale
   - Suggested timing in narration
   - Priority (high/medium/low)

Focus on enhancing understanding for a biology graduate learning about data centers.

Respond in JSON format:
{
  "totalImages": number,
  "totalVideos": number,
  "opportunities": [
    {
      "slideNumber": number,
      "type": "image" or "video",
      "prompt": "detailed generation prompt",
      "purpose": "why this media is needed",
      "timing": "when to show (e.g., 0:15-0:20)",
      "priority": "high/medium/low",
      "narrationContext": "what's being said when shown"
    }
  ],
  "rationale": "overall media strategy",
  "estimatedCost": {
    "images": "cost estimate",
    "videos": "cost estimate"
  }
}`;

    console.log(chalk.yellow('🤖 Generating media opportunities with GPT-5 Nano...'));
    console.log('');

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are a creative director specializing in educational media. Create engaging visual opportunities that enhance learning.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 10000
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from API');

    // Parse response
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const mediaPlan: MediaPlan = JSON.parse(cleanContent);

    console.log(chalk.green('✅ Media plan generated!'));
    console.log('');
    
    // Display summary
    console.log(chalk.bold.cyan('📊 Media Plan Summary:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.yellow(`🖼️  Total Images: ${mediaPlan.totalImages}`));
    console.log(chalk.yellow(`🎥 Total Videos: ${mediaPlan.totalVideos}`));
    console.log('');
    
    // Group by slide
    const bySlide: Record<number, MediaOpportunity[]> = {};
    mediaPlan.opportunities.forEach(opp => {
      if (!bySlide[opp.slideNumber]) bySlide[opp.slideNumber] = [];
      bySlide[opp.slideNumber].push(opp);
    });

    // Display opportunities by slide
    Object.entries(bySlide).forEach(([slideNum, opps]) => {
      const slideInfo = analysis.slides.find((s: any) => s.slideNumber === parseInt(slideNum));
      console.log(chalk.bold.yellow(`\nSlide ${slideNum}: ${slideInfo?.title || 'Unknown'}`));
      
      opps.forEach(opp => {
        const icon = opp.type === 'image' ? '🖼️ ' : '🎥';
        const color = opp.priority === 'high' ? chalk.red : 
                      opp.priority === 'medium' ? chalk.yellow : chalk.gray;
        
        console.log(color(`  ${icon} [${opp.priority.toUpperCase()}] ${opp.purpose}`));
        console.log(chalk.gray(`     Timing: ${opp.timing}`));
        if (opp.type === 'image') {
          console.log(chalk.cyan(`     Prompt: ${opp.prompt.substring(0, 100)}...`));
        } else {
          console.log(chalk.magenta(`     Video: ${opp.prompt.substring(0, 100)}...`));
        }
      });
    });

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold.cyan('💡 Media Strategy:'));
    console.log(chalk.gray(mediaPlan.rationale));
    console.log('');
    
    console.log(chalk.bold.cyan('💰 Estimated Costs:'));
    console.log(chalk.gray(`  Images (Imagen 4 Ultra): ${mediaPlan.estimatedCost.images}`));
    console.log(chalk.gray(`  Videos (Runway Gen-4): ${mediaPlan.estimatedCost.videos}`));
    console.log('');

    // Save Stage 5 output
    const stage5Path = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning');
    await fs.mkdir(stage5Path, { recursive: true });

    await session.saveStageOutput(5, {
      mediaPlan,
      sourceAnalysis: 'stage-03',
      userContext,
      generatedAt: new Date().toISOString(),
      model: 'gpt-5-nano',
      status: 'completed'
    });

    // Save detailed media plan
    await fs.writeFile(
      path.join(stage5Path, 'media-plan.json'),
      JSON.stringify(mediaPlan, null, 2)
    );

    // Create generation scripts
    const imagePrompts = mediaPlan.opportunities
      .filter(o => o.type === 'image')
      .map(o => ({
        slideNumber: o.slideNumber,
        prompt: o.prompt,
        fileName: `slide${o.slideNumber}_img${mediaPlan.opportunities.indexOf(o)}.png`
      }));

    const videoPrompts = mediaPlan.opportunities
      .filter(o => o.type === 'video')
      .map(o => ({
        slideNumber: o.slideNumber,
        prompt: o.prompt,
        fileName: `slide${o.slideNumber}_vid${mediaPlan.opportunities.indexOf(o)}.mp4`,
        duration: '5 seconds'
      }));

    await fs.writeFile(
      path.join(stage5Path, 'image-prompts.json'),
      JSON.stringify(imagePrompts, null, 2)
    );

    await fs.writeFile(
      path.join(stage5Path, 'video-prompts.json'),
      JSON.stringify(videoPrompts, null, 2)
    );

    // Create summary
    const summary = `
Media Planning Summary
=====================
Session: ${sessionId}
Date: ${new Date().toISOString()}

Statistics:
- Total Images: ${mediaPlan.totalImages}
- Total Videos: ${mediaPlan.totalVideos}
- High Priority: ${mediaPlan.opportunities.filter(o => o.priority === 'high').length}
- Medium Priority: ${mediaPlan.opportunities.filter(o => o.priority === 'medium').length}
- Low Priority: ${mediaPlan.opportunities.filter(o => o.priority === 'low').length}

Distribution by Slide:
${Object.entries(bySlide).map(([num, opps]) => 
  `  Slide ${num}: ${opps.filter(o => o.type === 'image').length} images, ${opps.filter(o => o.type === 'video').length} videos`
).join('\n')}

Strategy:
${mediaPlan.rationale}

Cost Estimates:
- Images: ${mediaPlan.estimatedCost.images}
- Videos: ${mediaPlan.estimatedCost.videos}
    `.trim();

    await fs.writeFile(
      path.join(stage5Path, 'summary.txt'),
      summary
    );

    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.green('✅ Stage 5 Media Planning Complete!'));
    console.log('');
    console.log(chalk.cyan('📁 Output files:'));
    console.log(chalk.gray('  • media-plan.json - Complete plan'));
    console.log(chalk.gray('  • image-prompts.json - Ready for Imagen 4'));
    console.log(chalk.gray('  • video-prompts.json - Ready for Runway'));
    console.log(chalk.gray('  • summary.txt - Overview'));
    console.log('');
    console.log(chalk.yellow(`📍 Location: ${stage5Path}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Step:'));
    console.log(chalk.gray('  Stage 6: Generate AI media using the prompts'));

  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 5:'), error);
    process.exit(1);
  }
}

// Run the test
testStage5MediaPlanning().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});