<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowNext } from '@wikimedia/codex-icons'

interface Props {
  /** Shown as the module heading row. */
  title?: string
  /**
   * In-app route — renders a tappable mobile link card (title row, arrow, body, optional blue CTA).
   */
  to?: RouteLocationRaw
  /**
   * External URL — same link-card layout as **`to`**, as **`<a target="_blank">`**.
   */
  href?: string
  /**
   * Label for the bottom **`.mobile-card__button`** strip when **`to`** or **`href`** is set.
   * Omit **`ctaLabel`** (and **`#cta`**) for a link card with no blue strip — the row stays tappable.
   * Override with the **`#cta`** slot for custom strip content.
   */
  ctaLabel?: string
  /**
   * When **`true`**, the progressive CTA row is not rendered (link /RouterLink behavior unchanged).
   * Prefer omitting **`ctaLabel`** / **`#cta`**; use this to explicitly suppress the strip.
   */
  hideCta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  to: undefined,
  href: undefined,
  ctaLabel: undefined,
  hideCta: false,
})

function trimmedTitle(): string {
  const t = props.title
  if (t == null) return ''
  return String(t).trim()
}
</script>

<template>
  <RouterLink
    v-if="props.to != null && String(props.to).length > 0"
    :to="props.to"
    class="mobile-card mobile-card--link dashboard-module dashboard-slot"
  >
    <div v-if="trimmedTitle()" class="mobile-card__header">
      <span class="mobile-card__title">{{ trimmedTitle() }}</span>
      <CdxIcon :icon="cdxIconArrowNext" size="medium" class="mobile-card__arrow" />
    </div>
    <div class="mobile-card__content mobile-card__content--preview dashboard-module__body">
      <slot />
    </div>
    <slot v-if="!props.hideCta" name="cta">
      <span v-if="props.ctaLabel?.trim()" class="mobile-card__button">{{ props.ctaLabel }}</span>
    </slot>
  </RouterLink>

  <a
    v-else-if="props.href?.trim()"
    :href="props.href.trim()"
    target="_blank"
    rel="noopener noreferrer"
    class="mobile-card mobile-card--link dashboard-module dashboard-slot"
  >
    <div v-if="trimmedTitle()" class="mobile-card__header">
      <span class="mobile-card__title">{{ trimmedTitle() }}</span>
      <CdxIcon :icon="cdxIconArrowNext" size="medium" class="mobile-card__arrow" />
    </div>
    <div class="mobile-card__content mobile-card__content--preview dashboard-module__body">
      <slot />
    </div>
    <slot v-if="!props.hideCta" name="cta">
      <span v-if="props.ctaLabel?.trim()" class="mobile-card__button">{{ props.ctaLabel }}</span>
    </slot>
  </a>

  <section v-else class="sidebar-card dashboard-module dashboard-slot">
    <div v-if="trimmedTitle()" class="sidebar-card__title">
      {{ trimmedTitle() }}
    </div>
    <div class="dashboard-module__body">
      <slot />
    </div>
  </section>
</template>

<style>
/* Module cards: sidebar + mobile link variants */
.mobile-card {
  border: 1px solid var(--border-color-subtle, #a2a9b1);
  border-radius: 2px;
  padding: 1rem;
}

.mobile-card--link {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.mobile-card--link:visited,
.mobile-card--link:visited:hover {
  text-decoration: none;
  color: inherit;
}

.mobile-card--link:hover,
.mobile-card--link:focus {
  outline: none;
  background-color: var(--background-color-interactive, #eaecf0);
  text-decoration: none;
  color: inherit;
}

.mobile-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mobile-card__title {
  font-weight: bold;
  font-size: 16px;
}

.mobile-card__arrow {
  color: var(--color-base--subtle, #54595d);
  flex-shrink: 0;
  padding: 0;
  transform: scale(1.4);
}

.mobile-card__arrow .cdx-icon {
  padding: 0;
}

.mobile-card__content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.4;
  font-size: 14px;
}

.mobile-card__content--stacked {
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-card:not(.mobile-card--link) .mobile-card__content {
  margin-top: 0.75rem;
}

.mobile-card__content-icon {
  color: var(--color-base--subtle, #54595d);
  flex-shrink: 0;
  margin-top: 0.1em;
}

.mobile-card__content-text {
  flex: 1;
  min-width: 0;
  color: var(--color-base, #202122);
}

.mobile-card__content--preview {
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  line-height: 1.4;
}

.mobile-card__stat-icon {
  color: var(--color-base--subtle, #54595d);
  flex-shrink: 0;
}

.mobile-card__stat {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--spacing-50, 8px);
  row-gap: var(--spacing-25, 4px);
  min-width: 0;
}

.mobile-card__stat-link {
  color: var(--color-progressive, #36c);
  font-weight: 700;
  text-decoration: none;
}

.mobile-card__stat-link:hover {
  text-decoration: underline;
}

.mobile-card__stat-value {
  font-weight: 700;
}

.mobile-card__button {
  display: block;
  align-self: stretch;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.25rem 1rem;
  background-color: var(--background-color-progressive, #36c);
  color: var(--color-inverted, #fff);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
}

.sidebar-card {
  border: 1px solid var(--border-color-subtle, #a2a9b1);
  border-radius: 2px;
  padding: 1rem;
}

.sidebar-card__title {
  margin: 0 0 0.75rem 0;
  padding: 0;
  font-weight: bold;
  font-size: 18px;
}

.sidebar-card .cdx-label {
  font-size: 14px;
}

.dashboard-module__body {
  min-width: 0;
}

.your-impact__metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0;
}

.your-impact__metric {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
  padding: 0 0.75rem;
}

.your-impact__metric:first-child {
  padding-left: 0;
}

.your-impact__metric:last-child {
  padding-right: 0;
}

.your-impact__divider {
  flex-shrink: 0;
  width: 1px;
  min-height: 2.5rem;
  align-self: stretch;
  background-color: var(--border-color-subtle, #a2a9b1);
}

.your-impact__value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.your-impact__icon {
  color: var(--color-base--subtle, #54595d);
}

.your-impact__value {
  font-weight: 400;
  line-height: 1.2;
  color: var(--color-base, #202122);
}

.your-impact__value-link {
  color: var(--color-progressive, #36c);
  font-weight: 700;
  text-decoration: none;
}

.your-impact__value-link:hover {
  text-decoration: underline;
}

.your-impact__label {
  color: var(--color-base--subtle, #54595d);
  flex-shrink: 0;
}
</style>
