<template>
  <div class="home-view">
    <WikipediaHeader>
      <template #actions>
        <UserAccountMenu @create-account="dialogOpen = true" />
      </template>
    </WikipediaHeader>
    <WikipediaArticle />
    <WikipediaFooter />
    <CreateAccountDialog v-model:open="dialogOpen" />
    <Teleport to="body">
      <AdminPanel v-if="showAdmin" @close="closeAdmin" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import WikipediaHeader from '../WikipediaHeader.vue'
import WikipediaFooter from '../WikipediaFooter.vue'
import WikipediaArticle from '../WikipediaArticle.vue'
import UserAccountMenu from '../components/UserAccountMenu.vue'
import CreateAccountDialog from '../components/CreateAccountDialog.vue'
import AdminPanel from '../components/AdminPanel.vue'

const dialogOpen = ref(false)
const showAdmin = inject<Ref<boolean>>('showAdmin')

function closeAdmin() {
  if (showAdmin) showAdmin.value = false
}
</script>
