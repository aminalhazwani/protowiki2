import { ref, shallowRef } from 'vue'

// Set of paragraph positions that received pasted content (keyed by paragraph start pos)
const pastedParagraphPositions = ref(new Set())

const isPasteCardVisible = ref(false)
const activePastedParagraphId = ref(null)
const activePastedRange = ref(null)
const pasteParagraphRect = shallowRef(null)

/**
 * Record that a paste happened at the current cursor position.
 * Called from the editor's handlePaste callback.
 */
function onPaste(editor) {
  const { $from } = editor.state.selection
  if ($from.parent.type.name === 'paragraph') {
    pastedParagraphPositions.value.add($from.before())
  }
}

/**
 * Check if the previous paragraph was pasted content.
 * Called when user moves to a new empty paragraph (same trigger as peacock detection).
 * Sets subtle highlight + stores range/ID for the rail indicator — does NOT show the card.
 */
function triggerPasteDetection(editor) {
  const { $from } = editor.state.selection
  const currentNode = $from.parent

  if (currentNode.type.name !== 'paragraph' || currentNode.content.size > 0) {
    return
  }

  const depth = $from.depth
  const indexInParent = $from.index(depth - 1)
  if (indexInParent === 0) return

  const parentNode = $from.node(depth - 1)
  let prevIndex = indexInParent - 1
  let prevNode = parentNode.child(prevIndex)

  while (prevIndex > 0 && prevNode.type.name !== 'paragraph') {
    prevIndex--
    prevNode = parentNode.child(prevIndex)
  }

  if (prevNode.type.name !== 'paragraph' || prevNode.content.size === 0) return

  // Calculate position of previous paragraph
  let pos = $from.start(depth - 1)
  for (let i = 0; i < prevIndex; i++) {
    pos += parentNode.child(i).nodeSize
  }

  // Check if this paragraph was flagged as pasted
  if (!pastedParagraphPositions.value.has(pos)) return

  // Remove from tracking set so it doesn't trigger again
  pastedParagraphPositions.value.delete(pos)

  const paragraphId = 'paste-' + Math.random().toString(36).slice(2, 8)
  const from = pos + 1
  const to = pos + prevNode.nodeSize - 1

  // Set subtle highlight only — no card yet
  editor.commands.setPasteHighlight({ from, to, paragraphId })

  activePastedParagraphId.value = paragraphId
  activePastedRange.value = { from, to }
}

/**
 * Compute visual position of the active pasted paragraph for rail indicator positioning.
 * Mirrors updatePeacockRect in usePeacockDetection.
 */
function updatePasteRect(editor) {
  if (!activePastedRange.value || !editor) {
    pasteParagraphRect.value = null
    return
  }

  try {
    const { from, to } = activePastedRange.value
    const startCoords = editor.view.coordsAtPos(from)
    const endCoords = editor.view.coordsAtPos(to)
    const top = startCoords.top
    const bottom = endCoords.bottom
    pasteParagraphRect.value = {
      top,
      bottom,
      height: bottom - top,
      visible: true,
    }
  } catch {
    pasteParagraphRect.value = null
  }
}

/**
 * Show the paste card when the rail indicator is clicked.
 * Promotes highlight to warning style.
 */
function showPasteCard(paragraphId, editor) {
  activePastedParagraphId.value = paragraphId
  isPasteCardVisible.value = true
  if (editor) editor.commands.promotePasteParagraph(paragraphId)
}

/**
 * User confirmed they wrote the text — dismiss card and clear highlight.
 */
function confirmPaste(editor) {
  if (activePastedParagraphId.value) {
    editor.commands.clearPasteParagraph(activePastedParagraphId.value)
  }
  isPasteCardVisible.value = false
  activePastedParagraphId.value = null
  activePastedRange.value = null
  pasteParagraphRect.value = null
}

/**
 * User said they didn't write the text — remove pasted content and dismiss.
 */
function rejectPaste(editor) {
  if (activePastedRange.value) {
    const { from, to } = activePastedRange.value
    editor.chain().focus().deleteRange({ from: from - 1, to: to + 1 }).run()
  }
  if (activePastedParagraphId.value) {
    editor.commands.clearPasteParagraph(activePastedParagraphId.value)
  }
  isPasteCardVisible.value = false
  activePastedParagraphId.value = null
  activePastedRange.value = null
  pasteParagraphRect.value = null
}

/**
 * User dismissed the card without answering — demote highlight back to subtle.
 */
function dismissPaste(editor) {
  isPasteCardVisible.value = false
  if (editor && activePastedParagraphId.value) {
    editor.commands.demotePasteParagraph(activePastedParagraphId.value)
  }
}

export function usePasteDetection() {
  return {
    isPasteCardVisible,
    activePastedParagraphId,
    activePastedRange,
    pasteParagraphRect,
    pastedParagraphPositions,
    onPaste,
    triggerPasteDetection,
    updatePasteRect,
    showPasteCard,
    confirmPaste,
    rejectPaste,
    dismissPaste,
  }
}
