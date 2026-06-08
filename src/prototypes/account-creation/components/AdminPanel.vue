<template>
  <div class="admin-overlay" @click.self="$emit('close')">
    <div class="admin-panel" :class="{ 'no-transitions': suppressTransitions }">
      <div class="admin-header">
        <h2>Settings</h2>
        <CdxButton weight="quiet" aria-label="Close" @click="$emit('close')">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <!-- Username section -->
      <div class="field-group">
        <CdxToggleSwitch
          :model-value="localSettings.fields.username.visible"
          @update:model-value="(value) => updateFieldVisibility('username', value)"
        >
          Username
        </CdxToggleSwitch>
        <div
          v-if="
            localSettings.fields.username.visible &&
            Object.keys(behaviorLabels.username || {}).length > 0
          "
        >
          <CdxCheckbox
            v-for="(label, behaviorName) in behaviorLabels.username"
            :key="behaviorName"
            :checkbox-id="`username-${behaviorName}`"
            :model-value="localSettings.fields.username.behaviors[behaviorName]"
            @update:model-value="(value) => updateFieldBehavior('username', behaviorName, value)"
          >
            {{ label }}
          </CdxCheckbox>
        </div>
      </div>

      <!-- Password section -->
      <div class="field-group">
        <CdxToggleSwitch
          :model-value="localSettings.fields.password.visible"
          @update:model-value="(value) => updateFieldVisibility('password', value)"
        >
          Password
        </CdxToggleSwitch>
        <div
          v-if="
            localSettings.fields.password.visible &&
            Object.keys(behaviorLabels.password || {}).length > 0
          "
          class="behavior-checkboxes"
        >
          <CdxCheckbox
            v-for="(label, behaviorName) in behaviorLabels.password"
            :key="behaviorName"
            :checkbox-id="`password-${behaviorName}`"
            :model-value="localSettings.fields.password.behaviors[behaviorName]"
            @update:model-value="(value) => updateFieldBehavior('password', behaviorName, value)"
          >
            {{ label }}
          </CdxCheckbox>
        </div>
      </div>

      <!-- Confirm password section -->
      <div class="field-group">
        <CdxToggleSwitch
          :model-value="localSettings.fields.confirmPassword.visible"
          @update:model-value="(value) => updateFieldVisibility('confirmPassword', value)"
        >
          Confirm password
        </CdxToggleSwitch>
        <div
          v-if="
            localSettings.fields.confirmPassword.visible &&
            Object.keys(behaviorLabels.confirmPassword || {}).length > 0
          "
        >
          <CdxCheckbox
            v-for="(label, behaviorName) in behaviorLabels.confirmPassword"
            :key="behaviorName"
            :checkbox-id="`confirmPassword-${behaviorName}`"
            :model-value="localSettings.fields.confirmPassword.behaviors[behaviorName]"
            @update:model-value="
              (value) => updateFieldBehavior('confirmPassword', behaviorName, value)
            "
          >
            {{ label }}
          </CdxCheckbox>
        </div>
      </div>

      <!-- Email address section -->
      <div class="field-group">
        <CdxToggleSwitch
          :model-value="localSettings.fields.email.visible"
          @update:model-value="(value) => updateFieldVisibility('email', value)"
        >
          Email address
        </CdxToggleSwitch>
        <div
          v-if="
            localSettings.fields.email.visible && Object.keys(behaviorLabels.email || {}).length > 0
          "
        >
          <CdxCheckbox
            v-for="(label, behaviorName) in behaviorLabels.email"
            :key="behaviorName"
            :checkbox-id="`email-${behaviorName}`"
            :model-value="localSettings.fields.email.behaviors[behaviorName]"
            @update:model-value="(value) => updateFieldBehavior('email', behaviorName, value)"
          >
            {{ label }}
          </CdxCheckbox>
        </div>
      </div>

      <!-- General settings -->
      <div class="field-group">
        <CdxLabel>General</CdxLabel>
        <CdxCheckbox
          v-for="(label, settingName) in generalLabels"
          :key="settingName"
          :checkbox-id="`general-${settingName}`"
          :model-value="localSettings.general[settingName]"
          @update:model-value="(value) => updateGeneralSetting(settingName, value)"
        >
          {{ label }}
        </CdxCheckbox>
      </div>

      <!-- hCaptcha location -->
      <div class="field-group">
        <CdxLabel>hCaptcha location</CdxLabel>
        <CdxRadio
          v-for="(label, value) in hcaptchaLabels"
          :key="value"
          :model-value="localSettings.hcaptcha.position"
          :input-value="value"
          name="hcaptcha-position"
          @update:model-value="updateHcaptchaSetting"
        >
          {{ label }}
        </CdxRadio>
      </div>

      <!-- Codex inputs height -->
      <div class="field-group">
        <CdxLabel>Codex inputs height</CdxLabel>
        <CdxRadio
          v-for="(label, value) in inputHeightLabels"
          :key="value"
          :model-value="localSettings.inputHeight.size"
          :input-value="value"
          name="input-height-size"
          @update:model-value="updateInputHeightSetting"
        >
          {{ label }}
        </CdxRadio>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { CdxButton, CdxIcon, CdxLabel, CdxToggleSwitch, CdxCheckbox, CdxRadio } from '@wikimedia/codex'
