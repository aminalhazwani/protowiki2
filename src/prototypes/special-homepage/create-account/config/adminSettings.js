import { variants } from './variants.js'

/**
 * Deep-merge source into target (mutates target).
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

/**
 * Admin panel settings configuration
 * Defines the structure and default values for field visibility and behaviors
 */

const baseSettings = {
  general: {
    multiStep: false,
  },
  hcaptcha: {
    position: 'below', // 'above' or 'below' the CTA button
  },
  inputHeight: {
    size: '32', // '32', '36', or '40' pixels
  },
  fields: {
    username: {
      visible: true,
      behaviors: {
        validateWhileTyping: true, // "Run validation while typing"
        taken: false, // "Any username triggers a taken username error"
        autoFocus: true, // "Focus username field on page load"
        autoCapitalize: true, // "Capitalize first letter as user types"
        learnMoreLink: false, // "Show 'Learn more' link instead of policy popover"
        chooseCarefullyCopy: true, // "'Choose carefully' description copy"
        thingsToKnowCopy: false, // "'Things to know' description copy"
        showUsernameHelperText: false, // "Show username suggestion below field"
        showUsernameHelperTextChip: false, // "Show username suggestion as info chip"
        showUsernameHelperTextChips: false, // "Show three username suggestions as chips"
        advanceFocusOnSuggestion: false, // "Move focus to password field after selecting suggestion"
        validationSwapsHelpText: false, // "Validation result replaces help text in place"
        showReloadUsername: false, // "Show reload username button"
        prefillUsername: false, // "Pre-fill username field with a generated username"
      },
    },
    password: {
      visible: true,
      behaviors: {
        enforceLength: true, // "Enforce password length requirement" (default on)
        weak: false, // "Any password triggers a weak password warning"
        showToggle: true, // "Display show password button"
        emailPassword: false, // "Show email me a password option"
        hideHelperText: true, // "Hide helper text"
      },
    },
    confirmPassword: {
      visible: true,
      behaviors: {
        matchValidation: true, // "Password match validation" (default on)
        showToggle: true, // "Display show password button"
      },
    },
    email: {
      visible: true,
      behaviors: {
        emailValidation: true, // "Email validation" (default on)
        hideDescription: true, // "Hide description text"
        hideOptionalFlag: true, // "Hide (recommended) flag"
      },
    },
  },
}

/**
 * Return the default settings for a given variant, merging overrides from variants.js.
 * Used at runtime (route-based) and build-time (VITE_VARIANT env var).
 */
export function getDefaultSettings(variant) {
  return deepMerge(structuredClone(baseSettings), variants[variant] || {})
}

/** Static default for build-time variant (backward compat) */
export const defaultSettings = getDefaultSettings(import.meta.env.VITE_VARIANT || 'v2')

/**
 * Field labels for display in the admin panel
 */
export const fieldLabels = {
  username: 'Username',
  password: 'Password',
  confirmPassword: 'Confirm password',
  email: 'Email address',
}

/**
 * General setting labels for display in the admin panel
 */
export const generalLabels = {
  multiStep: 'Multi-step form',
}

/**
 * hCaptcha position labels for display in the admin panel
 */
export const hcaptchaLabels = {
  above: 'Above CTA',
  below: 'Below CTA',
  hidden: 'Hidden',
}

/**
 * Input height labels for display in the admin panel
 */
export const inputHeightLabels = {
  32: '32px',
  36: '36px',
  40: '40px',
}

/**
 * Behavior labels for display in the admin panel
 */
export const behaviorLabels = {
  username: {
    validateWhileTyping: 'Validate in real time',
    taken: 'Force "username taken" warning',
    autoFocus: 'Auto-focus on page load',
    autoCapitalize: 'Auto-capitalize username',
    learnMoreLink: 'Show "Learn more" link',
    chooseCarefullyCopy: '"Choose carefully" copy',
    thingsToKnowCopy: '"Things to know" copy',
    showUsernameHelperText: 'Show username suggestion',
    showUsernameHelperTextChip: 'Show username suggestion as chip',
    showUsernameHelperTextChips: 'Show three username suggestions as chips',
    advanceFocusOnSuggestion: 'Advance focus to password on suggestion select',
    validationSwapsHelpText: 'Validation replaces help text in place',
    showReloadUsername: 'Show "reload username" button',
  },
  password: {
    enforceLength: 'Enforce length requirement',
    weak: 'Force weak password warning',
    showToggle: 'Show "reveal password" toggle',
    emailPassword: 'Show "email me a password" option',
    hideHelperText: 'Hide helper text',
  },
  confirmPassword: {
    matchValidation: 'Enforce match validation',
    showToggle: 'Show "reveal password" toggle',
  },
  email: {
    emailValidation: 'Validate email format',
    hideDescription: 'Hide description',
    hideOptionalFlag: 'Hide optional flag',
  },
}
