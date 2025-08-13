#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function createIntelligentTimeline() {
  console.log(chalk.bold.cyan('🎯 Creating Intelligent Audio-Based Timeline'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load audio metadata
  console.log(chalk.yellow('\n📊 Loading audio metadata...'));
  const audioMetadataPath = path.join(sessionDir, 'stage-09-tts-audio/audio-metadata.json');
  const audioMetadata = JSON.parse(await fs.readFile(audioMetadataPath, 'utf-8'));
  const totalDuration = audioMetadata.duration;
  console.log(chalk.gray(`  Audio duration: ${totalDuration.toFixed(1)}s`));
  console.log(chalk.gray(`  Speech rate: ${audioMetadata.narrationStats.actualWPM.toFixed(0)} WPM`));
  
  // Load narration text
  console.log(chalk.yellow('\n📝 Analyzing narration content...'));
  const narrationPath = path.join(sessionDir, 'stage-08-final-narration/narration.txt');
  const narrationText = await fs.readFile(narrationPath, 'utf-8');
  
  // Analyze narration to find transition points
  const transitions = analyzeNarrationTransitions(narrationText, totalDuration);
  console.log(chalk.gray(`  Found ${transitions.length} natural transition points`));
  
  // Load media manifest for available assets
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  
  // Create timeline events based on content analysis
  console.log(chalk.yellow('\n⏱️  Building content-aware timeline...'));
  const events = [];
  let currentTime = 0;
  
  // Slide 1: Introduction (0 to first transition)
  events.push({
    id: 'overlay-1',
    startTime: 0,
    endTime: transitions[0].time,
    duration: transitions[0].time,
    type: 'slide-with-overlay',
    content: {
      slideNumber: 1,
      slidePath: path.join(process.cwd(), 'public/Slide1.png'),
      overlayPath: path.join(sessionDir, 'stage-06-ai-media/images/slide1_img1.png'),
      description: 'Introduction - The Central Nervous System of Research',
      transition: 'fade'
    },
    narrationContent: 'Introduction and biological analogy for data centers'
  });
  
  // Transition
  events.push({
    id: 'transition-1',
    startTime: transitions[0].time,
    endTime: transitions[0].time + 0.5,
    duration: 0.5,
    type: 'transition',
    content: { transition: 'dissolve' }
  });
  currentTime = transitions[0].time + 0.5;
  
  // Slide 2: Services
  events.push({
    id: 'slide-2',
    startTime: currentTime,
    endTime: transitions[1].time,
    duration: transitions[1].time - currentTime,
    type: 'slide',
    content: {
      slideNumber: 2,
      slidePath: path.join(process.cwd(), 'public/Slide2.png'),
      description: 'What is a Data Center? - Services',
      transition: 'fade'
    },
    narrationContent: 'Data center services: storage, hosting, email'
  });
  
  // Transition
  events.push({
    id: 'transition-2',
    startTime: transitions[1].time,
    endTime: transitions[1].time + 0.5,
    duration: 0.5,
    type: 'transition',
    content: { transition: 'dissolve' }
  });
  currentTime = transitions[1].time + 0.5;
  
  // Slide 3: Infrastructure
  events.push({
    id: 'overlay-3',
    startTime: currentTime,
    endTime: transitions[2].time,
    duration: transitions[2].time - currentTime,
    type: 'slide-with-overlay',
    content: {
      slideNumber: 3,
      slidePath: path.join(process.cwd(), 'public/Slide3.png'),
      overlayPath: path.join(sessionDir, 'stage-06-ai-media/images/slide3_img2.png'),
      description: 'Data Center Infrastructure - Anatomy',
      transition: 'fade'
    },
    narrationContent: 'Infrastructure components: servers, storage, cooling, power'
  });
  
  // Transition
  events.push({
    id: 'transition-3',
    startTime: transitions[2].time,
    endTime: transitions[2].time + 0.5,
    duration: 0.5,
    type: 'transition',
    content: { transition: 'dissolve' }
  });
  currentTime = transitions[2].time + 0.5;
  
  // Slide 4: Benefits with embedded video
  // First part - lead in
  events.push({
    id: 'slide-4-intro',
    startTime: currentTime,
    endTime: transitions[3].time, // Video start point
    duration: transitions[3].time - currentTime,
    type: 'slide',
    content: {
      slideNumber: 4,
      slidePath: path.join(process.cwd(), 'public/Slide4.png'),
      description: 'Data Center Benefits - Efficiency introduction',
      transition: 'fade'
    },
    narrationContent: 'Why centralize? Efficiency and economies of scale'
  });
  
  // Video plays during "To give you a sense of this..."
  const videoFile = mediaManifest.videos[0];
  events.push({
    id: 'video-4',
    startTime: transitions[3].time,
    endTime: transitions[4].time,
    duration: transitions[4].time - transitions[3].time,
    type: 'ai-video',
    content: {
      slideNumber: 4,
      videoId: videoFile.file,
      videoPath: path.join(sessionDir, 'stage-06-ai-media/videos', videoFile.file),
      description: 'Data Center Scale Visualization',
      transition: 'dissolve'
    },
    narrationContent: 'Video showing massive scale of data centers'
  });
  
  // Slide 4 continues - security benefits
  events.push({
    id: 'slide-4-outro',
    startTime: transitions[4].time,
    endTime: transitions[5].time,
    duration: transitions[5].time - transitions[4].time,
    type: 'slide',
    content: {
      slideNumber: 4,
      slidePath: path.join(process.cwd(), 'public/Slide4.png'),
      description: 'Data Center Benefits - Security',
      transition: 'fade'
    },
    narrationContent: 'Enhanced security benefits'
  });
  
  // Transition
  events.push({
    id: 'transition-4',
    startTime: transitions[5].time,
    endTime: transitions[5].time + 0.5,
    duration: 0.5,
    type: 'transition',
    content: { transition: 'dissolve' }
  });
  currentTime = transitions[5].time + 0.5;
  
  // Slide 5: Tiers (remainder of audio)
  events.push({
    id: 'overlay-5',
    startTime: currentTime,
    endTime: totalDuration,
    duration: totalDuration - currentTime,
    type: 'slide-with-overlay',
    content: {
      slideNumber: 5,
      slidePath: path.join(process.cwd(), 'public/Slide5.png'),
      overlayPath: path.join(sessionDir, 'stage-06-ai-media/images/slide5_img3.png'),
      description: 'Data Center Tiers - Reliability Levels',
      transition: 'fade'
    },
    narrationContent: 'Four tiers of data center reliability and downtime costs'
  });
  
  // Create final timeline object
  const timeline = {
    events,
    totalDuration,
    audioTrack: {
      duration: totalDuration,
      path: path.join(sessionDir, 'stage-09-tts-audio/narration.mp3')
    },
    metadata: {
      createdAt: new Date().toISOString(),
      method: 'content-aware',
      audioWPM: audioMetadata.narrationStats.actualWPM,
      transitionPoints: transitions.map(t => ({
        time: t.time.toFixed(1),
        marker: t.marker
      }))
    }
  };
  
  // Save the new timeline
  const outputPath = path.join(sessionDir, 'stage-10-audio-based-timeline');
  await fs.mkdir(outputPath, { recursive: true });
  await fs.writeFile(
    path.join(outputPath, 'timeline.json'),
    JSON.stringify(timeline, null, 2)
  );
  
  // Display timeline summary
  console.log(chalk.green('\n✅ Intelligent timeline created!'));
  console.log(chalk.gray(`  Total duration: ${totalDuration.toFixed(1)}s`));
  console.log(chalk.gray(`  Events: ${events.length}`));
  console.log(chalk.gray(`  Output: ${outputPath}/timeline.json`));
  
  console.log(chalk.yellow('\n📊 Timeline Summary:'));
  for (const event of events) {
    if (event.type !== 'transition') {
      const duration = event.duration.toFixed(1);
      const start = event.startTime.toFixed(1);
      const end = event.endTime.toFixed(1);
      console.log(chalk.gray(`  [${start}s-${end}s] ${event.type} (${duration}s): ${event.narrationContent || ''}`));
    }
  }
  
  return timeline;
}

function analyzeNarrationTransitions(text: string, totalDuration: number) {
  // Key phrases that indicate content transitions
  const transitionMarkers = [
    { marker: "So, what does a data center actually do", estimatedPosition: 0.156 }, // ~47s at 301s total
    { marker: "Now, let's look under the hood", estimatedPosition: 0.398 }, // ~120s
    { marker: "Why centralize all this", estimatedPosition: 0.614 }, // ~185s
    { marker: "To give you a sense of this", estimatedPosition: 0.664 }, // ~200s (video start)
    { marker: "The other huge benefit is enhanced security", estimatedPosition: 0.714 }, // ~215s (video end)
    { marker: "Not all data centers are created equal", estimatedPosition: 0.764 } // ~230s
  ];
  
  const transitions = [];
  const textLower = text.toLowerCase();
  
  for (const marker of transitionMarkers) {
    const index = textLower.indexOf(marker.marker.toLowerCase());
    if (index !== -1) {
      // Calculate actual position based on character position
      const actualPosition = index / text.length;
      // Blend estimated and actual positions for better accuracy
      const blendedPosition = (marker.estimatedPosition * 0.7) + (actualPosition * 0.3);
      const time = blendedPosition * totalDuration;
      
      transitions.push({
        time,
        marker: marker.marker,
        charIndex: index
      });
    }
  }
  
  // Sort by time
  transitions.sort((a, b) => a.time - b.time);
  
  return transitions;
}

// Run the script
createIntelligentTimeline().catch(error => {
  console.error(chalk.red('❌ Failed to create timeline:'), error);
  process.exit(1);
});