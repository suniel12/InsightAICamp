
// This is the composition that would be used by Remotion
// It defines how the slides and audio are combined into a video

export const VideoComposition = {
  slides: ["Slide1.png","Slide2.png","Slide3.png","Slide4.png","Slide5.png"],
  audio: [{"slideNumber":1,"file":"slide_1_audio.mp3","duration":26.5},{"slideNumber":2,"file":"slide_2_audio.mp3","duration":28.1},{"slideNumber":3,"file":"slide_3_audio.mp3","duration":30},{"slideNumber":4,"file":"slide_4_audio.mp3","duration":32.6},{"slideNumber":5,"file":"slide_5_audio.mp3","duration":24.7}],
  totalDuration: 141.89999999999998,
  fps: 30,
  resolution: '1080p'
};

// Timeline:
// Slide 1: 26.5s
// Slide 2: 28.1s
// Slide 3: 30s
// Slide 4: 32.6s
// Slide 5: 24.7s
// Total: 141.9 seconds
