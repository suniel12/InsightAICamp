#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStage5Simplified() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('📝 Stage 5 SIMPLIFIED: 3 Images + 1 Video Test'));
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
    
    console.log(chalk.cyan('📊 Creating Simplified Media Plan'));
    console.log(chalk.gray('  Target: 3 strategic images + 1 impactful video'));
    console.log('');

    // Manually select the most impactful media opportunities
    const simplifiedMediaPlan = {
      totalImages: 3,
      totalVideos: 1,
      opportunities: [
        // Image 1: Opening biological analogy (Slide 1)
        {
          slideNumber: 1,
          type: 'image',
          prompt: 'Educational illustration split-screen comparison: Left side shows a biological cell with glowing nucleus, mitochondria, and cellular networks. Right side shows a data center with glowing servers, cooling systems, and network cables. Both sides connected by flowing energy patterns. Modern, clean infographic style with labels.',
          purpose: 'Establish the core biological analogy for data centers',
          timing: '0:10-0:20',
          priority: 'high',
          narrationContext: 'Data center as living cellular organ'
        },
        // Image 2: Physical components as organs (Slide 3)
        {
          slideNumber: 3,
          type: 'image',
          prompt: 'Isometric cutaway view of data center showing components as biological organs: servers labeled as "muscles", storage as "memory", routers as "nervous system", UPS as "heart", cooling as "lungs". Clean technical illustration with biological labels and flowing connections between components.',
          purpose: 'Visualize physical infrastructure using biological metaphors',
          timing: '2:00-2:15',
          priority: 'high',
          narrationContext: 'Components working together like organs in a body'
        },
        // Image 3: Tier visualization (Slide 5)
        {
          slideNumber: 5,
          type: 'image',
          prompt: 'Vertical tier visualization showing 4 levels like immune system layers. Tier 1 at bottom (basic protection), progressing to Tier 4 at top (full redundancy). Each tier shows availability percentage and downtime hours. Use gradient from light to dark blue, with biological defense imagery.',
          purpose: 'Clarify reliability tiers as layers of biological defense',
          timing: '4:30-4:45',
          priority: 'high',
          narrationContext: 'Tiers as escalating immune defenses'
        },
        // Video 1: Data flow animation (Slide 4)
        {
          slideNumber: 4,
          type: 'video',
          prompt: 'Create 5-second animation showing data flowing through a data center like nutrients through a biological system. Start with data packets as glowing orbs entering servers, processing through components, and flowing out to users. Smooth, organic motion with biological flow patterns.',
          purpose: 'Demonstrate dynamic data flow using biological circulation metaphor',
          timing: '3:00-3:05',
          duration: '5 seconds',
          priority: 'high',
          narrationContext: 'Data flowing like nutrients through the digital ecosystem'
        }
      ],
      rationale: 'Focused on three key visual moments that best support the biological narrative: opening analogy, physical infrastructure, and reliability tiers. Single video demonstrates dynamic flow.',
      estimatedCost: {
        images: '$180-360 (3 images at $60-120 each)',
        videos: '$300-600 (1 video at 5 seconds)'
      }
    };

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Generate complete narration with reduced media
    console.log(chalk.yellow('🤖 Generating complete narration with simplified media...'));
    console.log('');

    const narrationPrompt = `Generate a complete, continuous narration script for a 6-slide data center presentation.
This is a SIMPLIFIED version with only 3 images and 1 video for testing.

PRESENTATION OVERVIEW:
${analysis.presentationOverview}

USER: ${userContext.background} (${userContext.expertise} level)

SLIDES:
${analysis.slides.map((s: any) => `
Slide ${s.slideNumber}: ${s.title}
- Key Points: ${s.keyPoints.join('; ')}
- Biological Analogies: ${s.biologicalAnalogies?.join('; ') || 'None'}
`).join('\n')}

MEDIA TO INCORPORATE (ONLY THESE 4):
1. [IMAGE at 0:10-0:20]: Biological cell vs data center comparison (Slide 1)
2. [IMAGE at 2:00-2:15]: Data center components as biological organs (Slide 3)  
3. [VIDEO at 3:00-3:05]: 5-second data flow animation (Slide 4)
4. [IMAGE at 4:30-4:45]: Tier levels as immune system layers (Slide 5)

REQUIREMENTS:
- Create ONE continuous narration from start to finish
- Smoothly integrate the 3 images and 1 video at specified times
- Use biological analogies throughout
- Don't announce media, just pause naturally when they appear
- Total duration: 6-8 minutes
- Include opening hook and closing call to action

Write the complete narration with [IMAGE: description] and [VIDEO: description] cues embedded at the right moments.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator. Generate smooth, continuous narration that naturally incorporates media cues.'
        },
        {
          role: 'user',
          content: narrationPrompt
        }
      ],
      max_completion_tokens: 20000
    });

    const narration = response.choices[0].message.content || '';
    
    console.log(chalk.green('✅ Simplified narration generated!'));
    console.log('');
    
    // Display preview
    console.log(chalk.cyan('📜 Narration Preview:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(narration.substring(0, 400) + '...'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');

    // Save everything to Stage 5
    const stage5Path = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning');
    await fs.mkdir(stage5Path, { recursive: true });

    // Save simplified media plan
    await fs.writeFile(
      path.join(stage5Path, 'media-plan-simplified.json'),
      JSON.stringify(simplifiedMediaPlan, null, 2)
    );

    // Save complete narration
    await fs.writeFile(
      path.join(stage5Path, 'narration-simplified.md'),
      `# Simplified Narration (3 Images + 1 Video)

