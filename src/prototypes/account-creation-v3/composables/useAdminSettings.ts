import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defaultSettings, type AdminSettings } from '../config/adminSettings'

export function useAdminSettings() {
  const route = useRoute()
  const router = useRouter()

  const settings = computed<AdminSettings>(() => {
    const parsed: AdminSettings = JSON.parse(JSON.stringify(defaultSettings))

    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value !== 'string') continue

      // general-fullWidthNextButton, etc.
      const generalMatch = key.match(/^general-(\w+)$/)
      if (generalMatch) {
        const [, settingName] = generalMatch
        if (settingName in parsed.general) {
          parsed.general[settingName as keyof AdminSettings['general']] = value === '1'
        }
        continue
      }

      // username-taken, password-weak, etc.
      const behaviorMatch = key.match(/^(\w+)-(\w+)$/)
      if (behaviorMatch) {
        const [, fieldName, behaviorName] = behaviorMatch
        const field = parsed.fields[fieldName as keyof AdminSettings['fields']]
        if (field && behaviorName in field.behaviors) {
          field.behaviors[behaviorName] = value === '1'
        }
      }
    }

    return parsed
  })

  function updateSettings(newSettings: AdminSettings) {
    const query: Record<string, string> = {}

    // Serialize general settings
    for (const [settingName, enabled] of Object.entries(newSettings.general)) {
      if (enabled !== defaultSettings.general[settingName as keyof AdminSettings['general']]) {
        query[`general-${settingName}`] = enabled ? '1' : '0'
      }
    }

    // Serialize field behaviors
    for (const [fieldName, fieldConfig] of Object.entries(newSettings.fields)) {
      const fieldDefaults = defaultSettings.fields[fieldName as keyof AdminSettings['fields']]

      for (const [behaviorName, enabled] of Object.entries(fieldConfig.behaviors)) {
        if (enabled !== fieldDefaults.behaviors[behaviorName]) {
          query[`${fieldName}-${behaviorName}`] = enabled ? '1' : '0'
        }
      }
    }

    // Preserve non-settings query params
    const preserved: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value !== 'string') continue
      if (!key.match(/^(\w+)-(\w+)$/)) {
        preserved[key] = value
      }
    }

    router.replace({ query: { ...preserved, ...query } })
  }

  return { settings, updateSettings }
}
