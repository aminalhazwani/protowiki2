import { ref, provide, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Mirrors the App.vue boilerplate from the monorepo source:
 * - Provides `showAdmin` (Ref<boolean>) + `toggleAdmin` so HomeView,
 *   RegisterWithoutEmailView, and CreateAccountDialog can inject them.
 * - Binds Ctrl+Shift+S to toggle the admin panel.
 *
 * Each route's index.vue calls this in setup; since protowiki2's
 * unplugin-vue-router doesn't share a parent component across nested
 * routes, each route owns its own admin state.
 */
export function useAdminToggle(): { showAdmin: Ref<boolean>; toggleAdmin: () => void } {
  const showAdmin = ref(false)

  function toggleAdmin() {
    showAdmin.value = !showAdmin.value
  }

  provide('showAdmin', showAdmin)
  provide('toggleAdmin', toggleAdmin)

  function onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      toggleAdmin()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  return { showAdmin, toggleAdmin }
}
