#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function testStage6GptImage() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Stage 6: Generating Media with GPT Image 1'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  const runwayKey = process.env.RUNWAY_API_KEY;
  
  if (!openaiKey) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Using GPT Image 1 Model'));
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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images with GPT Image 1
    console.log(chalk.bold.yellow('🖼️  Generating Images with GPT Image 1'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const imageOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'image');
    
    for (let i = 0; i < imageOpportunities.length; i++) {
      const opp = imageOpportunities[i];
      const fileName = `slide${opp.slideNumber}_img${i + 1}.png`;
      
      console.log(chalk.cyan(`\n📸 Generating Image ${i + 1}/${imageOpportunities.length}`));
      console.log(chalk.gray(`   Slide: ${opp.slideNumber}`));
      console.log(chalk.gray(`   Purpose: ${opp.purpose}`));
      console.log(chalk.blue(`   Prompt: "${opp.prompt.substring(0, 100)}..."`));
      
      try {
        console.log(chalk.yellow('   🎨 Calling GPT Image 1 API...'));
        
        // Enhanced prompt for better quality
        const enhancedPrompt = `${opp.prompt}. High quality, professional educational illustration, clean modern design, clear labels and annotations where mentioned.`;
        
        console.log(chalk.gray('   Making API request...'));
        
        // Generate image using GPT Image 1
        const response = await openai.images.generate({
          model: 'gpt-image-1',
          prompt: enhancedPrompt,
          n: 1,
          size: '1536x1024', // 16:10 aspect ratio, good for presentations
          quality: 'medium' // Using medium quality for balance of speed and quality
        });
        
        console.log(chalk.gray('   API response received'));
        
        // Get the image URL
        const imageUrl = response.data[0]?.url;
        
        if (imageUrl) {
          console.log(chalk.gray(`   Downloading from: ${imageUrl.substring(0, 50)}...`));
          // Download the image
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          
          // Save to both pipeline and public directories
          const imagePath = path.join(stage6ImagesPath, fileName);
          const publicImagePath = path.join(publicImagesPath, fileName);
          
          await fs.writeFile(imagePath, imageBuffer);
          await fs.writeFile(publicImagePath, imageBuffer);
          
          console.log(chalk.green(`   ✓ Image generated and saved: ${fileName}`));
          console.log(chalk.gray(`     Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`));
          
          generatedImages.push({
            fileName,
            slideNumber: opp.slideNumber,
            purpose: opp.purpose,
            prompt: opp.prompt,
            enhancedPrompt,
            timing: opp.timing,
            narrationContext: opp.narrationContext,
            paths: {
              pipeline: imagePath,
              public: `/sessions/${sessionId}/ai-images/${fileName}`
            },
            size: '1536x1024',
            quality: 'medium',
            model: 'gpt-image-1',
            status: 'generated',
            generatedAt: new Date().toISOString()
          });
        } else {
          console.log(chalk.red('   ❌ No image URL in response'));
          console.log(chalk.gray(`   Response data: ${JSON.stringify(response.data[0])}`));
          throw new Error('No image URL in API response');
        }
        
      } catch (error: any) {
        console.error(chalk.red(`   ❌ Error generating image: ${error.message}`));
        
        // Create error placeholder
        const errorContent = {
          error: error.message,
          prompt: opp.prompt,
          slideNumber: opp.slideNumber,
          timestamp: new Date().toISOString()
        };
        
        const errorPath = path.join(stage6ImagesPath, fileName.replace('.png', '_error.json'));
        const publicErrorPath = path.join(publicImagesPath, fileName.replace('.png', '_error.json'));
        
        await fs.writeFile(errorPath, JSON.stringify(errorContent, null, 2));
        await fs.writeFile(publicErrorPath, JSON.stringify(errorContent, null, 2));
        
        generatedImages.push({
          fileName: fileName.replace('.png', '_error.json'),
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          status: 'error',
          error: error.message,
          generatedAt: new Date().toISOString()
        });
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < imageOpportunities.length - 1) {
        console.log(chalk.gray('   Waiting 2 seconds before next request...'));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate Video placeholders
    console.log('');
    console.log(chalk.bold.magenta('🎥 Video Generation'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const videoOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'video');
    
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`\n🎬 Video ${i + 1}/${videoOpportunities.length}`));
      console.log(chalk.gray(`   Purpose: ${opp.purpose}`));
      console.log(chalk.yellow('   Note: Runway API integration available'));
      console.log(chalk.yellow('   Creating placeholder for now'));
      
      // Create detailed placeholder
      const placeholderContent = {
        type: 'video_placeholder',
        fileName,
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        duration: opp.duration,
        runwayApiKey: runwayKey ? 'Available' : 'Missing',
        note: 'To generate actual video, use Runway Gen-3 Alpha API or generate manually at https://runwayml.com',
        generatedAt: new Date().toISOString()
      };
      
      const videoPath = path.join(stage6VideosPath, fileName.replace('.mp4', '.json'));
      const publicVideoPath = path.join(publicVideosPath, fileName.replace('.mp4', '.json'));
      
      await fs.writeFile(videoPath, JSON.stringify(placeholderContent, null, 2));
      await fs.writeFile(publicVideoPath, JSON.stringify(placeholderContent, null, 2));
      
      generatedVideos.push({
        ...placeholderContent,
        paths: {
          pipeline: videoPath,
          public: `/sessions/${sessionId}/ai-videos/${fileName.replace('.mp4', '.json')}`
        },
        status: 'placeholder'
      });
      
      console.log(chalk.green(`   ✓ Video placeholder created`));
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      mode: 'gpt-image-1',
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        imagesGenerated: generatedImages.filter(i => i.status === 'generated').length,
        imagesFailed: generatedImages.filter(i => i.status === 'error').length,
        totalVideos: generatedVideos.length,
        videosGenerated: 0,
        videoPlaceholders: generatedVideos.length,
        generationTime: new Date().toISOString()
      },
      apis: {
        imageGeneration: 'gpt-image-1',
        videoGeneration: 'runway-placeholder'
      },
      costs: {
        estimatedImageCost: generatedImages.filter(i => i.status === 'generated').length * 0.063, // Medium quality 1536x1024
        note: 'Cost calculation based on GPT Image 1 medium quality pricing'
      }
    });

    // Display summary
    console.log(chalk.green('✅ Stage 6 Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    const successfulImages = generatedImages.filter(i => i.status === 'generated').length;
    const failedImages = generatedImages.filter(i => i.status === 'error').length;
    
    console.log(chalk.gray(`  Images Generated: ${successfulImages}/${generatedImages.length}`));
    if (failedImages > 0) {
      console.log(chalk.yellow(`  Images Failed: ${failedImages}`));
    }
    console.log(chalk.gray(`  Videos: ${generatedVideos.length} placeholder(s) created`));
    console.log('');
    
    if (successfulImages > 0) {
      console.log(chalk.green('🎉 Images successfully generated with GPT Image 1!'));
      console.log(chalk.gray(`   Estimated cost: $${(successfulImages * 0.063).toFixed(3)}`));
      console.log(chalk.gray('   Check the output folders to see the AI-generated images'));
    }
    
    console.log('');
    console.log(chalk.cyan('📍 Locations:'));
    console.log(chalk.gray(`  Pipeline: ${stage6Path}`));
    console.log(chalk.gray(`  Public: public/sessions/${sessionId}/ai-images/`));
    console.log('');
    
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  Stage 7: Timeline Orchestration'));
    console.log(chalk.gray('  Stage 8: Final Narration'));
    console.log(chalk.gray('  Stage 9: Text-to-Speech'));
    console.log(chalk.gray('  Stage 10: Video Assembly with Remotion'));

  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 6:'), error);
    process.exit(1);
  }
}

// Run the test
testStage6GptImage().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});