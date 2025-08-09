# Video Pipeline

Automated pipeline for converting PowerPoint presentations to professional educational videos with AI-powered narration, text-to-speech, and video generation.

## Features

- **PowerPoint Extraction**: Extract content, speaker notes, and images from PPTX files
- **AI Narration**: Generate engaging narration using GPT-4 or Claude
- **Text-to-Speech**: Convert narration to natural speech with ElevenLabs
- **AI Video Generation**: Create video clips using Runway Gen-3
- **Slide Enhancement**: Improve slide visuals with layouts and graphics
- **Video Assembly**: Combine all elements into final video with Remotion

## Quick Start

```bash
# Install dependencies
npm install

# Configure pipeline
npm run pipeline:config

# Run test
npm run pipeline:test

# Convert a PowerPoint
npm run cli convert presentation.pptx
```

## Configuration

Create a `.env` file with your API keys:

```env
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id
RUNWAY_API_KEY=your_runway_key
```

## CLI Usage

```bash
# Convert with default settings
videopipeline convert presentation.pptx

# Specify output directory and format
videopipeline convert presentation.pptx -o ./videos --format mp4 --resolution 1080p

# Disable specific stages
videopipeline convert presentation.pptx --no-video --no-tts

# Use configuration file
videopipeline convert presentation.pptx -c config.json
```

## Pipeline Stages

1. **Extraction**: Parse PowerPoint content and metadata
2. **Narration**: Generate contextual narration for each slide
3. **Slides**: Enhance slide visuals and layouts
4. **TTS**: Convert narration to speech
5. **Video**: Generate AI video clips for key moments
6. **Assembly**: Combine all elements into final video

## Cost Estimation

| Component | Provider | Cost |
|-----------|----------|------|
| Narration | GPT-4 | ~$0.03 per 1k tokens |
| TTS | ElevenLabs | ~$0.15 per 1k characters |
| Video | Runway Gen-3 | $0.05 per second |

## Architecture

```
PowerPoint → Extraction → Narration → TTS → Video → Assembly → Final Video
                 ↓           ↓         ↓       ↓
              Content    Scripts    Audio   Clips
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API

The pipeline can also be used programmatically:

```typescript
import { PipelineOrchestrator } from '@insightaicamp/videopipeline';

const pipeline = new PipelineOrchestrator(config);
const result = await pipeline.run();
```