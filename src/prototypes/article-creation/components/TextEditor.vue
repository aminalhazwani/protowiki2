<template>
  <div
    class="text-editor-wrapper"
    :class="{
      'hide-placeholder':
        entryPointStyle !== 'inline' && !(entryPointStyle === 'text' && !hasInteracted),
    }"
  >
    <EditorContent ref="editorContentRef" class="text-editor" :editor="editor" />
    <div
      v-show="isButtonVisible"
      ref="floatingElRef"
      class="codex-floating-entry"
      :style="floatingButtonStyle"
      @mousedown.prevent
      @click.stop="onCodexButtonClick"
      @mouseenter="pauseAnimation"
      @mouseleave="resumeAnimation"
    >
      <!-- Style 1: Icon button (default) -->
      <CdxButton
        v-if="entryPointStyle === 'icon'"
        class="codex-floating-btn"
        aria-label="Add content"
      >
        <CdxIcon :icon="icons.cdxIconAdd" />
      </CdxButton>

      <!-- Style 2: Quiet button with cycling label (before interaction) -->
      <CdxButton
        v-else-if="entryPointStyle === 'quiet' && isCycling"
        weight="quiet"
        class="codex-floating-btn-quiet"
        aria-label="Add content"
      >
        <CdxIcon :icon="icons.cdxIconAdd" />
        <span class="typewriter-container">
          <span
            class="typewriter-text"
            :class="{ 'typewriter-mask': animPhase === 'wiping' }"
            :style="animPhase === 'wiping' ? { '--wipe': wipeMaskPercent + '%' } : {}"
            >{{ displayText }}</span
          >
        </span>
      </CdxButton>

      <!-- Style 3: Floating placeholder (initial state only) -->
      <span
        v-else-if="entryPointStyle === 'floating' && !hasInteracted"
        class="codex-floating-text"
      >
        Tap here to continue...
      </span>

      <!-- Fallback: icon button for other styles after cycling stops -->
      <CdxButton v-else class="codex-floating-btn" aria-label="Add content">
        <CdxIcon :icon="icons.cdxIconAdd" />
      </CdxButton>
    </div>
    <CdxButton
      weight="quiet"
      class="settings-btn"
      aria-label="Settings"
      @click="$emit('open-settings')"
    >
      <CdxIcon :icon="icons.cdxIconSettings" />
    </CdxButton>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'
import { useEditor, EditorContent } from '../tiptap'
import { StarterKit } from '../tiptap'
import { Placeholder } from '../tiptap'
import { AnnotationHighlight } from '../extensions/annotationHighlight'
import { PeacockHighlight } from '../extensions/peacockHighlight'
import { PasteHighlight } from '../extensions/pasteHighlight'
import { usePeacockDetection } from '../composables/usePeacockDetection'
import { usePasteDetection } from '../composables/usePasteDetection'
import { PlaceholderDetectionHighlight } from '../extensions/placeholderDetectionHighlight'
import { usePlaceholderDetection } from '../composables/usePlaceholderDetection'
import { PlaceholderChip } from '../extensions/placeholderChip'
import { CitationSuperscript } from '../extensions/citationSuperscript'
import { ReferencesSection } from '../extensions/referencesSection'
import { useEditorSettings } from '../composables/useEditorSettings'
import { useEditorInstance } from '../composables/useEditorInstance'
import { usePlaceholderInteraction } from '../composables/usePlaceholderInteraction'
import { useEditCheckPagination } from '../composables/useEditCheckPagination'
import { useCursorRect } from '../composables/useCursorRect'
import { useEditorTypewriter } from '../composables/useEditorTypewriter'
import { useFloatingButton } from '../composables/useFloatingButton'
import { defaultSettings } from '../config/editorSettings'
import { articleSections } from '../config/articleSections'

const icons = useIcons()
const emit = defineEmits(['open-outline', 'open-settings'])

const { settings } = useEditorSettings()
const { setEditor, hasContent } = useEditorInstance()
const { activePlaceholderPos } = usePlaceholderInteraction()
const { setCursorRect, clearCursorRect } = useCursorRect()
const { triggerDetection, scanParagraphAtPos, updatePeacockRect, activeParagraphRange } =
  usePeacockDetection()
const { onPaste, triggerPasteDetection, updatePasteRect, activePastedRange } =
  usePasteDetection()
