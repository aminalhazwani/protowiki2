<template>
  <EditCheckCard title="Complete section" :visible="isPlaceholderCardVisible" @close="onDismiss">
    <template #description>
      <p>Before you continue, replace or remove all incomplete parts.</p>
    </template>
    <template #actions>
      <div class="complete-section-buttons">
        <CdxButton @click="onEdit">Got it</CdxButton>
      </div>
    </template>
  </EditCheckCard>
</template>

<script setup>
import { CdxButton } from '@wikimedia/codex'
import EditCheckCard from './EditCheckCard.vue'
import { usePlaceholderDetection } from '../composables/usePlaceholderDetection'
import { useEditorInstance } from '../composables/useEditorInstance'

const { isPlaceholderCardVisible, editPlaceholder, dismissPlaceholderCard } =
  usePlaceholderDetection()
const { getEditor } = useEditorInstance()

function onEdit() {
  const editor = getEditor()
  if (editor) editPlaceholder(editor)
}

function onDismiss() {
  const editor = getEditor()
  if (editor) dismissPlaceholderCard(editor)
}
</script>

<style scoped>
.complete-section-buttons {
  display: flex;
  gap: var(--spacing-75, 12px);
}
</style>
