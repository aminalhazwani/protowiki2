<template>
  <NodeViewWrapper as="div" class="references-section" contenteditable="false">
    <h2 class="references-heading">References</h2>
    <ol class="references-list">
      <li v-for="citation in parsedCitations" :key="citation.id" class="references-item">
        <span class="references-caret">^</span>
        <span class="references-text">
          <template v-for="(segment, sIndex) in citation.segments" :key="sIndex">
            <a v-if="segment.style === 'link'" class="references-link" href="#" @click.prevent>{{
              segment.text
            }}</a>
            <a
              v-else-if="segment.style === 'link-italic'"
              class="references-link"
              href="#"
              @click.prevent
              ><i>{{ segment.text }}</i></a
            >
            <i v-else-if="segment.style === 'italic'">{{ segment.text }}</i>
            <span v-else>{{ segment.text }}</span>
          </template>
        </span>
      </li>
    </ol>
  </NodeViewWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { NodeViewWrapper } from '../tiptap'

const props = defineProps({
  node: { type: Object, required: true },
  editor: { type: Object, required: true },
  getPos: { type: Function, required: true },
})

const parsedCitations = computed(() => {
  try {
    return JSON.parse(props.node.attrs.citations)
  } catch {
    return []
  }
})
</script>

<style scoped>
.references-section {
  user-select: none;
  -webkit-user-select: none;
  margin-top: var(--spacing-100);
}

.references-heading {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xx-large);
  border-bottom: 1px var(--border-style-base) var(--border-color-muted, #dadde3);
  margin: 0 0 var(--spacing-50) 0;
  padding: var(--spacing-50) 0;
}

.references-list {
  padding: 0 0 0 var(--spacing-150);
  margin: 0;
}

.references-item {
  padding: var(--spacing-25) 0;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
  color: var(--color-base);
}

.references-caret {
  margin-right: var(--spacing-25);
  color: var(--color-base);
}

.references-link {
  color: var(--color-progressive);
  text-decoration: none;
  word-break: break-word;
}
</style>
