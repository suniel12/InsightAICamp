import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

export interface SessionMetadata {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  status: 'initialized' | 'in_progress' | 'completed' | 'failed';
  currentStage: number;
  title?: string;
  description?: string;
  stages: Record<number, StageMetadata>;
}

export interface StageMetadata {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  name: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface SessionStatus {
  sessionId: string;
  currentStage: number;
  completedStages: number[];
  nextStage: number;
  canResume: boolean;
}

export interface SessionSummary {
  sessionId: string;
  created: string;
  lastUpdated: string;
  currentStage: number;
  status: string;
  title?: string;
}

export class PipelineSession {
  public readonly sessionId: string;
  private sessionPath: string;
  private metadata!: SessionMetadata;
  private readonly baseDir = './pipeline-data/sessions';

  constructor(sessionId?: string) {
    if (sessionId) {
      // Resume existing session
      this.sessionId = sessionId;
    } else {
      // Create new session with unique ID
      this.sessionId = this.generateSessionId();
    }
    
    this.sessionPath = path.join(this.baseDir, this.sessionId);
  }

  private generateSessionId(): string {
    // Short, readable ID with prefix
    return `ps_${nanoid(8)}`; // ps = pipeline session, e.g., ps_7x9mN3pQ
  }

  async initialize(title?: string, description?: string): Promise<void> {
    // Create session directory
    await fs.mkdir(this.sessionPath, { recursive: true });

    // Initialize metadata
    this.metadata = {
      sessionId: this.sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'initialized',
      currentStage: 0,
      title: title || `Pipeline Session ${this.sessionId}`,
      description: description || '',
      stages: {
        1: { status: 'pending', name: 'input' },
        2: { status: 'pending', name: 'images' },
        3: { status: 'pending', name: 'personalized-analysis-narration' },
        4: { status: 'pending', name: 'enhanced-ppt' },
        5: { status: 'pending', name: 'script-video-planning' },
        6: { status: 'pending', name: 'ai-videos' },
        7: { status: 'pending', name: 'timeline' },
        8: { status: 'pending', name: 'final-narration' },
        9: { status: 'pending', name: 'tts-audio' },
        10: { status: 'pending', name: 'final-video' }
      }
    };

    await this.saveMetadata();
    console.log(`✅ Session initialized: ${this.sessionId}`);
  }

  async load(): Promise<void> {
    const metadataPath = path.join(this.sessionPath, 'session.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      this.metadata = JSON.parse(data);
      console.log(`✅ Session loaded: ${this.sessionId}`);
    } catch (error) {
      throw new Error(`Session ${this.sessionId} not found. Initialize it first.`);
    }
  }

  async saveStageInput(stageNumber: number, input: any): Promise<void> {
    const stageName = this.metadata.stages[stageNumber]?.name || `stage${stageNumber}`;
    const stagePath = path.join(
      this.sessionPath,
      `stage-${String(stageNumber).padStart(2, '0')}-${stageName}`
    );

    await fs.mkdir(stagePath, { recursive: true });
    await fs.writeFile(
      path.join(stagePath, 'input.json'),
      JSON.stringify(input, null, 2)
    );

    // Update stage status
    this.metadata.stages[stageNumber].status = 'in_progress';
    this.metadata.stages[stageNumber].startedAt = new Date().toISOString();
    this.metadata.updatedAt = new Date().toISOString();
    
    await this.saveMetadata();
  }

  async saveStageOutput(stageNumber: number, output: any, files?: Array<{source: string, name: string}>): Promise<void> {
    const stageName = this.metadata.stages[stageNumber]?.name || `stage${stageNumber}`;
    const stagePath = path.join(
      this.sessionPath,
      `stage-${String(stageNumber).padStart(2, '0')}-${stageName}`
    );

    await fs.mkdir(stagePath, { recursive: true });
    
    // Save JSON output
    await fs.writeFile(
      path.join(stagePath, 'output.json'),
      JSON.stringify(output, null, 2)
    );

    // Copy any files
    if (files) {
      for (const file of files) {
        const destPath = path.join(stagePath, file.name);
        await fs.copyFile(file.source, destPath);
      }
    }

    // Update metadata
    this.metadata.stages[stageNumber].status = 'completed';
    this.metadata.stages[stageNumber].completedAt = new Date().toISOString();
    this.metadata.currentStage = stageNumber;
    this.metadata.status = 'in_progress';
    this.metadata.updatedAt = new Date().toISOString();

    // Check if all stages are complete
    const allComplete = Object.values(this.metadata.stages).every(
      stage => stage.status === 'completed'
    );
    if (allComplete) {
      this.metadata.status = 'completed';
    }

    await this.saveMetadata();
    console.log(`✅ Stage ${stageNumber} (${stageName}) completed for session ${this.sessionId}`);
  }

