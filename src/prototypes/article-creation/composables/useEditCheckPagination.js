import { ref, computed, watch } from 'vue'
import { usePeacockDetection } from './usePeacockDetection'
import { usePasteDetection } from './usePasteDetection'
import { usePlaceholderDetection } from './usePlaceholderDetection'

const currentGroupIndex = ref(0)
const currentCheckIndex = ref(0)
const cursorInCheckParagraph = ref(false)

function rangesOverlap(a, b) {
  if (!a || !b) return false
  return a.from <= b.to && b.from <= a.to
}

function unionRect(rects) {
  const top = Math.min(...rects.map((r) => r.top))
  const bottom = Math.max(...rects.map((r) => r.bottom))
  return { top, bottom, height: bottom - top, visible: true }
}

export function useEditCheckPagination() {
  const {
    peacockParagraphRect,
    activeParagraphId,
    activeParagraphRange,
    isCardVisible,
    showCard: showPeacockCard,
    dismissCard: dismissPeacock,
  } = usePeacockDetection()

  const {
    pasteParagraphRect,
    activePastedParagraphId,
    activePastedRange,
    isPasteCardVisible,
    showPasteCard,
    dismissPaste,
  } = usePasteDetection()

  const {
    placeholderDetections,
    isPlaceholderCardVisible,
    showPlaceholderCard,
    dismissPlaceholderCard,
  } = usePlaceholderDetection()

  // Collect active checks in fixed order: peacock → paste → placeholder
  const activeChecks = computed(() => {
    const checks = []
    if (peacockParagraphRect.value?.visible) {
      checks.push({
        type: 'peacock',
        range: activeParagraphRange.value,
        rect: peacockParagraphRect.value,
      })
    }
    if (pasteParagraphRect.value?.visible) {
      checks.push({
        type: 'paste',
        range: activePastedRange.value,
        rect: pasteParagraphRect.value,
      })
    }
    for (const [id, det] of placeholderDetections.value) {
      if (det.rect?.visible) {
        checks.push({
          type: 'placeholder',
          detectionId: id,
          range: det.range,
          rect: det.rect,
        })
      }
    }
    return checks
  })

  // Group checks by paragraph (overlapping ranges = same paragraph)
  const checkGroups = computed(() => {
    const groups = []
    for (const check of activeChecks.value) {
      const existing = groups.find((g) =>
        g.checks.some((c) => rangesOverlap(c.range, check.range)),
      )
      if (existing) {
        existing.checks.push(check)
      } else {
        groups.push({ checks: [check] })
      }
    }
    return groups.map((g) => ({
      checks: g.checks,
      rect: unionRect(g.checks.map((c) => c.rect)),
      count: g.checks.length,
    }))
  })

  const totalGroups = computed(() => checkGroups.value.length)

  // The active group's check count (for card pagination)
  const activeGroupCheckCount = computed(() => {
    const group = checkGroups.value[currentGroupIndex.value]
    return group ? group.count : 0
  })

  // Reset indices when groups change
  watch(totalGroups, (n) => {
    if (currentGroupIndex.value >= n) {
      currentGroupIndex.value = Math.max(0, n - 1)
    }
  })

  watch(activeGroupCheckCount, (n) => {
    if (currentCheckIndex.value >= n) {
      currentCheckIndex.value = Math.max(0, n - 1)
    }
  })

  function dismissAllCards(editor) {
    if (isCardVisible.value) dismissPeacock(editor)
    if (isPasteCardVisible.value) dismissPaste(editor)
    if (isPlaceholderCardVisible.value) dismissPlaceholderCard(editor)
  }

  function showCheck(check, editor) {
    if (check.type === 'peacock') showPeacockCard(activeParagraphId.value, editor)
    else if (check.type === 'paste') showPasteCard(activePastedParagraphId.value, editor)
    else if (check.type === 'placeholder') showPlaceholderCard(check.detectionId, editor)
  }

  // Show a check within the active group by its index within that group
  function showCheckInGroup(groupIndex, checkIndex, editor) {
    dismissAllCards(editor)
    currentGroupIndex.value = groupIndex
    currentCheckIndex.value = checkIndex
    const group = checkGroups.value[groupIndex]
    if (group) {
      const check = group.checks[checkIndex]
      if (check) showCheck(check, editor)
    }
  }

  // Show the first check of a specific group (used by rail indicator click)
  function showGroupAtIndex(groupIndex, editor) {
    showCheckInGroup(groupIndex, 0, editor)
  }

  function goToNext(editor) {
    if (currentCheckIndex.value < activeGroupCheckCount.value - 1) {
      showCheckInGroup(currentGroupIndex.value, currentCheckIndex.value + 1, editor)
    }
  }

  function goToPrev(editor) {
    if (currentCheckIndex.value > 0) {
      showCheckInGroup(currentGroupIndex.value, currentCheckIndex.value - 1, editor)
    }
  }

  const isAnyCardActive = computed(() => {
    return isCardVisible.value || isPasteCardVisible.value || isPlaceholderCardVisible.value
  })

  function updateCursorInCheck(editor) {
    if (!editor) {
      cursorInCheckParagraph.value = false
      return
    }
    const pos = editor.state.selection.from
    for (const check of activeChecks.value) {
      if (check.range && pos >= check.range.from && pos <= check.range.to) {
        cursorInCheckParagraph.value = true
        return
      }
    }
    cursorInCheckParagraph.value = false
  }

  return {
    activeChecks,
    checkGroups,
    totalGroups,
    activeGroupCheckCount,
    currentCheckIndex,
    currentGroupIndex,
    isAnyCardActive,
    cursorInCheckParagraph,
    showGroupAtIndex,
    goToNext,
    goToPrev,
    dismissAllCards,
    updateCursorInCheck,
  }
}
