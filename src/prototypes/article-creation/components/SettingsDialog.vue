<template>
  <CdxDialog v-model:open="open" title="Settings" :use-close-button="true">
    <div class="settings-content" :class="{ 'no-transitions': suppressTransitions }">
      <!-- Entry point section -->
      <div class="field-group">
        <CdxLabel>Entry point</CdxLabel>
        <CdxRadio
          v-for="(label, styleKey) in entryPointLabels"
          :key="styleKey"
          v-model="localSettings.entryPoint.style"
          :input-value="styleKey"
          name="entryPoint-style"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Auto-focus section -->
      <div class="field-group">
        <CdxLabel>Auto-focus</CdxLabel>
        <CdxRadio
          v-for="(label, focusKey) in autoFocusLabels"
          :key="focusKey"
          v-model="localSettings.entryPoint.autoFocus"
          :input-value="focusKey"
          name="entryPoint-autoFocus"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Outline location section -->
      <div class="field-group">
        <CdxLabel>Outline location</CdxLabel>
        <CdxRadio
          v-for="(label, locationKey) in outlineLocationLabels"
          :key="locationKey"
          v-model="localSettings.outline.location"
          :input-value="locationKey"
          name="outline-location"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Outline persistence section -->
      <div class="field-group">
        <CdxLabel>Outline persistence</CdxLabel>
        <CdxRadio
          v-for="(label, persistenceKey) in outlinePersistenceLabels"
          :key="persistenceKey"
          v-model="localSettings.outline.persistence"
          :input-value="persistenceKey"
          name="outline-persistence"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Placeholder cursor behavior section -->
      <div class="field-group">
        <CdxLabel>Placeholder behavior</CdxLabel>
        <CdxRadio
          v-for="(label, cursorKey) in placeholderCursorLabels"
          :key="cursorKey"
          v-model="localSettings.placeholder.cursorBehavior"
          :input-value="cursorKey"
          name="placeholder-cursorBehavior"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- References badge section -->
      <div class="field-group">
        <CdxLabel>References badge</CdxLabel>
        <CdxRadio
          v-for="(label, badgeKey) in citeBadgeLabels"
          :key="badgeKey"
          v-model="localSettings.cite.badge"
          :input-value="badgeKey"
          name="cite-badge"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Icon set section -->
      <div class="field-group">
        <CdxLabel>Icon set</CdxLabel>
        <CdxRadio
          v-for="(label, setKey) in iconSetLabels"
          :key="setKey"
          v-model="localSettings.icons.set"
          :input-value="setKey"
          name="icons-set"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Soft keyboard section -->
      <div class="field-group">
        <CdxLabel>Soft keyboard</CdxLabel>
        <CdxRadio
          v-for="(label, displayKey) in keyboardDisplayLabels"
          :key="displayKey"
          v-model="localSettings.keyboard.display"
          :input-value="displayKey"
          name="keyboard-display"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
    </div>
  </CdxDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { CdxDialog, CdxLabel, CdxRadio } from '@wikimedia/codex'
import { useEditorSettings } from '../composables/useEditorSettings'
import {
  entryPointLabels,
  autoFocusLabels,
  outlineLocationLabels,
  outlinePersistenceLabels,
  placeholderCursorLabels,
  keyboardDisplayLabels,
  citeBadgeLabels,
  iconSetLabels,
} from '../config/editorSettings'

const open = defineModel('open', { type: Boolean, default: false })

// Suppress CSS transitions on mount so radios don't animate to their initial state
const suppressTransitions = ref(true)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressTransitions.value = false
    })
  })
})

const { settings, updateSettings } = useEditorSettings()

// Local copy of settings for reactive updates
const localSettings = ref(structuredClone(settings.value))

// Watch for external URL changes and sync local settings
watch(
  settings,
  (newSettings) => {
    localSettings.value = structuredClone(newSettings)
  },
  { deep: true },
)

function onSettingChange() {
  updateSettings(localSettings.value)
}
</script>

<style scoped>
.field-group {
  margin-top: var(--spacing-75);
}

.field-group :deep(.cdx-label) {
  font-weight: var(--font-weight-bold);
}

.no-transitions :deep(*) {
  transition: none !important;
}
</style>
