<template>
  <div class="editor-page">
    <CdxToolbar :cite-badge-count="citeBadgeCount" @cite="onOpenCiteDefault" />
    <div
      class="editor-wrapper"
      :class="{
        'rail-open': isRailOpen,
        'check-card-active': isAnyCardActive,
        'cursor-in-check': cursorInCheckParagraph,
      }"
    >
      <div
        class="editor-main"
        :class="{ 'keyboard-visible': showSoftKeyboard }"
        :style="keyboardHeight > 0 ? { '--keyboard-padding': `${keyboardHeight + 24}px` } : {}"
        @click="isRailOpen && (isRailOpen = false)"
      >
        <TextEditor @open-outline="onOpenOutline" @open-settings="settingsDialogOpen = true" />
      </div>
      <div class="editor-rail-column">
        <EditorRail
          :is-open="isRailOpen"
          :initial-view="initialView"
          @content-inserted="onContentInserted"
          @close="isRailOpen = false"
          @open-cite-discover="onOpenCiteDiscover"
        />
      </div>
    </div>

    <!-- Force entry point: + button in the 44px rail strip, aligned with cursor -->
    <div
      v-if="isForceButtonVisible"
      class="force-entry-point"
      :style="forceButtonStyle"
      @mousedown.prevent
      @click.stop="onForceButtonClick"
    >
      <CdxIcon :icon="icons.cdxIconAdd" />
    </div>

    <!-- Per-paragraph check rail indicators -->
    <template v-if="areRailIndicatorsVisible">
      <div
        v-for="(group, gi) in checkGroups"
        :key="gi"
        class="peacock-rail-indicator"
        :style="railStyleForGroup(group)"
        @mousedown.prevent
        @click.stop="onGroupRailClick(gi)"
      >
        <span class="rail-icon-wrapper">
          <CdxIcon :icon="icons.cdxIconAlert" />
          <span v-if="group.count > 1" class="rail-badge">{{ group.count }}</span>
        </span>
      </div>
    </template>

    <OutlinePopover
      v-if="outlineLocation === 'popover'"
      v-model:open="isPopoverOpen"
      :initial-view="initialView"
      @content-inserted="onContentInserted"
      @open-cite-discover="onOpenCiteDiscover"
    />
    <SettingsDialog v-model:open="settingsDialogOpen" />
    <CiteDialog
      v-model:open="citeDialogOpen"
      :initial-tab="citeDialogInitialTab"
      @citation-selected="onCitationSelected"
    />
    <ReviseToneCard />
    <PastedContentCard />
    <CompleteSectionCard />
    <SoftKeyboard v-if="showSoftKeyboard" @height-change="onKeyboardHeightChange" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
import TextEditor from '../components/TextEditor.vue'
import EditorRail from '../components/EditorRail.vue'
import CdxToolbar from '../components/CdxToolbar.vue'
import SettingsDialog from '../components/SettingsDialog.vue'
import CiteDialog from '../components/CiteDialog.vue'
import OutlinePopover from '../components/OutlinePopover.vue'
import ReviseToneCard from '../components/ReviseToneCard.vue'
import PastedContentCard from '../components/PastedContentCard.vue'
import CompleteSectionCard from '../components/CompleteSectionCard.vue'
import SoftKeyboard from '../components/SoftKeyboard.vue'
import { useEditorSettings } from '../composables/useEditorSettings'
import { useEditorInstance } from '../composables/useEditorInstance'
import { useCursorRect } from '../composables/useCursorRect'
import { usePlaceholderInteraction } from '../composables/usePlaceholderInteraction'
import { usePeacockDetection } from '../composables/usePeacockDetection'
import { useEditCheckPagination } from '../composables/useEditCheckPagination'
import { useCitationRegistry } from '../composables/useCitationRegistry'
import { citations as preExistingCitations } from '../config/citations'

