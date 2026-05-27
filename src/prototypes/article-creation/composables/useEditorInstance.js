import { shallowRef, ref } from 'vue'
import { usePlaceholderInteraction } from './usePlaceholderInteraction'
import { useEditorSettings } from './useEditorSettings'

const editorInstance = shallowRef(null)
const hasContent = ref(false)
const citationClickCount = ref(0)

export function useEditorInstance() {
  const { setActivePlaceholder, markActivePlaceholderSettled } = usePlaceholderInteraction()
  const { settings } = useEditorSettings()

  function setEditor(editor) {
    editorInstance.value = editor
  }

  function getEditor() {
    return editorInstance.value
  }

  function insertContent(content) {
    const editor = editorInstance.value
    if (!editor) return
    const startPos = editor.state.selection.from
    editor.chain().focus().insertContent(content).run()

    const endPos = editor.state.selection.from
    let firstChipPos = null
    editor.state.doc.nodesBetween(startPos, endPos, (node, pos) => {
      if (firstChipPos === null && node.type.name === 'placeholderChip') {
        firstChipPos = pos
        return false
      }
    })

    if (firstChipPos !== null) {
      const behavior = settings.value.placeholder?.cursorBehavior || 'before'
      const chipNode = editor.state.doc.nodeAt(firstChipPos)
      const targetPos =
        behavior === 'before' ? firstChipPos : firstChipPos + chipNode.nodeSize
      setActivePlaceholder(firstChipPos, behavior)
      editor.commands.setTextSelection(targetPos)
      markActivePlaceholderSettled()
    }
  }

  function focus() {
    editorInstance.value?.commands.focus()
  }

  function signalCitationClicked() {
    citationClickCount.value++
  }

  return {
    editorInstance,
    setEditor,
    getEditor,
    insertContent,
    focus,
    hasContent,
    citationClickCount,
    signalCitationClicked,
  }
}
