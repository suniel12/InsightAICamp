# InsightAICamp - AI-Powered Educational Content Platform

A monorepo containing the landing page and automated video generation pipeline for creating educational courses at scale.

## 🏗️ Project Structure

```
InsightAICamp/
├── apps/
│   ├── landing/          # Marketing website and demo videos
│   └── videopipeline/    # Automated course generation pipeline
├── packages/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
└── content/             # Course content and assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for PPT extraction)
- LibreOffice (for slide conversion)
- FFmpeg (for video processing)

### Installation

```bash
# Install all dependencies
npm install

# Install Python dependencies for PPT extraction
pip install python-pptx
```

### Development

```bash
# Run landing page
npm run dev:landing

# Run video pipeline
npm run dev:pipeline

# Run both simultaneously
npm run dev:all
```

## 📁 Applications

### Landing Page (`apps/landing`)
- Marketing website built with React, Vite, TypeScript
- 3D demo videos using Remotion and React Three Fiber
- Course previews and testimonials
- Job board with 150+ cached data center positions
- Blog system with MDX support for content management

### Video Pipeline (`apps/videopipeline`)
Automated pipeline that converts PowerPoint/PDF to professional video courses:

1. **Extraction** - Parse PPT/PDF content
2. **Narration** - Generate scripts using AI (GPT-4)
3. **Slides** - Enhance visual presentation
4. **TTS** - Convert text to speech (ElevenLabs)
5. **Video** - Generate AI videos for key concepts (Runway Gen-3)
6. **Assembly** - Combine into final video using Remotion

## 🛠️ Available Scripts

```bash
# Development
npm run dev:landing      # Start landing page dev server
npm run dev:pipeline     # Start pipeline dev server
npm run dev:all         # Start both apps

# Building
npm run build           # Build all packages and apps
npm run build:landing   # Build landing page only
npm run build:pipeline  # Build pipeline only

# Pipeline Operations
npm run pipeline:start  # Start pipeline API
npm run pipeline:worker # Start background workers

# Remotion
npm run remotion:studio # Open Remotion Studio for video editing

# Jobs Data Management (Landing Page)
npm run export:jobs     # Export SQLite jobs to static JSON
npm run refresh:jobs    # Fetch new jobs from Adzuna + export to JSON
```

## 🔄 Weekly Jobs Data Refresh

The landing page displays cached job data from Adzuna API. To keep the data fresh:

### Refresh Jobs Weekly
```bash
cd apps/landing
npm run refresh:jobs
```

This command will:
1. Fetch latest jobs from Adzuna API (requires API credentials)
2. Update the SQLite database (`data/datacenter_jobs.db`)
3. Export to static JSON (`src/data/cachedJobs.json`)
4. No backend server needed for display - just static JSON!

### Manual Export Only
If you've updated the database manually and just need to export:
```bash
npm run export:jobs
```

The jobs page will show a warning if data is older than 7 days.

## 🎯 Pipeline Usage

### Basic Usage

```javascript
import { VideoPipeline } from '@insightaicamp/videopipeline';

const pipeline = new VideoPipeline({
  llm: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  },
  tts: {
    provider: 'elevenlabs',
    voiceId: 'voice-id',
    apiKey: process.env.ELEVENLABS_API_KEY
  },
  videoGen: {
    provider: 'runway',
    apiKey: process.env.RUNWAY_API_KEY,
    maxVideosPerCourse: 5,
    maxDurationPerVideo: 10
  },
  output: {
    format: 'mp4',
    resolution: '1080p',
    fps: 30
  }
});

// Process a single course
const outputPath = await pipeline.processCourse(pptFile, 'ppt');
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective app directories:

```bash
# apps/videopipeline/.env
OPENAI_API_KEY=your-key
ELEVENLABS_API_KEY=your-key
RUNWAY_API_KEY=your-key
```

## 📦 Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn-ui, Remotion, React Three Fiber
- **Pipeline**: Node.js, TypeScript, BullMQ, Express
- **AI Services**: OpenAI GPT-4, ElevenLabs, Runway Gen-3
- **Infrastructure**: Docker, Kubernetes (optional)

## 🚢 Deployment

### Landing Page (Lovable/Vercel)
```bash
cd apps/landing
npm run build
# Deploy dist/ to Lovable or Vercel
```

### Video Pipeline (Docker/Cloud Run)
```bash
cd apps/videopipeline
npm run build
docker build -t videopipeline .
# Deploy to Google Cloud Run, AWS ECS, or your preferred platform
```

## 📝 License

Private - All rights reserved

## 🤝 Contributing

Internal project - Please follow the established patterns and conventions.
