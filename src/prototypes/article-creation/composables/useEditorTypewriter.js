import { ref, computed, isRef } from 'vue'

const CHAR_INTERVAL_MS = 50
const HOLD_DURATION_MS = 3000

/**
 * Typewriter animation for the quiet floating button style.
 * Cycles through section titles with a type-then-wipe animation.
 *
 * @param {import('vue').Ref<string[]>|string[]} titlesSource - titles to cycle through
 */
export function useEditorTypewriter(titlesSource) {
  const getTitles = () => (isRef(titlesSource) ? titlesSource.value : titlesSource)

  const currentLabelIndex = ref(0)
  const displayText = ref('')
  const wipeProgress = ref(0)
  const isCycling = ref(true)
  const animPhase = ref('typing') // 'typing' | 'holding' | 'wiping'

  let charTimer = null
  let holdTimer = null
  let charIndex = 0
  let wipeLen = 0
  let wipeTicks = 0
  let cyclingStarted = false
  let isPaused = false
  let holdStartTime = 0
  let holdRemainingMs = 0

  // Mask goes from -15% (all visible) to 100% (all hidden)
  const wipeMaskPercent = computed(() => -15 + wipeProgress.value * 115)

  function typewriterTick() {
    if (animPhase.value === 'typing') {
      const title = getTitles()[currentLabelIndex.value]
      displayText.value += title[charIndex]
      charIndex++
      if (charIndex >= title.length) {
        clearInterval(charTimer)
        charTimer = null
        animPhase.value = 'holding'
        if (isPaused) return
        holdStartTime = Date.now()
        holdTimer = setTimeout(startWipe, HOLD_DURATION_MS)
      }
    } else if (animPhase.value === 'wiping') {
      wipeTicks++
      wipeProgress.value = wipeTicks / wipeLen
      if (wipeTicks >= wipeLen) {
        clearInterval(charTimer)
        charTimer = null
        displayText.value = ''
        currentLabelIndex.value = (currentLabelIndex.value + 1) % getTitles().length
        charIndex = 0
        animPhase.value = 'typing'
        charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
      }
    }
  }

  function startWipe() {
    holdTimer = null
    wipeLen = displayText.value.length
    wipeTicks = 0
    wipeProgress.value = 0
    animPhase.value = 'wiping'
    charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
  }

  function startCycling() {
    if (charTimer) return
    if (!cyclingStarted) cyclingStarted = true
    animPhase.value = 'typing'
    charIndex = 0
    displayText.value = ''
    charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
  }

  function stopCycling() {
    if (!isCycling.value) return
    isCycling.value = false
    clearInterval(charTimer)
    clearTimeout(holdTimer)
    charTimer = null
    holdTimer = null
    displayText.value = ''
  }

  function pauseAnimation() {
    if (!isCycling.value) return
    isPaused = true
    if (animPhase.value === 'holding') {
      clearTimeout(holdTimer)
      holdTimer = null
      holdRemainingMs = Math.max(0, HOLD_DURATION_MS - (Date.now() - holdStartTime))
    }
  }

  function resumeAnimation() {
    if (!isCycling.value || !isPaused) return
    isPaused = false
    if (animPhase.value === 'holding') {
      holdStartTime = Date.now()
      holdTimer = setTimeout(startWipe, holdRemainingMs)
    }
  }

  function cleanup() {
    clearInterval(charTimer)
    clearTimeout(holdTimer)
  }

  return {
    isCycling,
    displayText,
    animPhase,
    wipeMaskPercent,
    cyclingStarted: () => cyclingStarted,
    startCycling,
    stopCycling,
    pauseAnimation,
    resumeAnimation,
    cleanup,
  }
}
