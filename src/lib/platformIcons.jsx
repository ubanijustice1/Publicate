import { Instagram, Facebook, Youtube, Twitter, MessageCircle, Music2 } from 'lucide-react'

const ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
  x: Twitter,
  whatsapp: MessageCircle,
}

export default function PlatformIcon({ platform, className = 'w-4 h-4' }) {
  const Icon = ICONS[platform] || Instagram
  return <Icon className={className} />
}
