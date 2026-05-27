<template>
  <EditCheckCard title="Revise Tone" :visible="isCardVisible" @close="onDismiss">
    <template #description>
      <p>
        Other editors often revise this kind of wording to have a more balanced tone.
        <a
          href="https://meta.wikimedia.org/wiki/Neutral_point_of_view"
          target="_blank"
          rel="noopener"
        >
          Learn more
        </a>
      </p>
    </template>
    <template #actions>
      <div class="revise-tone-buttons">
        <CdxButton @click="onRevise">Revise</CdxButton>
        <CdxButton @click="onDecline">Decline</CdxButton>
      </div>
    </template>
    <template #footer>
      <div class="revise-tone-disclaimer">
        <CdxIcon :icon="icons.cdxIconRobot" size="small" class="revise-tone-disclaimer-icon" />
        <span>
          Identified using a
          <a
            href="https://meta.wikimedia.org/wiki/Special:MyLanguage/Machine_learning_models/Proposed/Tone_Check"
            target="_blank"
            rel="noopener"
          >
            BERT model
          </a>
        </span>
      </div>
    </template>
  </EditCheckCard>
</template>

<script setup>
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
import EditCheckCard from './EditCheckCard.vue'
import { usePeacockDetection } from '../composables/usePeacockDetection'
import { useEditorInstance } from '../composables/useEditorInstance'

const { isCardVisible, revise, dismissCard, decline } = usePeacockDetection()
const { getEditor } = useEditorInstance()

function onRevise() {
  const editor = getEditor()
  if (editor) revise(editor)
}

function onDismiss() {
  const editor = getEditor()
  if (editor) dismissCard(editor)
}

function onDecline() {
  const editor = getEditor()
  if (editor) decline(editor)
}
</script>

<style scoped>
.revise-tone-buttons {
  display: flex;
  gap: var(--spacing-75, 12px);
}

.revise-tone-disclaimer {
  display: flex;
  align-items: center;
  gap: var(--spacing-25, 6px);
  font-size: var(--font-size-small, 14px);
  line-height: var(--line-height-small, 22px);
  color: var(--color-subtle, #54595d);
}

.revise-tone-disclaimer-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-placeholder);
  margin-top: -3px;
}

.revise-tone-disclaimer a {
  color: var(--color-progressive, #36c);
}
</style>
