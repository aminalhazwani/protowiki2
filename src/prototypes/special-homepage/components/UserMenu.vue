<template>
  <div class="user-menu">
    <CdxButton
      weight="quiet"
      size="large"
      aria-label="User account"
      aria-haspopup="true"
      :aria-expanded="open"
      class="user-menu__button"
      @click="toggle"
    >
      <CdxIcon :icon="cdxIconUserAvatarOutline" size="large" />
    </CdxButton>

    <Transition name="user-menu">
      <div v-if="open" class="user-menu__dropdown" role="menu">
        <RouterLink
          to="/special-homepage/create-account"
          class="user-menu__item"
          role="menuitem"
          @click="open = false"
        >
          <CdxIcon :icon="cdxIconUserAvatar" class="user-menu__item-icon" />
          <span>Create account</span>
        </RouterLink>
        <a href="#" class="user-menu__item" role="menuitem" @click.prevent="open = false">
          <CdxIcon :icon="cdxIconLogIn" class="user-menu__item-icon" />
          <span>Log in</span>
        </a>
      </div>
    </Transition>

    <!-- Backdrop to close on outside click -->
    <div v-if="open" class="user-menu__backdrop" @click="open = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconUserAvatar, cdxIconUserAvatarOutline, cdxIconLogIn } from '@wikimedia/codex-icons'

const open = ref(false)

function toggle() {
  open.value = !open.value
}
</script>

<style scoped>
.user-menu {
  position: relative;
}

/* Match the 40px square Minerva touch target used by the sibling header icons
   (ChromeHeader can't reach this button via :slotted, so size it here). */
.user-menu__button {
  box-sizing: border-box;
  width: var(--size-icon-large, 40px);
  min-width: var(--size-icon-large, 40px);
  height: var(--size-icon-large, 40px);
  min-height: var(--size-icon-large, 40px);
  padding: 0;
  color: var(--color-subtle, #54595d);
}

.user-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 100;
  min-width: 200px;
  background-color: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: var(--border-radius-base, 2px);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-35, 6px);
  padding: var(--spacing-75, 12px) var(--spacing-100, 16px);
  color: var(--color-subtle, #54595d);
  text-decoration: none;
  font-size: var(--font-size-medium, 1rem);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-medium, 1.6);
  cursor: pointer;
  transition: background-color 100ms;
}

.user-menu__item:hover {
  background-color: var(--background-color-interactive, #eaecf0);
}

.user-menu__item-icon {
  color: var(--color-subtle, #54595d);
  flex-shrink: 0;
}

/* Transition */
.user-menu-enter-active,
.user-menu-leave-active {
  transition:
    opacity 150ms,
    transform 150ms;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
