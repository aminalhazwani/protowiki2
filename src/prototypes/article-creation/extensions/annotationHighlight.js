import { Extension } from '../tiptap'
import { Plugin, PluginKey } from '../tiptap'
import { Decoration, DecorationSet } from '../tiptap'

export const AnnotationHighlightKey = new PluginKey('annotationHighlight')

export const AnnotationHighlight = Extension.create({
  name: 'annotationHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: AnnotationHighlightKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, decorationSet, oldState, newState) {
            const meta = tr.getMeta(AnnotationHighlightKey)
            if (meta?.type === 'setAnnotations') {
              const decorations = meta.annotations
                .filter((a) => a.from < a.to && a.to <= newState.doc.content.size)
                .map((annotation) =>
                  Decoration.inline(annotation.from, annotation.to, {
                    class: 'annotation-highlight',
                    'data-annotation-id': annotation.id,
                  }),
                )
              return DecorationSet.create(newState.doc, decorations)
            }

            // Map existing decorations through document changes
            const mapped = decorationSet.map(tr.mapping, tr.doc)

            // Filter out zero-width decorations that collapsed after edits
            const validDecorations = []
            mapped.find(0, newState.doc.content.size, (spec) => {
              // find callback receives (from, to, decoration)
            })

            return mapped
          },
        },

        props: {
          decorations(state) {
            return AnnotationHighlightKey.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setAnnotations:
        (annotations) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(AnnotationHighlightKey, {
              type: 'setAnnotations',
              annotations,
            })
          }
          return true
        },

      clearAnnotations:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(AnnotationHighlightKey, {
              type: 'setAnnotations',
              annotations: [],
            })
          }
          return true
        },
    }
  },
})
