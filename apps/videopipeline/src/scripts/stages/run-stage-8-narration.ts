#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage8Narration() {
  console.log(chalk.bold.cyan('🎬 Stage 8: Final Narration Generation'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionManager = new PipelineSession(SESSION_ID);
  await sessionManager.load();
  console.log(chalk.green(`✅ Session loaded: ${SESSION_ID}`));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load Stage 5 narration
  console.log(chalk.yellow('\n📚 Loading Stage 5 narration...'));
  const narrationPath = path.join(sessionDir, 'stage-05-script-video-planning/complete-narration.md');
  const narrationContent = await fs.readFile(narrationPath, 'utf-8');
  
  // Load Stage 7 timeline for timing
  console.log(chalk.yellow('⏱️  Loading Stage 7 timeline...'));
  const timelinePath = path.join(sessionDir, 'stage-07-timeline/timeline.json');
  const timeline = JSON.parse(await fs.readFile(timelinePath, 'utf-8'));
  
  // Parse and clean narration for TTS
  console.log(chalk.yellow('\n🎙️  Processing narration for TTS...'));
  const segments = parseNarrationForTTS(narrationContent, timeline);
  
  // Combine all segments into continuous narration
  const fullScript = segments
    .map(seg => seg.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Calculate speech metrics
  const wordCount = fullScript.split(/\s+/).filter(w => w.length > 0).length;
  const totalDuration = timeline.totalDuration;
  const wordsPerMinute = (wordCount / totalDuration) * 60;
  
  console.log(chalk.gray(`  Word count: ${wordCount}`));
  console.log(chalk.gray(`  Duration: ${totalDuration.toFixed(1)}s`));
  console.log(chalk.gray(`  Speech rate: ${wordsPerMinute.toFixed(0)} WPM`));
  
  // Create final narration object
  const finalNarration = {
    fullScript,
    segments,
    totalDuration,
    wordsPerMinute,
    metadata: {
      sessionId: SESSION_ID,
      generatedAt: new Date().toISOString(),
      userProfile: 'Biology graduate with lab experience',
      topic: 'Understanding Data Centers',
      slideCount: 5
    }
  };
  
  // Save Stage 8 outputs
  const stage8Dir = path.join(sessionDir, 'stage-08-final-narration');
  await fs.mkdir(stage8Dir, { recursive: true });
  
  // Save JSON format
  await fs.writeFile(
    path.join(stage8Dir, 'narration.json'),
    JSON.stringify(finalNarration, null, 2)
  );
  
  // Save plain text for TTS
  await fs.writeFile(
    path.join(stage8Dir, 'narration.txt'),
    fullScript
  );
  
  // Save formatted script with timings
  await fs.writeFile(
    path.join(stage8Dir, 'narration-formatted.md'),
    generateFormattedScript(segments, timeline)
  );
  
  console.log(chalk.green('\n✅ Stage 8 completed successfully!'));
  console.log(chalk.gray(`  Output: ${stage8Dir}`));
  console.log(chalk.gray(`  Files created:`));
  console.log(chalk.gray(`    - narration.json (structured data)`));
  console.log(chalk.gray(`    - narration.txt (plain text for TTS)`));
  console.log(chalk.gray(`    - narration-formatted.md (with timings)`));
}

function parseNarrationForTTS(narrationContent: string, timeline: any) {
  const segments = [];
  
  // Extract narration for each slide
  const slideMatches = narrationContent.match(/\(SLIDE \d+:[\s\S]*?(?=\(SLIDE|\[SLIDE TRANSITION\]|---|\n## |$)/g) || [];
  
  for (const slideContent of slideMatches) {
    const slideNumMatch = slideContent.match(/\(SLIDE (\d+):/);
    if (!slideNumMatch) continue;
    
    const slideNumber = parseInt(slideNumMatch[1]);
    
    // Find corresponding timeline event
    const timelineEvent = timeline.events.find((e: any) => 
      e.content?.slideNumber === slideNumber && e.type !== 'transition'
    );
    
    if (!timelineEvent) continue;
    
    // Extract and clean narration text
    let narrationText = slideContent
      .replace(/\(SLIDE \d+:[^)]*\)/, '') // Remove slide header
      .trim();
    
    // Handle video sections specially
    if (slideNumber === 4) {
      // Split narration around video
      const beforeVideo = narrationText.match(/^([\s\S]*?)(?=\(Video Begins\))/)?.[1] || '';
      const duringVideo = narrationText.match(/\(Video Begins\)([\s\S]*?)\(Video Ends\)/)?.[1] || '';
      const afterVideo = narrationText.match(/\(Video Ends\)([\s\S]*?)$/)?.[1] || '';
      
      // Combine with smooth transition
      narrationText = beforeVideo.trim();
      
      if (duringVideo.trim()) {
        narrationText += ' ' + duringVideo.trim();
      }
      
      if (afterVideo.trim()) {
        narrationText += ' ' + afterVideo.trim();
      }
    } else {
      // Remove any video markers if present
      narrationText = narrationText
        .replace(/\(Video Begins\)[\s\S]*?\(Video Ends\)/g, '')
        .trim();
    }
    
    // Clean up formatting
    narrationText = narrationText
      .replace(/\n\n+/g, ' ') // Replace multiple newlines with space
      .replace(/\n/g, ' ') // Replace single newlines with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    segments.push({
      slideNumber,
      text: narrationText,
      startTime: timelineEvent.startTime,
      endTime: timelineEvent.endTime,
      duration: timelineEvent.duration,
      visualType: timelineEvent.type,
      emphasis: extractEmphasisWords(narrationText),
      pace: calculatePace(narrationText, timelineEvent.duration)
    });
  }
  
  return segments;
}

function extractEmphasisWords(text: string): string[] {
  // Extract important technical terms and key concepts
  const emphasisPatterns = [
    /data center/gi,
    /biological/gi,
    /DNA/g,
    /servers?/gi,
    /storage/gi,
    /cooling/gi,
    /power/gi,
    /UPS/g,
    /Tier \d/gi,
    /availability/gi,
    /downtime/gi,
    /security/gi,
    /redundan(t|cy)/gi
  ];
  
  const emphasisWords = new Set<string>();
  
  for (const pattern of emphasisPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => emphasisWords.add(match.toLowerCase()));
    }
  }
  
  return Array.from(emphasisWords);
}

function calculatePace(text: string, duration: number): 'slow' | 'normal' | 'fast' {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const wpm = (wordCount / duration) * 60;
  
  if (wpm < 140) return 'slow';
  if (wpm > 160) return 'fast';
  return 'normal';
}

function generateFormattedScript(segments: any[], timeline: any) {
  let formatted = `# Final Narration Script with Timings

## Session: ${SESSION_ID}
## Generated: ${new Date().toISOString()}
## Total Duration: ${timeline.totalDuration.toFixed(1)} seconds

---

`;

  for (const segment of segments) {
    formatted += `## Slide ${segment.slideNumber} [${segment.startTime.toFixed(1)}s - ${segment.endTime.toFixed(1)}s]
**Duration:** ${segment.duration.toFixed(1)}s | **Pace:** ${segment.pace} | **Type:** ${segment.visualType}

${segment.text}

**Key Terms:** ${segment.emphasis.join(', ') || 'none'}

---

`;
  }
  
  return formatted;
}

// Run the script
runStage8Narration().catch(error => {
  console.error(chalk.red('❌ Stage 8 failed:'), error);
  process.exit(1);
});