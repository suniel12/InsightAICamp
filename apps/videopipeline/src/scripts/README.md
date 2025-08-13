# Pipeline Scripts

This directory contains all the scripts for running the video generation pipeline.

## Main Pipeline (Recommended)

### Complete Pipeline
- **`run-pipeline.ts`** - Complete unified pipeline (stages 8-11) with segmented audio
  ```bash
  npx tsx src/scripts/run-pipeline.ts
  ```
  ✅ **Latest working version** - Generates perfect audio-video synchronization

- **`run-segmented-pipeline.ts`** - Alternative segmented pipeline runner
  ```bash  
  npx tsx src/scripts/run-segmented-pipeline.ts
  ```

## Stage-by-Stage Execution (For Demos)

For creating demo videos and debugging individual stages, run these in sequence:

### Prerequisites
1. **Session Setup**: Create a new session first
   ```bash
   npx tsx src/scripts/create-new-session.ts
   ```

2. **User Media Integration** (Optional): Add custom images/videos
   ```bash
   npx tsx src/scripts/integrate-user-media.ts [sessionId] [mediaDir]
   ```

### Pipeline Stages
Run these stages in order:

```bash
# Stage 3: Visual Analysis
npx tsx src/scripts/stages/run-stage-3-analysis.ts

# Stage 5: Narration Generation  
npx tsx src/scripts/stages/run-stage-5-narration.ts

# Stage 6: AI Image Generation (Imagen 4 - works well)
npx tsx src/scripts/stages/run-stage-6-imagen.ts

# Stage 7: Timeline Creation
npx tsx src/scripts/stages/run-stage-7-timeline.ts

# Stage 8: Narration Processing
npx tsx src/scripts/stages/run-stage-8-narration.ts

# Stage 9: Text-to-Speech
npx tsx src/scripts/stages/run-stage-9-tts.ts

# Stage 10: Video Assembly
npx tsx src/scripts/stages/run-stage-10-assembly.ts
```

## Utilities

- **`test-segmentation.ts`** - Test narration segmentation
  ```bash
  npx tsx src/scripts/test-segmentation.ts
  ```

## Archive

The `archive/` directory contains historical scripts:

- **`alternative-stage-runners/`** - Alternative versions of stage runners
- **`test-experiments/`** - Experimental test scripts for different providers
- **`utilities/`** - Debug and utility scripts

### Why Keep Archives?
- **Historical Reference**: Track evolution of the pipeline
- **Provider Alternatives**: Different AI service providers tested
- **Debugging**: Alternative implementations for troubleshooting

## Configuration

Ensure your `.env` file contains:
```env
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key  
ELEVENLABS_VOICE_ID=your_voice_id
RUNWAY_API_KEY=your_runway_key
GOOGLE_CLOUD_PROJECT=your_project_id
```

## Success Rate

✅ **Working Scripts**: Main pipeline + all stage scripts in `stages/` directory  
⚠️ **Experimental**: Scripts in `archive/` - use with caution

## Recent Success

Latest successful video generated: 
- **File**: `output/video-output/segmented_video_2025-08-13T17-23-01-765Z.mp4`  
- **Duration**: 288.4s (4.8 minutes)
- **Quality**: Perfect audio-video sync with segmented audio
- **Generated**: August 13, 2025