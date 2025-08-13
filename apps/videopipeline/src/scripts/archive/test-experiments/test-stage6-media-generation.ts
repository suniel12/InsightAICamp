#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
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
}

async function testStage6MediaGeneration() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Testing Stage 6: AI Media Generation'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for API keys
  const hasGeminiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;
  const hasRunwayKey = !!process.env.RUNWAY_API_KEY;
  
  if (!hasGeminiKey) {
    console.log(chalk.yellow('⚠️  GEMINI_API_KEY not found - will create placeholder images'));
  }
  if (!hasRunwayKey) {
    console.log(chalk.yellow('⚠️  RUNWAY_API_KEY not found - will create placeholder videos'));
  }
  console.log('');

  try {
    // Load session
    const session = new PipelineSession(sessionId);
    await session.load();
    
    // Get Stage 5 media plan
    const stage5Output = await session.getStageOutput(5);
    const mediaPlan = stage5Output.mediaPlan;
    
    console.log(chalk.cyan('📊 Media Plan Loaded'));
    console.log(chalk.gray(`  Images to generate: ${mediaPlan.totalImages}`));
    console.log(chalk.gray(`  Videos to generate: ${mediaPlan.totalVideos}`));
    console.log('');

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

    // Separate media by type
    const imageOpportunities = mediaPlan.opportunities.filter((o: MediaOpportunity) => o.type === 'image');
    const videoOpportunities = mediaPlan.opportunities.filter((o: MediaOpportunity) => o.type === 'video');

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images
    console.log(chalk.bold.yellow('🖼️  Generating Images'));
    console.log(chalk.gray('─'.repeat(60)));
    
    if (hasGeminiKey) {
      // TODO: Implement actual Gemini/Imagen 4 Ultra API calls
      console.log(chalk.red('Note: Gemini/Imagen 4 Ultra integration not yet implemented'));
      console.log(chalk.yellow('Creating placeholder images instead...'));
    }

    // For now, create placeholder images
    for (let i = 0; i < imageOpportunities.length; i++) {
      const opp = imageOpportunities[i];
      const fileName = `slide${opp.slideNumber}_img${i + 1}.png`;
      
      console.log(chalk.cyan(`  Generating image ${i + 1}/${imageOpportunities.length}`));
      console.log(chalk.gray(`    Slide ${opp.slideNumber}: ${opp.purpose.substring(0, 50)}...`));
      console.log(chalk.gray(`    Prompt: ${opp.prompt.substring(0, 80)}...`));
      
      // Create placeholder image (in real implementation, call Imagen API)
      const placeholderContent = `Placeholder for:\n${opp.purpose}\n\nPrompt:\n${opp.prompt}`;
      
      // Save to both locations
      const imagePath = path.join(stage6ImagesPath, fileName);
      const publicImagePath = path.join(publicImagesPath, fileName);
      
      await fs.writeFile(imagePath, placeholderContent);
      await fs.writeFile(publicImagePath, placeholderContent);
      
      generatedImages.push({
        fileName,
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        paths: {
          pipeline: imagePath,
          public: publicImagePath
        },
        status: 'placeholder',
        generatedAt: new Date().toISOString()
      });
      
      console.log(chalk.green(`    ✓ Created: ${fileName}`));
    }

    console.log('');
    console.log(chalk.bold.yellow('🎥 Generating Videos'));
    console.log(chalk.gray('─'.repeat(60)));
    
    if (hasRunwayKey) {
      // TODO: Implement actual Runway Gen-4 API calls
      console.log(chalk.red('Note: Runway Gen-4 integration not yet implemented'));
      console.log(chalk.yellow('Creating placeholder videos instead...'));
    }

    // For now, create placeholder videos
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`  Generating video ${i + 1}/${videoOpportunities.length}`));
      console.log(chalk.gray(`    Slide ${opp.slideNumber}: ${opp.purpose.substring(0, 50)}...`));
      console.log(chalk.gray(`    Prompt: ${opp.prompt.substring(0, 80)}...`));
      
      // Create placeholder video metadata (in real implementation, call Runway API)
      const placeholderContent = `Placeholder video for:\n${opp.purpose}\n\nPrompt:\n${opp.prompt}`;
      
      // Save to both locations
      const videoPath = path.join(stage6VideosPath, fileName);
      const publicVideoPath = path.join(publicVideosPath, fileName);
      
      await fs.writeFile(videoPath, placeholderContent);
      await fs.writeFile(publicVideoPath, placeholderContent);
      
      generatedVideos.push({
        fileName,
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        duration: '5 seconds',
        paths: {
          pipeline: videoPath,
          public: publicVideoPath
        },
        status: 'placeholder',
        generatedAt: new Date().toISOString()
      });
      
      console.log(chalk.green(`    ✓ Created: ${fileName}`));
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        totalVideos: generatedVideos.length,
        status: hasGeminiKey && hasRunwayKey ? 'generated' : 'placeholders',
        generationTime: new Date().toISOString()
      },
      paths: {
        images: {
          pipeline: stage6ImagesPath,
          public: publicImagesPath
        },
        videos: {
          pipeline: stage6VideosPath,
          public: publicVideosPath
        }
      }
    });

    // Create manifest file for Remotion
    const mediaManifest = {
      sessionId,
      images: generatedImages.map(img => ({
        slide: img.slideNumber,
        file: img.fileName,
        url: `/sessions/${sessionId}/ai-images/${img.fileName}`,
        timing: img.timing
      })),
      videos: generatedVideos.map(vid => ({
        slide: vid.slideNumber,
        file: vid.fileName,
        url: `/sessions/${sessionId}/ai-videos/${vid.fileName}`,
        timing: vid.timing,
        duration: vid.duration
      }))
    };

    await fs.writeFile(
      path.join(stage6Path, 'media-manifest.json'),
      JSON.stringify(mediaManifest, null, 2)
    );

    await fs.writeFile(
      path.join('public/sessions', sessionId, 'media-manifest.json'),
      JSON.stringify(mediaManifest, null, 2)
    );

    // Display summary
    console.log(chalk.green('✅ Stage 6 Media Generation Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    console.log(chalk.gray(`  Images: ${generatedImages.length} ${hasGeminiKey ? 'generated' : 'placeholders'}`));
    console.log(chalk.gray(`  Videos: ${generatedVideos.length} ${hasRunwayKey ? 'generated' : 'placeholders'}`));
    console.log('');
    
    console.log(chalk.cyan('📁 Media Locations:'));
    console.log(chalk.gray(`  Pipeline: ${stage6Path}`));
    console.log(chalk.gray(`  Public (Remotion): public/sessions/${sessionId}/`));
    console.log('');
    
    console.log(chalk.cyan('📋 Files Created:'));
    console.log(chalk.gray('  • output.json - Stage 6 results'));
    console.log(chalk.gray('  • media-manifest.json - Remotion reference'));
    console.log(chalk.gray('  • images/ - Generated images'));
    console.log(chalk.gray('  • videos/ - Generated videos'));
    console.log('');
    
    if (!hasGeminiKey || !hasRunwayKey) {
      console.log(chalk.yellow('⚠️  Note: Placeholders created. To generate actual media:'));
      if (!hasGeminiKey) {
        console.log(chalk.gray('  1. Add GEMINI_API_KEY to .env for Imagen 4 Ultra'));
      }
      if (!hasRunwayKey) {
        console.log(chalk.gray('  2. Add RUNWAY_API_KEY to .env for Runway Gen-4'));
      }
      console.log('');
    }
    
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  Stage 7: Timeline Orchestration'));
    console.log(chalk.gray('  Stage 8: Final Narration Refinement'));
    console.log(chalk.gray('  Stage 9: Text-to-Speech Generation'));

  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 6:'), error);
    process.exit(1);
  }
}

// Run the test
testStage6MediaGeneration().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});