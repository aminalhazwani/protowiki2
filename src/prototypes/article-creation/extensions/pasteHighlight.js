import { Extension } from '../tiptap'
import { Plugin, PluginKey } from '../tiptap'
import { Decoration, DecorationSet } from '../tiptap'

export const PasteHighlightKey = new PluginKey('pasteHighlight')

export const PasteHighlight = Extension.create({
  name: 'pasteHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PasteHighlightKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, decorationSet, oldState, newState) {
            const meta = tr.getMeta(PasteHighlightKey)

            if (meta?.type === 'setHighlight') {
              const { from, to, paragraphId } = meta
              if (from >= to || to > newState.doc.content.size) {
                return decorationSet.map(tr.mapping, tr.doc)
              }
              const decoration = Decoration.inline(
                from,
                to,
                { class: 'paste-highlight', 'data-paragraph-id': paragraphId },
                { paragraphId },
              )
              const existing = decorationSet.map(tr.mapping, tr.doc)
              const all = []
              existing.find(0, newState.doc.content.size).forEach((d) => all.push(d))
              all.push(decoration)
              return DecorationSet.create(newState.doc, all)
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
                        class: 'paste-highlight-warning',
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
                        class: 'paste-highlight',
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

            if (meta?.type === 'clearAll') {
              return DecorationSet.empty
            }

            return decorationSet.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return PasteHighlightKey.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setPasteHighlight:
        ({ from, to, paragraphId }) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PasteHighlightKey, { type: 'setHighlight', from, to, paragraphId })
          }
          return true
        },

      promotePasteParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PasteHighlightKey, { type: 'promoteParagraph', paragraphId })
          }
          return true
        },

      demotePasteParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PasteHighlightKey, { type: 'demoteParagraph', paragraphId })
          }
          return true
        },

      clearPasteParagraph:
        (paragraphId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PasteHighlightKey, { type: 'clearParagraph', paragraphId })
          }
          return true
        },

      clearPasteHighlights:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(PasteHighlightKey, { type: 'clearAll' })
          }
          return true
        },
    }
  },
})
