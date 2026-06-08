import { useEditorInstance } from './useEditorInstance'

export function useTextPositionReporter() {
  const { getEditor } = useEditorInstance()

  /**
   * Get viewport-relative bounding rect for a text range.
   * Returns { top, bottom, left, right, height, width } or null.
   */
  function getRangeRect(from, to) {
    const editor = getEditor()
    if (!editor) return null

    const view = editor.view
    try {
      const startCoords = view.coordsAtPos(from)
      const endCoords = view.coordsAtPos(to)

      return {
        top: startCoords.top,
        bottom: endCoords.bottom,
        left: Math.min(startCoords.left, endCoords.left),
        right: Math.max(startCoords.right, endCoords.right),
        height: endCoords.bottom - startCoords.top,
        width:
          Math.max(startCoords.right, endCoords.right) -
          Math.min(startCoords.left, endCoords.left),
      }
    } catch {
      return null
    }
  }

  /**
   * Get position relative to a container element (e.g., the editor wrapper).
   */
  function getRangeRectRelativeTo(from, to, containerEl) {
    const rect = getRangeRect(from, to)
    if (!rect || !containerEl) return null

    const containerRect = containerEl.getBoundingClientRect()
    return {
      top: rect.top - containerRect.top,
      bottom: rect.bottom - containerRect.top,
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      height: rect.height,
      width: rect.width,
    }
  }

  /**
   * Get the current cursor position in viewport coordinates.
   */
  function getCursorRect() {
    const editor = getEditor()
    if (!editor) return null

    const { from } = editor.state.selection
    return getRangeRect(from, from)
  }

  return { getRangeRect, getRangeRectRelativeTo, getCursorRect }
}
