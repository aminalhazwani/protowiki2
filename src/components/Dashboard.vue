<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <main class="personal-dashboard-clone">
    <div v-if="slots.banner" class="dashboard-mobile-banner">
      <slot name="banner" />
    </div>

    <div v-if="slots.mobile" class="dashboard-mobile-cards">
      <slot name="mobile" />
    </div>

    <div class="dashboard-main">
      <div class="personal-dashboard-clone__primary dashboard-slot dashboard-slot--desktop-primary">
        <slot name="primary" />
      </div>
      <aside class="dashboard-sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
  </main>
</template>

<style scoped>
.personal-dashboard-clone__primary {
  min-width: 0;
  box-sizing: border-box;
}
</style>

<style>
/* Shell: grid, banner, desktop primary/sidebar regions */
.personal-dashboard-clone {
  width: 100%;
  margin: 0 auto;
  font-size: 14px;
}

.dashboard-mobile-banner {
  display: none;
}

.dashboard-mobile-cards {
  display: none;
}

@media (max-width: 640px) {
  .dashboard-mobile-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: -1rem;
    margin-bottom: 1rem;
  }

  .dashboard-mobile-banner__feedback {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #3366cc;
    text-decoration: none;
    font-size: 14px;
  }

  .dashboard-mobile-banner__feedback:hover {
    text-decoration: underline;
  }

  .dashboard-main {
    display: none !important;
  }

  .dashboard-mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
}

/* Two columns when desktop grid is shown (>640px). */
.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 34%);
  gap: 2rem;
  align-items: start;
  padding-bottom: 1rem;
}

/* Primary column: e.g. Review Changes feed */
.personal-dashboard-clone .review-changes {
  min-width: 0;
  border: 1px solid var(--border-color-subtle, #a2a9b1);
  border-radius: 2px;
}

.personal-dashboard-clone .review-changes.review-changes--no-border {
  border: none;
  border-radius: 0;
  padding: 0;
  padding-top: 17px;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.review-changes-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review-changes-controls__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-changes-controls__row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ratio-slider-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ratio-slider {
  flex: 1;
  min-width: 80px;
}

.ratio-slider-value {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 2.5em;
}

.dashboard-slot {
  min-height: 4rem;
  box-sizing: border-box;
}

/* Static modules use `.sidebar-card__title` (18px); tappable rows use `.mobile-card__title` (16px) — unify in the mobile stack only. */
.dashboard-mobile-cards .sidebar-card__title {
  font-size: 16px;
}
</style>
