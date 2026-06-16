import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDefaultSettings } from '../config/adminSettings'

/**
 * Composable for managing admin settings synchronized with URL query parameters
 * Settings are encoded as query params: ?username-visible=1&username-taken=1
 *
 * Variant is read from ?variant=v1 (was a /v1 path segment in the monorepo
 * source — switched to a query param because protowiki2 auto-routes each
 * prototype folder to a single path and doesn't support per-prototype path
 * params).
 */
export function useAdminSettings() {
  const route = useRoute()
  const router = useRouter()

  const variantDefaults = computed(() => {
    const variant = route.query.variant || import.meta.env.VITE_VARIANT || 'v2'
    return getDefaultSettings(variant)
  })

  /**
   * Parse URL query parameters into settings object
   * Falls back to variant-specific defaults for missing or invalid values
   */
  const settings = computed(() => {
    const defaults = variantDefaults.value
    const parsed = structuredClone(defaults)

    for (const [key, value] of Object.entries(route.query)) {
      // Parse hcaptcha params: hcaptcha-position
      const hcaptchaMatch = key.match(/^hcaptcha-(\w+)$/)
      if (hcaptchaMatch) {
        const settingName = hcaptchaMatch[1]
        if (settingName in parsed.hcaptcha) {
          const allowed = ['above', 'below', 'hidden']
          if (allowed.includes(value)) {
            parsed.hcaptcha[settingName] = value
          }
        }
        continue
      }

      // Parse inputHeight params: inputHeight-size
      const inputHeightMatch = key.match(/^inputHeight-(\w+)$/)
      if (inputHeightMatch) {
        const settingName = inputHeightMatch[1]
        if (settingName in parsed.inputHeight) {
          const allowed = ['32', '36', '40']
          if (allowed.includes(value)) {
            parsed.inputHeight[settingName] = value
          }
        }
        continue
      }

      // Parse general params: general-multiStep, etc.
      const generalMatch = key.match(/^general-(\w+)$/)
      if (generalMatch) {
        const settingName = generalMatch[1]
        if (settingName in parsed.general) {
          parsed.general[settingName] = value === '1'
        }
        continue
      }

      // Parse visibility params: username-visible, password-visible, etc.
      const visibilityMatch = key.match(/^(\w+)-visible$/)
      if (visibilityMatch) {
        const fieldName = visibilityMatch[1]
        if (parsed.fields[fieldName]) {
          parsed.fields[fieldName].visible = value === '1'
        }
        continue
      }

      // Parse behavior params: username-taken, password-weak, etc.
      const behaviorMatch = key.match(/^(\w+)-(\w+)$/)
      if (behaviorMatch) {
        const [, fieldName, behaviorName] = behaviorMatch
        if (
          parsed.fields[fieldName] &&
          behaviorName in parsed.fields[fieldName].behaviors
        ) {
          parsed.fields[fieldName].behaviors[behaviorName] = value === '1'
        }
      }
    }

    return parsed
  })

  /**
   * Serialize settings object to URL query parameters
   * Diffs against the current variant's defaults so only overrides appear in the URL
   */
  function serializeToQuery(settings) {
    const defaults = variantDefaults.value
    const query = {}

    // Serialize hcaptcha settings
    for (const [settingName, value] of Object.entries(settings.hcaptcha)) {
      if (value !== defaults.hcaptcha[settingName]) {
        query[`hcaptcha-${settingName}`] = value
      }
    }

    // Serialize inputHeight settings
    for (const [settingName, value] of Object.entries(settings.inputHeight)) {
      if (value !== defaults.inputHeight[settingName]) {
        query[`inputHeight-${settingName}`] = value
      }
    }

    // Serialize general settings
    for (const [settingName, value] of Object.entries(settings.general)) {
      if (value !== defaults.general[settingName]) {
        query[`general-${settingName}`] = value ? '1' : '0'
      }
    }

    for (const [fieldName, fieldConfig] of Object.entries(settings.fields)) {
      const fieldDefaults = defaults.fields[fieldName]

      // Serialize visibility only if it differs from default
      if (fieldConfig.visible !== fieldDefaults.visible) {
        query[`${fieldName}-visible`] = fieldConfig.visible ? '1' : '0'
      }

      // Serialize behaviors only if they differ from default
      for (const [behaviorName, enabled] of Object.entries(
        fieldConfig.behaviors,
      )) {
        if (enabled !== fieldDefaults.behaviors[behaviorName]) {
          query[`${fieldName}-${behaviorName}`] = enabled ? '1' : '0'
        }
      }
    }

    return query
  }

  /**
   * Update settings and sync to URL
   * Preserves other query params (like admin=true)
   */
  function updateSettings(newSettings) {
    const settingsQuery = serializeToQuery(newSettings)

    // Preserve non-settings query params
    const preservedQuery = {}
    for (const [key, value] of Object.entries(route.query)) {
      // Keep params that don't match settings pattern
      if (!key.match(/^(\w+)-(?:visible|\w+)$/) && !key.match(/^hcaptcha-/) && !key.match(/^inputHeight-/)) {
        preservedQuery[key] = value
      }
    }

    router.replace({ query: { ...preservedQuery, ...settingsQuery } })
  }

  return { settings, updateSettings }
}
