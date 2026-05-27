<template>
  <div :class="{ 'icons-custom': settings.icons.set === 'custom' }">
  <CdxAccordion
    v-for="(section, index) in articleSections"
    :key="section.title"
    :class="{ 'accordion--empty': isSectionEmpty(section) }"
    separation="none"
    :model-value="accordionStates[section.title]"
    :action-icon="index === 0 ? null : icons.cdxIconAdd"
    :action-always-visible="index !== 0 && isSectionEmpty(section)"
    :action-button-label="`Add ${section.title} section`"
    @update:model-value="(val) => updateAccordionState(section, val)"
    @action-button-click="onInsertSectionHeading(section)"
  >
    <template #title>{{ section.title }}</template>
    <template #description>{{ section.description }}</template>
    <div v-if="section.paragraphs && section.paragraphs.length" class="paragraph-cards">
      <CdxCard
        v-for="paragraph in section.paragraphs"
        :key="paragraph.title"
        :icon="icons.cdxIconAdd"
        @click="onInsertParagraph(section, index, paragraph)"
      >
        <template #title>{{ paragraph.title }}</template>
        <template #description>{{ paragraph.description }}</template>
      </CdxCard>
    </div>
  </CdxAccordion>
  </div>
</template>

<script setup>
import { CdxAccordion, CdxCard } from '@wikimedia/codex'
import { useIcons } from '../composables/useIcons'
import { useEditorSettings } from '../composables/useEditorSettings'

const icons = useIcons()
const { settings } = useEditorSettings()
import { articleSections, CITATION_LABEL } from '../config/articleSections.js'
import { useEditorInstance } from '../composables/useEditorInstance'
import { useAccordionState } from '../composables/useAccordionState'

const emit = defineEmits(['content-inserted'])
const { insertContent, getEditor } = useEditorInstance()
const { accordionStates, updateAccordionState } = useAccordionState()

function isSectionEmpty(section) {
  return !section.paragraphs || section.paragraphs.length === 0
}

function onInsertSectionHeading(section) {
  insertContent(`<h2>${section.title}</h2><p></p>`)
  emit('content-inserted')
}

function parsePlaceholders(text) {
  const citationMarker = `[${CITATION_LABEL}]`
  const parts = text.split(new RegExp(`(\\{\\{[^}]+\\}\\}|\\[${CITATION_LABEL}\\])`))
  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      const placeholderMatch = part.match(/^\{\{(.+)\}\}$/)
      if (placeholderMatch) {
        return { type: 'placeholderChip', attrs: { label: placeholderMatch[1] } }
      }
      if (part === citationMarker) {
        return { type: 'citationSuperscript', attrs: { label: CITATION_LABEL } }
      }
      return { type: 'text', text: part }
    })
}

function editorHasH2(title) {
  const editor = getEditor()
  if (!editor) return false
  let found = false
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading' && node.attrs.level === 2 && node.textContent === title) {
      found = true
      return false
    }
  })
  return found
}

function onInsertParagraph(section, index, paragraph) {
  if (paragraph.content) {
    const contentNodes = parsePlaceholders(paragraph.content)
    const nodes = []
    if (index !== 0 && !editorHasH2(section.title)) {
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: section.title }],
      })
    }
    nodes.push({ type: 'paragraph', content: contentNodes })
    insertContent(nodes)
    emit('content-inserted')
  }
}
</script>

<style scoped>
.paragraph-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.paragraph-cards :deep(.cdx-card) {
  background-color: var(--background-color-transparent);
}

.accordion--empty :deep(> summary::before) {
  opacity: 0;
}

.accordion--empty :deep(> summary) {
  cursor: default;
  pointer-events: none;
}

.accordion--empty :deep(> summary .cdx-accordion__action) {
  pointer-events: auto;
  cursor: pointer;
}

.icons-custom :deep(.cdx-accordion > summary::before) {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M16.707 8.0166L10.707 14H9.29297L3.29297 8.0166L4.70703 6.60254L10 11.8955L15.293 6.60254L16.707 8.0166Z"/></svg>') !important;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M16.707 8.0166L10.707 14H9.29297L3.29297 8.0166L4.70703 6.60254L10 11.8955L15.293 6.60254L16.707 8.0166Z"/></svg>') !important;
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M16.707 8.0166L10.707 14H9.29297L3.29297 8.0166L4.70703 6.60254L10 11.8955L15.293 6.60254L16.707 8.0166Z"/></svg>') !important;
}
</style>
