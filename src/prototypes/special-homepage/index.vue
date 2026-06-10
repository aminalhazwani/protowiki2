<script setup lang="ts">
import { ref } from 'vue'
import { CdxButton, CdxCard, CdxField, CdxIcon, CdxMessage, CdxTextInput } from '@wikimedia/codex'
import {
  cdxIconArrowNext,
  cdxIconArrowPrevious,
  cdxIconLink,
  cdxIconMessage,
  cdxIconReference,
} from '@wikimedia/codex-icons'
import ChromeWrapper from '@/components/chrome/ChromeWrapper.vue'
import DashboardModule from '@/components/DashboardModule.vue'
import MobileWrapper from '@/components/MobileWrapper.vue'

definePage({
  meta: {
    title: 'Special homepage',
    description:
      'Newcomer homepage shown in-context after editing an article — back link, suggested-edits cards, and impact module (T419358).',
  },
})

const username = 'Username'
const articleTitle = 'Wet Leg'

const showEmailField = ref(false)
const email = ref('')

function toggleEmailField() {
  showEmailField.value = !showEmailField.value
}

const SUGGESTIONS = [
  {
    id: 'citation',
    icon: cdxIconReference,
    title: 'Complete the citation',
    description: 'Wet Leg • British indie rock band',
    supporting: 'Add the missing website.',
  },
  {
    id: 'links',
    icon: cdxIconLink,
    title: 'Add links',
    description: 'Chaise Longue (song) • 2021 single by Wet Leg',
    supporting: 'Consider linking to Music video.',
  },
  {
    id: 'reference',
    icon: cdxIconReference,
    title: 'Add reference',
    description: 'Moisturizer (album) • 2025 studio album by Wet Leg',
    supporting: 'Help explain where this information is coming from.',
  },
]
</script>

<template>
  <MobileWrapper max-width="412px">
    <ChromeWrapper skin="mobile" :last-edited-notice="false">
      <div class="special-homepage">
        <CdxMessage
          class="special-homepage__back"
          type="notice"
          inline
          :icon="cdxIconArrowPrevious"
        >
          Return to
          <a class="special-homepage__link" href="#" @click.prevent>{{ articleTitle }}</a>
        </CdxMessage>

        <div class="special-homepage__welcome">
          <h1 class="special-homepage__title">Welcome, {{ username }}!</h1>
          <CdxMessage
            class="special-homepage__email"
            type="notice"
            inline
            :icon="cdxIconMessage"
          >
            <a class="special-homepage__link" href="#" @click.prevent="toggleEmailField">
              Add your email
            </a>
          </CdxMessage>
          <CdxField v-if="showEmailField" class="special-homepage__email-field" optional>
          <template #label>Email</template>
          <CdxTextInput v-model="email" input-type="email" placeholder="Email" />
          <template #help-text>
            Your username is public and cannot be made private later.
          </template>
        </CdxField>
      </div>

      <DashboardModule mobile-card title="Suggested edits">
        <template #header-actions>
          <CdxButton weight="quiet" :icon-only="true" aria-label="View all suggested edits">
            <CdxIcon :icon="cdxIconArrowNext" />
          </CdxButton>
        </template>

        <div class="special-homepage__cards">
          <CdxCard
            v-for="suggestion in SUGGESTIONS"
            :key="suggestion.id"
            force-thumbnail
            :custom-placeholder-icon="suggestion.icon"
          >
            <template #title>{{ suggestion.title }}</template>
            <template #description>{{ suggestion.description }}</template>
            <template #supporting-text>{{ suggestion.supporting }}</template>
          </CdxCard>
        </div>

        <CdxButton
          class="special-homepage__discover"
          action="progressive"
          weight="primary"
        >
          Discover all 9 suggestions
        </CdxButton>
      </DashboardModule>

      <DashboardModule mobile-card title="Your impact">
        <template #header-actions>
          <CdxButton weight="quiet" :icon-only="true" aria-label="View your impact">
            <CdxIcon :icon="cdxIconArrowNext" />
          </CdxButton>
        </template>

        <p class="special-homepage__impact-text">
          Start with a few
          <a class="special-homepage__inline-link" href="#" @click.prevent>suggested edits</a>,
          then see how many people are viewing your contributions here.
        </p>
      </DashboardModule>
      </div>
    </ChromeWrapper>
  </MobileWrapper>
</template>

<style scoped>
.special-homepage {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  box-sizing: border-box;
  padding: var(--spacing-100);
  color: var(--color-base);
}

/* The back link and "Add your email" are Codex inline Messages (matching the
   Figma "Message" instances). Inline notice icons render dark to match the design. */
.special-homepage__back,
.special-homepage__email {
  font-size: var(--font-size-medium);
}

.special-homepage :deep(.cdx-message__icon--vue) {
  color: var(--color-base);
}

.special-homepage__link {
  color: var(--color-progressive);
  text-decoration: none;
}

.special-homepage__link:hover {
  text-decoration: underline;
}

.special-homepage__welcome {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-25);
}

.special-homepage__title {
  margin: 0;
  padding: 0;
  border: none;
  font-family: var(--font-family-base);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-xxx-large);
  color: var(--color-base);
}

.special-homepage__email-field {
  margin-top: var(--spacing-50);
}

/* Module headings render as Heading 4 (18px bold) in the design. */
.special-homepage :deep(.mobile-card__title) {
  font-size: var(--font-size-large);
}

.special-homepage__cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.special-homepage__discover {
  width: 100%;
  /* Mailbox/mobile touch target — Figma `size-275` (44px), taller than the 32px desktop default. */
  min-height: 44px;
  margin-top: var(--spacing-100);
}

.special-homepage__impact-text {
  margin: 0;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
  color: var(--color-base);
}

.special-homepage__inline-link {
  color: var(--color-progressive);
  text-decoration: none;
}

.special-homepage__inline-link:hover {
  text-decoration: underline;
}
</style>