import { cdxIconClose } from '@wikimedia/codex-icons'
import { useAdminSettings } from '../composables/useAdminSettings'
import { behaviorLabels, generalLabels, hcaptchaLabels, inputHeightLabels } from '../config/adminSettings'

defineEmits(['close'])

// Suppress CSS transitions on mount so toggles/checkboxes don't animate to their initial state
const suppressTransitions = ref(true)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressTransitions.value = false
    })
  })
})

const { settings, updateSettings } = useAdminSettings()

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

function updateHcaptchaSetting(value) {
  localSettings.value.hcaptcha.position = value
  updateSettings(localSettings.value)
}

function updateInputHeightSetting(value) {
  localSettings.value.inputHeight.size = value
  updateSettings(localSettings.value)
}

function updateGeneralSetting(settingName, value) {
  localSettings.value.general[settingName] = value
  updateSettings(localSettings.value)
}

function updateFieldVisibility(fieldName, visible) {
  localSettings.value.fields[fieldName].visible = visible

  // If hiding a field, also disable its behaviors
  if (!visible) {
    for (const behaviorName in localSettings.value.fields[fieldName].behaviors) {
      localSettings.value.fields[fieldName].behaviors[behaviorName] = false
    }
  }

  updateSettings(localSettings.value)
}

// Behaviors that are mutually exclusive within a field
const exclusiveGroups = {
  username: ['learnMoreLink', 'chooseCarefullyCopy', 'thingsToKnowCopy'],
}

function updateFieldBehavior(fieldName, behaviorName, enabled) {
  // If enabling a behavior that belongs to an exclusive group, disable the others
  if (enabled && exclusiveGroups[fieldName]) {
    const group = exclusiveGroups[fieldName]
    if (group.includes(behaviorName)) {
      for (const other of group) {
        if (other !== behaviorName) {
          localSettings.value.fields[fieldName].behaviors[other] = false
        }
      }
    }
  }

  localSettings.value.fields[fieldName].behaviors[behaviorName] = enabled
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

.admin-hint {
  font-size: 12px;
  color: var(--color-subtle, #54595d);
  margin: 4px 0 16px;
}

.field-group {
  margin-top: var(--spacing-150);
}

.field-group :deep(.cdx-toggle-switch) {
  width: var(--size-full);
}

.field-group :deep(.cdx-toggle-switch__label) {
  width: var(--size-full);
}

.field-group :deep(.cdx-toggle-switch__label > .cdx-label__label > .cdx-label__label__text) {
  font-weight: var(--font-weight-bold);
}

.no-transitions :deep(*) {
  transition: none !important;
}
</style>
