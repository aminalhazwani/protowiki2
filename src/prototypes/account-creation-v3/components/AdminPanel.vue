<template>
  <div class="admin-overlay" @click.self="$emit('close')">
    <div class="admin-panel" :class="{ 'no-transitions': suppressTransitions }">
      <div class="admin-header">
        <h2>Settings</h2>
        <CdxButton weight="quiet" aria-label="Close" @click="$emit('close')">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <!-- General -->
      <div class="field-group">
        <CdxLabel>General</CdxLabel>
        <CdxCheckbox
          v-for="(label, settingName) in generalLabels"
          :key="settingName"
          :checkbox-id="`general-${settingName}`"
          :model-value="localSettings.general[settingName as keyof AdminSettings['general']]"
          @update:model-value="(v: boolean) => updateGeneralSetting(settingName as keyof AdminSettings['general'], v)"
        >
          {{ label }}
        </CdxCheckbox>
      </div>

      <!-- Username -->
      <div class="field-group">
        <CdxLabel>Username</CdxLabel>
        <CdxCheckbox
          v-for="(label, behaviorName) in behaviorLabels.username"
          :key="behaviorName"
          :checkbox-id="`username-${behaviorName}`"
          :model-value="localSettings.fields.username.behaviors[behaviorName]"
          @update:model-value="(v: boolean) => updateFieldBehavior('username', behaviorName, v)"
        >
          {{ label }}
        </CdxCheckbox>
      </div>

      <!-- Password -->
      <div class="field-group">
        <CdxLabel>Password</CdxLabel>
        <CdxCheckbox
          v-for="(label, behaviorName) in behaviorLabels.password"
          :key="behaviorName"
          :checkbox-id="`password-${behaviorName}`"
          :model-value="localSettings.fields.password.behaviors[behaviorName]"
          @update:model-value="(v: boolean) => updateFieldBehavior('password', behaviorName, v)"
        >
          {{ label }}
        </CdxCheckbox>
      </div>

      <!-- Confirm password -->
      <div class="field-group">
        <CdxLabel>Confirm password</CdxLabel>
        <CdxCheckbox
          v-for="(label, behaviorName) in behaviorLabels.confirmPassword"
          :key="behaviorName"
          :checkbox-id="`confirmPassword-${behaviorName}`"
          :model-value="localSettings.fields.confirmPassword.behaviors[behaviorName]"
          @update:model-value="
            (v: boolean) => updateFieldBehavior('confirmPassword', behaviorName, v)
          "
        >
          {{ label }}
        </CdxCheckbox>
      </div>

      <!-- Email address -->
      <div class="field-group">
        <CdxLabel>Email address</CdxLabel>
        <CdxCheckbox
          v-for="(label, behaviorName) in behaviorLabels.email"
          :key="behaviorName"
          :checkbox-id="`email-${behaviorName}`"
          :model-value="localSettings.fields.email.behaviors[behaviorName]"
          @update:model-value="(v: boolean) => updateFieldBehavior('email', behaviorName, v)"
        >
          {{ label }}
        </CdxCheckbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { CdxButton, CdxIcon, CdxLabel, CdxCheckbox } from '@wikimedia/codex'
import { cdxIconClose } from '@wikimedia/codex-icons'
import { useAdminSettings } from '../composables/useAdminSettings'
import { behaviorLabels, generalLabels, type AdminSettings } from '../config/adminSettings'

defineEmits<{ close: [] }>()

// Suppress CSS transitions on mount so controls don't animate to their initial state
const suppressTransitions = ref(true)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressTransitions.value = false
    })
  })
})

const { settings, updateSettings } = useAdminSettings()

const localSettings = ref<AdminSettings>(JSON.parse(JSON.stringify(settings.value)))

watch(
  settings,
  (newSettings) => {
    localSettings.value = JSON.parse(JSON.stringify(newSettings))
  },
  { deep: true },
)

function updateGeneralSetting(settingName: keyof AdminSettings['general'], enabled: boolean) {
  localSettings.value.general[settingName] = enabled
  updateSettings(localSettings.value)
}

function updateFieldBehavior(
  fieldName: keyof AdminSettings['fields'],
  behaviorName: string,
  enabled: boolean,
) {
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
  max-width: 80vw;
  background: #fff;
  height: 100vh;
  overflow-y: auto;
  padding: 16px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.admin-header h2 {
  margin: 0;
  font-size: 18px;
}

.field-group {
  margin-top: var(--spacing-150);
}

.no-transitions :deep(*) {
  transition: none !important;
}
</style>
