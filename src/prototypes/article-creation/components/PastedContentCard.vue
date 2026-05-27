<template>
  <EditCheckCard title="Pasted content" :visible="isPasteCardVisible" @close="onDismiss">
    <template #description>
      <p>
        Please avoid copying text from other sources, even if rephrased or cited. This could be
        considered
        <a
          href="https://en.wikipedia.org/wiki/Wikipedia:Copyright_violations"
          target="_blank"
          rel="noopener"
        >
          copyright violation or plagiarism
        </a>
        and may result in your content being removed or your account being blocked.
      </p>
    </template>
    <template #actions>
      <p class="paste-question">Did you write this text?</p>
      <div class="paste-buttons">
        <CdxButton @click="onYes">Yes, keep it</CdxButton>
        <CdxButton @click="onNo">No, remove it</CdxButton>
      </div>
    </template>
  </EditCheckCard>
</template>

<script setup>
import { CdxButton } from '@wikimedia/codex'
import EditCheckCard from './EditCheckCard.vue'
import { usePasteDetection } from '../composables/usePasteDetection'
import { useEditorInstance } from '../composables/useEditorInstance'

const { isPasteCardVisible, confirmPaste, rejectPaste, dismissPaste } = usePasteDetection()
const { getEditor } = useEditorInstance()

function onYes() {
  const editor = getEditor()
  if (editor) confirmPaste(editor)
}

function onNo() {
  const editor = getEditor()
  if (editor) rejectPaste(editor)
}

function onDismiss() {
  const editor = getEditor()
  if (editor) dismissPaste(editor)
}
</script>

<style scoped>
.paste-question {
  margin: 0 0 var(--spacing-25) 0;
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-medium, 16px);
  line-height: var(--line-height-small, 22px);
  color: var(--color-subtle, #54595d);
}

.paste-buttons {
  display: flex;
  gap: var(--spacing-75, 12px);
}
</style>
