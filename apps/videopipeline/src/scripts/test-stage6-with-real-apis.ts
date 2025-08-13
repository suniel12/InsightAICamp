#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

interface RunwayGenerationResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

async function generateImageWithDallE(prompt: string, apiKey: string): Promise<Buffer | null> {
  try {
    const openai = new OpenAI({ 
      apiKey,
      timeout: 60000, // 60 second timeout per request
      maxRetries: 2
    });
    
    console.log(chalk.gray('   → Calling GPT-Image-1 (this may take 10-20 seconds)...'));
    const startTime = Date.now();
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1024x1024', // Using square size for faster generation
      quality: 'medium' // Using medium for balance of speed and quality
    });
        

    if (response.data && response.data[0]) {
      // GPT-Image-1 returns base64-encoded images
      if ((response.data[0] as any).b64_json) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(chalk.gray(`   → Generated in ${elapsed}s`));
        const buffer = Buffer.from((response.data[0] as any).b64_json, 'base64');
        return buffer;
      } else if (response.data[0].url) {
        // Fallback for URL-based response (shouldn't happen with gpt-image-1)
        const imageResponse = await fetch(response.data[0].url);
        const buffer = Buffer.from(await imageResponse.arrayBuffer());
        return buffer;
      }
    }
    return null;
  } catch (error) {
    console.error(chalk.red('   ❌ GPT-Image-1 error:'), error);
    return null;
  }
}

