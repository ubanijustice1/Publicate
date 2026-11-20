// Google Publisher Tag (Google Ad Manager) web rewarded ads.
// AdMob ad units (ca-app-pub-...) only serve inside native mobile apps, so the web
// app uses Ad Manager's rewarded format instead. Set VITE_GAM_REWARDED_AD_UNIT to
// your Ad Manager ad unit path (e.g. /1234567/publicate_rewarded). Until then,
// Google's public test unit is used so the flow can be tried end to end.

const GOOGLE_TEST_REWARDED_UNIT = '/22639388115/rewarded_web_example'
export const REWARDED_AD_UNIT = import.meta.env.VITE_GAM_REWARDED_AD_UNIT || GOOGLE_TEST_REWARDED_UNIT
export const IS_TEST_AD_UNIT = REWARDED_AD_UNIT === GOOGLE_TEST_REWARDED_UNIT

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
let gptPromise = null

function loadGpt() {
  if (gptPromise) return gptPromise
  gptPromise = new Promise((resolve, reject) => {
    window.googletag = window.googletag || { cmd: [] }
    const script = document.createElement('script')
    script.src = GPT_SRC
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => window.googletag.cmd.push(() => resolve(window.googletag))
    script.onerror = () => {
      gptPromise = null
      reject(new Error('Ads could not load. If you use an ad blocker, please pause it for Publicate and try again.'))
    }
    document.head.appendChild(script)
  })
  return gptPromise
}

/**
 * Shows one rewarded ad.
 * Resolves { granted: boolean } when the ad closes; rejects if no ad is available.
 */
export async function showRewardedAd() {
  const googletag = await loadGpt()

  return new Promise((resolve, reject) => {
    googletag.cmd.push(() => {
      const slot = googletag.defineOutOfPageSlot(
        REWARDED_AD_UNIT,
        googletag.enums.OutOfPageFormat.REWARDED
      )
      if (!slot) {
        reject(new Error('Rewarded ads are not supported on this browser or screen size.'))
        return
      }
      slot.addService(googletag.pubads())

      let granted = false
      let settled = false
      const pubads = googletag.pubads()

      const finish = (fn) => {
        if (settled) return
        settled = true
        clearTimeout(noFillTimer)
        pubads.removeEventListener('rewardedSlotReady', onReady)
        pubads.removeEventListener('rewardedSlotGranted', onGranted)
        pubads.removeEventListener('rewardedSlotClosed', onClosed)
        pubads.removeEventListener('slotRenderEnded', onRenderEnded)
        googletag.destroySlots([slot])
        fn()
      }

      const onReady = (e) => {
        if (e.slot === slot) {
          clearTimeout(noFillTimer)
          e.makeRewardedVisible()
        }
      }
      const onGranted = (e) => {
        if (e.slot === slot) granted = true
      }
      const onClosed = (e) => {
        if (e.slot === slot) finish(() => resolve({ granted }))
      }
      const onRenderEnded = (e) => {
        if (e.slot === slot && e.isEmpty) {
          finish(() => reject(new Error('No ad is available right now. Please try again in a few minutes.')))
        }
      }
      // If Google never responds, don't leave the user waiting forever.
      const noFillTimer = setTimeout(() => {
        finish(() => reject(new Error('The ad took too long to load. Please try again.')))
      }, 15000)

      pubads.addEventListener('rewardedSlotReady', onReady)
      pubads.addEventListener('rewardedSlotGranted', onGranted)
      pubads.addEventListener('rewardedSlotClosed', onClosed)
      pubads.addEventListener('slotRenderEnded', onRenderEnded)

      googletag.enableServices()
      googletag.display(slot)
    })
  })
}
