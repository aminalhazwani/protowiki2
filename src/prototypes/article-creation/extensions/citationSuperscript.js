import { Node, mergeAttributes } from '../tiptap'
import { Plugin, PluginKey } from '../tiptap'
import { VueNodeViewRenderer } from '../tiptap'
import CitationSuperscriptView from '../components/CitationSuperscriptView.vue'
import { CITATION_LABEL } from '../config/articleSections'
import { useCitationRegistry } from '../composables/useCitationRegistry'

export const CitationSuperscript = Node.create({
  name: 'citationSuperscript',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      label: { default: CITATION_LABEL },
      citationId: { default: null },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-citation-superscript]' },
      { tag: 'sup[data-citation-superscript]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ 'data-citation-superscript': '' }, HTMLAttributes),
      `[${HTMLAttributes.label || CITATION_LABEL}]`,
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(CitationSuperscriptView)
  },

  addProseMirrorPlugins() {
    const { reconcileCitations, usedCitations } = useCitationRegistry()

    return [
      new Plugin({
        key: new PluginKey('citationReconciliation'),
        appendTransaction(transactions, _oldState, newState) {
          const hasDocChange = transactions.some((tr) => tr.docChanged)
          if (!hasDocChange) return null

          // Collect all citationSuperscript nodes with a real citationId (in doc order)
          const seen = new Set()
          const orderedIds = []
          const nodePositions = []

          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'citationSuperscript' && node.attrs.citationId) {
              if (!seen.has(node.attrs.citationId)) {
                seen.add(node.attrs.citationId)
                orderedIds.push(node.attrs.citationId)
              }
              nodePositions.push({ pos, node })
            }
          })

          // Reconcile with the registry (pass document-ordered unique IDs)
          const labelMap = reconcileCitations(orderedIds)

          // Build a transaction lazily — only if label updates or references changes needed
          let tr = null

          // Update stale citation labels
          for (const { pos, node } of nodePositions) {
            const expectedLabel = labelMap.get(node.attrs.citationId)
            if (expectedLabel && node.attrs.label !== expectedLabel) {
              if (!tr) tr = newState.tr
              tr.setNodeMarkup(pos, null, {
                ...node.attrs,
                label: expectedLabel,
              })
            }
          }

          // Manage the References section
          const hasCitations = orderedIds.length > 0
          let refNodePos = null
          let refNode = null

          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'referencesSection') {
              refNodePos = pos
              refNode = node
              return false
            }
          })

          if (hasCitations) {
            const citationsJson = JSON.stringify(
              usedCitations.value.map((c) => ({
                id: c.id,
                segments: c.segments,
                referenceNumber: c.referenceNumber,
              })),
            )

            if (refNode) {
              if (refNode.attrs.citations !== citationsJson) {
                if (!tr) tr = newState.tr
                const mappedPos = tr.mapping.map(refNodePos)
                tr.setNodeMarkup(mappedPos, null, { citations: citationsJson })
              }
            } else {
              if (!tr) tr = newState.tr
              const refNodeType = newState.schema.nodes.referencesSection
              const node = refNodeType.create({ citations: citationsJson })
              tr.insert(tr.doc.content.size, node)
            }
          } else if (refNode) {
            if (!tr) tr = newState.tr
            const mappedPos = tr.mapping.map(refNodePos)
            tr.delete(mappedPos, mappedPos + refNode.nodeSize)
          }

          return tr
        },
      }),
    ]
  },
})
