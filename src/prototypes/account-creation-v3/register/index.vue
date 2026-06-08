<script setup lang="ts">
definePage({
  meta: {
    title: 'Account creation v3 — Register without email',
    description: 'Subroute of the v3 signup prototype: email-less registration path.',
  },
})

import RegisterWithoutEmailView from '../views/RegisterWithoutEmailView.vue'
import { useAdminToggle } from '../composables/useAdminToggle'
import '../styles/global.css'

useAdminToggle()
</script>

<template>
  <RegisterWithoutEmailView />
</template>
