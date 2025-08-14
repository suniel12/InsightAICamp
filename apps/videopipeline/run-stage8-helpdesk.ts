#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

async function segmentHelpdeskNarration(sessionId: string) {
  console.log(chalk.bold.cyan('✂️  Stage 8: Segmenting Helpdesk Narration'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  try {
    // Create output directory
    const stage8Dir = path.join('pipeline-data/sessions', sessionId, 'stage-08-segmentation');
    await fs.mkdir(stage8Dir, { recursive: true });
    
    // Read the formatted narration
    const formattedFile = path.join('pipeline-data/sessions', sessionId, 'stage-08-final-narration/narration-formatted.md');
    const formattedContent = await fs.readFile(formattedFile, 'utf-8');
    
    console.log(chalk.cyan('📝 Processing formatted narration...'));
    
    // Parse segments from the formatted narration
    const segments = [];
    const segmentMatches = formattedContent.match(/Segment \d+:.*?(?=Segment \d+:|$)/gs);
    
    if (!segmentMatches) {
      throw new Error('No segments found in formatted narration');
    }
    
    for (const segmentText of segmentMatches) {
      // Extract segment info
      const segmentMatch = segmentText.match(/Segment (\d+): (.+?) \[(.+?)\]/);
      const durationMatch = segmentText.match(/Duration: (.+?) \|/);
      const typeMatch = segmentText.match(/Type: (.+?)$/m);
      const keyTermsMatch = segmentText.match(/Key Terms: (.+?)$/m);
      
      if (segmentMatch && durationMatch && typeMatch) {
        const segmentNumber = parseInt(segmentMatch[1]);
        const title = segmentMatch[2];
        const timing = segmentMatch[3];
        const duration = durationMatch[1];
        const type = typeMatch[1];
        const keyTerms = keyTermsMatch ? keyTermsMatch[1] : '';
        
        // Extract narration text (between type line and key terms)
        const narrationStart = segmentText.indexOf('Type: ' + type) + ('Type: ' + type).length;
        const narrationEnd = segmentText.indexOf('Key Terms:');
        const narrationText = segmentText.substring(narrationStart, narrationEnd).trim();
        
        // Parse timing
        const [startTime, endTime] = timing.split(' - ');
        const startSeconds = parseFloat(startTime.replace('s', ''));
        const endSeconds = parseFloat(endTime.replace('s', ''));
        
        // Determine content mapping
        let slideNumber = null;
        let contentType = type;
        let contentFile = null;
        
        if (type === 'slide') {
          const slideMatch = title.match(/Slide (\d+)/);
          slideNumber = slideMatch ? parseInt(slideMatch[1]) : null;
          contentFile = slideNumber ? `Slide${slideNumber}.png` : null;
        } else if (type === 'ai-video') {
          contentFile = 'slide4_vid1.mp4';
          contentType = 'video';
        } else if (type === 'ai-image') {
          // Map AI images based on the filename in title
          if (title.includes('slide1_img1.png')) {
            contentFile = 'helpdesk_img1.png';  // We only have one AI image now
          } else {
            contentFile = 'helpdesk_img1.png';  // Default to our single AI image
          }
          contentType = 'image';
        }
        
        const segment = {
          id: `segment-${segmentNumber}`,
          segmentNumber: segmentNumber,
          title: title,
          startTime: startSeconds,
          endTime: endSeconds,
          duration: endSeconds - startSeconds,
          contentType: contentType,
          contentFile: contentFile,
          slideNumber: slideNumber,
          narrationText: narrationText,
          keyTerms: keyTerms.split(', ').map(term => term.trim()),
          timing: timing
        };
        
        segments.push(segment);
      }
    }
    
    console.log(chalk.green(`✅ Parsed ${segments.length} segments`));
    
    // Save segments
    await fs.writeFile(
      path.join(stage8Dir, 'narration-segments.json'),
      JSON.stringify(segments, null, 2),
      'utf-8'
    );
    
    // Create summary
    const summary = {
      sessionId,
      generatedAt: new Date().toISOString(),
      persona: 'Helpdesk/Desktop Support Technician',
      totalSegments: segments.length,
      totalDuration: Math.max(...segments.map(s => s.endTime)),
      segmentTypes: {
        slide: segments.filter(s => s.contentType === 'slide').length,
        video: segments.filter(s => s.contentType === 'video').length,
        image: segments.filter(s => s.contentType === 'image').length
      },
      slideMapping: segments
        .filter(s => s.slideNumber)
        .map(s => ({ segment: s.segmentNumber, slide: s.slideNumber }))
    };
    
    await fs.writeFile(
      path.join(stage8Dir, 'segmentation-summary.json'),
      JSON.stringify(summary, null, 2),
      'utf-8'
    );
    
    console.log('');
    console.log(chalk.bold.green('✅ Stage 8 Complete!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan('📊 Segmentation Summary:'));
    console.log(chalk.gray(`  • Total segments: ${summary.totalSegments}`));
    console.log(chalk.gray(`  • Total duration: ${summary.totalDuration}s`));
    console.log(chalk.gray(`  • Slides: ${summary.segmentTypes.slide}`));
    console.log(chalk.gray(`  • Videos: ${summary.segmentTypes.video}`));
    console.log(chalk.gray(`  • Images: ${summary.segmentTypes.image}`));
    
    console.log('');
    console.log(chalk.cyan('📁 Output files:'));
    console.log(chalk.gray(`  • ${path.join(stage8Dir, 'narration-segments.json')}`));
    console.log(chalk.gray(`  • ${path.join(stage8Dir, 'segmentation-summary.json')}`));
    
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Generate TTS audio (Stage 9)'));
    console.log(chalk.gray('  2. Create timeline (Stage 10)'));
    console.log(chalk.gray('  3. Assemble final video (Stage 11)'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error segmenting narration:'), error);
    process.exit(1);
  }
}

// Run the script
const sessionId = process.argv[2] || 'ps_f573d96a24';
segmentHelpdeskNarration(sessionId);