  async getStageInput(stageNumber: number): Promise<any> {
    const stageName = this.metadata.stages[stageNumber]?.name || `stage${stageNumber}`;
    const inputPath = path.join(
      this.sessionPath,
      `stage-${String(stageNumber).padStart(2, '0')}-${stageName}`,
      'input.json'
    );

    try {
      const data = await fs.readFile(inputPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async getStageOutput(stageNumber: number): Promise<any> {
    const stageName = this.metadata.stages[stageNumber]?.name || `stage${stageNumber}`;
    const outputPath = path.join(
      this.sessionPath,
      `stage-${String(stageNumber).padStart(2, '0')}-${stageName}`,
      'output.json'
    );

    try {
      const data = await fs.readFile(outputPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Stage ${stageNumber} output not found. Complete this stage first.`);
    }
  }

  async getStagePath(stageNumber: number): Promise<string> {
    const stageName = this.metadata.stages[stageNumber]?.name || `stage${stageNumber}`;
    return path.join(
      this.sessionPath,
      `stage-${String(stageNumber).padStart(2, '0')}-${stageName}`
    );
  }

  getStatus(): SessionStatus {
    const completedStages = Object.entries(this.metadata.stages)
      .filter(([_, stage]) => stage.status === 'completed')
      .map(([num, _]) => parseInt(num));

    const nextStage = this.metadata.currentStage + 1;
    const canResume = nextStage <= 10 && this.metadata.status !== 'completed';

    return {
      sessionId: this.sessionId,
      currentStage: this.metadata.currentStage,
      completedStages,
      nextStage,
      canResume
    };
  }

  async prepareForRemotion(): Promise<string> {
    // CRITICAL: Remotion requires all assets in public folder for HTTP access
    // This method copies assets from pipeline storage to public folder
    // See docs/REMOTION-ASSETS.md for detailed explanation
    const publicPath = path.join('./public/sessions', this.sessionId);
    await fs.mkdir(publicPath, { recursive: true });

    // Copy images from stage 2
    const imagesPath = await this.getStagePath(2);
    const imagesTarget = path.join(publicPath, 'images');
    await fs.cp(imagesPath, imagesTarget, { recursive: true, force: true });

    // Copy audio from stage 11
    try {
      const audioPath = await this.getStagePath(11);
      const audioTarget = path.join(publicPath, 'audio');
      await fs.cp(audioPath, audioTarget, { recursive: true, force: true });
    } catch {
      // Audio might not be ready yet
    }

    console.log(`✅ Files prepared for Remotion at: ${publicPath}`);
    return publicPath;
  }

  private async saveMetadata(): Promise<void> {
    const metadataPath = path.join(this.sessionPath, 'session.json');
    await fs.writeFile(
      metadataPath,
      JSON.stringify(this.metadata, null, 2)
    );
  }
}

export class SessionManager {
  private static readonly baseDir = './pipeline-data/sessions';

  static async listSessions(): Promise<SessionSummary[]> {
    await fs.mkdir(this.baseDir, { recursive: true });
    
    const sessionDirs = await fs.readdir(this.baseDir);
    const summaries: SessionSummary[] = [];

    for (const sessionId of sessionDirs) {
      try {
        const metadataPath = path.join(this.baseDir, sessionId, 'session.json');
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: SessionMetadata = JSON.parse(data);

        summaries.push({
          sessionId,
          created: metadata.createdAt,
          lastUpdated: metadata.updatedAt,
          currentStage: metadata.currentStage,
          status: metadata.status,
          title: metadata.title
        });
      } catch {
        // Skip invalid sessions
      }
    }

    return summaries.sort((a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  static async getRecentSession(): Promise<string | null> {
    const sessions = await this.listSessions();
    return sessions[0]?.sessionId || null;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.baseDir, sessionId);
    await fs.rm(sessionPath, { recursive: true, force: true });
    
    // Also remove from public if exists
    const publicPath = path.join('./public/sessions', sessionId);
    await fs.rm(publicPath, { recursive: true, force: true }).catch(() => {});
    
    console.log(`🗑️  Session ${sessionId} deleted`);
  }

  static async cleanOldSessions(daysOld: number = 7): Promise<void> {
    const sessions = await this.listSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    for (const session of sessions) {
      if (new Date(session.lastUpdated) < cutoffDate) {
        await this.deleteSession(session.sessionId);
      }
    }
  }
}