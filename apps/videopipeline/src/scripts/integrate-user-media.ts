#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

interface MediaMapping {
  images: Array<{
    userFile: string;
    pipelineFile: string;
    slideNumber: number;
    purpose: string;
    timing: string;
  }>;
  videos: Array<{
    userFile: string;
    pipelineFile: string;
    slideNumber: number;
    purpose: string;
    timing: string;
    duration: string;
  }>;
}

async function integrateUserMedia(sessionId: string, userMediaDir: string) {
  console.log(chalk.bold.cyan('🎨 Integrating User-Provided Media'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log(chalk.yellow(`📂 User Media Directory: ${userMediaDir}`));
  console.log('');

  try {
    // Load session
    const session = new PipelineSession(sessionId);
    await session.load();
    
    // Define media mapping based on the updated narration
    const mediaMapping: MediaMapping = {
      images: [
        {
          userFile: 'image1.png', // User to provide: DNA to data center connection
          pipelineFile: 'slide1_img1.png',
          slideNumber: 1,
          purpose: 'The Central Nervous System of Research',
          timing: 'During Slide 1 narration'
        },
        {
          userFile: 'image2.png', // User to provide: Data center anatomy
          pipelineFile: 'slide3_img2.png',
          slideNumber: 3,
          purpose: 'Anatomy of a Data Center',
          timing: 'During Slide 3 narration'
        },
        {
          userFile: 'image3.png', // User to provide: Four tiers visualization
          pipelineFile: 'slide5_img3.png',
          slideNumber: 5,
          purpose: 'The Four Tiers of Reliability',
          timing: 'During Slide 5 narration'
        }
      ],
      videos: [
        {
          userFile: 'video1.mp4', // User to provide: 8-second scale demonstration
          pipelineFile: 'slide4_vid1.mp4',
          slideNumber: 4,
          purpose: 'Data Center Economies of Scale',
          timing: 'During Slide 4 narration after "economies of scale"',
          duration: '8 seconds'
        }
      ]
    };

    // Create output directories
    const stage6Path = path.join('pipeline-data/sessions', sessionId, 'stage-06-ai-media');
    const stage6ImagesPath = path.join(stage6Path, 'images');
    const stage6VideosPath = path.join(stage6Path, 'videos');
    const publicImagesPath = path.join('public/sessions', sessionId, 'ai-images');
    const publicVideosPath = path.join('public/sessions', sessionId, 'ai-videos');
    
    await fs.mkdir(stage6ImagesPath, { recursive: true });
    await fs.mkdir(stage6VideosPath, { recursive: true });
    await fs.mkdir(publicImagesPath, { recursive: true });
    await fs.mkdir(publicVideosPath, { recursive: true });

    // Track integrated media
    const integratedImages: any[] = [];
    const integratedVideos: any[] = [];

    // Process Images
    console.log(chalk.bold.yellow('🖼️  Processing User Images'));
    console.log(chalk.gray('─'.repeat(60)));
    
    for (const imageMap of mediaMapping.images) {
      const userFilePath = path.join(userMediaDir, imageMap.userFile);
      
      try {
        // Check if user file exists
        await fs.access(userFilePath);
        
        console.log(chalk.cyan(`📸 Processing ${imageMap.userFile}`));
        console.log(chalk.gray(`   Slide: ${imageMap.slideNumber}`));
        console.log(chalk.gray(`   Purpose: ${imageMap.purpose}`));
        
        // Copy to pipeline locations
        const pipelinePath = path.join(stage6ImagesPath, imageMap.pipelineFile);
        const publicPath = path.join(publicImagesPath, imageMap.pipelineFile);
        
        await fs.copyFile(userFilePath, pipelinePath);
        await fs.copyFile(userFilePath, publicPath);
        
        integratedImages.push({
          fileName: imageMap.pipelineFile,
          slideNumber: imageMap.slideNumber,
          purpose: imageMap.purpose,
          timing: imageMap.timing,
          paths: {
            pipeline: pipelinePath,
            public: `/sessions/${sessionId}/ai-images/${imageMap.pipelineFile}`
          },
          status: 'user-provided',
          source: imageMap.userFile,
          integratedAt: new Date().toISOString()
        });
        
        console.log(chalk.green(`   ✓ Integrated as ${imageMap.pipelineFile}`));
      } catch (error) {
        console.log(chalk.red(`   ❌ File not found: ${imageMap.userFile}`));
        console.log(chalk.yellow(`   ⚠️  Please provide this file in ${userMediaDir}`));
        
        integratedImages.push({
          fileName: imageMap.pipelineFile,
          slideNumber: imageMap.slideNumber,
          purpose: imageMap.purpose,
          timing: imageMap.timing,
          status: 'missing',
          expectedFile: imageMap.userFile,
          error: 'User file not provided'
        });
      }
    }

    // Process Videos
    console.log('');
    console.log(chalk.bold.magenta('🎥 Processing User Videos'));
    console.log(chalk.gray('─'.repeat(60)));
    
    for (const videoMap of mediaMapping.videos) {
      const userFilePath = path.join(userMediaDir, videoMap.userFile);
      
      try {
        // Check if user file exists
        await fs.access(userFilePath);
        
        console.log(chalk.magenta(`🎬 Processing ${videoMap.userFile}`));
        console.log(chalk.gray(`   Slide: ${videoMap.slideNumber}`));
        console.log(chalk.gray(`   Purpose: ${videoMap.purpose}`));
        console.log(chalk.gray(`   Duration: ${videoMap.duration}`));
        
        // Copy to pipeline locations
        const pipelinePath = path.join(stage6VideosPath, videoMap.pipelineFile);
        const publicPath = path.join(publicVideosPath, videoMap.pipelineFile);
        
        await fs.copyFile(userFilePath, pipelinePath);
        await fs.copyFile(userFilePath, publicPath);
        
        integratedVideos.push({
          fileName: videoMap.pipelineFile,
          slideNumber: videoMap.slideNumber,
          purpose: videoMap.purpose,
          timing: videoMap.timing,
          duration: videoMap.duration,
          paths: {
            pipeline: pipelinePath,
            public: `/sessions/${sessionId}/ai-videos/${videoMap.pipelineFile}`
          },
          status: 'user-provided',
          source: videoMap.userFile,
          integratedAt: new Date().toISOString()
        });
        
        console.log(chalk.green(`   ✓ Integrated as ${videoMap.pipelineFile}`));
      } catch (error) {
        console.log(chalk.red(`   ❌ File not found: ${videoMap.userFile}`));
        console.log(chalk.yellow(`   ⚠️  Please provide this file in ${userMediaDir}`));
        
        integratedVideos.push({
          fileName: videoMap.pipelineFile,
          slideNumber: videoMap.slideNumber,
          purpose: videoMap.purpose,
          timing: videoMap.timing,
          duration: videoMap.duration,
          status: 'missing',
          expectedFile: videoMap.userFile,
          error: 'User file not provided'
        });
      }
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      mode: 'user-provided',
      images: integratedImages,
      videos: integratedVideos,
      summary: {
        totalImages: integratedImages.length,
        integratedImages: integratedImages.filter(i => i.status === 'user-provided').length,
        missingImages: integratedImages.filter(i => i.status === 'missing').length,
        totalVideos: integratedVideos.length,
        integratedVideos: integratedVideos.filter(v => v.status === 'user-provided').length,
        missingVideos: integratedVideos.filter(v => v.status === 'missing').length,
        integrationTime: new Date().toISOString()
      },
      source: {
        userMediaDir: userMediaDir,
        mapping: mediaMapping
      }
    });

    // Create media manifest for Remotion
    const mediaManifest = {
      sessionId,
      mode: 'user-provided',
      images: integratedImages.filter(i => i.status === 'user-provided').map(img => ({
        slide: img.slideNumber,
        file: img.fileName,
        url: img.paths.public,
        timing: img.timing,
        purpose: img.purpose,
        status: img.status
      })),
      videos: integratedVideos.filter(v => v.status === 'user-provided').map(vid => ({
        slide: vid.slideNumber,
        file: vid.fileName,
        url: vid.paths.public,
        timing: vid.timing,
        duration: vid.duration,
        purpose: vid.purpose,
        status: vid.status
      }))
    };

    await fs.writeFile(
      path.join(stage6Path, 'media-manifest.json'),
      JSON.stringify(mediaManifest, null, 2)
    );

    // Display summary
    console.log(chalk.green('✅ Media Integration Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Integration Summary:'));
    
    const integratedImageCount = integratedImages.filter(i => i.status === 'user-provided').length;
    const missingImageCount = integratedImages.filter(i => i.status === 'missing').length;
    const integratedVideoCount = integratedVideos.filter(v => v.status === 'user-provided').length;
    const missingVideoCount = integratedVideos.filter(v => v.status === 'missing').length;
    
    console.log(chalk.gray(`  Images: ${integratedImageCount}/${mediaMapping.images.length} integrated`));
    if (missingImageCount > 0) {
      console.log(chalk.yellow(`  Missing Images: ${missingImageCount}`));
    }
    console.log(chalk.gray(`  Videos: ${integratedVideoCount}/${mediaMapping.videos.length} integrated`));
    if (missingVideoCount > 0) {
      console.log(chalk.yellow(`  Missing Videos: ${missingVideoCount}`));
    }
    console.log('');
    
    if (missingImageCount > 0 || missingVideoCount > 0) {
      console.log(chalk.yellow('⚠️  Missing Files:'));
      console.log(chalk.gray(`Please provide these files in ${userMediaDir}:`));
      
      integratedImages.filter(i => i.status === 'missing').forEach(img => {
        console.log(chalk.gray(`  - ${img.expectedFile} (${img.purpose})`));
      });
      
      integratedVideos.filter(v => v.status === 'missing').forEach(vid => {
        console.log(chalk.gray(`  - ${vid.expectedFile} (${vid.purpose})`));
      });
      console.log('');
    }
    
    console.log(chalk.cyan('📍 Locations:'));
    console.log(chalk.gray(`  Pipeline: ${stage6Path}`));
    console.log(chalk.gray(`  Public: public/sessions/${sessionId}/ai-{images,videos}/`));
    console.log('');
    
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  Stage 7: Timeline Orchestration'));
    console.log(chalk.gray('  Stage 8: Final Narration'));
    console.log(chalk.gray('  Stage 9: Text-to-Speech'));
    console.log(chalk.gray('  Stage 10: Video Assembly'));

  } catch (error) {
    console.error(chalk.red('❌ Error in media integration:'), error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const sessionId = args[0] || 'ps_mNLd3DCJ';
const userMediaDir = args[1] || 'user-media';

// Display usage if no arguments
if (args.length === 0) {
  console.log(chalk.cyan('Usage:'));
  console.log('  npx tsx src/scripts/integrate-user-media.ts [sessionId] [userMediaDir]');
  console.log('');
  console.log(chalk.cyan('Example:'));
  console.log('  npx tsx src/scripts/integrate-user-media.ts ps_mNLd3DCJ ./my-media');
  console.log('');
  console.log(chalk.cyan('Expected files in user media directory:'));
  console.log('  - image1.png (DNA to data center connection)');
  console.log('  - image2.png (Data center anatomy)');
  console.log('  - image3.png (Four tiers visualization)');
  console.log('  - video1.mp4 (20-second downtime comparison)');
  console.log('');
  console.log(chalk.yellow('Using defaults:'));
  console.log(`  Session ID: ${sessionId}`);
  console.log(`  User Media Directory: ${userMediaDir}`);
  console.log('');
}

// Run the integration
integrateUserMedia(sessionId, userMediaDir).catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});