#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import { TimelinePlanner } from '../stages/timeline/planner';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage7Timeline() {
  console.log(chalk.bold.cyan('🎬 Stage 7: Timeline Orchestration'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionManager = new PipelineSession(SESSION_ID);
  await sessionManager.load();
  console.log(chalk.green(`✅ Session loaded: ${SESSION_ID}`));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load Stage 5 outputs
  console.log(chalk.yellow('\n📚 Loading Stage 5 outputs...'));
  const narrationPath = path.join(sessionDir, 'stage-05-script-video-planning/complete-narration.md');
  const mediaPlansPath = path.join(sessionDir, 'stage-05-script-video-planning/media-plan-simplified.json');
  
  const narrationContent = await fs.readFile(narrationPath, 'utf-8');
  const mediaPlans = JSON.parse(await fs.readFile(mediaPlansPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Loaded narration and media plans`));
  
  // Load Stage 6 outputs
  console.log(chalk.yellow('\n🎨 Loading Stage 6 outputs...'));
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Loaded media manifest: ${mediaManifest.images.length} images, ${mediaManifest.videos.length} videos`));
  
  // Parse narration segments
  console.log(chalk.yellow('\n📝 Parsing narration segments...'));
  const segments = parseNarrationSegments(narrationContent);
  console.log(chalk.gray(`  ✓ Parsed ${segments.length} segments`));
  segments.forEach(seg => {
    console.log(chalk.gray(`    Slide ${seg.slideNumber}: ${seg.duration.toFixed(1)}s`));
  });
  
  // Prepare slide images
  const slideImages = [
    path.join(process.cwd(), 'public/Slide1.png'),
    path.join(process.cwd(), 'public/Slide2.png'),
    path.join(process.cwd(), 'public/Slide3.png'),
    path.join(process.cwd(), 'public/Slide4.png'),
    path.join(process.cwd(), 'public/Slide5.png'),
  ];
  
  // Create proper opportunities with image file paths
  console.log(chalk.yellow('\n🎯 Mapping media opportunities...'));
  const opportunities = mediaPlans.opportunities.map((plan: any) => {
    // Find the corresponding media file from Stage 6
    let mediaFilePath = undefined;
    
    if (plan.type === 'image') {
      const imageEntry = mediaManifest.images.find((img: any) => img.slide === plan.slideNumber);
      if (imageEntry) {
        mediaFilePath = path.join(sessionDir, 'stage-06-ai-media/images', imageEntry.file);
      }
    }
    
    // Parse duration if it's a string
    let duration = undefined;
    if (plan.duration) {
      if (typeof plan.duration === 'string') {
        const match = plan.duration.match(/(\d+)/);
        if (match) duration = parseInt(match[1]);
      } else {
        duration = plan.duration;
      }
    }
    
    return {
      slideNumber: plan.slideNumber,
      type: plan.type,
      timing: plan.timing,
      duration,
      prompt: plan.prompt,
      purpose: plan.purpose,
      priority: 'high' as const,
      score: 1.0,
      reasoning: plan.narrationContext,
      mediaFilePath // Add the actual file path
    };
  });
  
  console.log(chalk.gray(`  ✓ Mapped ${opportunities.length} opportunities`));
  opportunities.forEach((opp: any) => {
    if (opp.mediaFilePath) {
      console.log(chalk.gray(`    Slide ${opp.slideNumber}: ${opp.type} -> ${path.basename(opp.mediaFilePath)}`));
    }
  });
  
  // Create video entries with proper paths
  console.log(chalk.yellow('\n🎥 Processing videos...'));
  const generatedVideos = mediaManifest.videos.map((v: any) => {
    // Parse duration
    let duration = 8; // default
    if (typeof v.duration === 'string') {
      const match = v.duration.match(/(\d+)/);
      if (match) duration = parseInt(match[1]);
    } else if (typeof v.duration === 'number') {
      duration = v.duration;
    }
    
    return {
      id: v.file,
      slideNumber: v.slide,
      url: path.join(sessionDir, 'stage-06-ai-media/videos', v.file),
      duration,
      prompt: v.purpose,
      provider: 'user-provided',
      cost: 0
    };
  });
  
  console.log(chalk.gray(`  ✓ Processed ${generatedVideos.length} videos`));
  
  // Create timeline with fixed TimelinePlanner
  console.log(chalk.yellow('\n⏱️  Generating timeline...'));
  const timelinePlanner = new FixedTimelinePlanner();
  const timeline = await timelinePlanner.planTimeline(
    segments,
    slideImages,
    opportunities,
    generatedVideos,
    mediaManifest
  );
  
  // Save timeline
  const stage7Dir = path.join(sessionDir, 'stage-07-timeline');
  await fs.mkdir(stage7Dir, { recursive: true });
  await fs.writeFile(
    path.join(stage7Dir, 'timeline.json'),
    JSON.stringify(timeline, null, 2)
  );
  
  // Update session status
  // Note: updateStageStatus doesn't exist, we'll skip this
  
  console.log(chalk.green(`\n✅ Timeline created successfully!`));
  console.log(chalk.gray(`  Events: ${timeline.events.length}`));
  console.log(chalk.gray(`  Duration: ${timeline.totalDuration.toFixed(1)}s`));
  console.log(chalk.gray(`  Output: ${stage7Dir}/timeline.json`));
  
  // Validate timeline
  console.log(chalk.yellow('\n🔍 Validating timeline...'));
  const validation = validateTimeline(timeline);
  if (validation.valid) {
    console.log(chalk.green('  ✓ Timeline is valid'));
  } else {
    console.log(chalk.red('  ✗ Timeline has issues:'));
    validation.issues.forEach((issue: string) => {
      console.log(chalk.red(`    - ${issue}`));
    });
  }
}

// Fixed timeline planner that uses actual file paths
class FixedTimelinePlanner extends TimelinePlanner {
  async planTimeline(
    scriptSegments: any[],
    slideImages: string[],
    aiMediaOpportunities: any[],
    generatedVideos?: any[],
    mediaManifest?: any
  ): Promise<any> {
    const events: any[] = [];
    let currentTime = 0;
    
    // Create maps for quick lookup
    const mediaBySlide = new Map();
    aiMediaOpportunities.forEach(opp => {
      mediaBySlide.set(opp.slideNumber, opp);
    });
    
    const videosBySlide = new Map();
    generatedVideos?.forEach(video => {
      videosBySlide.set(video.slideNumber, video);
    });
    
    // Create image map from manifest
    const imagesBySlide = new Map();
    if (mediaManifest?.images) {
      mediaManifest.images.forEach((img: any) => {
        imagesBySlide.set(img.slide, img);
      });
    }
    
    // Process each segment
    for (let i = 0; i < scriptSegments.length; i++) {
      const segment = scriptSegments[i];
      const slideImage = slideImages[i];
      const aiMedia = mediaBySlide.get(segment.slideNumber);
      const generatedVideo = videosBySlide.get(segment.slideNumber);
      const imageFile = imagesBySlide.get(segment.slideNumber);
      
      if (aiMedia && aiMedia.type === 'video' && generatedVideo) {
        // Video event
        events.push({
          id: `video-${segment.slideNumber}`,
          startTime: currentTime,
          endTime: currentTime + generatedVideo.duration,
          duration: generatedVideo.duration,
          type: 'ai-video',
          content: {
            slideNumber: segment.slideNumber,
            videoId: generatedVideo.id,
            videoPath: generatedVideo.url,
            description: generatedVideo.prompt,
            transition: 'dissolve'
          },
          narrationSegment: segment.narration
        });
        currentTime += generatedVideo.duration;
      } else if (aiMedia && aiMedia.type === 'image' && imageFile) {
        // Slide with overlay (using actual image file)
        const imagePath = path.join(
          'pipeline-data/sessions', 
          SESSION_ID, 
          'stage-06-ai-media/images', 
          imageFile.file
        );
        
        events.push({
          id: `overlay-${segment.slideNumber}`,
          startTime: currentTime,
          endTime: currentTime + segment.duration,
          duration: segment.duration,
          type: 'slide-with-overlay',
          content: {
            slideNumber: segment.slideNumber,
            slidePath: slideImage,
            overlayPath: imagePath, // Use actual image path, not prompt!
            description: aiMedia.purpose,
            transition: 'fade'
          },
          narrationSegment: segment.narration
        });
        currentTime += segment.duration;
      } else {
        // Regular slide
        events.push({
          id: `slide-${segment.slideNumber}`,
          startTime: currentTime,
          endTime: currentTime + segment.duration,
          duration: segment.duration,
          type: 'slide',
          content: {
            slideNumber: segment.slideNumber,
            slidePath: slideImage,
            description: `Display slide ${segment.slideNumber}`,
            transition: 'fade'
          },
          narrationSegment: segment.narration
        });
        currentTime += segment.duration;
      }
      
      // Add transition between slides (except after last)
      if (i < scriptSegments.length - 1) {
        events.push({
          id: `transition-${currentTime}`,
          startTime: currentTime,
          endTime: currentTime + 0.5,
          duration: 0.5,
          type: 'transition',
          content: {
            transition: 'dissolve'
          }
        });
        currentTime += 0.5;
      }
    }
    
    return {
      events,
      totalDuration: currentTime,
      audioTrack: {
        duration: currentTime
      }
    };
  }
}

function parseNarrationSegments(narrationContent: string) {
  const segments = [];
  
  // Split by (SLIDE X: pattern
  const slideMatches = narrationContent.match(/\(SLIDE \d+:[\s\S]*?(?=\(SLIDE|\[SLIDE TRANSITION\]|---|\n## |$)/g) || [];
  
  for (const slideContent of slideMatches) {
    const slideNumMatch = slideContent.match(/\(SLIDE (\d+):/);
    if (!slideNumMatch) continue;
    
    const slideNumber = parseInt(slideNumMatch[1]);
    
    // Extract narration (everything after the slide header)
    const narrationText = slideContent
      .replace(/\(SLIDE \d+:[^)]*\)/, '') // Remove slide header
      .replace(/\(Video Begins\)[\s\S]*?\(Video Ends\)/g, '') // Remove video sections
      .trim();
    
    // Calculate duration (150 WPM)
    const wordCount = narrationText.split(/\s+/).filter(w => w.length > 0).length;
    const duration = Math.max(10, (wordCount / 150) * 60);
    
    segments.push({
      slideNumber,
      narration: narrationText,
      duration,
      content: narrationText, // For compatibility
      visualDescription: `Slide ${slideNumber} visuals`,
      keyPoints: []
    });
  }
  
  return segments;
}

function validateTimeline(timeline: any) {
  const issues: string[] = [];
  
  // Check for valid duration
  if (!timeline.totalDuration || isNaN(timeline.totalDuration)) {
    issues.push('Invalid total duration');
  }
  
  // Check events
  timeline.events.forEach((event: any, index: number) => {
    if (isNaN(event.startTime) || isNaN(event.endTime) || isNaN(event.duration)) {
      issues.push(`Event ${index} has invalid timing`);
    }
    
    if (event.type === 'slide-with-overlay') {
      // Check if overlayPath is a file path, not a prompt
      if (event.content.overlayPath && event.content.overlayPath.length > 100 && !event.content.overlayPath.includes('/')) {
        issues.push(`Event ${index} has prompt text instead of file path in overlayPath`);
      }
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Run the script
runStage7Timeline().catch(error => {
  console.error(chalk.red('❌ Stage 7 failed:'), error);
  process.exit(1);
});