import { shallowRef } from 'vue'

const cursorRect = shallowRef(null)

export function useCursorRect() {
  function setCursorRect(rect) {
    cursorRect.value = rect
  }

  function clearCursorRect() {
    cursorRect.value = null
  }

  return { cursorRect, setCursorRect, clearCursorRect }
}
