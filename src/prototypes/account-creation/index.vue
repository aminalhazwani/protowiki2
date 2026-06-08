<script setup>
definePage({
  meta: {
    title: 'Account creation',
    description: 'Prototype of the Wikipedia account creation form with an admin panel (Ctrl+Shift+S) for toggling fields and variants via URL query params.',
  },
})

import { ref, provide, onMounted, onUnmounted } from 'vue'
import CreateAccountView from './views/CreateAccountView.vue'
import AdminPanel from './components/AdminPanel.vue'
import './styles/global.css'

const showAdmin = ref(false)

function toggleAdmin() {
  showAdmin.value = !showAdmin.value
}

provide('toggleAdmin', toggleAdmin)

function onKeydown(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault()
    toggleAdmin()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <CreateAccountView />
  <AdminPanel v-if="showAdmin" @close="showAdmin = false" />
</template>