const {
  triggerPlaceholderDetection,
  updatePlaceholderDetectionRect,
  placeholderDetections,
} = usePlaceholderDetection()
const { isAnyCardActive, dismissAllCards, updateCursorInCheck } = useEditCheckPagination()

let lastParagraphPos = null

const entryPointStyle = computed(
  () => settings.value.entryPoint.style || defaultSettings.entryPoint.style,
)

const hasInteracted = ref(false)

const sectionTitles = computed(() => articleSections.map((s) => s.title))

const {
  isCycling,
  displayText,
  animPhase,
  wipeMaskPercent,
  cyclingStarted,
  startCycling,
  stopCycling,
  pauseAnimation,
  resumeAnimation,
  cleanup: cleanupTypewriter,
} = useEditorTypewriter(sectionTitles)

const useForceMode = computed(
  () =>
    entryPointStyle.value === 'inline' ||
    entryPointStyle.value === 'force' ||
    (entryPointStyle.value === 'quiet' && !isCycling.value) ||
    ((entryPointStyle.value === 'text' || entryPointStyle.value === 'floating') &&
      hasInteracted.value),
)

const isPlaceholderInitialState = computed(
  () =>
    (entryPointStyle.value === 'text' || entryPointStyle.value === 'floating') &&
    !hasInteracted.value,
)

// ── TipTap editor ──────────────────────────────────────────────────────

const editorContentRef = ref(null)
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: 'Start writing or tap the +',
    }),
    AnnotationHighlight,
    PeacockHighlight,
    PasteHighlight,
    PlaceholderDetectionHighlight,
    PlaceholderChip,
    CitationSuperscript,
    ReferencesSection,
  ],
  editorProps: {
    handlePaste: (view) => {
      setTimeout(() => {
        const editorInstance = editor.value
        if (editorInstance) onPaste(editorInstance)
      }, 0)
      return false
    },
  },
  onSelectionUpdate({ editor: editorRef }) {
    if (!isTyping.value) {
      updateButtonPosition()
    }
    const { $from } = editorRef.state.selection
    const currentParaPos = $from.parent.type.name === 'paragraph' ? $from.before() : null
    if (lastParagraphPos !== null && currentParaPos !== lastParagraphPos) {
      scanParagraphAtPos(editorRef, lastParagraphPos)
      triggerPlaceholderDetection(editorRef, lastParagraphPos)
      updatePeacockRect(editorRef)
      updatePasteRect(editorRef)
      updatePlaceholderDetectionRect(editorRef)
    }
    lastParagraphPos = currentParaPos
    updateCursorInCheck(editorRef)
  },
  onTransaction({ transaction, editor: editorRef }) {
    if (transaction.docChanged) {
      hasContent.value = !editorRef.isEmpty
      if (isPlaceholderInitialState.value) {
        hasInteracted.value = true
      }
      if (useForceMode.value) {
        updateButtonPosition()
      } else {
        stopCycling()
        hideButton()
        scheduleShowButton()
      }
      const { $from } = editorRef.state.selection
      const currentNode = $from.parent
      if (currentNode.type.name === 'paragraph' && currentNode.content.size === 0) {
        triggerDetection(editorRef)
        triggerPasteDetection(editorRef)
      }
    }
  },
  onFocus({ editor: editorRef }) {
    if (isAnyCardActive.value) {
      dismissAllCards(editorRef)
    }
    setTimeout(() => updateButtonPosition(), 0)
  },
  onBlur({ event }) {
    if (
      event.relatedTarget &&
      (event.relatedTarget.closest('.codex-floating-entry') ||
        event.relatedTarget.closest('.force-entry-point'))
    ) {
      return
    }
    if (entryPointStyle.value === 'inline') {
      isButtonVisible.value = false
      return
    }
    hideButton()
  },
})

// ── Floating button ────────────────────────────────────────────────────

const floatingButton = useFloatingButton({
  editor,
  entryPointStyle,
  isCycling,
  hasInteracted,
  useForceMode,
  activePlaceholderPos,
  setCursorRect,
  clearCursorRect,
  updatePeacockRect,
  updatePasteRect,
  updatePlaceholderDetectionRect,
  activeParagraphRange,
  activePastedRange,
  placeholderDetections,
})

const { floatingElRef, isButtonVisible, isTyping, floatingButtonStyle, updateButtonPosition, hideButton, scheduleShowButton, onScroll } = floatingButton

