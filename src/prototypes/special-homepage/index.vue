<script setup lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconBell } from '@wikimedia/codex-icons'
import ArticleSnapshot from '@/components/article/ArticleSnapshot.vue'
import ChromeWrapper from '@/components/chrome/ChromeWrapper.vue'
import MobileWrapper from '@/components/MobileWrapper.vue'
import PrototypeUserSettingsPopover from '@/components/PrototypeUserSettingsPopover.vue'
import UserMenu from './components/UserMenu.vue'

definePage({
  meta: {
    title: 'Special homepage — article',
    description:
      'Entry point of the newcomer journey: read the Wet Leg article, then create an account from the user menu (T419358).',
  },
})
</script>

<template>
  <MobileWrapper max-width="480px">
    <ChromeWrapper skin="mobile">
      <template #mobile-notifications>
        <PrototypeUserSettingsPopover v-slot="{ toggle, open }">
          <CdxButton
            class="special-homepage__notif-btn"
            weight="quiet"
            size="large"
            aria-label="Notifications"
            :aria-expanded="open"
            @click="toggle"
          >
            <CdxIcon :icon="cdxIconBell" />
          </CdxButton>
        </PrototypeUserSettingsPopover>
      </template>
      <template #mobile-user>
        <UserMenu />
      </template>

      <main class="special-homepage-article">
        <ArticleSnapshot article="Wet Leg" />
      </main>
    </ChromeWrapper>
  </MobileWrapper>
</template>

<style scoped>
.special-homepage-article {
  padding: 0 var(--spacing-100);
}

/* Match the 40px square Minerva touch target of the sibling header icons
   (this button is slotted into ChromeHeader, which can't size it via :slotted). */
.special-homepage__notif-btn.cdx-button {
  box-sizing: border-box;
  width: var(--size-icon-large, 40px);
  min-width: var(--size-icon-large, 40px);
  height: var(--size-icon-large, 40px);
  min-height: var(--size-icon-large, 40px);
  padding: 0;
  color: var(--color-subtle, #54595d);
}
</style>
