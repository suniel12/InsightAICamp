#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateStage5Narration() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('📝 Generating Stage 5: Complete Narration Script'));
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
    
    // Get Stage 3 analysis and Stage 5 media plan
    const stage3Output = await session.getStageOutput(3);
    const stage5Output = await session.getStageOutput(5);
    const analysis = stage3Output.analysis;
    const userContext = stage3Output.userContext;
    const mediaPlan = stage5Output.mediaPlan;
    
    console.log(chalk.cyan('📊 Loaded Previous Stages'));
    console.log(chalk.gray(`  Slides: ${analysis.totalSlides}`));
    console.log(chalk.gray(`  Images planned: ${mediaPlan.totalImages}`));
    console.log(chalk.gray(`  Videos planned: ${mediaPlan.totalVideos}`));
    console.log(chalk.gray(`  User: ${userContext.background}`));
    console.log('');

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create comprehensive prompt for narration generation
    const prompt = `Generate a complete, continuous narration script for an educational video about data centers.
This narration should flow naturally from start to finish, incorporating all slides, images, and videos.

PRESENTATION CONTEXT:
${analysis.presentationOverview}

USER PROFILE:
- Background: ${userContext.background}
- Expertise: ${userContext.expertise}
- Goals: ${userContext.goals}

SLIDE INFORMATION:
${analysis.slides.map((s: any) => `
Slide ${s.slideNumber}: ${s.title}
Key Points: ${s.keyPoints.join('; ')}
Biological Analogies: ${s.biologicalAnalogies?.join('; ') || 'None'}
Connection from Previous: ${s.connectionToPrevious || 'Start'}
Connection to Next: ${s.connectionToNext || 'End'}
`).join('\n')}

MEDIA ELEMENTS TO INCORPORATE:
${mediaPlan.opportunities.map((m: any) => `
- [${m.type.toUpperCase()}] Slide ${m.slideNumber} at ${m.timing}: ${m.purpose}
  Context: ${m.narrationContext || 'Visual support'}`).join('\n')}

REQUIREMENTS:
1. Create a CONTINUOUS narration that flows naturally from beginning to end
2. Include natural transitions between slides (don't announce slide numbers)
3. Integrate media cues seamlessly:
   - [IMAGE: description] when an image should appear
   - [VIDEO: description] when a video should play
   - [SLIDE TRANSITION] when moving to next slide
4. Use biological analogies throughout (user is a biology graduate)
5. Maintain beginner-friendly explanations
6. Total duration should be approximately ${analysis.suggestedDuration}
7. Include:
   - Opening hook to engage the viewer
   - Clear explanations of each concept
   - Smooth transitions between topics
   - Closing summary and call to action

STYLE:
- Conversational but educational
- Use "you" to address the viewer directly
- Include relevant biological metaphors
- Build knowledge progressively
- Maintain enthusiasm and engagement

Generate the complete narration script with media cues embedded.`;

    console.log(chalk.yellow('🤖 Generating comprehensive narration with GPT-5 Nano...'));
    console.log(chalk.gray('   This will create the complete video script'));
    console.log('');

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator specializing in making complex technical concepts accessible through storytelling and analogies. Create engaging, continuous narration that flows naturally.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 30000  // High limit for complete narration
    });

    const narration = response.choices[0].message.content;
    if (!narration) throw new Error('No narration generated');

    console.log(chalk.green('✅ Complete narration generated!'));
    console.log('');
    
    // Display preview
    console.log(chalk.bold.cyan('📜 Narration Preview (first 500 characters):'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(narration.substring(0, 500) + '...'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');

    // Count media cues
    const imageCues = (narration.match(/\[IMAGE:/g) || []).length;
    const videoCues = (narration.match(/\[VIDEO:/g) || []).length;
    const transitions = (narration.match(/\[SLIDE TRANSITION\]/g) || []).length;
    
    console.log(chalk.cyan('📊 Script Statistics:'));
    console.log(chalk.gray(`  Total length: ${narration.length} characters`));
    console.log(chalk.gray(`  Estimated speaking time: ${Math.round(narration.split(' ').length / 150)} minutes`));
    console.log(chalk.gray(`  Image cues: ${imageCues}`));
    console.log(chalk.gray(`  Video cues: ${videoCues}`));
    console.log(chalk.gray(`  Slide transitions: ${transitions}`));
    console.log('');

    // Save the narration
    const stage5Path = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning');
    
    // Save as markdown for readability
    await fs.writeFile(
      path.join(stage5Path, 'complete-narration.md'),
      `# Complete Narration Script

## Session: ${sessionId}
## Generated: ${new Date().toISOString()}
## User Profile: ${userContext.background}

---

${narration}

---

## Script Metadata

- **Total Duration**: ${analysis.suggestedDuration}
- **Total Slides**: ${analysis.totalSlides}
- **Image Cues**: ${imageCues}
- **Video Cues**: ${videoCues}
- **Slide Transitions**: ${transitions}
- **Target Audience**: ${userContext.background} with ${userContext.expertise} expertise

## Media Integration Points

${mediaPlan.opportunities.map((m: any) => 
  `- **${m.type === 'image' ? '🖼️' : '🎥'} Slide ${m.slideNumber}** [${m.timing}]: ${m.purpose}`
).join('\n')}
`
    );

    // Save as plain text for TTS
    const plainNarration = narration
      .replace(/\[IMAGE:.*?\]/g, '')
      .replace(/\[VIDEO:.*?\]/g, '')
      .replace(/\[SLIDE TRANSITION\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    await fs.writeFile(
      path.join(stage5Path, 'narration-for-tts.txt'),
      plainNarration
    );

    // Create timestamped script
    const lines = narration.split('\n').filter(line => line.trim());
    let timestamp = 0;
    const timestampedScript = lines.map(line => {
      const words = line.split(' ').length;
      const duration = Math.round((words / 150) * 60); // 150 words per minute
      const result = `[${Math.floor(timestamp/60)}:${(timestamp%60).toString().padStart(2, '0')}] ${line}`;
      timestamp += duration;
      return result;
    }).join('\n');

    await fs.writeFile(
      path.join(stage5Path, 'timestamped-script.txt'),
      timestampedScript
    );

    // Update Stage 5 output
    const existingOutput = await session.getStageOutput(5);
    await session.saveStageOutput(5, {
      ...existingOutput,
      narration: {
        complete: narration,
        plainText: plainNarration,
        characterCount: narration.length,
        wordCount: narration.split(' ').length,
        estimatedDuration: `${Math.round(narration.split(' ').length / 150)} minutes`,
        mediaCues: {
          images: imageCues,
          videos: videoCues,
          transitions: transitions
        }
      },
      files: {
        narration: 'complete-narration.md',
        tts: 'narration-for-tts.txt',
        timestamped: 'timestamped-script.txt',
        mediaPlan: 'media-plan.json'
      }
    });

    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.green('✅ Stage 5 Complete Narration Generated!'));
    console.log('');
    console.log(chalk.cyan('📁 Output files:'));
    console.log(chalk.gray('  • complete-narration.md - Full script with media cues'));
    console.log(chalk.gray('  • narration-for-tts.txt - Clean text for speech synthesis'));
    console.log(chalk.gray('  • timestamped-script.txt - Script with time markers'));
    console.log(chalk.gray('  • media-plan.json - Media generation prompts'));
    console.log('');
    console.log(chalk.yellow(`📍 Location: ${stage5Path}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Review the complete narration'));
    console.log(chalk.gray('  2. Generate media (Stage 6)'));
    console.log(chalk.gray('  3. Create timeline (Stage 7)'));
    console.log(chalk.gray('  4. Generate TTS audio (Stage 9)'));

  } catch (error) {
    console.error(chalk.red('❌ Error generating narration:'), error);
    process.exit(1);
  }
}

// Run the generation
generateStage5Narration().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});