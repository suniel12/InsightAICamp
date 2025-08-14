#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateHelpdeskNarration(sessionId: string) {
  console.log(chalk.bold.cyan('📝 Generating Stage 5: Helpdesk-Focused Narration Script'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found'));
    process.exit(1);
  }

  try {
    // Create output directories
    const stage5Dir = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning');
    await fs.mkdir(stage5Dir, { recursive: true });
    
    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create comprehensive prompt for helpdesk narration generation
    const prompt = `Generate a complete, continuous narration script for an educational video about data centers, personalized for a HELPDESK/DESKTOP SUPPORT TECHNICIAN.

USER CONTEXT:
- Role: Helpdesk/Desktop Support Technician with IT support experience
- Background: Experienced in troubleshooting user issues, managing service tickets, remote desktop support, and working with enterprise IT systems
- Knowledge Level: Familiar with basic networking, Windows/Mac OS, Active Directory, VPN, and common enterprise applications
- Learning Goals: Understanding how data center infrastructure impacts end-user experience and service delivery

IMPORTANT GUIDELINES:
1. Use IT support scenarios and real-world helpdesk examples
2. Connect infrastructure concepts to common user complaints and tickets
3. Explain how data center components affect service desk operations
4. Reference familiar tools like ticketing systems, remote desktop, monitoring dashboards
5. Focus on SLAs, uptime, and user productivity impacts
6. Include troubleshooting perspectives and escalation paths
7. Make it practical and relatable to daily support work

SLIDE CONTENT TO NARRATE:
- Slide 1: Introduction to Data Centers
- Slide 2: What Services Does a Data Center Provide?
- Slide 3: Core Components of a Data Center
- Slide 4: Why Centralize?
- Slide 5: Data Center Tier Classifications
- Slide 6: Business Impact and Cost Considerations

MEDIA INTEGRATION POINTS:
- Opening: AI-generated video showing data center walkthrough
- Slide 1: Server rack image with troubleshooting points
- Slide 3: Network operations center (NOC) monitoring screens
- Throughout: References to how each component affects help desk operations

Generate a natural, flowing narration (2000-2500 words) that:
1. Opens with a relatable helpdesk scenario
2. Explains each concept through the lens of IT support
3. Uses examples from service desk tickets
4. Emphasizes user impact and support workflows
5. Concludes with how understanding infrastructure improves support quality

The tone should be conversational, like an experienced tech explaining to a newer colleague.`;

    console.log(chalk.cyan('🤖 Generating helpdesk-focused narration...'));
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator specializing in making complex technical concepts accessible to IT support professionals. Create engaging, continuous narration that relates infrastructure to real-world helpdesk scenarios.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000
    });
    
    const narration = response.choices[0].message.content;
    if (!narration) throw new Error('No narration generated');
    
    // Save the narration
    await fs.writeFile(
      path.join(stage5Dir, 'complete-narration.md'),
      narration,
      'utf-8'
    );
    
    console.log(chalk.green('✅ Narration generated successfully'));
    console.log(chalk.gray(`  Length: ${narration.length} characters`));
    console.log(chalk.gray(`  Words: ~${narration.split(' ').length} words`));
    
    // Generate AI media prompts
    console.log(chalk.cyan('🎨 Generating AI media prompts...'));
    
    const mediaPrompt = `Based on the narration script above, generate specific prompts for AI image generation.
    
We need exactly 2 AI-generated images for a helpdesk/support technician audience:

1. First image: Server rack with labeled components showing common troubleshooting points
   - Should show physical server components that help desk might need to describe to data center teams
   - Include visual indicators for common issues (lights, cables, etc.)

2. Second image: Network Operations Center (NOC) with monitoring screens
   - Should show multiple monitors with system dashboards
   - Include elements familiar to support staff (ticket queues, system status, alerts)

For each image, provide:
- A detailed prompt for AI image generation (100-150 words)
- Where it should appear in the video timeline
- How it relates to the helpdesk narrative

Format as JSON with structure:
{
  "images": [
    {
      "id": "helpdesk_img1",
      "slide": "number", 
      "prompt": "detailed prompt",
      "purpose": "explanation",
      "timing": "when to show"
    }
  ]
}`;

    const mediaResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: mediaPrompt
        }
      ],
      max_tokens: 1000
    });
    
    const mediaText = mediaResponse.choices[0].message.content;
    if (!mediaText) throw new Error('No media prompts generated');
    
    // Extract JSON from response
    const jsonMatch = mediaText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const mediaJson = JSON.parse(jsonMatch[0]);
      await fs.writeFile(
        path.join(stage5Dir, 'image-prompts.json'),
        JSON.stringify(mediaJson, null, 2),
        'utf-8'
      );
      console.log(chalk.green('✅ AI image prompts generated'));
    }
    
    // Create a simplified narration for TTS
    const ttsPrompt = `Simplify the following narration for text-to-speech, removing any markdown formatting, special characters, and making it more conversational:

${narration}

Output only the clean, speakable text.`;

    const ttsResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: ttsPrompt
        }
      ],
      max_tokens: 3000
    });
    
    const ttsNarration = ttsResponse.choices[0].message.content;
    if (!ttsNarration) throw new Error('No TTS narration generated');
    
    await fs.writeFile(
      path.join(stage5Dir, 'narration-for-tts.txt'),
      ttsNarration,
      'utf-8'
    );
    
    console.log(chalk.green('✅ TTS-ready narration saved'));
    
    // Create media plan summary
    const mediaPlan = {
      sessionId,
      generatedAt: new Date().toISOString(),
      persona: 'Helpdesk/Desktop Support Technician',
      totalImages: 2,
      totalVideos: 1,
      videoReused: 'slide4_vid1.mp4',
      narrationLength: narration.length,
      narrationWords: narration.split(' ').length
    };
    
    await fs.writeFile(
      path.join(stage5Dir, 'media-plan.json'),
      JSON.stringify(mediaPlan, null, 2),
      'utf-8'
    );
    
    console.log('');
    console.log(chalk.bold.green('✅ Stage 5 Complete!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan('📁 Output files:'));
    console.log(chalk.gray(`  • ${path.join(stage5Dir, 'complete-narration.md')}`));
    console.log(chalk.gray(`  • ${path.join(stage5Dir, 'narration-for-tts.txt')}`));
    console.log(chalk.gray(`  • ${path.join(stage5Dir, 'image-prompts.json')}`));
    console.log(chalk.gray(`  • ${path.join(stage5Dir, 'media-plan.json')}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error generating narration:'), error);
    process.exit(1);
  }
}

// Run the script
const sessionId = process.argv[2] || 'ps_f573d96a24';
generateHelpdeskNarration(sessionId);