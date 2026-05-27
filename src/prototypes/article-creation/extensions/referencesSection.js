import { Node } from '../tiptap'
import { VueNodeViewRenderer } from '../tiptap'
import ReferencesSectionView from '../components/ReferencesSectionView.vue'

export const ReferencesSection = Node.create({
  name: 'referencesSection',
  group: 'block',
  atom: true,
  draggable: false,
  selectable: false,
  isolating: true,

  addAttributes() {
    return {
      citations: { default: '[]' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-references-section]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-references-section': '', ...HTMLAttributes }, 'References']
  },

  addNodeView() {
    return VueNodeViewRenderer(ReferencesSectionView)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (empty) {
          if ($from.nodeAfter?.type.name === 'referencesSection') return true
          if ($from.nodeBefore?.type.name === 'referencesSection') return true
        }
        return false
      },
      Delete: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (empty && $from.nodeAfter?.type.name === 'referencesSection') return true
        return false
      },
    }
  },
})
