#!/usr/bin/env tsx

import { PipelineSession, SessionManager } from '../lib/session-manager';
import chalk from 'chalk';
import * as path from 'path';

/**
 * Test script to demonstrate session management for the pipeline
 */
async function testSessionManager() {
  console.log(chalk.bold.cyan('🧪 Testing Pipeline Session Manager'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');

  // Step 1: Create a new session
  console.log(chalk.yellow('📁 Creating new session...'));
  const session = new PipelineSession();
  await session.initialize(
    'Data Center Education Video',
    'Test session for pipeline development'
  );
  
  const sessionId = session.sessionId;
  console.log(chalk.green(`✅ Session created: ${chalk.bold(sessionId)}`));
  console.log('');

  // Step 2: Save Stage 1 - Input PowerPoint
  console.log(chalk.yellow('💾 Saving Stage 1 - PowerPoint Input...'));
  await session.saveStageInput(1, {
    fileName: 'data-center-intro.pptx',
    uploadedAt: new Date().toISOString()
  });
  
  await session.saveStageOutput(1, {
    path: 'presentation.pptx',
    fileSize: 5242880,
    slideCount: 5
  });
  console.log(chalk.green('✅ Stage 1 completed'));
  console.log('');

  // Step 3: Save Stage 2 - Exported Images
  console.log(chalk.yellow('🖼️  Saving Stage 2 - Exported Images...'));
  await session.saveStageInput(2, {
    sourceFile: 'presentation.pptx',
    resolution: '4000x2250'
  });
  
  await session.saveStageOutput(2, {
    images: [
      'slide_001.png',
      'slide_002.png',
      'slide_003.png',
      'slide_004.png',
      'slide_005.png'
    ],
    resolution: '4000x2250',
    format: 'png'
  });
  console.log(chalk.green('✅ Stage 2 completed'));
  console.log('');

  // Step 4: Check session status
  console.log(chalk.yellow('📊 Checking session status...'));
  const status = session.getStatus();
  console.log(chalk.gray(`  Session ID: ${status.sessionId}`));
  console.log(chalk.gray(`  Current Stage: ${status.currentStage}`));
  console.log(chalk.gray(`  Completed Stages: ${status.completedStages.join(', ')}`));
  console.log(chalk.gray(`  Next Stage: ${status.nextStage}`));
  console.log(chalk.gray(`  Can Resume: ${status.canResume}`));
  console.log('');

  // Step 5: Simulate resuming the session later
  console.log(chalk.yellow('🔄 Simulating session resume...'));
  console.log(chalk.gray(`  (Imagine this is a different day/time)`));
  
  const resumedSession = new PipelineSession(sessionId);
  await resumedSession.load();
  
  const resumedStatus = resumedSession.getStatus();
  console.log(chalk.green(`✅ Session resumed at stage ${resumedStatus.currentStage}`));
  console.log('');

  // Step 6: Retrieve previous stage output
  console.log(chalk.yellow('📖 Reading Stage 2 output...'));
  const stage2Output = await resumedSession.getStageOutput(2);
  console.log(chalk.gray(`  Images found: ${stage2Output.images.length}`));
  console.log(chalk.gray(`  Image files: ${stage2Output.images.join(', ')}`));
  console.log('');

  // Step 7: Save Stage 3 - Analysis (example)
  console.log(chalk.yellow('🔍 Saving Stage 3 - Slide Analysis...'));
  await resumedSession.saveStageInput(3, {
    images: stage2Output.images,
    analysisModel: 'gpt-4-vision'
  });
  
  await resumedSession.saveStageOutput(3, {
    slides: [
      {
        number: 1,
        title: 'Introduction to Data Centers',
        keyPoints: ['Physical infrastructure', 'Global scale', 'Critical systems'],
        concepts: ['data center', 'infrastructure', 'servers'],
        complexity: 'moderate'
      }
    ]
  });
  console.log(chalk.green('✅ Stage 3 completed'));
  console.log('');

  // Step 8: List all sessions
  console.log(chalk.yellow('📋 Listing all sessions...'));
  const allSessions = await SessionManager.listSessions();
  
  for (const sessionSummary of allSessions) {
    console.log(chalk.gray(`  ${sessionSummary.sessionId}:`));
    console.log(chalk.gray(`    Title: ${sessionSummary.title}`));
    console.log(chalk.gray(`    Created: ${new Date(sessionSummary.created).toLocaleString()}`));
    console.log(chalk.gray(`    Stage: ${sessionSummary.currentStage}/12`));
    console.log(chalk.gray(`    Status: ${sessionSummary.status}`));
  }
  console.log('');

  // Step 9: Get stage paths
  console.log(chalk.yellow('📁 Getting stage paths...'));
  const stage2Path = await resumedSession.getStagePath(2);
  console.log(chalk.gray(`  Stage 2 path: ${stage2Path}`));
  console.log('');

  // Step 10: Prepare for Remotion (example)
  console.log(chalk.yellow('🎬 Preparing files for Remotion...'));
  const remotionPath = await resumedSession.prepareForRemotion();
  console.log(chalk.gray(`  Remotion public path: ${remotionPath}`));
  console.log('');

  // Summary
  console.log(chalk.bold.green('✅ Session Manager Test Complete!'));
  console.log('');
  console.log(chalk.cyan('📝 Key Points:'));
  console.log(chalk.gray(`  • Session ID stays constant: ${sessionId}`));
  console.log(chalk.gray(`  • Can resume from any stage`));
  console.log(chalk.gray(`  • All data persisted to pipeline-data/sessions/`));
  console.log(chalk.gray(`  • Files auto-copied to public/ for Remotion`));
  console.log('');
  
  console.log(chalk.yellow('💡 Next Steps:'));
  console.log(chalk.gray(`  1. Use session ID "${sessionId}" to continue`));
  console.log(chalk.gray(`  2. Run each pipeline stage independently`));
  console.log(chalk.gray(`  3. Check outputs in pipeline-data/sessions/${sessionId}/`));
}

// Run the test
testSessionManager().catch(error => {
  console.error(chalk.red('❌ Test failed:'), error);
  process.exit(1);
});