<template>
  <header class="wikipedia-header">
    <CdxButton weight="quiet" size="large" aria-label="Menu" class="header-button">
      <CdxIcon :icon="cdxIconMenu" />
    </CdxButton>
    <span class="wikipedia-wordmark">
      <img src="./assets/wikipedia-wordmark.svg" alt="Wikipedia" />
    </span>
    <CdxButton weight="quiet" size="large" aria-label="Search" class="header-button">
      <CdxIcon :icon="cdxIconSearch" />
    </CdxButton>
    <slot name="actions" />
  </header>
</template>

<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconMenu, cdxIconSearch } from '@wikimedia/codex-icons'
</script>

<style scoped>
.wikipedia-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px 0 8px;
  background-color: var(--background-color-interactive, #eaecf0);
  box-shadow: inset 0 -1px 3px 0 rgba(0, 0, 0, 0.08);
  height: 3.375em;
}

.wikipedia-wordmark {
  flex: 1;
  overflow: hidden;
}

a.wikipedia-wordmark {
  text-decoration: none;
}

.wikipedia-wordmark img {
  display: block;
  height: 21px;
  width: auto;
  opacity: 0.67;
}

.header-button .cdx-icon,
:slotted(.header-button) .cdx-icon {
  color: var(--color-subtle, #54595d);
}
</style>
