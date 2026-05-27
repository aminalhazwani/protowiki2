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

/**
 * The prototype's static files live in ./app/ (this folder). They're served
 * verbatim — no Vite HTML transform — via a symlink at
 * `public/logged-out-warning-message` → this folder's `app/`. That's required
 * because the saved Wikipedia page relies on its own importmap + runtime Vue
 * template compilation, which Vite's dev transform would break, and because a
 * production `vite build` only copies verbatim asset trees from publicDir.
 * The only thing outside this folder is that one symlink pointer.
 */
const route = useRoute()
const base = import.meta.env.BASE_URL
const src = computed(() => {
  const v = route.query.variant
  const file = v === 'v2' ? 'v2.html' : v === 'v3' ? 'v3.html' : 'v1.html'
  return `${base}logged-out-warning-message/${file}`
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
