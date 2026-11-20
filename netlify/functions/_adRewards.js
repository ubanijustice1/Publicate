// Shared limits for rewarded ads. 2 claimed views = 1 AI credit (see supabase/patch-003-rewarded-ads.sql).
export const ADS_PER_CREDIT = 2
export const AD_DAILY_CAP = 20 // max rewarded views per user per rolling 24h (= 10 credits)
export const AD_MIN_SECONDS = 5 // a reward can't be claimed sooner than this after the ad session starts
