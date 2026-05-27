<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="visible" class="edit-check-card">
        <div class="edit-check-header">
          <div class="edit-check-header-content">
            <CdxIcon :icon="icons.cdxIconAlert" class="edit-check-warning-icon" />
            <span class="edit-check-title">{{ title }}</span>
          </div>
          <CdxButton
            weight="quiet"
            class="edit-check-close"
            aria-label="Close"
            @click="$emit('close')"
          >
            <CdxIcon :icon="icons.cdxIconClose" />
          </CdxButton>
        </div>
        <div class="edit-check-body">
          <div class="edit-check-description">
            <slot name="description" />
          </div>
          <div class="edit-check-actions">
            <slot name="actions" />
          </div>
          <div v-if="$slots.footer" class="edit-check-footer">
            <slot name="footer" />
          </div>
        </div>
        <div v-if="activeGroupCheckCount > 1" class="edit-check-pagination">
          <span class="pagination-text">{{ currentCheckIndex + 1 }} of {{ activeGroupCheckCount }}</span>
          <div class="pagination-buttons">
            <CdxButton
              weight="quiet"
              class="pagination-btn"
              :disabled="currentCheckIndex <= 0"
              aria-label="Previous check"
              @click="onPrev"
            >
              <CdxIcon :icon="icons.cdxIconCollapse" />
            </CdxButton>
            <CdxButton
              weight="quiet"
              class="pagination-btn"
              :disabled="currentCheckIndex >= activeGroupCheckCount - 1"
              aria-label="Next check"
              @click="onNext"
            >
              <CdxIcon :icon="icons.cdxIconExpand" />
            </CdxButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
import { useEditCheckPagination } from '../composables/useEditCheckPagination'
import { useEditorInstance } from '../composables/useEditorInstance'

defineProps({
  title: { type: String, required: true },
  visible: { type: Boolean, default: false },
})

defineEmits(['close'])

const { activeGroupCheckCount, currentCheckIndex, goToNext, goToPrev } = useEditCheckPagination()
const { getEditor } = useEditorInstance()

function onPrev() {
  const editor = getEditor()
  if (editor) goToPrev(editor)
}

function onNext() {
  const editor = getEditor()
  if (editor) goToNext(editor)
}
</script>

<style scoped>
.edit-check-card {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: var(--background-color-base, #fff);
  border-top: 1px solid var(--border-color-base, #a2a9b1);
  box-shadow:
    0 -4px 4px 0 rgba(0, 0, 0, 0.06),
    0 0 8px 0 rgba(0, 0, 0, 0.06);
}

.edit-check-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-12) var(--spacing-50) var(--spacing-12) var(--spacing-100);
  border-bottom: var(--border-subtle);
}

.edit-check-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-75, 12px);
}

.edit-check-title {
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-medium, 16px);
  line-height: var(--line-height-small, 22px);
  color: var(--color-base, #202122);
}

.edit-check-warning-icon {
  color: var(--color-icon-warning, #ab7f2a);
}

.edit-check-close {
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px;
  max-height: 32px;
  padding: var(--spacing-25, 5px) !important;
}

.edit-check-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100, 16px);
  padding: var(--spacing-50, 8px) var(--spacing-100, 16px) var(--spacing-100, 16px);
}

.edit-check-description :deep(p) {
  margin: 0;
  font-size: var(--font-size-medium, 16px);
  line-height: var(--line-height-small, 22px);
  color: var(--color-subtle, #54595d);
}

.edit-check-description :deep(a) {
  color: var(--color-progressive, #36c);
}

.edit-check-pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 16px);
  padding: var(--spacing-25, 6px) var(--spacing-100, 16px);
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.pagination-text {
  flex: 1;
  text-align: right;
  font-size: var(--font-size-medium, 16px);
  line-height: var(--line-height-small, 22px);
  color: var(--color-subtle, #54595d);
}

.pagination-buttons {
  display: flex;
  gap: var(--spacing-100, 16px);
}

.pagination-btn {
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px;
  max-height: 32px;
  padding: var(--spacing-25, 5px) !important;
}
</style>
