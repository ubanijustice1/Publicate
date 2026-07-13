import { useAuth } from '../context/AuthContext'
import { PLATFORM_CATALOG, DEFAULT_PLATFORM_IDS } from '../lib/platforms'

// The platforms this user has enabled, in catalog order.
// Falls back to the default six until the profile loads (or for older accounts).
export function useUserPlatforms() {
  const { profile } = useAuth()
  const ids = profile?.platforms?.length ? profile.platforms : DEFAULT_PLATFORM_IDS
  return PLATFORM_CATALOG.filter((p) => ids.includes(p.id))
}
