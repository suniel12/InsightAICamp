// Brand Colors
export const BRAND_COLORS = {
  PRIMARY: '#1F5F5F',
  ACCENT: '#0F2027',
  WHITE: '#FFFFFF',
} as const;

// Quiz Constants
export const QUIZ_CONFIG = {
  TOTAL_QUICK_QUESTIONS: 5,
  PROGRESS_BAR_TRANSITION: 500, // ms
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ]
} as const;

// Animation Constants
export const ANIMATIONS = {
  COUNTER_DURATION: 2000, // ms
  HOVER_TRANSITION: 300, // ms
} as const;

// Layout Constants
export const LAYOUT = {
  CONTAINER_PADDING: '1.5rem',
  SECTION_PADDING_Y: '5rem',
  CARD_BORDER_RADIUS: '0.5rem',
} as const;

// SEO Constants
export const SEO = {
  SITE_NAME: 'GigaWatt Academy',
  SITE_URL: 'https://gigawattacademy.com',
  DEFAULT_DESCRIPTION: 'Join GigaWatt Academy\'s proven training program for high-paying data center careers. 90%+ placement rate, $100K+ average salary.',
} as const;