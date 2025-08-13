#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import chalk from 'chalk';

async function createNewSession() {
  console.log(chalk.bold.cyan('🚀 Creating New Pipeline Session'));
  console.log(chalk.gray('─'.repeat(50)));
  
  const session = new PipelineSession();
  await session.initialize(
    'Public Slide Demo Video',
    'Testing pipeline with publicly available slides for demo'
  );
  
  console.log(chalk.green(`✅ New session created: ${chalk.bold(session.sessionId)}`));
  console.log(chalk.yellow(`📁 Session path: pipeline-data/sessions/${session.sessionId}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('1. Add your PowerPoint or slide images'));
  console.log(chalk.gray('2. Run each pipeline stage'));
  console.log(chalk.gray('3. Generate final video'));
  console.log('');
  console.log(chalk.bold(`Session ID to remember: ${session.sessionId}`));
}

createNewSession().catch(error => {
  console.error(chalk.red('❌ Failed to create session:'), error);
  process.exit(1);
});