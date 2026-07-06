export const MONETIZATION_CHECKLISTS = {
  x: {
    label: 'X (Twitter)',
    color: '#0F1419',
    program: 'Creator Subscriptions & Ads Revenue Sharing',
    items: [
      { key: 'premium_verified', label: 'Subscribed to X Premium / Premium+ (verified account)' },
      { key: 'followers_500', label: 'At least 500 followers' },
      { key: 'impressions_5m', label: 'At least 5 million organic impressions on your posts in the last 3 months' },
      { key: 'account_age_3m', label: 'Account is at least 3 months old' },
      { key: 'no_violations', label: 'No recent policy strikes or violations' },
      { key: 'enrolled_program', label: 'Enrolled in the Creator Monetization Standards program' },
      { key: 'payment_details', label: 'Added payment & tax details (Stripe) to receive payouts' },
    ],
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    program: 'In-Stream Ads & Facebook Stars',
    items: [
      { key: 'followers_10k', label: 'At least 10,000 Page followers' },
      { key: 'watch_minutes', label: 'At least 600,000 total minutes viewed in the last 60 days' },
      { key: 'active_videos', label: 'At least 5 active videos posted in the last 60 days' },
      { key: 'meta_business_suite', label: 'Page connected to Meta Business Suite' },
      { key: 'partner_policies', label: 'Comply with Meta Partner Monetization Policies & Community Standards' },
      { key: 'payout_details', label: 'Bank details added for payouts' },
    ],
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    program: 'YouTube Partner Program (YPP)',
    items: [
      { key: 'subscribers_1k', label: 'At least 1,000 subscribers' },
      { key: 'watch_hours', label: '4,000 valid public watch hours in the past 12 months (or 10M Shorts views in 90 days)' },
      { key: 'no_strikes', label: 'No active Community Guidelines strikes' },
      { key: 'region_eligible', label: 'Channel is based in a YPP-eligible country (Nigeria is eligible)' },
      { key: 'adsense_linked', label: 'AdSense account linked to your channel' },
      { key: '2fa_enabled', label: '2-Step Verification enabled on your Google account' },
      { key: 'advertiser_friendly', label: 'Content follows advertiser-friendly guidelines' },
    ],
  },
}
