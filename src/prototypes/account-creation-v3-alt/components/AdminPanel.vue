<template>
  <div class="admin-overlay" @click.self="$emit('close')">
    <div class="admin-panel">
      <div class="admin-header">
        <h2>Settings</h2>
        <CdxButton weight="quiet" aria-label="Close" @click="$emit('close')">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <div class="field-group">
        <CdxLabel>Username</CdxLabel>
        <CdxCheckbox
          checkbox-id="username-autoFocus"
          :model-value="localSettings.fields.username.behaviors.autoFocus"
          @update:model-value="(value) => updateBehavior('username', 'autoFocus', value)"
        >
          Auto-focus on page load
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-taken"
          :model-value="localSettings.fields.username.behaviors.taken"
          @update:model-value="(value) => updateBehavior('username', 'taken', value)"
        >
          Force "username taken" warning
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-showUsernameHelperText"
          :model-value="localSettings.fields.username.behaviors.showUsernameHelperText"
          @update:model-value="(value) => updateBehavior('username', 'showUsernameHelperText', value)"
        >
          Show username suggestion
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-showUsernameHelperTextChip"
          :model-value="localSettings.fields.username.behaviors.showUsernameHelperTextChip"
          @update:model-value="(value) => updateBehavior('username', 'showUsernameHelperTextChip', value)"
        >
          Username suggestion as chip
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-showUsernameHelperTextChips"
          :model-value="localSettings.fields.username.behaviors.showUsernameHelperTextChips"
          @update:model-value="(value) => updateBehavior('username', 'showUsernameHelperTextChips', value)"
        >
          Show three username suggestions as chips
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-advanceFocusOnSuggestion"
          :model-value="localSettings.fields.username.behaviors.advanceFocusOnSuggestion"
          @update:model-value="(value) => updateBehavior('username', 'advanceFocusOnSuggestion', value)"
        >
          Advance focus to password on suggestion select
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-validationSwapsHelpText"
          :model-value="localSettings.fields.username.behaviors.validationSwapsHelpText"
          @update:model-value="(value) => updateBehavior('username', 'validationSwapsHelpText', value)"
        >
          Validation replaces help text in place
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-showReloadUsername"
          :model-value="localSettings.fields.username.behaviors.showReloadUsername"
          @update:model-value="(value) => updateBehavior('username', 'showReloadUsername', value)"
        >
          Show "reload username" button
        </CdxCheckbox>
        <CdxCheckbox
          checkbox-id="username-prefillUsername"
          :model-value="localSettings.fields.username.behaviors.prefillUsername"
          @update:model-value="(value) => updateBehavior('username', 'prefillUsername', value)"
        >
          Pre-fill username with suggestion
        </CdxCheckbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CdxButton, CdxIcon, CdxCheckbox, CdxLabel } from '@wikimedia/codex'
import { cdxIconClose } from '@wikimedia/codex-icons'
import { useAdminSettings } from '../composables/useAdminSettings.js'

defineEmits(['close'])

const { settings, updateSettings } = useAdminSettings()
const localSettings = ref(structuredClone(settings.value))

watch(settings, (val) => { localSettings.value = structuredClone(val) }, { deep: true })

function updateBehavior(fieldName, behaviorName, value) {
  localSettings.value.fields[fieldName].behaviors[behaviorName] = value
  updateSettings(localSettings.value)
}
</script>

<style scoped>
.admin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.admin-panel {
  width: 320px;
  max-width: 90vw;
  background: #fff;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h2 {
  margin: 0;
  font-size: 18px;
}

.field-group {
  margin-top: var(--spacing-150);
}
</style>
