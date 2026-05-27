import { ref, shallowRef } from 'vue'

const placeholderClickEvent = shallowRef(null)
const activePlaceholderPos = ref(null)
const activePlaceholderMode = ref(null)
const activePlaceholderSettled = ref(false)

export function usePlaceholderInteraction() {
  function signalPlaceholderClicked(label) {
    placeholderClickEvent.value = { label, timestamp: Date.now() }
  }

  function clearPlaceholderClick() {
    placeholderClickEvent.value = null
  }

  function setActivePlaceholder(pos, mode = 'after') {
    activePlaceholderPos.value = pos
    activePlaceholderMode.value = mode
    activePlaceholderSettled.value = false
  }

  function markActivePlaceholderSettled() {
    activePlaceholderSettled.value = true
  }

  function clearActivePlaceholder() {
    activePlaceholderPos.value = null
    activePlaceholderMode.value = null
    activePlaceholderSettled.value = false
  }

  return {
    placeholderClickEvent,
    signalPlaceholderClicked,
    clearPlaceholderClick,
    activePlaceholderPos,
    activePlaceholderMode,
    activePlaceholderSettled,
    setActivePlaceholder,
    markActivePlaceholderSettled,
    clearActivePlaceholder,
  }
}
