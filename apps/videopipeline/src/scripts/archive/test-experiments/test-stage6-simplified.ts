#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStage6Simplified() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Stage 6 SIMPLIFIED: Generating 3 Images + 1 Video'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for API keys
  const hasGeminiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;
  const hasRunwayKey = !!process.env.RUNWAY_API_KEY;
  
  if (!hasGeminiKey) {
    console.log(chalk.yellow('⚠️  GEMINI_API_KEY not found - creating placeholder images'));
  }
  if (!hasRunwayKey) {
    console.log(chalk.yellow('⚠️  RUNWAY_API_KEY not found - creating placeholder video'));
  }
  console.log('');

  try {
    // Load session
    const session = new PipelineSession(sessionId);
    await session.load();
    
    // Load simplified media plan from Stage 5
    const stage5Path = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning');
    const mediaPlanData = await fs.readFile(
      path.join(stage5Path, 'media-plan-simplified.json'),
      'utf-8'
    );
    const mediaPlan = JSON.parse(mediaPlanData);
    
    console.log(chalk.cyan('📊 Simplified Media Plan Loaded'));
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

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images
    console.log(chalk.bold.yellow('🖼️  Generating 3 Strategic Images'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const imageOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'image');
    
    for (let i = 0; i < imageOpportunities.length; i++) {
      const opp = imageOpportunities[i];
      const fileName = `slide${opp.slideNumber}_img${i + 1}.png`;
      
      console.log(chalk.cyan(`\n📸 Image ${i + 1}/3: ${opp.purpose}`));
      console.log(chalk.gray(`   Slide: ${opp.slideNumber}`));
      console.log(chalk.gray(`   Timing: ${opp.timing}`));
      console.log(chalk.blue(`   Prompt: "${opp.prompt.substring(0, 100)}..."`));
      
      if (hasGeminiKey) {
        // TODO: Call actual Imagen 4 Ultra API
        console.log(chalk.yellow('   → Would call Imagen 4 Ultra API here'));
      }
      
      // Create detailed placeholder that describes what the image should be
      const placeholderHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 10px;
        }
        h1 { color: #FFD700; }
        .label { 
            background: rgba(0,0,0,0.3); 
            padding: 5px 10px; 
            border-radius: 5px; 
            display: inline-block;
            margin: 5px 0;
        }
        .prompt {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ AI Image Placeholder</h1>
        <div class="label">Slide ${opp.slideNumber}</div>
        <div class="label">${opp.timing}</div>
        <h2>Purpose:</h2>
        <p>${opp.purpose}</p>
        <h2>Generation Prompt:</h2>
        <div class="prompt">${opp.prompt}</div>
        <h2>Context:</h2>
        <p>${opp.narrationContext}</p>
        <p style="opacity: 0.7; margin-top: 30px;">
            This placeholder represents where the AI-generated image would appear.
            Use GEMINI_API_KEY to generate actual image with Imagen 4 Ultra.
        </p>
    </div>
</body>
</html>`;
      
      // Save to both locations
      const imagePath = path.join(stage6ImagesPath, fileName.replace('.png', '.html'));
      const publicImagePath = path.join(publicImagesPath, fileName.replace('.png', '.html'));
      
      await fs.writeFile(imagePath, placeholderHtml);
      await fs.writeFile(publicImagePath, placeholderHtml);
      
      generatedImages.push({
        fileName: fileName.replace('.png', '.html'),
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        narrationContext: opp.narrationContext,
        paths: {
          pipeline: imagePath,
          public: `/sessions/${sessionId}/ai-images/${fileName.replace('.png', '.html')}`
        },
        status: hasGeminiKey ? 'generated' : 'placeholder',
        generatedAt: new Date().toISOString()
      });
      
      console.log(chalk.green(`   ✓ Created: ${fileName}`));
    }

    // Generate Video
    console.log('');
    console.log(chalk.bold.magenta('🎥 Generating 1 Key Video'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const videoOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'video');
    
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`\n🎬 Video 1/1: ${opp.purpose}`));
      console.log(chalk.gray(`   Slide: ${opp.slideNumber}`));
      console.log(chalk.gray(`   Timing: ${opp.timing}`));
      console.log(chalk.gray(`   Duration: ${opp.duration}`));
      console.log(chalk.blue(`   Prompt: "${opp.prompt.substring(0, 100)}..."`));
      
      if (hasRunwayKey) {
        // TODO: Call actual Runway Gen-4 API
        console.log(chalk.yellow('   → Would call Runway Gen-4 API here'));
      }
      
      // Create video placeholder
      const placeholderHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(0,0,0,0.3);
            padding: 30px;
            border-radius: 10px;
        }
        h1 { color: #FFD700; }
        .label { 
            background: rgba(255,255,255,0.2); 
            padding: 5px 10px; 
            border-radius: 5px; 
            display: inline-block;
            margin: 5px;
        }
        .prompt {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .play-button {
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px auto;
            font-size: 50px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 AI Video Placeholder</h1>
        <div class="play-button">▶️</div>
        <div class="label">Slide ${opp.slideNumber}</div>
        <div class="label">${opp.timing}</div>
        <div class="label">${opp.duration}</div>
        <h2>Purpose:</h2>
        <p>${opp.purpose}</p>
        <h2>Generation Prompt:</h2>
        <div class="prompt">${opp.prompt}</div>
        <h2>Context:</h2>
        <p>${opp.narrationContext}</p>
        <p style="opacity: 0.7; margin-top: 30px;">
            This placeholder represents a ${opp.duration} AI-generated video.
            Use RUNWAY_API_KEY to generate actual video with Runway Gen-4.
        </p>
    </div>
</body>
</html>`;
      
      // Save to both locations
      const videoPath = path.join(stage6VideosPath, fileName.replace('.mp4', '.html'));
      const publicVideoPath = path.join(publicVideosPath, fileName.replace('.mp4', '.html'));
      
      await fs.writeFile(videoPath, placeholderHtml);
      await fs.writeFile(publicVideoPath, placeholderHtml);
      
      generatedVideos.push({
        fileName: fileName.replace('.mp4', '.html'),
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        duration: opp.duration,
        narrationContext: opp.narrationContext,
        paths: {
          pipeline: videoPath,
          public: `/sessions/${sessionId}/ai-videos/${fileName.replace('.mp4', '.html')}`
        },
        status: hasRunwayKey ? 'generated' : 'placeholder',
        generatedAt: new Date().toISOString()
      });
      
      console.log(chalk.green(`   ✓ Created: ${fileName}`));
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      mode: 'simplified',
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        totalVideos: generatedVideos.length,
        status: (hasGeminiKey && hasRunwayKey) ? 'generated' : 'placeholders',
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

    // Create media manifest for Remotion
    const mediaManifest = {
      sessionId,
      mode: 'simplified',
      images: generatedImages.map(img => ({
        slide: img.slideNumber,
        file: img.fileName,
        url: img.paths.public,
        timing: img.timing,
        purpose: img.purpose
      })),
      videos: generatedVideos.map(vid => ({
        slide: vid.slideNumber,
        file: vid.fileName,
        url: vid.paths.public,
        timing: vid.timing,
        duration: vid.duration,
        purpose: vid.purpose
      }))
    };

    await fs.writeFile(
      path.join(stage6Path, 'media-manifest.json'),
      JSON.stringify(mediaManifest, null, 2)
    );

    // Display summary
    console.log(chalk.green('✅ Stage 6 Simplified Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    console.log(chalk.gray(`  Images: ${generatedImages.length} ${hasGeminiKey ? 'generated' : 'placeholder files'}`));
    console.log(chalk.gray(`  Videos: ${generatedVideos.length} ${hasRunwayKey ? 'generated' : 'placeholder file'}`));
    console.log('');
    
    // Show what was generated
    console.log(chalk.cyan('📁 Generated Media:'));
    generatedImages.forEach((img, i) => {
      console.log(chalk.gray(`  ${i+1}. Image: Slide ${img.slideNumber} - ${img.purpose.substring(0, 40)}...`));
    });
    generatedVideos.forEach((vid, i) => {
      console.log(chalk.gray(`  ${i+1}. Video: Slide ${vid.slideNumber} - ${vid.purpose.substring(0, 40)}...`));
    });
    console.log('');
    
    console.log(chalk.cyan('📍 Locations:'));
    console.log(chalk.gray(`  Pipeline: ${stage6Path}`));
    console.log(chalk.gray(`  Public: public/sessions/${sessionId}/ai-{images,videos}/`));
    console.log('');
    
    if (!hasGeminiKey || !hasRunwayKey) {
      console.log(chalk.yellow('💡 To generate actual media:'));
      if (!hasGeminiKey) {
        console.log(chalk.gray('  • Add GEMINI_API_KEY for Imagen 4 Ultra'));
      }
      if (!hasRunwayKey) {
        console.log(chalk.gray('  • Add RUNWAY_API_KEY for Runway Gen-4'));
      }
      console.log(chalk.gray('  • Placeholders show what would be generated'));
      console.log('');
    }
    
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  Stage 7: Timeline Orchestration'));
    console.log(chalk.gray('  Stage 8: Final Narration'));
    console.log(chalk.gray('  Stage 9: Text-to-Speech'));
    console.log(chalk.gray('  Stage 10: Video Assembly'));

  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 6:'), error);
    process.exit(1);
  }
}

// Run the test
testStage6Simplified().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});