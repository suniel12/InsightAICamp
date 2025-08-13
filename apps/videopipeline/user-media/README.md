# User Media Directory

Place your media files here with the following names:

## Required Images

1. **image1.png** - DNA to Data Center Connection (Slide 1)
   - Purpose: The Central Nervous System of Research
   - Description: Conceptual image showing DNA strand with fiber-optic lines connecting to server rack
   - Recommended resolution: 1920x1080 or higher

2. **image2.png** - Data Center Anatomy (Slide 3)
   - Purpose: Anatomy of a Data Center
   - Description: 3D infographic showing data center components labeled as biological organs
   - Recommended resolution: 1920x1080 or higher

3. **image3.png** - Four Tiers Visualization (Slide 5)
   - Purpose: The Four Tiers of Reliability
   - Description: Concentric glowing shields representing the four data center tiers
   - Recommended resolution: 1920x1080 or higher

## Required Video

1. **video1.mp4** - Data Center Scale (Slide 4)
   - Purpose: Data Center Economies of Scale
   - Duration: 8 seconds
   - Description: Camera pullback from single server to reveal vast data center hall
   - Recommended resolution: 1920x1080 or higher
   - Format: MP4 with H.264 codec

## How to Integrate

Once you have placed all files in this directory, run:

```bash
npx tsx src/scripts/integrate-user-media.ts ps_mNLd3DCJ ./user-media
```

This will:
1. Copy your media files to the pipeline directories
2. Create the media manifest for video assembly
3. Update the session status to mark Stage 6 as complete

## Notes

- File names must match exactly (case-sensitive)
- Supported image formats: PNG, JPG, JPEG
- Supported video formats: MP4
- The pipeline will report any missing files when you run the integration script