<template>
  <div ref="anchorRef" class="outline-popover-anchor"></div>
  <CdxPopover
    v-model:open="open"
    :anchor="anchorRef"
    placement="top-start"
    :render-in-place="true"
    class="outline-popover-sheet"
  >
    <div class="outline-popover-header">
      <CdxMenuButton v-model:selected="selectedView" :menu-items="menuItems">
        <CdxIcon :icon="currentItem.icon" />
        {{ currentItem.label }}
      </CdxMenuButton>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="icons.cdxIconClose" />
      </CdxButton>
    </div>
    <div ref="bodyRef" class="outline-popover-body" tabindex="-1">
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
const bodyRef = ref(null)
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

// Codex 2.5.1's CdxPopover focus-trap calls focusFirst() on open, which lands
// on the view-switcher menu button and shows a focus ring as if it were
// pre-selected. There's no prop to disable it, and the focus is set without a
// focusin event we can intercept, so we poll for a short window after open and
// redirect focus off the menu-button trigger onto the non-interactive popover
// body (tabindex="-1", no focus ring). Polling (rather than a one-shot blur)
// is robust to however many frames Codex takes to set focus. The window is
// short enough that a deliberate later click on the menu button is unaffected.
let suppressFocusRaf = 0

function suppressInitialMenuFocus() {
  cancelAnimationFrame(suppressFocusRaf)
  let frames = 0
  const tick = () => {
    const active = document.activeElement
    if (active?.closest?.('.outline-popover-sheet .cdx-menu-button') && bodyRef.value) {
      bodyRef.value.focus()
    }
    if (++frames < 40) {
      suppressFocusRaf = requestAnimationFrame(tick)
    }
  }
  suppressFocusRaf = requestAnimationFrame(tick)
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
    suppressInitialMenuFocus()
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
  outline: none;
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

.outline-popover-body :deep(.cdx-accordion__content) {
  font-family: var(--font-family-system-sans);
}
</style>

<!--
  Bottom-sheet styling for the popover root. This lives in a NON-scoped block
  (keyed on the `outline-popover-sheet` class we pass to <CdxPopover>) because
  Codex 2.5.1 renders the popover wrapped in `.cdx-popover__backdrop` inside the
  nearest positioned ancestor — it is NOT an adjacent sibling of the anchor and
  carries no scoped data-v attribute, so the original
  `.outline-popover-anchor + :deep(.cdx-popover)` selector never matched here.
  `!important` overrides @floating-ui's inline positioning styles.
-->
<style>
.cdx-popover.outline-popover-sheet {
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

.cdx-popover.outline-popover-sheet .cdx-popover__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
