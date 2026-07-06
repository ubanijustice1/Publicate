export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 20,
    tagline: 'Get started and try Publicate out',
    features: [
      '20 AI credits / month',
      '1 connected content calendar',
      'Basic post scoring',
      'Monetization Navigator access',
    ],
  },
  {
    id: 'starter',
    name: 'Creator Starter',
    price: 2000,
    credits: 80,
    tagline: 'For creators just getting consistent',
    features: [
      '80 AI credits / month',
      'Full content calendar',
      'AI caption generator',
      'Post score & trend radar',
    ],
  },
  {
    id: 'pro',
    name: 'Creator Pro',
    price: 5000,
    credits: 250,
    tagline: 'Most popular for growing creators',
    highlight: true,
    features: [
      '250 AI credits / month',
      'Everything in Starter',
      'Media Kit generator',
      'Priority AI response speed',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 10000,
    credits: 600,
    tagline: 'For small businesses posting daily',
    features: [
      '600 AI credits / month',
      'Everything in Pro',
      'Multiple brand profiles',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 25000,
    credits: 2000,
    tagline: 'For teams managing multiple clients',
    features: [
      '2,000 AI credits / month',
      'Everything in Business',
      'Team member access',
      'Dedicated onboarding',
    ],
  },
]

export function planById(id) {
  return PLANS.find((p) => p.id === id)
}
