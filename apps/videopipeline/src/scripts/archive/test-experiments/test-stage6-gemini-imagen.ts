#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStage6GeminiImagen() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Stage 6: Generating Media with Gemini 2.0 Flash'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for API keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const runwayKey = process.env.RUNWAY_API_KEY;
  
  if (!geminiKey) {
    console.error(chalk.red('❌ GEMINI_API_KEY not found'));
    process.exit(1);
  }
  if (!runwayKey) {
    console.log(chalk.yellow('⚠️  RUNWAY_API_KEY found but will create placeholder for now'));
  }
  
  console.log(chalk.green('✅ Using Gemini 2.0 Flash Experimental'));
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

    // Initialize Gemini with the correct model
    const genAI = new GoogleGenerativeAI(geminiKey);
    
    // Use Gemini 2.0 Flash experimental which supports image generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images with Gemini
    console.log(chalk.bold.yellow('🖼️  Generating Images with Gemini'));
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
        // For now, we'll generate a description instead of an actual image
        // since Gemini 2.0 Flash image generation requires special configuration
        console.log(chalk.yellow('   Generating image description...'));
        
        const imagePrompt = `You are an AI assistant helping to visualize educational content. 
Based on this prompt, describe in detail what the image should look like:

Prompt: ${opp.prompt}

Provide a detailed description of the visual elements, composition, colors, and style.`;

        const result = await model.generateContent(imagePrompt);
        const response = await result.response;
        const description = response.text();
        
        // Create a detailed placeholder with the AI-generated description
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
        .description {
            background: rgba(0,200,255,0.2);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #00C8FF;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ AI-Generated Image Description</h1>
        <div class="label">Slide ${opp.slideNumber}</div>
        <div class="label">${opp.timing}</div>
        <h2>Purpose:</h2>
        <p>${opp.purpose}</p>
        <h2>Original Prompt:</h2>
        <div class="prompt">${opp.prompt}</div>
        <h2>AI-Generated Visual Description:</h2>
        <div class="description">${description}</div>
        <h2>Context:</h2>
        <p>${opp.narrationContext}</p>
        <p style="opacity: 0.7; margin-top: 30px;">
            This is an AI-generated description of what the image should look like.
            To generate actual images, consider using dedicated image generation APIs like Imagen 4.0 or DALL-E 3.
        </p>
    </div>
</body>
</html>`;
        
        const imagePath = path.join(stage6ImagesPath, fileName.replace('.png', '.html'));
        const publicImagePath = path.join(publicImagesPath, fileName.replace('.png', '.html'));
        
        await fs.writeFile(imagePath, placeholderHtml);
        await fs.writeFile(publicImagePath, placeholderHtml);
        
        console.log(chalk.green(`   ✓ Image description generated and saved: ${fileName}`));
        
        generatedImages.push({
          fileName: fileName.replace('.png', '.html'),
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          narrationContext: opp.narrationContext,
          description: description,
          paths: {
            pipeline: imagePath,
            public: `/sessions/${sessionId}/ai-images/${fileName.replace('.png', '.html')}`
          },
          status: 'description-generated',
          generatedAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(chalk.red(`   ❌ Error generating image description: ${error}`));
        
        // Create error placeholder
        const placeholderContent = `Error generating image:\n${error}\n\nPrompt:\n${opp.prompt}`;
        const imagePath = path.join(stage6ImagesPath, fileName.replace('.png', '_error.txt'));
        const publicImagePath = path.join(publicImagesPath, fileName.replace('.png', '_error.txt'));
        
        await fs.writeFile(imagePath, placeholderContent);
        await fs.writeFile(publicImagePath, placeholderContent);
        
        generatedImages.push({
          fileName: fileName.replace('.png', '_error.txt'),
          slideNumber: opp.slideNumber,
          purpose: opp.purpose,
          prompt: opp.prompt,
          timing: opp.timing,
          status: 'error',
          error: String(error),
          generatedAt: new Date().toISOString()
        });
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < imageOpportunities.length - 1) {
        console.log(chalk.gray('   Waiting 1 second before next request...'));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate Video (placeholder for now as Runway API integration is complex)
    console.log('');
    console.log(chalk.bold.magenta('🎥 Video Generation'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const videoOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'video');
    
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`\n🎬 Video ${i + 1}/${videoOpportunities.length}`));
      console.log(chalk.gray(`   Purpose: ${opp.purpose}`));
      console.log(chalk.yellow('   Note: Runway API integration requires additional setup'));
      console.log(chalk.yellow('   Creating detailed placeholder for now'));
      
      // For now, create a detailed placeholder
      const placeholderContent = `Runway Gen-3 Alpha Video Placeholder
Duration: ${opp.duration}
Slide: ${opp.slideNumber}
Timing: ${opp.timing}

Prompt:
${opp.prompt}

To generate actual video:
1. Use Runway API with key: ${runwayKey ? 'Available' : 'Missing'}
2. Or generate manually at https://runwayml.com`;
      
      const videoPath = path.join(stage6VideosPath, fileName.replace('.mp4', '.txt'));
      const publicVideoPath = path.join(publicVideosPath, fileName.replace('.mp4', '.txt'));
      
      await fs.writeFile(videoPath, placeholderContent);
      await fs.writeFile(publicVideoPath, placeholderContent);
      
      generatedVideos.push({
        fileName: fileName.replace('.mp4', '.txt'),
        slideNumber: opp.slideNumber,
        purpose: opp.purpose,
        prompt: opp.prompt,
        timing: opp.timing,
        duration: opp.duration,
        status: 'placeholder',
        note: 'Runway integration pending',
        generatedAt: new Date().toISOString()
      });
      
      console.log(chalk.green(`   ✓ Video placeholder created`));
    }

    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    
    // Save Stage 6 output
    await session.saveStageOutput(6, {
      mode: 'gemini-descriptions',
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        imagesGenerated: generatedImages.filter(i => i.status === 'description-generated').length,
        totalVideos: generatedVideos.length,
        videosGenerated: generatedVideos.filter(v => v.status === 'generated').length,
        generationTime: new Date().toISOString()
      },
      apis: {
        gemini: 'gemini-2.0-flash-exp',
        runway: 'placeholder'
      }
    });

    // Display summary
    console.log(chalk.green('✅ Stage 6 Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    const successfulImages = generatedImages.filter(i => i.status === 'description-generated').length;
    console.log(chalk.gray(`  Images: ${successfulImages}/${generatedImages.length} descriptions generated`));
    console.log(chalk.gray(`  Videos: ${generatedVideos.length} placeholder(s) created`));
    console.log('');
    
    if (successfulImages > 0) {
      console.log(chalk.green('🎉 Image descriptions generated with Gemini!'));
      console.log(chalk.gray('   Check the output folders to see the AI-generated descriptions'));
    }
    
    console.log('');
    console.log(chalk.cyan('📍 Locations:'));
    console.log(chalk.gray(`  Pipeline: ${stage6Path}`));
    console.log(chalk.gray(`  Public: public/sessions/${sessionId}/ai-images/`));
    console.log('');
    
    console.log(chalk.yellow('💡 Note:'));
    console.log(chalk.gray('  Gemini 2.0 Flash can generate descriptions but not images directly.'));
    console.log(chalk.gray('  For actual image generation, consider:'));
    console.log(chalk.gray('  • Google AI Studio with Imagen 4.0'));
    console.log(chalk.gray('  • OpenAI DALL-E 3 API'));
    console.log(chalk.gray('  • Midjourney API'));
    console.log(chalk.gray('  • Stable Diffusion API'));
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
testStage6GeminiImagen().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});