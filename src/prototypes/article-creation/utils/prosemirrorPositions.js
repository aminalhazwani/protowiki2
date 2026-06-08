/**
 * Convert a plain text character offset to a ProseMirror document position.
 * Walks the document tree, skipping node boundaries, counting only text characters.
 */
export function textOffsetToPos(doc, offset) {
  let pos = 0
  let charCount = 0
  let found = false

  doc.descendants((node, nodePos) => {
    if (found) return false

    if (node.isText) {
      const remaining = offset - charCount
      if (remaining <= node.text.length) {
        pos = nodePos + remaining
        found = true
        return false
      }
      charCount += node.text.length
    }
    return true
  })

  return found ? pos : doc.content.size
}

/**
 * Convert a ProseMirror position to a plain text character offset.
 */
export function posToTextOffset(doc, targetPos) {
  let charCount = 0
  let found = false

  doc.descendants((node, nodePos) => {
    if (found) return false

    if (node.isText) {
      const end = nodePos + node.nodeSize
      if (end > targetPos) {
        charCount += targetPos - nodePos
        found = true
        return false
      }
      charCount += node.text.length
    }
    return true
  })

  return charCount
}
