export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'x', label: 'X (Twitter)', color: '#0F1419' },
  { id: 'whatsapp', label: 'WhatsApp Status', color: '#25D366' },
]

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
  return PLATFORMS.find((p) => p.id === id)
}
