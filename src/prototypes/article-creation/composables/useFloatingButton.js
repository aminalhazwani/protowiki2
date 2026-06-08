import { ref, computed } from 'vue'

const TYPING_DEBOUNCE_MS = 1000
const BUTTON_GAP = 4
const ENTRY_POINT_HEIGHT = 32
const ENTRY_POINT_WIDTHS = { icon: 32, quiet: 220, floating: 180 }

/**
 * Manages the floating entry-point button position and visibility.
 * Tracks cursor coordinates via ProseMirror and publishes cursor rect
 * for force-mode entry points.
 */
export function useFloatingButton({
  editor,
  entryPointStyle,
  isCycling,
  hasInteracted,
  useForceMode,
  activePlaceholderPos,
  setCursorRect,
  clearCursorRect,
  updatePeacockRect,
  updatePasteRect,
  updatePlaceholderDetectionRect,
  activeParagraphRange,
  activePastedRange,
  placeholderDetections,
}) {
  const floatingElRef = ref(null)
  const isButtonVisible = ref(false)
  const buttonTop = ref(0)
  const buttonLeft = ref(0)

  let typingTimer = null
  const isTyping = ref(false)

  const floatingButtonStyle = computed(() => ({
    position: 'absolute',
    top: `${buttonTop.value}px`,
    left: `${buttonLeft.value}px`,
    zIndex: 1,
  }))

  function getEditorScrollEl() {
    return editor.value?.view?.dom || null
  }

  function updateButtonPosition() {
    if (!editor.value) {
      isButtonVisible.value = false
      return
    }

    // In inline placeholder initial state, no button needed — the placeholder is the entry point
    if (entryPointStyle.value === 'text' && !hasInteracted.value) {
      isButtonVisible.value = false
      return
    }

    // Update paragraph rects for warning rail positioning
    updatePeacockRect(editor.value)
    updatePasteRect(editor.value)
    updatePlaceholderDetectionRect(editor.value)

    const { state, view } = editor.value
    const { empty } = state.selection

    // When a placeholderChip has a NodeSelection, align the force button with the chip
    if (!empty && state.selection.node?.type.name === 'placeholderChip') {
      const chipDom = view.nodeDOM(state.selection.from)
      if (chipDom) {
        const chipRect = chipDom.getBoundingClientRect()
        const editorEl = getEditorScrollEl()
        const editorRect = editorEl?.getBoundingClientRect()
        const caretVisible = editorRect
          ? !(chipRect.bottom < editorRect.top || chipRect.top > editorRect.bottom)
          : true
        setCursorRect({
          top: chipRect.top,
          bottom: chipRect.bottom,
          lineHeight: chipRect.height,
          glyphHeight: chipRect.height,
          visible: caretVisible,
        })
      }
      isButtonVisible.value = false
      return
    }

    // When cursor-after mode is active, use the chip's bounding rect for the force button
    if (activePlaceholderPos.value !== null) {
      const chipDom = view.nodeDOM(activePlaceholderPos.value)
      if (chipDom) {
        const chipRect = chipDom.getBoundingClientRect()
        const editorEl = getEditorScrollEl()
        const editorRect = editorEl?.getBoundingClientRect()
        const caretVisible = editorRect
          ? !(chipRect.bottom < editorRect.top || chipRect.top > editorRect.bottom)
          : true
        setCursorRect({
          top: chipRect.top,
          bottom: chipRect.bottom,
          lineHeight: chipRect.height,
          glyphHeight: chipRect.height,
          visible: caretVisible,
        })
      }
      isButtonVisible.value = false
      return
    }

    // Only show button when cursor is collapsed (no text selected)
    if (!empty) {
      isButtonVisible.value = false
      return
    }

    const editorEl = getEditorScrollEl()
    if (!editorEl) {
      isButtonVisible.value = false
      return
    }

    const editorRect = editorEl.getBoundingClientRect()

    // Use ProseMirror's coordsAtPos for precise cursor position
    let coords
    try {
      coords = view.coordsAtPos(state.selection.from)
    } catch {
      isButtonVisible.value = false
      return
    }

    // Handle empty document or empty line: zero-height coords
    const caretHeight = coords.bottom - coords.top
    if (caretHeight === 0) {
      const computedStyle = window.getComputedStyle(view.dom)
      const lineHeight =
        parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.5
      coords = { top: coords.top, bottom: coords.top + lineHeight, left: coords.left, right: coords.right }
    }

    const caretVisible = !(coords.bottom < editorRect.top || coords.top > editorRect.bottom)

    // For force mode, publish cursor rect and don't show the inline floating button
    if (useForceMode.value) {
      const resolvedPos = view.domAtPos(state.selection.from)
      const domEl =
        resolvedPos.node.nodeType === 3 ? resolvedPos.node.parentElement : resolvedPos.node
      const computedLineHeight =
        parseFloat(window.getComputedStyle(domEl).lineHeight) || coords.bottom - coords.top
      setCursorRect({
        top: coords.top,
        bottom: coords.bottom,
        lineHeight: computedLineHeight,
        glyphHeight: coords.bottom - coords.top,
        visible: caretVisible,
      })
      isButtonVisible.value = false
      return
    }

    // Hide if caret is scrolled out of the visible editor area
    if (!caretVisible) {
      isButtonVisible.value = false
      return
    }

    // Convert viewport coords to wrapper-relative coords
    let top = coords.bottom - editorRect.top + BUTTON_GAP
    let left = coords.left - editorRect.left

    const quietWidth = isCycling.value ? ENTRY_POINT_WIDTHS.quiet : ENTRY_POINT_WIDTHS.icon
    const currentWidth =
      entryPointStyle.value === 'quiet' ? quietWidth : ENTRY_POINT_WIDTHS[entryPointStyle.value] || 32

    // Hide if button would extend below visible editor area
    if (top + ENTRY_POINT_HEIGHT > editorEl.clientHeight) {
      isButtonVisible.value = false
      return
    }

    // Right-edge flip: if entry point overflows right, align right edge to cursor
    if (left + currentWidth > editorEl.clientWidth) {
      left = coords.left - editorRect.left - currentWidth
    }

    left = Math.max(0, left)

    buttonTop.value = top
    buttonLeft.value = left
    isButtonVisible.value = true
  }

  function hideButton() {
    isButtonVisible.value = false
    clearCursorRect()
    clearTimeout(typingTimer)
    typingTimer = null
  }

  function scheduleShowButton() {
    clearTimeout(typingTimer)
    isTyping.value = true
    typingTimer = setTimeout(() => {
      typingTimer = null
      isTyping.value = false
      updateButtonPosition()
    }, TYPING_DEBOUNCE_MS)
  }

  function onScroll() {
    if (isButtonVisible.value || useForceMode.value) {
      updateButtonPosition()
    }
    if (
      activeParagraphRange.value ||
      activePastedRange.value ||
      placeholderDetections.value.size > 0
    ) {
      updatePeacockRect(editor.value)
      updatePasteRect(editor.value)
      updatePlaceholderDetectionRect(editor.value)
    }
  }

  function cleanup() {
    clearTimeout(typingTimer)
    typingTimer = null
  }

  return {
    floatingElRef,
    isButtonVisible,
    isTyping,
    floatingButtonStyle,
    updateButtonPosition,
    hideButton,
    scheduleShowButton,
    onScroll,
    cleanup,
  }
}
