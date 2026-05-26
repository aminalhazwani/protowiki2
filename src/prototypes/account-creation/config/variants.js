/**
 * Per-variant overrides for defaultSettings.
 * Each key defines only the diffs from the base defaults in adminSettings.js.
 * Set VITE_VARIANT=v1|v2|v3 at build time to select.
 */
export const variants = {
  v1: {
    hcaptcha: { position: 'above' },
    fields: {
      username: { behaviors: { learnMoreLink: true } },
    },
  },
  v2: {},
  v3: {},
}
