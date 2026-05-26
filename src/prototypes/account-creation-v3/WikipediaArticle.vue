<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="mw-body-content" v-html="mainContent" />
</template>

<script setup lang="ts">
import './wikipedia.css'
import mainContent from './wikipedia-main.html?raw'
</script>

<style>
/* Prevent #-links from showing as visited — `:visited` only allows color overrides */
.mw-body-content a[href='#']:visited {
  color: #3366cc;
}
</style>
