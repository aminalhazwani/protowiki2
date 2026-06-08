<template>
  <div class="editor-rail" :class="{ 'is-open': isOpen }">
    <div class="rail-header">
      <CdxMenuButton v-model:selected="selectedView" :menu-items="menuItems">
        <CdxIcon :icon="currentItem.icon" />
        {{ currentItem.label }}
      </CdxMenuButton>
      <CdxButton weight="quiet" aria-label="Close" @click="$emit('close')">
        <CdxIcon :icon="icons.cdxIconClose" />
      </CdxButton>
    </div>
    <div ref="bodyRef" class="rail-body" @scroll="onBodyScroll">
      <OutlineAccordionList
        v-if="selectedView === 'outline'"
        @content-inserted="$emit('content-inserted')"
      />
      <VerifiedFactsList
        v-if="selectedView === 'verified-facts'"
        @content-inserted="$emit('content-inserted')"
      />
      <ReferenceSourcesList
        v-if="selectedView === 'references'"
        @open-cite-discover="$emit('open-cite-discover')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { CdxMenuButton, CdxButton, CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
import OutlineAccordionList from './OutlineAccordionList.vue'
import VerifiedFactsList from './VerifiedFactsList.vue'
import ReferenceSourcesList from './ReferenceSourcesList.vue'

defineEmits(['content-inserted', 'close', 'open-cite-discover'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  initialView: {
    type: String,
    default: null,
  },
})

const selectedView = ref('outline')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedView.value = props.initialView || 'outline'
    }
  },
)

const menuItems = computed(() => [
  {
    value: 'outline',
    label: 'Outline',
    description: 'Build off similar articles',
    icon: icons.value.cdxIconListBullet,
  },
  {
    value: 'verified-facts',
    label: 'Verified facts',
    description: 'From Wikidata',
    icon: icons.value.cdxIconCheckAll,
  },
  {
    value: 'references',
    label: 'References',
    description: 'In other projects',
    icon: icons.value.cdxIconReference,
  },
])

const currentItem = computed(
  () => menuItems.value.find((item) => item.value === selectedView.value) || menuItems.value[0],
)

const bodyRef = ref(null)

function onBodyScroll() {
  if (!bodyRef.value) return
  bodyRef.value.classList.toggle('is-scrolled', bodyRef.value.scrollTop > 0)
}

watch(selectedView, async () => {
  if (bodyRef.value) {
    await nextTick()
    bodyRef.value.scrollTop = 0
    bodyRef.value.classList.remove('is-scrolled')
  }
})
</script>

<style scoped>
.editor-rail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background-color-neutral-subtle);
}

.rail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-100, 16px);
  padding-left: 44px;
}

.editor-rail.is-open .rail-header {
  padding-left: var(--spacing-100, 16px);
}

.rail-header :deep(.cdx-menu-button__menu) {
  min-width: 256px;
}

.rail-header :deep(.cdx-menu-button > .cdx-button.cdx-button--weight-quiet) {
  border-color: var(--border-color-interactive);
  background-color: var(--background-color-interactive-subtle);
  font-weight: var(--font-weight-bold);
}

.rail-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-100, 16px);
  padding-left: 44px;
  border-top: 1px solid var(--border-color-transparent);
  transition-property: var(--transition-property-base);
  transition-duration: var(--transition-duration-medium);
  transition-timing-function: var(--transition-timing-function-user);
}

.editor-rail.is-open .rail-body {
  padding-left: var(--spacing-100, 16px);
}

.rail-body.is-scrolled {
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.rail-body :deep(.cdx-accordion__content) {
  font-family: var(--font-family-system-sans);
}
</style>