const { settings } = useEditorSettings()
const outlineLocation = computed(() => settings.value.outline.location)
const outlinePersistence = computed(() => settings.value.outline.persistence)
const entryPointStyle = computed(() => settings.value.entryPoint.style)
const showSoftKeyboard = computed(() => settings.value.keyboard.display === 'visible')
const keyboardHeight = ref(0)
function onKeyboardHeightChange(height) {
  keyboardHeight.value = height
}

// Force entry point
const { getEditor, hasContent, citationClickCount } = useEditorInstance()
const { activePlaceholderPos } = usePlaceholderInteraction()
const {
  usedCitations,
  availableCitations,
  insertCitation,
  clickedCitationPos,
  clearClickedCitationPos,
} = useCitationRegistry()
const { cursorRect } = useCursorRect()
const { triggerDetectionOnInsert } = usePeacockDetection()
const {
  activeChecks,
  checkGroups,
  totalGroups,
  isAnyCardActive,
  cursorInCheckParagraph,
  showGroupAtIndex,
} = useEditCheckPagination()

// Per-paragraph rail indicators
const areRailIndicatorsVisible = computed(() => {
  if (isRailOpen.value || isPopoverOpen.value) return false
  return totalGroups.value > 0
})

function railStyleForGroup(group) {
  if (!group.rect) return {}
  return {
    position: 'fixed',
    top: `${group.rect.top}px`,
    right: '0px',
    width: '44px',
    height: `${group.rect.height}px`,
  }
}

const isForceButtonVisible = computed(() => {
  if (!['inline', 'force', 'quiet', 'text', 'floating'].includes(entryPointStyle.value))
    return false
  if (isRailOpen.value || isPopoverOpen.value) return false
  if (!cursorRect.value) return false
  if (areRailIndicatorsVisible.value && cursorInCheckParagraph.value) return false
  return cursorRect.value.visible
})

const forceButtonStyle = computed(() => {
  if (!cursorRect.value) return {}
  const rect = cursorRect.value
  const halfLeading = (rect.lineHeight - rect.glyphHeight) / 2
  return {
    position: 'fixed',
    top: `${rect.top - halfLeading}px`,
    right: '0px',
    width: '44px',
    height: `${rect.lineHeight}px`,
  }
})

const isRailOpen = ref(false)
const isPopoverOpen = ref(false)
const settingsDialogOpen = ref(false)
const citeDialogOpen = ref(false)
const citeDialogInitialTab = ref('automatic')
const initialView = ref(null)

function onForceButtonClick() {
  getEditor()?.commands.blur()
  onOpenOutline()
}

function onGroupRailClick(groupIndex) {
  const editor = getEditor()
  editor?.commands.blur()
  showGroupAtIndex(groupIndex, editor)
}

function onOpenOutline() {
  const editor = getEditor()
  const isPlaceholderSelected =
    editor?.state.selection.node?.type.name === 'placeholderChip' ||
    activePlaceholderPos.value !== null
  initialView.value = isPlaceholderSelected ? 'verified-facts' : null

  if (outlineLocation.value === 'popover') {
    isPopoverOpen.value = true
  } else {
    isRailOpen.value = true
  }
}

const citeBadgeSetting = computed(() => settings.value.cite.badge)
const citeBadgeDismissed = ref(false)
const citeBadgeCount = computed(() =>
  citeBadgeSetting.value === 'hidden' || citeBadgeDismissed.value ? 0 : preExistingCitations.length,
)

function onOpenCiteDefault() {
  citeBadgeDismissed.value = true
  const hasCitations = usedCitations.value.length > 0 || availableCitations.value.length > 0
  citeDialogInitialTab.value = hasCitations ? 'reuse' : 'automatic'
  citeDialogOpen.value = true
}

function onOpenCiteDiscover() {
  citeDialogInitialTab.value = 'discover'
  citeDialogOpen.value = true
}

// Track whether the popover/rail should stay open after content insertion
const keepOpenAfterInsert = ref(false)

