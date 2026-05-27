<template>
  <div ref="anchorRef" class="outline-popover-anchor"></div>
  <CdxPopover v-model:open="open" :anchor="anchorRef" placement="top-start" :render-in-place="true">
    <div class="outline-popover-header">
      <CdxMenuButton v-model:selected="selectedView" :menu-items="menuItems">
        <CdxIcon :icon="currentItem.icon" />
        {{ currentItem.label }}
      </CdxMenuButton>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="icons.cdxIconClose" />
      </CdxButton>
    </div>
    <div class="outline-popover-body">
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
  </CdxPopover>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { CdxPopover, CdxMenuButton, CdxButton, CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
import OutlineAccordionList from './OutlineAccordionList.vue'
import VerifiedFactsList from './VerifiedFactsList.vue'
import ReferenceSourcesList from './ReferenceSourcesList.vue'

defineEmits(['content-inserted', 'open-cite-discover'])
const props = defineProps({
  initialView: {
    type: String,
    default: null,
  },
})
const open = defineModel('open', { type: Boolean, default: false })
const anchorRef = ref(null)
const selectedView = ref('outline')

watch(open, (isOpen) => {
  if (isOpen) {
    selectedView.value = props.initialView || 'outline'
  }
})

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

let bodyEl = null
let resizeObserver = null

function getBodyEl() {
  if (!anchorRef.value) return null
  const popover = anchorRef.value.nextElementSibling
  return popover?.querySelector('.outline-popover-body') ?? null
}

function checkScrollable() {
  if (!bodyEl) return
  const scrollable = bodyEl.scrollHeight > bodyEl.clientHeight
  bodyEl.classList.toggle('is-scrollable', scrollable)
}

function onBodyScroll() {
  if (!bodyEl) return
  bodyEl.classList.toggle('is-scrolled', bodyEl.scrollTop > 0)
}

function attachObserver() {
  detachObserver()
  bodyEl = getBodyEl()
  if (!bodyEl) return
  bodyEl.addEventListener('scroll', onBodyScroll)
  resizeObserver = new ResizeObserver(checkScrollable)
  resizeObserver.observe(bodyEl)
  checkScrollable()
}

function detachObserver() {
  bodyEl?.removeEventListener('scroll', onBodyScroll)
  bodyEl?.classList.remove('is-scrollable', 'is-scrolled')
  resizeObserver?.disconnect()
  bodyEl = null
}

watch(selectedView, async () => {
  if (bodyEl) {
    await nextTick()
    bodyEl.scrollTop = 0
    bodyEl.classList.remove('is-scrolled')
    checkScrollable()
  }
})

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick()
    attachObserver()
  } else {
    detachObserver()
  }
})

onMounted(async () => {
  if (open.value) {
    await nextTick()
    attachObserver()
  }
})

onBeforeUnmount(() => {
  detachObserver()
})
</script>

<style scoped>
.outline-popover-anchor {
  width: 0;
  height: 0;
}

.outline-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-100, 16px);
}

.outline-popover-header :deep(.cdx-menu-button__menu) {
  min-width: 256px;
}

.outline-popover-header :deep(.cdx-menu-button > .cdx-button.cdx-button--weight-quiet) {
  border-color: var(--border-color-interactive);
  background-color: var(--background-color-interactive-subtle);
  font-weight: var(--font-weight-bold);
}

.outline-popover-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-100, 16px) var(--spacing-100, 16px) 0;
  border-top: 1px solid var(--border-color-transparent);
  transition-property: var(--transition-property-base);
  transition-duration: var(--transition-duration-medium);
  transition-timing-function: var(--transition-timing-function-user);
}

.outline-popover-body.is-scrollable {
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  padding-bottom: var(--spacing-100);
}

.outline-popover-body.is-scrolled {
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.outline-popover-anchor + :deep(.cdx-popover .cdx-popover__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.outline-popover-anchor + :deep(.cdx-popover) {
  min-height: 50vh !important;
  max-height: 50vh !important;
  display: flex;
  flex-direction: column;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  top: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  transform: none !important;
  border-radius: 0 !important;
  border: none !important;
  border-top: 1px solid var(--border-color-base, #a2a9b1) !important;
  padding: 0 !important;
}

.outline-popover-body :deep(.cdx-accordion__content) {
  font-family: var(--font-family-system-sans);
}
</style>
