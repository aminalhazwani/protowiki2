<script setup lang="ts">
definePage({
  meta: {
    title: 'Account creation v3',
    description: 'Prototype of the Wikipedia signup flow (v3). Ctrl+Shift+S opens the admin panel.',
  },
})

import HomeView from './views/HomeView.vue'
import { useAdminToggle } from './composables/useAdminToggle'
import './styles/global.css'

useAdminToggle()
</script>

<template>
  <HomeView />
</template>
