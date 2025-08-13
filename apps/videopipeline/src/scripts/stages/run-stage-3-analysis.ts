#!/usr/bin/env tsx

import { VisualAnalyzer, UserContext } from '../stages/analysis/visual-analyzer';
import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testStage3Analysis() {
  const sessionId = 'ps_mNLd3DCJ'; // Your current demo session
  
  console.log(chalk.bold.cyan('🔍 Testing Stage 3: Personalized Slide Analysis & Narration'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.yellow(`Session: ${sessionId}`));
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
    
    console.log(chalk.cyan(`📊 Found ${slideImages.length} slides to analyze`));
    slideImages.forEach((img, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${path.basename(img)}`));
    });
    console.log('');

    // Define user context (you can customize this)
    const userContext: UserContext = {
      background: 'General audience with basic tech knowledge',
      expertise: 'beginner',
      industry: 'Technology/Education',
      goals: 'Learn about data center fundamentals'
    };

    console.log(chalk.cyan('👤 User Context:'));
    console.log(chalk.gray(`  Background: ${userContext.background}`));
    console.log(chalk.gray(`  Expertise: ${userContext.expertise}`));
    console.log(chalk.gray(`  Industry: ${userContext.industry}`));
    console.log(chalk.gray(`  Goals: ${userContext.goals}`));
    console.log('');

    // Initialize the visual analyzer
    const analyzer = new VisualAnalyzer(process.env.OPENAI_API_KEY);
    
    // Save Stage 3 input
    await session.saveStageInput(3, {
      images: stage2Output.images,
      userContext,
      analysisModel: 'gpt-4o',
      timestamp: new Date().toISOString()
    });

    console.log(chalk.yellow('🤖 Sending images to OpenAI Vision API...'));
    console.log(chalk.gray('  Model: gpt-4o'));
    console.log(chalk.gray('  This may take a moment...'));
    console.log('');

    // Analyze slides
    const analyses = await analyzer.analyzeSlides(slideImages, userContext);
    
    console.log(chalk.green('✅ Analysis complete!'));
    console.log('');
    
    // Display results
    console.log(chalk.bold.cyan('📝 Analysis Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    analyses.forEach((analysis, index) => {
      console.log('');
      console.log(chalk.bold.yellow(`Slide ${analysis.slideNumber}: ${analysis.title}`));
      console.log(chalk.gray(`Complexity: ${analysis.complexity}`));
      
      if (analysis.keyPoints.length > 0) {
        console.log(chalk.cyan('Key Points:'));
        analysis.keyPoints.forEach(point => {
          console.log(chalk.gray(`  • ${point}`));
        });
      }
      
      if (analysis.visualElements.length > 0) {
        console.log(chalk.cyan('Visual Elements:'));
        analysis.visualElements.forEach(element => {
          console.log(chalk.gray(`  • ${element}`));
        });
      }
      
      if (analysis.concepts.length > 0) {
        console.log(chalk.cyan('Concepts to Explain:'));
        analysis.concepts.forEach(concept => {
          console.log(chalk.gray(`  • ${concept}`));
        });
      }
      
      if (analysis.narrativeFocus) {
        console.log(chalk.cyan('Narrative Focus:'));
        console.log(chalk.gray(`  ${analysis.narrativeFocus}`));
      }
    });
    
    // Save Stage 3 output
    await session.saveStageOutput(3, {
      analyses,
      userContext,
      totalSlides: analyses.length,
      generatedAt: new Date().toISOString(),
      status: 'completed'
    });
    
    // Also save as readable text
    const analysisText = analyses.map(a => 
      `Slide ${a.slideNumber}: ${a.title}\n` +
      `Complexity: ${a.complexity}\n` +
      `Key Points:\n${a.keyPoints.map(p => `  • ${p}`).join('\n')}\n` +
      `Visual Elements:\n${a.visualElements.map(e => `  • ${e}`).join('\n')}\n` +
      `Concepts:\n${a.concepts.map(c => `  • ${c}`).join('\n')}\n` +
      `Narrative Focus: ${a.narrativeFocus}\n`
    ).join('\n---\n\n');
    
    await fs.writeFile(
      path.join('pipeline-data/sessions', sessionId, 'stage-03-personalized-analysis-narration', 'analysis.txt'),
      analysisText
    );
    
    console.log('');
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green('✅ Stage 3 completed successfully!'));
    console.log(chalk.yellow(`📁 Results saved to: pipeline-data/sessions/${sessionId}/stage-03-personalized-analysis-narration/`));
    console.log('');
    console.log(chalk.cyan('Next Step: Generate personalized narration based on this analysis'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error in Stage 3:'), error);
    process.exit(1);
  }
}

// Run the test
testStage3Analysis().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});