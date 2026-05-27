<script setup lang="ts">
definePage({
  meta: {
    title: 'Logged-out warning message',
    description:
      'The original static-HTML prototype, hosted as-is in an iframe. Click the edit pencil, fix the double space, then tap the blue ">" to see the "You\'re not logged in" dialog. Compare placements with ?variant=v1|v2|v3.',
  },
})

import { computed } from 'vue'
import { useRoute } from 'vue-router'
// Served verbatim via Vite's ?url suffix (bypasses HTML-entry processing) so
// the saved-Wikipedia page + its relative assets load untouched, all from
// inside this prototype folder.
import v1Url from './app/v1.html?url'
import v2Url from './app/v2.html?url'
import v3Url from './app/v3.html?url'

const route = useRoute()
const src = computed(() => {
  const v = route.query.variant
  if (v === 'v2') return v2Url
  if (v === 'v3') return v3Url
  return v1Url
})
</script>

<template>
  <iframe :src="src" class="low-frame" title="Logged-out warning message prototype" />
</template>

<style scoped>
.low-frame {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
