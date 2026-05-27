<template>
  <div class="reference-sources-cards">
    <CdxCard
      v-for="source in referenceSources"
      :key="source.id"
      :thumbnail="{ url: source.thumbnailUrl }"
      @click="emit('open-cite-discover')"
    >
      <template #title>{{ source.title }}</template>
      <template #description>{{ source.description }}</template>
      <template #supporting-text>
        <a
          :href="source.url"
          target="_blank"
          rel="noopener"
          class="reference-link"
          @click.stop
        >
          {{ source.references.length }} {{ source.references.length === 1 ? 'reference' : 'references' }}
        </a>
      </template>
    </CdxCard>
  </div>
</template>

<script setup>
import { CdxCard } from '@wikimedia/codex'
import { referenceSources } from '../config/referenceSources.js'

const emit = defineEmits(['open-cite-discover'])
</script>

<style scoped>
.reference-sources-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.reference-sources-cards :deep(.cdx-card) {
  background-color: var(--background-color-transparent);
}

.reference-link {
  color: var(--color-progressive);
  text-decoration: none;
}

.reference-link:hover {
  text-decoration: underline;
}
</style>
