import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defaultSettings } from '../config/editorSettings'

/**
 * Composable for managing editor settings synchronized with URL query parameters
 * Settings are encoded as query params: ?entryPoint-icon=templateAdd
 */
export function useEditorSettings() {
  const route = useRoute()
  const router = useRouter()

  /**
   * Parse URL query parameters into settings object
   * Falls back to defaultSettings for missing or invalid values
   */
  const settings = computed(() => {
    const parsed = structuredClone(defaultSettings)

    for (const [key, value] of Object.entries(route.query)) {
      const entryPointMatch = key.match(/^entryPoint-(\w+)$/)
      if (entryPointMatch) {
        const settingName = entryPointMatch[1]
        if (settingName in parsed.entryPoint) {
          parsed.entryPoint[settingName] = value
        }
      }

      const outlineMatch = key.match(/^outline-(\w+)$/)
      if (outlineMatch) {
        const settingName = outlineMatch[1]
        if (settingName in parsed.outline) {
          parsed.outline[settingName] = value
        }
      }

      const placeholderMatch = key.match(/^placeholder-(\w+)$/)
      if (placeholderMatch) {
        const settingName = placeholderMatch[1]
        if (settingName in parsed.placeholder) {
          parsed.placeholder[settingName] = value
        }
      }

      const keyboardMatch = key.match(/^keyboard-(\w+)$/)
      if (keyboardMatch) {
        const settingName = keyboardMatch[1]
        if (settingName in parsed.keyboard) {
          parsed.keyboard[settingName] = value
        }
      }

      const citeMatch = key.match(/^cite-(\w+)$/)
      if (citeMatch) {
        const settingName = citeMatch[1]
        if (settingName in parsed.cite) {
          parsed.cite[settingName] = value
        }
      }

      const iconsMatch = key.match(/^icons-(\w+)$/)
      if (iconsMatch) {
        const settingName = iconsMatch[1]
        if (settingName in parsed.icons) {
          parsed.icons[settingName] = value
        }
      }
    }

    return parsed
  })

  /**
   * Serialize settings object to URL query parameters
   * Only writes values that differ from defaults
   */
  function serializeToQuery(settings) {
    const query = {}

    for (const [settingName, value] of Object.entries(settings.entryPoint)) {
      if (value !== defaultSettings.entryPoint[settingName]) {
        query[`entryPoint-${settingName}`] = value
      }
    }

    for (const [settingName, value] of Object.entries(settings.outline)) {
      if (value !== defaultSettings.outline[settingName]) {
        query[`outline-${settingName}`] = value
      }
    }

    for (const [settingName, value] of Object.entries(settings.placeholder)) {
      if (value !== defaultSettings.placeholder[settingName]) {
        query[`placeholder-${settingName}`] = value
      }
    }

    for (const [settingName, value] of Object.entries(settings.keyboard)) {
      if (value !== defaultSettings.keyboard[settingName]) {
        query[`keyboard-${settingName}`] = value
      }
    }

    for (const [settingName, value] of Object.entries(settings.cite)) {
      if (value !== defaultSettings.cite[settingName]) {
        query[`cite-${settingName}`] = value
      }
    }

    for (const [settingName, value] of Object.entries(settings.icons)) {
      if (value !== defaultSettings.icons[settingName]) {
        query[`icons-${settingName}`] = value
      }
    }

    return query
  }

  /**
   * Update settings and sync to URL
   * Preserves other query params
   */
  function updateSettings(newSettings) {
    const settingsQuery = serializeToQuery(newSettings)

    // Preserve non-settings query params
    const preservedQuery = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (!key.match(/^(entryPoint|outline|placeholder|keyboard|cite|icons)-\w+$/)) {
        preservedQuery[key] = value
      }
    }

    router.replace({ query: { ...preservedQuery, ...settingsQuery } })
  }

  return { settings, updateSettings }
}
