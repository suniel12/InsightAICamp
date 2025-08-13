#!/usr/bin/env tsx

import { BatchAnalyzer, UserContext } from '../stages/analysis/batch-analyzer';
import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStage3Batch() {
  const sessionId = 'ps_mNLd3DCJ'; // Current demo session
  
  console.log(chalk.bold.cyan('🚀 Testing Stage 3: Batch Analysis with GPT-5 Nano'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found in environment variables'));
    console.log(chalk.yellow('Please add OPENAI_API_KEY to your .env file'));
    process.exit(1);
  }

  try {
    // Load the session
    const session = new PipelineSession(sessionId);
    await session.load();
    
    // Get slide images from Stage 2
    const stage2Output = await session.getStageOutput(2);
    const slideImages = stage2Output.images.map((img: string) => 
      path.join('pipeline-data/sessions', sessionId, 'stage-02-images', img)
    );
    
    console.log(chalk.cyan(`📊 Found ${slideImages.length} slides for batch analysis`));
    slideImages.forEach((img, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${path.basename(img)}`));
    });
    console.log('');

    // Load user context
    let userContext: UserContext;
    const contextPath = path.join('pipeline-data/sessions', sessionId, 'user-context.json');
    
    try {
      const contextData = await fs.readFile(contextPath, 'utf-8');
      const fullContext = JSON.parse(contextData);
      
      userContext = {
        background: fullContext.background,
        expertise: fullContext.expertise as 'beginner' | 'intermediate' | 'expert',
        industry: fullContext.industry,
        goals: fullContext.goals
      };
      
      console.log(chalk.green('✅ Loaded user context'));
      console.log(chalk.cyan('👤 User Profile:'));
      console.log(chalk.gray(`  Background: ${userContext.background}`));
      console.log(chalk.gray(`  Expertise: ${userContext.expertise}`));
      console.log(chalk.gray(`  Industry: ${userContext.industry}`));
      console.log(chalk.gray(`  Goals: ${userContext.goals}`));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Using default user context'));
      
      userContext = {
        background: 'General audience',
        expertise: 'beginner',
        industry: 'Technology',
        goals: 'Learn data center fundamentals'
      };
    }
    
    console.log('');
    console.log(chalk.gray('─'.repeat(60)));

    // Initialize the batch analyzer
    const analyzer = new BatchAnalyzer(process.env.OPENAI_API_KEY);
    
    // Save Stage 3 input
    await session.saveStageInput(3, {
      images: stage2Output.images,
      userContext,
      analysisModel: 'gpt-5-nano',
      analysisType: 'batch',
      timestamp: new Date().toISOString()
    });

    console.log(chalk.yellow('🤖 Sending all slides to GPT-5 Nano in single batch...'));
    console.log(chalk.gray('   Model: GPT-5 Nano (Latest)'));
    console.log(chalk.gray('   Processing: All 6 slides with full context'));
    console.log('');

    // Perform batch analysis
    const startTime = Date.now();
    const analysis = await analyzer.analyzePresentationBatch(slideImages, userContext);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(chalk.green(`✅ Batch analysis complete in ${duration} seconds!`));
    console.log('');
    
    // Display results
    console.log(chalk.bold.cyan('📝 Presentation Overview:'));
    console.log(chalk.gray(analysis.presentationOverview));
    console.log('');
    console.log(chalk.cyan(`📊 Total Slides: ${analysis.totalSlides}`));
    console.log(chalk.cyan(`⏱️  Suggested Duration: ${analysis.suggestedDuration}`));
    console.log('');
    
    console.log(chalk.bold.cyan('📑 Slide-by-Slide Analysis:'));
    console.log(chalk.gray('─'.repeat(60)));
    
    analysis.slides.forEach((slide) => {
      console.log('');
      console.log(chalk.bold.yellow(`Slide ${slide.slideNumber}: ${slide.title}`));
      console.log(chalk.gray(`Complexity: ${slide.complexity}`));
      
      if (slide.connectionToPrevious) {
        console.log(chalk.magenta(`↩️  From Previous: ${slide.connectionToPrevious}`));
      }
      
      if (slide.keyPoints.length > 0) {
        console.log(chalk.cyan('Key Points:'));
        slide.keyPoints.forEach(point => {
          console.log(chalk.gray(`  • ${point}`));
        });
      }
      
      if (slide.biologicalAnalogies && slide.biologicalAnalogies.length > 0) {
        console.log(chalk.green('🧬 Biological Analogies:'));
        slide.biologicalAnalogies.forEach(analogy => {
          console.log(chalk.gray(`  • ${analogy}`));
        });
      }
      
      if (slide.narrativeFocus) {
        console.log(chalk.cyan('📝 Narrative Focus:'));
        console.log(chalk.gray(`  ${slide.narrativeFocus}`));
      }
      
      if (slide.connectionToNext) {
        console.log(chalk.magenta(`↪️  To Next: ${slide.connectionToNext}`));
      }
    });
    
    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.bold.cyan('🎯 Overall Narrative Arc:'));
    console.log(chalk.gray(analysis.overallNarrativeArc));
    console.log('');
    
    // Generate narration script
    console.log(chalk.yellow('📝 Generating personalized narration script...'));
    const narrationScript = analyzer.generateNarrationScript(analysis, userContext);
    
    // Create Stage 3 output directory
    const stage3Path = path.join('pipeline-data/sessions', sessionId, 'stage-03-personalized-analysis-narration');
    await fs.mkdir(stage3Path, { recursive: true });
    
    // Save all outputs
    await session.saveStageOutput(3, {
      analysis,
      userContext,
      generatedAt: new Date().toISOString(),
      duration: `${duration} seconds`,
      model: 'gpt-5-nano',
      status: 'completed'
    });
    
    // Save analysis as readable text
    const analysisText = JSON.stringify(analysis, null, 2);
    await fs.writeFile(
      path.join(stage3Path, 'analysis.json'),
      analysisText
    );
    
    // Save narration script
    await fs.writeFile(
      path.join(stage3Path, 'narration.md'),
      narrationScript
    );
    
    // Create summary text file
    const summaryText = `
Batch Analysis Summary
======================
Session: ${sessionId}
Model: GPT-5 Nano
Date: ${new Date().toISOString()}
Duration: ${duration} seconds

User Context:
- Background: ${userContext.background}
- Expertise: ${userContext.expertise}
- Industry: ${userContext.industry}
- Goals: ${userContext.goals}

Presentation Overview:
${analysis.presentationOverview}

Total Slides: ${analysis.totalSlides}
Suggested Duration: ${analysis.suggestedDuration}

Slide Analysis:
${analysis.slides.map(s => `
Slide ${s.slideNumber}: ${s.title}
- Complexity: ${s.complexity}
- Key Points: ${s.keyPoints.length} items
- Biological Analogies: ${s.biologicalAnalogies?.length || 0} items
- Narrative Focus: ${s.narrativeFocus}
`).join('\n')}

Overall Narrative Arc:
${analysis.overallNarrativeArc}
    `.trim();
    
    await fs.writeFile(
      path.join(stage3Path, 'summary.txt'),
      summaryText
    );
    
    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.green('✅ Stage 3 Batch Analysis Complete!'));
    console.log('');
    console.log(chalk.cyan('📁 Output files saved:'));
    console.log(chalk.gray(`  • output.json - Full analysis data`));
    console.log(chalk.gray(`  • analysis.json - Structured analysis`));
    console.log(chalk.gray(`  • narration.md - Personalized script`));
    console.log(chalk.gray(`  • summary.txt - Quick overview`));
    console.log('');
    console.log(chalk.yellow(`📍 Location: ${stage3Path}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Review the generated narration script'));
    console.log(chalk.gray('  2. Proceed to Stage 4 (Enhanced PPT) or skip to Stage 5'));
    console.log(chalk.gray('  3. Generate media opportunities and timeline'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 3 Batch Analysis:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('Details:'), error.message);
      if (error.message.includes('model')) {
        console.log(chalk.yellow('Note: Make sure GPT-5 Nano is available in your OpenAI account'));
      }
    }
    process.exit(1);
  }
}

// Run the test
testStage3Batch().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});