import { ref, triggerRef } from 'vue'

const isPlaceholderCardVisible = ref(false)
const activeCardDetectionId = ref(null)
// Map of detectionId → { range: { from, to }, rect: { top, bottom, height, visible } | null }
const placeholderDetections = ref(new Map())

/**
 * Check if a paragraph node contains any placeholderChip nodes.
 */
function paragraphHasPlaceholders(node) {
  let found = false
  node.descendants((child) => {
    if (child.type.name === 'placeholderChip') {
      found = true
      return false // stop traversal
    }
  })
  return found
}

function rangesOverlap(a, b) {
  if (!a || !b) return false
  return a.from <= b.to && b.from <= a.to
}

/**
 * Check the paragraph at the given position for unfilled placeholders.
 * Called when the cursor leaves a paragraph (from onSelectionUpdate).
 * Sets subtle highlight on placeholder chips + stores range for rail indicator.
 * Does NOT show the card.
 */
function triggerPlaceholderDetection(editor, paragraphPos) {
  try {
    const node = editor.state.doc.nodeAt(paragraphPos)
    if (!node || node.type.name !== 'paragraph' || node.content.size === 0) return

    if (!paragraphHasPlaceholders(node)) return

    const from = paragraphPos + 1
    const to = paragraphPos + node.nodeSize - 1
    const newRange = { from, to }

    // Skip if this paragraph already has a detection
    for (const [, det] of placeholderDetections.value) {
      if (rangesOverlap(det.range, newRange)) return
    }

    const detectionId = 'pd-' + Math.random().toString(36).slice(2, 8)

    editor.commands.setPlaceholderDetectionHighlights({ from, to, detectionId })

    placeholderDetections.value.set(detectionId, { range: newRange, rect: null })
    triggerRef(placeholderDetections)
  } catch {
    // Position may be invalid after doc changes
  }
}

/**
 * Compute visual positions of all detected paragraphs for rail indicator positioning.
 */
function updatePlaceholderDetectionRect(editor) {
  if (!editor || placeholderDetections.value.size === 0) return

  let changed = false
  for (const [id, det] of placeholderDetections.value) {
    try {
      const { from, to } = det.range
      const startCoords = editor.view.coordsAtPos(from)
      const endCoords = editor.view.coordsAtPos(to)
      const top = startCoords.top
      const bottom = endCoords.bottom
      const newRect = { top, bottom, height: bottom - top, visible: true }
      if (!det.rect || det.rect.top !== top || det.rect.bottom !== bottom) {
        det.rect = newRect
        changed = true
      }
    } catch {
      if (det.rect !== null) {
        det.rect = null
        changed = true
      }
      // Position invalid — will be cleaned up or ignored by pagination
    }
  }
  if (changed) triggerRef(placeholderDetections)
}

/**
 * Show the complete section card when the rail indicator is clicked.
 * Promotes placeholder chip highlights to warning style.
 */
function showPlaceholderCard(detectionId, editor) {
  activeCardDetectionId.value = detectionId
  isPlaceholderCardVisible.value = true
  if (editor) editor.commands.promotePlaceholderDetection(detectionId)
}

/**
 * User clicked "Edit" — move cursor before the first placeholder chip,
 * clear highlights, dismiss card.
 */
function editPlaceholder(editor) {
  const detectionId = activeCardDetectionId.value
  const det = detectionId ? placeholderDetections.value.get(detectionId) : null

  if (det) {
    const { from, to } = det.range
    // Find the first placeholderChip node in the range
    let firstChipPos = null
    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      if (firstChipPos === null && node.type.name === 'placeholderChip') {
        firstChipPos = pos
        return false
      }
    })
    if (firstChipPos !== null) {
      editor.chain().focus().setTextSelection(firstChipPos).run()
    }
  }

  if (detectionId) {
    editor.commands.clearPlaceholderDetection(detectionId)
    placeholderDetections.value.delete(detectionId)
    triggerRef(placeholderDetections)
  }

  isPlaceholderCardVisible.value = false
  activeCardDetectionId.value = null
}

/**
 * User dismissed the card without acting — demote highlights back to subtle.
 */
function dismissPlaceholderCard(editor) {
  isPlaceholderCardVisible.value = false
  if (editor && activeCardDetectionId.value) {
    editor.commands.demotePlaceholderDetection(activeCardDetectionId.value)
  }
  activeCardDetectionId.value = null
}

export function usePlaceholderDetection() {
  return {
    isPlaceholderCardVisible,
    activeCardDetectionId,
    placeholderDetections,
    triggerPlaceholderDetection,
    updatePlaceholderDetectionRect,
    showPlaceholderCard,
    editPlaceholder,
    dismissPlaceholderCard,
  }
}