// ── Event handlers ─────────────────────────────────────────────────────

function onCodexButtonClick() {
  stopCycling()
  hasInteracted.value = true
  editor.value?.commands.blur()
  emit('open-outline')
}

function onEditorClick(event) {
  if (entryPointStyle.value === 'text' && !hasInteracted.value && editor.value?.isEmpty) {
    event.stopPropagation()
    hasInteracted.value = true
    editor.value?.commands.blur()
    emit('open-outline')
  }
}

// Start typewriter on first button appearance (not on mount)
watch(isButtonVisible, (visible) => {
  if (visible && !cyclingStarted() && isCycling.value) {
    startCycling()
  }
})

// ── Lifecycle ──────────────────────────────────────────────────────────

let scrollEl = null

onMounted(() => {
  if (editor.value) {
    setEditor(editor.value)
    if (import.meta.env.DEV) window.__editor = editor.value
  }
  scrollEl = editor.value?.view?.dom || null
  if (scrollEl) {
    scrollEl.addEventListener('scroll', onScroll)
    scrollEl.addEventListener('click', onEditorClick)
  }
  if (settings.value.entryPoint.autoFocus !== 'false') {
    editor.value?.commands.focus()
    if (entryPointStyle.value === 'floating') {
      setTimeout(() => updateButtonPosition(), 50)
    }
  }
})

onBeforeUnmount(() => {
  setEditor(null)
  clearCursorRect()
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', onScroll)
    scrollEl.removeEventListener('click', onEditorClick)
  }
  cleanupTypewriter()
  floatingButton.cleanup()
})

defineExpose({ editor })
</script>

<style scoped>
.text-editor-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-editor :deep(.ProseMirror) {
  flex: 1;
  padding: var(--spacing-100);
  background-color: var(--background-color-base);
  outline: none;
  overflow-y: auto;
}

/* Placeholder */

.text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-placeholder);
  pointer-events: none;
  float: left;
  height: 0;
}

.hide-placeholder :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  display: none;
}

/* Text styles */

.text-editor :deep(.ProseMirror h2) {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xx-large);
  border-bottom: 1px var(--border-style-base) var(--border-color-muted, #dadde3);
  margin: 0 0 var(--spacing-50) 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror h3) {
  font-size: var(--font-size-x-large);
  line-height: var(--line-height-x-large);
  font-weight: var(--font-weight-bold);
  margin: 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror h4) {
  font-size: var(--font-size-large);
  line-height: var(--line-height-large);
  font-weight: var(--font-weight-bold);
  margin: 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror p) {
  padding-bottom: var(--spacing-50);
  margin: var(--spacing-50) 0 0 0;
  line-height: var(--line-height-medium);
}

.text-editor :deep(.annotation-highlight) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
  border-radius: 2px;
}

.text-editor :deep(.peacock-highlight) {
  background-color: var(--background-color-interactive-subtle);
}

.text-editor :deep(.peacock-highlight-warning) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
}

.text-editor :deep(.paste-highlight) {
  background-color: var(--background-color-interactive-subtle);
}

.text-editor :deep(.paste-highlight-warning) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
}

.text-editor :deep(.placeholder-detection-highlight.placeholder-chip) {
  background-color: var(--background-color-interactive-subtle);
}

.text-editor :deep(.placeholder-detection-highlight.placeholder-chip.placeholder-chip--selected) {
  background-color: var(--background-color-interactive-subtle--hover);
}

.text-editor :deep(.placeholder-detection-highlight-warning.placeholder-chip) {
  background-color: var(--background-color-warning-subtle, #fdf2d5);
}

.settings-btn {
  position: fixed;
  bottom: var(--spacing-35);
  right: var(--spacing-35);
  z-index: 1;
  opacity: 0.1;
}

.codex-floating-entry {
  position: absolute;
  z-index: 1;
}

.codex-floating-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 5px !important;
}

.codex-floating-btn-quiet {
  white-space: nowrap;
}

.typewriter-container {
  display: inline-block;
}

.typewriter-text {
  white-space: pre;
}

.typewriter-mask {
  --wipe: -15%;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--wipe),
    black calc(var(--wipe) + 15%),
    black 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--wipe),
    black calc(var(--wipe) + 15%),
    black 100%
  );
}

.codex-floating-text {
  white-space: nowrap;
  color: var(--color-subtle);
  cursor: pointer;
}
</style>
