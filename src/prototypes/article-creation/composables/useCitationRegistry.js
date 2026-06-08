import { ref, computed } from 'vue'
import { citations as preExistingCitations } from '../config/citations'

// Persistent store of all citations ever seen (keyed by id).
// Grows monotonically — handles undo by letting us recover citation data.
const citationStore = new Map()

// Pre-populate store with config citations
for (const c of preExistingCitations) {
  citationStore.set(c.id, c)
}

// IDs of citations that originated from config (for returning to available on delete)
const configCitationIds = new Set(preExistingCitations.map((c) => c.id))

// Available references from config — not yet inserted into editor
const availableCitations = ref([...preExistingCitations])

// Citations that have been inserted into the editor, in insertion order.
// Each entry: { id, segments, referenceNumber }
const usedCitations = ref([])

// Position of the citation superscript node the user clicked (or null for fresh insert)
const clickedCitationPos = ref(null)

export function useCitationRegistry() {
  const nextReferenceNumber = computed(() => usedCitations.value.length + 1)

  /**
   * Mark a citation as used. If it comes from availableCitations, remove it there.
   * Idempotent: if already used, returns existing number.
   * Returns the assigned reference number.
   */
  function insertCitation(citation) {
    // Always store in the persistent store
    if (!citationStore.has(citation.id)) {
      citationStore.set(citation.id, citation)
    }

    const existing = usedCitations.value.find((c) => c.id === citation.id)
    if (existing) {
      return existing.referenceNumber
    }

    const num = nextReferenceNumber.value
    usedCitations.value.push({
      ...citation,
      referenceNumber: num,
    })

    // Remove from available if present
    const availIdx = availableCitations.value.findIndex((c) => c.id === citation.id)
    if (availIdx !== -1) {
      availableCitations.value.splice(availIdx, 1)
    }

    return num
  }

  /**
   * Reconcile usedCitations with what's actually in the editor document.
   * Called by the ProseMirror plugin after any doc change.
   *
   * @param {string[]} orderedIds — unique citationIds in document order (first occurrence)
   * @returns {Map<string, string>} — map of citationId → new label string
   */
  function reconcileCitations(orderedIds) {
    const presentIds = new Set(orderedIds)
    const currentUsed = usedCitations.value
    const removed = currentUsed.filter((c) => !presentIds.has(c.id))

    // Build the new usedCitations in document order
    const stillUsed = []
    for (const id of orderedIds) {
      // Try existing usedCitations first, then fall back to store (handles undo)
      const existing = currentUsed.find((c) => c.id === id)
      if (existing) {
        stillUsed.push(existing)
      } else if (citationStore.has(id)) {
        const stored = citationStore.get(id)
        stillUsed.push({ ...stored })
      }
    }

    // Renumber sequentially by document order
    stillUsed.forEach((c, i) => {
      c.referenceNumber = i + 1
    })

    // Return removed config citations to available
    for (const c of removed) {
      if (configCitationIds.has(c.id)) {
        const stored = citationStore.get(c.id)
        if (stored && !availableCitations.value.find((a) => a.id === c.id)) {
          availableCitations.value.push({ ...stored })
        }
      }
    }

    // Update usedCitations reactively
    usedCitations.value = stillUsed

    // Build label map for the plugin to update node attrs
    const labelMap = new Map()
    for (const c of stillUsed) {
      labelMap.set(c.id, String(c.referenceNumber))
    }
    return labelMap
  }

  function setClickedCitationPos(pos) {
    clickedCitationPos.value = pos
  }

  function clearClickedCitationPos() {
    clickedCitationPos.value = null
  }

  return {
    availableCitations,
    usedCitations,
    nextReferenceNumber,
    insertCitation,
    reconcileCitations,
    clickedCitationPos,
    setClickedCitationPos,
    clearClickedCitationPos,
  }
}