## Test Configuration
- **Session**: ${sessionId}
- **Generated**: ${new Date().toISOString()}
- **Media**: 3 images + 1 video
- **Duration**: 6-8 minutes

---

${narration}

---

## Media Cues
- Image 1: Biological cell vs data center (0:10-0:20)
- Image 2: Components as organs (2:00-2:15)
- Video 1: Data flow animation (3:00-3:05)
- Image 3: Tier visualization (4:30-4:45)
`
    );

    // Extract clean narration for TTS
    const cleanNarration = narration
      .replace(/\[IMAGE:.*?\]/g, '')
      .replace(/\[VIDEO:.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    await fs.writeFile(
      path.join(stage5Path, 'narration-simplified-tts.txt'),
      cleanNarration
    );

    // Update Stage 5 output
    await session.saveStageOutput(5, {
      mode: 'simplified',
      mediaPlan: simplifiedMediaPlan,
      narration: {
        full: narration,
        clean: cleanNarration,
        wordCount: cleanNarration.split(' ').length,
        estimatedDuration: `${Math.round(cleanNarration.split(' ').length / 150)} minutes`
      },
      userContext,
      generatedAt: new Date().toISOString(),
      status: 'completed'
    });

    // Display summary
    console.log(chalk.bold.cyan('📊 Simplified Stage 5 Summary:'));
    console.log(chalk.gray(`  Mode: Test/Simplified`));
    console.log(chalk.gray(`  Images: 3 (strategic placements)`));
    console.log(chalk.gray(`  Videos: 1 (data flow animation)`));
    console.log(chalk.gray(`  Narration: ${Math.round(cleanNarration.split(' ').length / 150)} minutes`));
    console.log('');
    
    console.log(chalk.cyan('📁 Files Created:'));
    console.log(chalk.gray('  • media-plan-simplified.json'));
    console.log(chalk.gray('  • narration-simplified.md'));
    console.log(chalk.gray('  • narration-simplified-tts.txt'));
    console.log('');
    
    console.log(chalk.green('✅ Stage 5 Simplified Complete!'));
    console.log('');
    console.log(chalk.cyan('🎬 Next: Stage 6 will generate these 3 images + 1 video'));

  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

// Run the test
testStage5Simplified().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});