async function generateVideoWithRunway(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log(chalk.gray('   → Calling Runway Gen-3 Alpha Turbo...'));
    
    // Start generation
    const response = await fetch('https://api.dev.runwayml.com/v1/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        prompt_text: prompt,
        duration: 5,
        aspect_ratio: '16:9',
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Runway API error: ${response.status} - ${errorText}`);
    }

    const generation = await response.json() as RunwayGenerationResponse;
    console.log(chalk.gray(`   → Generation started: ${generation.id}`));
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/generation/${generation.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        }
      });
      
      const status = await statusResponse.json() as RunwayGenerationResponse;
      
      if (status.status === 'completed' && status.output && status.output[0]) {
        console.log(chalk.green('   ✓ Video generation complete'));
        return status.output[0]; // Return the video URL
      } else if (status.status === 'failed') {
        throw new Error(`Generation failed: ${status.error}`);
      }
      
      attempts++;
      console.log(chalk.gray(`   ⏳ Waiting for video generation... (${attempts * 5}s)`));
    }
    
    throw new Error('Video generation timed out');
  } catch (error) {
    console.error(chalk.red('   ❌ Runway error:'), error);
    return null;
  }
}

async function testStage6WithRealAPIs() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Stage 6: AI Media Generation with Real APIs'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  const runwayKey = process.env.RUNWAY_API_KEY;
  
  if (!openaiKey) {
    console.log(chalk.red('❌ OPENAI_API_KEY not found'));
    process.exit(1);
  }
  if (!runwayKey) {
    console.log(chalk.red('❌ RUNWAY_API_KEY not found'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ API Keys found:'));
  console.log(chalk.gray('  • OpenAI (GPT-Image-1)'));
  console.log(chalk.gray('  • Runway (Gen-3 Alpha Turbo)'));
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

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images with GPT-Image-1
    console.log(chalk.bold.yellow('🖼️  Generating Images with GPT-Image-1'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const imageOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'image');
    
    for (let i = 0; i < imageOpportunities.length; i++) {
      const opp = imageOpportunities[i];
      const fileName = `slide${opp.slideNumber}_img${i + 1}.png`;
      
      console.log(chalk.cyan(`\n📸 Image ${i + 1}/${imageOpportunities.length}: ${opp.purpose}`));
      console.log(chalk.gray(`   Slide: ${opp.slideNumber}`));
      console.log(chalk.gray(`   Timing: ${opp.timing}`));
      
      // Simplified prompt for GPT-Image-1 (avoiding complex prompts that might hang)
      const simplifiedPrompt = opp.prompt.substring(0, 200); // Limit prompt length
      
      const imageBuffer = await generateImageWithDallE(simplifiedPrompt, openaiKey!);
      
      if (imageBuffer) {
        // Save the actual image
        const imagePath = path.join(stage6ImagesPath, fileName);
        const publicImagePath = path.join(publicImagesPath, fileName);
        
        await fs.writeFile(imagePath, imageBuffer);
        await fs.writeFile(publicImagePath, imageBuffer);
        
        generatedImages.push({
          fileName,
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          narrationContext: opp.narrationContext,
          paths: {
            pipeline: imagePath,
            public: `/sessions/${sessionId}/ai-images/${fileName}`
          },
          status: 'generated',
          generatedAt: new Date().toISOString()
        });
        
        console.log(chalk.green(`   ✓ Generated: ${fileName}`));
      } else {
        console.log(chalk.yellow(`   ⚠ Failed to generate, creating placeholder`));
        
        // Create placeholder if generation fails
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ Image Generation Failed</h1>
        <p>GPT-Image-1 failed to generate this image.</p>
        <h2>Prompt:</h2>
        <p>${opp.prompt}</p>
    </div>
</body>
</html>`;
        
        const fallbackName = fileName.replace('.png', '.html');
        await fs.writeFile(
          path.join(stage6ImagesPath, fallbackName),
          placeholderHtml
        );
        await fs.writeFile(
          path.join(publicImagesPath, fallbackName),
          placeholderHtml
        );
        
        generatedImages.push({
          fileName: fallbackName,
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          status: 'failed',
          generatedAt: new Date().toISOString()
        });
      }
      
      // Add delay between generations to respect rate limits
      if (i < imageOpportunities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate Videos with Runway
    console.log('');
    console.log(chalk.bold.magenta('🎥 Generating Videos with Runway Gen-3'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const videoOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'video');
    
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`\n🎬 Video ${i + 1}/${videoOpportunities.length}: ${opp.purpose}`));
      console.log(chalk.gray(`   Slide: ${opp.slideNumber}`));
      console.log(chalk.gray(`   Timing: ${opp.timing}`));
      console.log(chalk.gray(`   Duration: ${opp.duration}`));
      
      const videoUrl = await generateVideoWithRunway(opp.prompt, runwayKey!);
      
      if (videoUrl) {
        // Download the video
        const videoResponse = await fetch(videoUrl);
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        
        const videoPath = path.join(stage6VideosPath, fileName);
        const publicVideoPath = path.join(publicVideosPath, fileName);
        
        await fs.writeFile(videoPath, videoBuffer);
        await fs.writeFile(publicVideoPath, videoBuffer);
        
        generatedVideos.push({
          fileName,
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          duration: opp.duration,
          narrationContext: opp.narrationContext,
          paths: {
            pipeline: videoPath,
            public: `/sessions/${sessionId}/ai-videos/${fileName}`
          },
          status: 'generated',
          generatedAt: new Date().toISOString()
        });
        
        console.log(chalk.green(`   ✓ Generated: ${fileName}`));
      } else {
        console.log(chalk.yellow(`   ⚠ Failed to generate, creating placeholder`));
        
        // Create placeholder if generation fails
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 Video Generation Failed</h1>
        <p>Runway Gen-3 failed to generate this video.</p>
        <h2>Prompt:</h2>
        <p>${opp.prompt}</p>
    </div>
</body>
</html>`;
        
        const fallbackName = fileName.replace('.mp4', '.html');
        await fs.writeFile(
          path.join(stage6VideosPath, fallbackName),
          placeholderHtml
        );
        await fs.writeFile(
          path.join(publicVideosPath, fallbackName),
          placeholderHtml
        );
        
        generatedVideos.push({
          fileName: fallbackName,
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          duration: opp.duration,
          narrationContext: opp.narrationContext,
          paths: {
            pipeline: path.join(stage6VideosPath, fallbackName),
            public: `/sessions/${sessionId}/ai-videos/${fallbackName}`
          },
          status: 'failed',
          generatedAt: new Date().toISOString()
        });
      }
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      mode: 'real-apis',
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        totalVideos: generatedVideos.length,
        imagesGenerated: generatedImages.filter(i => i.status === 'generated').length,
        videosGenerated: generatedVideos.filter(v => v.status === 'generated').length,
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
      mode: 'real-apis',
      images: generatedImages.map(img => ({
        slide: img.slideNumber,
        file: img.fileName,
        url: img.paths.public,
        timing: img.timing,
        purpose: img.purpose,
        status: img.status
      })),
      videos: generatedVideos.map(vid => ({
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
    console.log(chalk.green('✅ Stage 6 Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    console.log(chalk.gray(`  Images: ${generatedImages.filter(i => i.status === 'generated').length}/${generatedImages.length} successfully generated`));
    console.log(chalk.gray(`  Videos: ${generatedVideos.filter(v => v.status === 'generated').length}/${generatedVideos.length} successfully generated`));
    console.log('');
    
    // Show what was generated
    console.log(chalk.cyan('📁 Generated Media:'));
    generatedImages.forEach((img, i) => {
      const icon = img.status === 'generated' ? '✓' : '✗';
      console.log(chalk.gray(`  ${icon} Image ${i+1}: Slide ${img.slideNumber} - ${img.fileName}`));
    });
    generatedVideos.forEach((vid, i) => {
      const icon = vid.status === 'generated' ? '✓' : '✗';
      console.log(chalk.gray(`  ${icon} Video ${i+1}: Slide ${vid.slideNumber} - ${vid.fileName}`));
    });
    console.log('');
    
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
    console.error(chalk.red('❌ Error in Stage 6:'), error);
    process.exit(1);
  }
}

// Run the test
testStage6WithRealAPIs().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});