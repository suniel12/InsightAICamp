#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

async function testStage6Imagen4() {
  const sessionId = 'ps_mNLd3DCJ';
  
  console.log(chalk.bold.cyan('🎨 Stage 6: Generating Media with Imagen 4.0'));
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
  
  console.log(chalk.green('✅ Using Imagen 4.0 Generate Preview'));
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

    // Create Python script for Imagen 4.0 generation
    const pythonScript = `
import os
import json
import sys
from google import genai
from google.genai import types
from PIL import Image

# Set the API key - using GEMINI_API_KEY
os.environ['GEMINI_API_KEY'] = '${geminiKey}'

def generate_image(prompt, output_path, image_number):
    """Generate an image using Imagen 4.0"""
    try:
        print(f"🎨 Generating image {image_number}...")
        print(f"   Prompt: {prompt[:100]}...")
        
        # Use GEMINI_API_KEY environment variable
        client = genai.Client()
        
        response = client.models.generate_images(
            model='imagen-4.0-generate-preview-06-06',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9"  # Good for video content
            )
        )
        
        # Save the first generated image
        if response.generated_images:
            generated_image = response.generated_images[0]
            generated_image.image.save(output_path)
            print(f"   ✓ Image saved to {output_path}")
            return True
        else:
            print(f"   ❌ No image generated")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

# Read the media plan
media_plan_path = sys.argv[1] if len(sys.argv) > 1 else 'media-plan.json'
output_dir = sys.argv[2] if len(sys.argv) > 2 else '.'

with open(media_plan_path, 'r') as f:
    media_plan = json.load(f)

# Generate images
image_opportunities = [o for o in media_plan['opportunities'] if o['type'] == 'image']
generated_images = []

for i, opp in enumerate(image_opportunities, 1):
    slide_num = opp['slideNumber']
    output_path = os.path.join(output_dir, f"slide{slide_num}_img{i}.png")
    
    print(f"\\n📸 Processing Image {i}/{len(image_opportunities)}")
    print(f"   Slide: {slide_num}")
    print(f"   Purpose: {opp['purpose']}")
    
    success = generate_image(opp['prompt'], output_path, i)
    
    generated_images.append({
        'fileName': os.path.basename(output_path),
        'slideNumber': slide_num,
        'purpose': opp['purpose'],
        'prompt': opp['prompt'],
        'timing': opp['timing'],
        'status': 'generated' if success else 'failed',
        'path': output_path if success else None
    })
    
    # Add delay between requests
    if i < len(image_opportunities):
        import time
        time.sleep(2)

# Save results
results = {
    'totalImages': len(image_opportunities),
    'successfulImages': len([i for i in generated_images if i['status'] == 'generated']),
    'images': generated_images
}

results_path = os.path.join(output_dir, 'generation-results.json')
with open(results_path, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\\n✅ Generation complete: {results['successfulImages']}/{results['totalImages']} images")
`;

    // Save Python script
    const pythonScriptPath = path.join(stage6Path, 'generate_images.py');
    await fs.writeFile(pythonScriptPath, pythonScript);
    
    // Save media plan for Python script
    const mediaPlanPath = path.join(stage6Path, 'media-plan.json');
    await fs.writeFile(mediaPlanPath, JSON.stringify(mediaPlan, null, 2));

    // Track generated media
    const generatedImages: any[] = [];
    const generatedVideos: any[] = [];

    // Generate Images with Imagen 4.0
    console.log(chalk.bold.yellow('🖼️  Generating Images with Imagen 4.0'));
    console.log(chalk.gray('─'.repeat(60)));
    
    try {
      // First check if google-genai is installed
      console.log(chalk.cyan('📦 Checking for google-genai package...'));
      try {
        await execAsync('python3 -c "import google.genai"');
        console.log(chalk.green('   ✓ google-genai package found'));
      } catch {
        console.log(chalk.yellow('   ⚠️  Installing google-genai package...'));
        await execAsync('pip install google-genai');
        console.log(chalk.green('   ✓ google-genai package installed'));
      }
      
      // Run the Python script
      console.log(chalk.cyan('🚀 Running Imagen 4.0 generation...'));
      const { stdout, stderr } = await execAsync(
        `python3 "${pythonScriptPath}" "${mediaPlanPath}" "${stage6ImagesPath}"`,
        { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
      );
      
      if (stdout) {
        console.log(stdout);
      }
      if (stderr && !stderr.includes('WARNING')) {
        console.error(chalk.yellow('Warnings:'), stderr);
      }
      
      // Read the results
      const resultsPath = path.join(stage6ImagesPath, 'generation-results.json');
      const resultsData = await fs.readFile(resultsPath, 'utf-8');
      const results = JSON.parse(resultsData);
      
      // Copy generated images to public folder and update tracking
      for (const img of results.images) {
        if (img.status === 'generated' && img.path) {
          const publicPath = path.join(publicImagesPath, img.fileName);
          await fs.copyFile(img.path, publicPath);
          
          generatedImages.push({
            ...img,
            paths: {
              pipeline: img.path,
              public: `/sessions/${sessionId}/ai-images/${img.fileName}`
            },
            generatedAt: new Date().toISOString()
          });
        } else {
          generatedImages.push({
            ...img,
            status: 'failed',
            generatedAt: new Date().toISOString()
          });
        }
      }
      
      console.log(chalk.green(`✅ Generated ${results.successfulImages}/${results.totalImages} images`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error generating images:'), error);
      console.log(chalk.yellow('Falling back to placeholder generation...'));
      
      // Fallback to placeholders
      const imageOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'image');
      for (let i = 0; i < imageOpportunities.length; i++) {
        const opp = imageOpportunities[i];
        const fileName = `slide${opp.slideNumber}_img${i + 1}_placeholder.txt`;
        const placeholderContent = `Imagen 4.0 Placeholder\nPrompt: ${opp.prompt}\nError: ${error}`;
        
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
          status: 'placeholder',
          error: String(error),
          generatedAt: new Date().toISOString()
        });
      }
    }

    // Generate Video placeholders (Runway integration would go here)
    console.log('');
    console.log(chalk.bold.magenta('🎥 Video Generation'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const videoOpportunities = mediaPlan.opportunities.filter((o: any) => o.type === 'video');
    
    for (let i = 0; i < videoOpportunities.length; i++) {
      const opp = videoOpportunities[i];
      const fileName = `slide${opp.slideNumber}_vid${i + 1}.mp4`;
      
      console.log(chalk.magenta(`\n🎬 Video ${i + 1}/${videoOpportunities.length}`));
      console.log(chalk.gray(`   Purpose: ${opp.purpose}`));
      console.log(chalk.yellow('   Note: Creating placeholder for Runway integration'));
      
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
      mode: 'imagen-4.0',
      images: generatedImages,
      videos: generatedVideos,
      summary: {
        totalImages: generatedImages.length,
        imagesGenerated: generatedImages.filter(i => i.status === 'generated').length,
        totalVideos: generatedVideos.length,
        videosGenerated: generatedVideos.filter(v => v.status === 'generated').length,
        generationTime: new Date().toISOString()
      },
      apis: {
        imagen: 'imagen-4.0-generate-preview-06-06',
        runway: 'placeholder'
      }
    });

    // Display summary
    console.log(chalk.green('✅ Stage 6 Complete!'));
    console.log('');
    console.log(chalk.cyan('📊 Generation Summary:'));
    const successfulImages = generatedImages.filter(i => i.status === 'generated').length;
    console.log(chalk.gray(`  Images: ${successfulImages}/${generatedImages.length} generated`));
    console.log(chalk.gray(`  Videos: ${generatedVideos.length} placeholder(s) created`));
    console.log('');
    
    if (successfulImages > 0) {
      console.log(chalk.green('🎉 Images generated with Imagen 4.0!'));
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
    console.log(chalk.gray('  Stage 10: Video Assembly'));

  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 6:'), error);
    process.exit(1);
  }
}

// Run the test
testStage6Imagen4().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});