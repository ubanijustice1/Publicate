// Full catalog of platforms Publicate supports. Users pick which ones they
// actually use (stored in profiles.platforms); DEFAULT_PLATFORM_IDS is the
// starting set for new accounts.
export const PLATFORM_CATALOG = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'x', label: 'X (Twitter)', color: '#0F1419' },
  { id: 'whatsapp', label: 'WhatsApp Status', color: '#25D366' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'threads', label: 'Threads', color: '#1C1C1C' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023' },
  { id: 'telegram', label: 'Telegram', color: '#229ED9' },
  { id: 'snapchat', label: 'Snapchat', color: '#EAB308' },
]

export const DEFAULT_PLATFORM_IDS = ['instagram', 'facebook', 'tiktok', 'youtube', 'x', 'whatsapp']

// Back-compat: several components import PLATFORMS.
export const PLATFORMS = PLATFORM_CATALOG

export const TONES = [
  'Friendly',
  'Professional',
  'Witty & Humorous',
  'Inspirational',
  'Bold & Confident',
  'Educational',
  'Pidgin / Local Flavour',
]

export const NICHES = [
  'Fashion & Style',
  'Beauty & Skincare',
  'Food & Cooking',
  'Fitness & Health',
  'Comedy & Entertainment',
  'Tech & Gadgets',
  'Business & Finance',
  'Real Estate',
  'Fashion Retail / E-commerce',
  'Music',
  'Motivation & Lifestyle',
  'Parenting & Family',
  'Education',
  'Agriculture & Agribusiness',
  'Travel',
  'Other',
]

export function platformById(id) {
  return PLATFORM_CATALOG.find((p) => p.id === id)
}
