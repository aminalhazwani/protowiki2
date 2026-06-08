<script setup>
definePage({
  meta: {
    title: 'Article creation',
    description: 'Prototype of a Tiptap-based rich text editor for Wikipedia-style article authoring. Includes peacock-word detection, citation chips, paste highlights, and a soft keyboard.',
  },
})

import EditorView from './views/EditorView.vue'
import './styles/global.css'
</script>

<template>
  <EditorView />
</template>
