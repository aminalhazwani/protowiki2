import { Extension } from '../tiptap'
import { Plugin, PluginKey } from '../tiptap'
import { Decoration, DecorationSet } from '../tiptap'

export const PlaceholderDetectionHighlightKey = new PluginKey('placeholderDetectionHighlight')

/**
 * Find all placeholderChip node positions within a given range.
 */
function findPlaceholderChips(doc, from, to) {
  const chips = []
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'placeholderChip') {
      chips.push({ from: pos, to: pos + node.nodeSize })
    }
  })
  return chips
}

export const PlaceholderDetectionHighlight = Extension.create({
  name: 'placeholderDetectionHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PlaceholderDetectionHighlightKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, decorationSet, oldState, newState) {
            const meta = tr.getMeta(PlaceholderDetectionHighlightKey)

            if (meta?.type === 'setHighlights') {
              const { from, to, detectionId } = meta
              if (from >= to || to > newState.doc.content.size) {
                return decorationSet.map(tr.mapping, tr.doc)
              }
              const chips = findPlaceholderChips(newState.doc, from, to)
              const decorations = chips.map((chip) =>
                Decoration.node(
                  chip.from,
                  chip.to,
                  { class: 'placeholder-detection-highlight', 'data-detection-id': detectionId },
                  { detectionId },
                ),
              )
              const existing = decorationSet.map(tr.mapping, tr.doc)
              const all = []
              existing.find(0, newState.doc.content.size).forEach((d) => all.push(d))
              decorations.forEach((d) => all.push(d))
              return all.length ? DecorationSet.create(newState.doc, all) : DecorationSet.empty
            }

            if (meta?.type === 'promoteParagraph') {
              const all = []
              decorationSet.find(0, newState.doc.content.size).forEach((d) => {
                if (d.spec?.detectionId === meta.detectionId) {
                  all.push(
                    Decoration.node(
                      d.from,
                      d.to,
                      {
                        class: 'placeholder-detection-highlight-warning',
                        'data-detection-id': d.spec.detectionId,
                      },
                      { detectionId: d.spec.detectionId },
                    ),
                  )
                } else {
                  all.push(d)
                }
              })
              return all.length ? DecorationSet.create(newState.doc, all) : DecorationSet.empty
            }

            if (meta?.type === 'demoteParagraph') {
              const all = []
              decorationSet.find(0, newState.doc.content.size).forEach((d) => {
                if (d.spec?.detectionId === meta.detectionId) {
                  all.push(
                    Decoration.node(
                      d.from,
                      d.to,
                      {
                        class: 'placeholder-detection-highlight',
                        'data-detection-id': d.spec.detectionId,
                      },
                      { detectionId: d.spec.detectionId },
                    ),
                  )
                } else {
                  all.push(d)
                }
              })
              return all.length ? DecorationSet.create(newState.doc, all) : DecorationSet.empty
            }

            if (meta?.type === 'clearParagraph') {
              const remaining = []
              decorationSet.find(0, newState.doc.content.size).forEach((d) => {
                if (d.spec?.detectionId !== meta.detectionId) {
                  remaining.push(d)
                }
              })
              return remaining.length
                ? DecorationSet.create(newState.doc, remaining)
                : DecorationSet.empty
            }

            if (meta?.type === 'clearAll') {
              return DecorationSet.empty
            }

            return decorationSet.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return PlaceholderDetectionHighlightKey.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setPlaceholderDetectionHighlights:
        ({ from, to, detectionId }) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PlaceholderDetectionHighlightKey, {
              type: 'setHighlights',
              from,
              to,
              detectionId,
            })
          }
          return true
        },

      promotePlaceholderDetection:
        (detectionId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PlaceholderDetectionHighlightKey, {
              type: 'promoteParagraph',
              detectionId,
            })
          }
          return true
        },

      demotePlaceholderDetection:
        (detectionId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PlaceholderDetectionHighlightKey, {
              type: 'demoteParagraph',
              detectionId,
            })
          }
          return true
        },

      clearPlaceholderDetection:
        (detectionId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PlaceholderDetectionHighlightKey, {
              type: 'clearParagraph',
              detectionId,
            })
          }
          return true
        },

      clearAllPlaceholderDetections:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PlaceholderDetectionHighlightKey, { type: 'clearAll' })
          }
          return true
        },
    }
  },
})
