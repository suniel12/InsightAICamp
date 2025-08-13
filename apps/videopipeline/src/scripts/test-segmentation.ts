#!/usr/bin/env tsx

import { NarrationSegmenter } from '../stages/segmentation/narration-segmenter';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function testSegmentation() {
  console.log(chalk.bold.cyan('🧪 Testing Narration Segmentation'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  try {
    // Initialize segmenter
    const segmenter = new NarrationSegmenter({
      sessionId: SESSION_ID,
      sessionDir
    });

    // Test segmentation
    console.log(chalk.yellow('\n1. Testing narration segmentation...'));
    const narrationSegments = await segmenter.segmentNarration();
    
    // Display results
    console.log(chalk.green(`\n✅ Successfully segmented narration into ${narrationSegments.length} segments\n`));
    
    let totalDuration = 0;
    
    for (const segment of narrationSegments) {
      console.log(chalk.cyan(`📄 ${segment.id}`));
      console.log(chalk.gray(`   Slide: ${segment.slideNumber} | Type: ${segment.contentType}`));
      console.log(chalk.gray(`   Time: ${segment.startTime.toFixed(1)}s - ${segment.endTime.toFixed(1)}s (${segment.duration.toFixed(1)}s)`));
      console.log(chalk.gray(`   Pace: ${segment.pace} | Key terms: ${segment.keyTerms.join(', ')}`));
      console.log(chalk.white(`   Text: "${segment.narrationText.substring(0, 100)}${segment.narrationText.length > 100 ? '...' : ''}"`));
      console.log();
      
      totalDuration += segment.duration;
    }
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Total Duration: ${totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`Average Segment: ${(totalDuration / narrationSegments.length).toFixed(1)}s`));

    // Test audio segment conversion
    console.log(chalk.yellow('\n2. Testing audio segment conversion...'));
    const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);
    
    console.log(chalk.green(`✅ Created ${audioSegmentTemplates.length} audio segment templates`));
    
    // Show first few audio segments
    console.log(chalk.cyan('\nFirst 3 audio segment templates:'));
    for (let i = 0; i < Math.min(3, audioSegmentTemplates.length); i++) {
      const segment = audioSegmentTemplates[i];
      console.log(chalk.gray(`  ${segment.id}: ${segment.contentType} (${segment.narrationText.substring(0, 50)}...)`));
    }

    // Save test results
    console.log(chalk.yellow('\n3. Saving test results...'));
    const testOutputDir = path.join(sessionDir, 'test-segmentation');
    const outputPath = await segmenter.saveSegments(narrationSegments, testOutputDir);
    
    // Create audio segment templates file
    const audioTemplatesPath = path.join(testOutputDir, 'audio-segment-templates.json');
    await fs.writeFile(audioTemplatesPath, JSON.stringify({
      sessionId: SESSION_ID,
      createdAt: new Date().toISOString(),
      templates: audioSegmentTemplates
    }, null, 2));

    console.log(chalk.green('✅ Test results saved successfully!'));
    console.log(chalk.gray(`   Narration segments: ${outputPath}`));
    console.log(chalk.gray(`   Audio templates: ${audioTemplatesPath}`));

    // Validate against expected structure
    console.log(chalk.yellow('\n4. Validation checks...'));
    
    const validationResults = {
      segmentCount: narrationSegments.length,
      expectedSlides: [1, 2, 3, 4, 5],
      actualSlides: [...new Set(narrationSegments.map(s => s.slideNumber))].sort(),
      timeGaps: [],
      overlaps: [],
      totalDuration: totalDuration
    };

    // Check for time gaps or overlaps
    for (let i = 0; i < narrationSegments.length - 1; i++) {
      const current = narrationSegments[i];
      const next = narrationSegments[i + 1];
      
      const gap = next.startTime - current.endTime;
      if (Math.abs(gap) > 0.1) { // More than 0.1 second difference
        if (gap > 0) {
          validationResults.timeGaps.push({
            between: `${current.id} and ${next.id}`,
            gap: gap.toFixed(2)
          });
        } else {
          validationResults.overlaps.push({
            between: `${current.id} and ${next.id}`,
            overlap: Math.abs(gap).toFixed(2)
          });
        }
      }
    }

    // Report validation
    if (validationResults.timeGaps.length === 0 && validationResults.overlaps.length === 0) {
      console.log(chalk.green('✅ All segments have proper timing continuity'));
    } else {
      if (validationResults.timeGaps.length > 0) {
        console.log(chalk.yellow(`⚠️  Found ${validationResults.timeGaps.length} time gaps:`));
        validationResults.timeGaps.forEach(gap => {
          console.log(chalk.gray(`   ${gap.between}: ${gap.gap}s gap`));
        });
      }
      
      if (validationResults.overlaps.length > 0) {
        console.log(chalk.red(`❌ Found ${validationResults.overlaps.length} overlaps:`));
        validationResults.overlaps.forEach(overlap => {
          console.log(chalk.gray(`   ${overlap.between}: ${overlap.overlap}s overlap`));
        });
      }
    }

    // Check slide coverage
    const missingSlides = validationResults.expectedSlides.filter(
      slide => !validationResults.actualSlides.includes(slide)
    );
    
    if (missingSlides.length === 0) {
      console.log(chalk.green('✅ All expected slides are covered'));
    } else {
      console.log(chalk.red(`❌ Missing slides: ${missingSlides.join(', ')}`));
    }

    // Save validation results
    const validationPath = path.join(testOutputDir, 'validation-results.json');
    await fs.writeFile(validationPath, JSON.stringify(validationResults, null, 2));
    
    console.log(chalk.green('\n🎉 Segmentation test completed successfully!'));
    console.log(chalk.gray(`Validation results: ${validationPath}`));
    
    return {
      success: true,
      segmentCount: narrationSegments.length,
      totalDuration,
      validationResults
    };

  } catch (error) {
    console.error(chalk.red('\n❌ Segmentation test failed:'), error);
    
    const errorPath = path.join(sessionDir, 'test-segmentation-error.json');
    await fs.writeFile(errorPath, JSON.stringify({
      sessionId: SESSION_ID,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2));
    
    throw error;
  }
}

// Run the test
testSegmentation().catch(error => {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
});