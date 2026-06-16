<template>
  <WikipediaHeader />
  <div class="form-container">
    <h1 class="form-heading">
      Create
      <a href="#" class="admin-trigger" @click.prevent="toggleAdmin">account</a>
    </h1>
    <CreateAccountForm />
  </div>
  <WikipediaFooter />
</template>

<script setup>
import { inject } from 'vue'
import WikipediaHeader from '../WikipediaHeader.vue'
import CreateAccountForm from '../components/CreateAccountForm.vue'
import WikipediaFooter from '../WikipediaFooter.vue'

const toggleAdmin = inject('toggleAdmin')
</script>

<style scoped>
.form-heading {
  font-family: var(--font-family-system-sans);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-x-large);
  margin: 0 0 var(--spacing-150) 0;
  color: var(--color-base);
}

.admin-trigger {
  color: inherit;
  text-decoration: none;
  cursor: text;
}
</style>
