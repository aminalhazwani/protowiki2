import { Extension } from '../tiptap'
import { Plugin, PluginKey } from '../tiptap'
import { Decoration, DecorationSet } from '../tiptap'

export const PeacockHighlightKey = new PluginKey('peacockHighlight')

export const PeacockHighlight = Extension.create({
  name: 'peacockHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PeacockHighlightKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, decorationSet, oldState, newState) {
            const meta = tr.getMeta(PeacockHighlightKey)

            if (meta?.type === 'setHighlights') {
              const decorations = meta.highlights
                .filter((h) => h.from < h.to && h.to <= newState.doc.content.size)
                .map((h) =>
                  Decoration.inline(
                    h.from,
                    h.to,
                    { class: 'peacock-highlight', 'data-paragraph-id': h.paragraphId },
                    { paragraphId: h.paragraphId },
                  ),
                )
              // Merge with existing decorations, replacing any that overlap
              // the new highlight ranges (prevents duplicates on same paragraph)
              const existing = decorationSet.map(tr.mapping, tr.doc)
              const all = []
              existing.find(0, newState.doc.content.size).forEach((d) => {
                const dominated = decorations.some(
                  (n) => d.from >= n.from && d.to <= n.to,
                )
                if (!dominated) all.push(d)
              })
              decorations.forEach((d) => all.push(d))
              return DecorationSet.create(newState.doc, all)
            }

            if (meta?.type === 'clearParagraph') {
              const remaining = []
              decorationSet.find(0, newState.doc.content.size).forEach((d) => {
                if (d.spec?.paragraphId !== meta.paragraphId) {
                  remaining.push(d)
                }
              })
              return remaining.length
                ? DecorationSet.create(newState.doc, remaining)
                : DecorationSet.empty
            }

            if (meta?.type === 'promoteParagraph') {
              const all = []
              decorationSet.find(0, newState.doc.content.size).forEach((d) => {
                if (d.spec?.paragraphId === meta.paragraphId) {
                  all.push(
                    Decoration.inline(
                      d.from,
                      d.to,
                      {
                        class: 'peacock-highlight-warning',
                        'data-paragraph-id': d.spec.paragraphId,
                      },
                      { paragraphId: d.spec.paragraphId },
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
                if (d.spec?.paragraphId === meta.paragraphId) {
                  all.push(
                    Decoration.inline(
                      d.from,
                      d.to,
                      {
                        class: 'peacock-highlight',
                        'data-paragraph-id': d.spec.paragraphId,
                      },
                      { paragraphId: d.spec.paragraphId },
                    ),
                  )
                } else {
                  all.push(d)
                }
              })
              return all.length ? DecorationSet.create(newState.doc, all) : DecorationSet.empty
            }

            if (meta?.type === 'clearAll') {
              return DecorationSet.empty
            }

            return decorationSet.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return PeacockHighlightKey.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setPeacockHighlights:
        (highlights) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PeacockHighlightKey, {
              type: 'setHighlights',
              highlights,
            })
          }
          return true
        },

      clearPeacockParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PeacockHighlightKey, {
              type: 'clearParagraph',
              paragraphId,
            })
          }
          return true
        },

      promotePeacockParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PeacockHighlightKey, {
              type: 'promoteParagraph',
              paragraphId,
            })
          }
          return true
        },

      demotePeacockParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PeacockHighlightKey, {
              type: 'demoteParagraph',
              paragraphId,
            })
          }
          return true
        },

      clearPeacockHighlights:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PeacockHighlightKey, { type: 'clearAll' })
          }
          return true
        },
    }
  },
})
