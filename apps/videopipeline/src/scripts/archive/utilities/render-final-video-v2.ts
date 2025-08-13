import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

const sessionId = 'ps_mNLd3DCJ';
const outputDir = `output-${sessionId}`;
const timelinePath = path.join(outputDir, 'timeline-content-aware.json');
const outputVideoPath = path.join(outputDir, 'final-video.mp4');

async function copyAssetsToPublic() {
  console.log('📁 Setting up assets in Remotion public directory...');
  
  // Copy enhanced slides
  const slides = ['Slide1.png', 'Slide2.png', 'Slide3.png', 'Slide4.png', 'Slide5.png', 'Slide6.png'];
  for (const slide of slides) {
    const sourcePath = path.join(outputDir, 'public', slide);
    const destPath = path.join('output', 'video-output', 'public', slide);
    await fs.copyFile(sourcePath, destPath);
    console.log(`  ✓ Copied ${slide}`);
  }
  
  // Copy AI images with proper naming
  const aiImages = [
    { source: 'slide1_img1.png', dest: 'ai_image_1.png' },
    { source: 'slide3_img2.png', dest: 'ai_image_2.png' },
    { source: 'slide5_img3.png', dest: 'ai_image_3.png' }
  ];
  
  for (const img of aiImages) {
    const sourcePath = path.join('pipeline-data', 'sessions', sessionId, 'stage-06-ai-media', 'images', img.source);
    const destPath = path.join('output', 'video-output', 'public', img.dest);
    await fs.copyFile(sourcePath, destPath);
    console.log(`  ✓ Copied ${img.source} as ${img.dest}`);
  }
  
  // Copy video
  const videoSource = path.join('pipeline-data', 'sessions', sessionId, 'stage-06-ai-media', 'videos', 'slide4_vid1.mp4');
  const videoDest = path.join('output', 'video-output', 'public', 'slide4_vid1.mp4');
  await fs.copyFile(videoSource, videoDest);
  console.log('  ✓ Copied video slide4_vid1.mp4');
  
  // Copy audio
  const audioSource = path.join('pipeline-data', 'sessions', sessionId, 'stage-09-tts-audio', 'narration.mp3');
  const audioDest = path.join('output', 'video-output', 'public', 'narration.mp3');
  await fs.copyFile(audioSource, audioDest);
  console.log('  ✓ Copied narration.mp3');
}

async function renderVideo() {
  console.log('🎬 Starting video render with enhanced slides...');
  console.log(`  Timeline: ${timelinePath}`);
  console.log(`  Output: ${outputVideoPath}`);
  
  // Create progress log
  const progressLogPath = path.join(outputDir, 'render-progress.log');
  await fs.writeFile(progressLogPath, `Render started at ${new Date().toISOString()}\n`);
  
  // Start render with progress monitoring
  const startTime = Date.now();
  
  try {
    // Copy timeline to expected location
    await fs.copyFile(timelinePath, 'output/video-output/timeline.json');
    
    // Run Remotion render
    const renderCommand = `cd output/video-output && npx remotion render src/index.tsx DataCenterVideo ${path.join('..', '..', outputVideoPath)} --props='{"timelinePath":"timeline.json","audioPath":"public/narration.mp3"}' --codec h264 --image-format jpeg --jpeg-quality 95 --scale 1 --concurrency 1 --overwrite`;
    
    console.log('  Executing render command...');
    
    // Create a monitoring interval
    const monitorInterval = setInterval(async () => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const progress = `Progress update at ${new Date().toISOString()}: Rendering... (${elapsed}s elapsed)\n`;
      await fs.appendFile(progressLogPath, progress);
      console.log(`  ⏳ Rendering... ${elapsed}s elapsed`);
    }, 10000);
    
    // Execute render
    execSync(renderCommand, { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    clearInterval(monitorInterval);
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const completionLog = `\nRender completed at ${new Date().toISOString()}\nTotal render time: ${Math.round(totalTime / 60 * 10) / 10} minutes\nOutput file: ${outputVideoPath}\n`;
    await fs.appendFile(progressLogPath, completionLog);
    
    // Check file size
    const stats = await fs.stat(outputVideoPath);
    const fileSizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
    await fs.appendFile(progressLogPath, `File size: ${fileSizeMB} MB\n`);
    
    console.log('✅ Video render completed successfully!');
    console.log(`  Total time: ${Math.round(totalTime / 60 * 10) / 10} minutes`);
    console.log(`  Output: ${outputVideoPath}`);
    console.log(`  Size: ${fileSizeMB} MB`);
    
  } catch (error) {
    console.error('❌ Render failed:', error);
    await fs.appendFile(progressLogPath, `\nRender failed at ${new Date().toISOString()}\nError: ${error}\n`);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting final video render with enhanced slides');
    console.log(`  Session: ${sessionId}`);
    
    // Ensure output directory exists
    await fs.mkdir(path.join('output', 'video-output', 'public'), { recursive: true });
    
    // Copy all assets
    await copyAssetsToPublic();
    
    // Render video
    await renderVideo();
    
    console.log('\n✨ All done! Your video is ready at:', outputVideoPath);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();