function onContentInserted() {
  hasContent.value = true
  if (outlinePersistence.value === 'close') {
    isRailOpen.value = false
    isPopoverOpen.value = false
  } else {
    // Set flag so the watcher can re-open the popover if focus-loss closes it
    keepOpenAfterInsert.value = true
  }

  // Check the previous paragraph for peacock words after rail insertion
  nextTick(() => {
    const editor = getEditor()
    if (editor) triggerDetectionOnInsert(editor)
  })
}

// When the popover closes due to focus moving to the editor after insertion,
// re-open it if the keep-open flag is set
watch(isPopoverOpen, (newVal) => {
  if (!newVal && keepOpenAfterInsert.value) {
    keepOpenAfterInsert.value = false
    isPopoverOpen.value = true
  }
})

watch(citationClickCount, () => {
  onOpenCiteDefault()
})

// Clear clicked citation position when dialog closes without selection
watch(citeDialogOpen, (isOpen) => {
  if (!isOpen) {
    clearClickedCitationPos()
  }
})

function onCitationSelected(citation) {
  const editor = getEditor()
  if (!editor) return

  const refNumber = insertCitation(citation)
  const label = String(refNumber)
  const pos = clickedCitationPos.value

  if (pos !== null) {
    // Replace the clicked "Add a citation" placeholder node
    const node = editor.state.doc.nodeAt(pos)
    if (node && node.type.name === 'citationSuperscript') {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(pos, null, { label, citationId: citation.id })
          return true
        })
        .run()
    }
    clearClickedCitationPos()
  } else {
    // No placeholder was clicked — insert at current cursor position
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'citationSuperscript',
        attrs: { label, citationId: citation.id },
      })
      .run()
  }
}

watch(outlineLocation, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
})
</script>

<style scoped>
.editor-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.editor-wrapper {
  display: flex;
  padding-top: 48px;
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.editor-wrapper.rail-open {
  transform: translateX(calc(-100vw + 88px));
}

.editor-main {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.editor-rail-column {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.editor-main.keyboard-visible :deep(.ProseMirror) {
  padding-bottom: var(--keyboard-padding, 0);
}

.force-entry-point {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid var(--border-color-interactive);
  box-sizing: border-box;
  cursor: pointer;
  z-index: 2;
}

.force-entry-point :deep(.cdx-icon) {
  color: var(--color-base);
}

.peacock-rail-indicator {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  border-left: 2px solid var(--color-warning);
  box-sizing: border-box;
  cursor: pointer;
  z-index: 2;
}

.rail-icon-wrapper {
  position: relative;
  display: inline-flex;
}

.peacock-rail-indicator :deep(.cdx-icon) {
  color: var(--color-icon-warning);
}

.rail-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  min-width: 12px;
  min-height: 12px;
  padding: 1px 2px;
  background-color: var(--background-color-progressive, #36c);
  border: 1px solid var(--border-color-inverted, #fff);
  border-radius: var(--border-radius-base, 2px);
  color: var(--color-inverted, #fff);
  font-size: var(--font-size-x-small, 12px);
  font-weight: var(--font-weight-bold, 700);
  line-height: 12px;
  text-align: center;
}

.editor-wrapper.check-card-active :deep(.peacock-highlight) {
  background-color: transparent;
}

.editor-wrapper.check-card-active :deep(.paste-highlight) {
  background-color: transparent;
}

.editor-wrapper.check-card-active :deep(.placeholder-detection-highlight) {
  background-color: transparent;
}

/* Ensure promoted (warning) highlights always show over the suppression */
.editor-wrapper.check-card-active :deep(.peacock-highlight-warning) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
}

.editor-wrapper.check-card-active :deep(.paste-highlight-warning) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
}

.editor-wrapper.check-card-active :deep(.placeholder-detection-highlight-warning) {
  background-color: var(--background-color-warning-subtle, #fdf2d5);
}

/* Hide highlight when cursor is in the flagged paragraph and card is closed */
.editor-wrapper.cursor-in-check:not(.check-card-active) :deep(.peacock-highlight) {
  background-color: transparent;
}

.editor-wrapper.cursor-in-check:not(.check-card-active) :deep(.paste-highlight) {
  background-color: transparent;
}
</style>
