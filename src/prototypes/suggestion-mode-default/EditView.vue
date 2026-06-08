<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { CdxButton, CdxIcon, CdxField, CdxTextInput, CdxTextArea, CdxMenuButton, CdxRadio, CdxMessage } from '@wikimedia/codex'
  import { cdxIconClose, cdxIconEdit, cdxIconEllipsis, cdxIconCheck, cdxIconSuccess, cdxIconUndo, cdxIconClear } from '@wikimedia/codex-icons'
  import type { CardData } from './types'
  import SaveChangesDialog from './SaveChangesDialog.vue'

  const props = defineProps<{ cards: CardData[], showPublish?: boolean, showPublish2?: boolean }>()
  const emit = defineEmits<{ close: [], published: [] }>()

  type CardMode = 'default' | 'removing' | 'citing' | 'cited' | 'editing' | 'edited' | 'published' | 'rejecting' | 'rejected'

  const cardModes = ref<CardMode[]>([])
  const citationInputs = ref<string[]>([])
  const citationErrors = ref<boolean[]>([])
  const editTexts = ref<string[]>([])
  const rejectionSelections = ref<string[]>([])
  const rejectionErrors = ref<boolean[]>([])

  watch(() => props.cards, (cards) => {
    cardModes.value = cards.map(() => 'default')
    citationInputs.value = cards.map(() => '')
    citationErrors.value = cards.map(() => false)
    editTexts.value = cards.map((c) => c.plainText ?? '')
    rejectionSelections.value = cards.map(() => '')
    rejectionErrors.value = cards.map(() => false)
  }, { immediate: true })

  const isPublishing2 = ref(false)
  let publish2Timeout: ReturnType<typeof setTimeout> | null = null

  function startPublish2() {
    isPublishing2.value = true
    publish2Timeout = setTimeout(() => {
      isPublishing2.value = false
      publish2Timeout = null
      cardModes.value = cardModes.value.map(m =>
        (m !== 'default' && m !== 'published') ? 'published' : m
      )
      emit('published')
    }, 3000)
  }

  function cancelPublish2() {
    if (publish2Timeout) {
      clearTimeout(publish2Timeout)
      publish2Timeout = null
    }
    isPublishing2.value = false
  }

  const REJECTION_OPTIONS: Record<string, { label: string; value: string }[]> = {
    'remove-duplicate': [
      { label: 'The link appears only once in this section', value: 'appears-once' },
      { label: 'The link is useful here for readers', value: 'useful-here' },
      { label: "I'm not sure what a duplicate link is", value: 'not-sure' },
      { label: 'None of these', value: 'none' },
    ],
    'add-citation': [
      { label: 'This information is widely known', value: 'widely-known' },
      { label: 'A citation already exists nearby', value: 'citation-nearby' },
      { label: "This section doesn't need a citation", value: 'no-citation-needed' },
      { label: 'None of these', value: 'none' },
    ],
    'ai-content': [
      { label: 'This text was written by a human editor', value: 'human-written' },
      { label: 'The content is accurate and encyclopedic', value: 'accurate' },
      { label: "I'm not sure how to check this", value: 'not-sure' },
      { label: 'None of these', value: 'none' },
    ],
  }

  const cardMenuSelected = ref<string | null>(null)

  const cardMenuItems = [
    { value: 'about', label: 'About suggestions' },
    { value: 'report', label: 'Report a problem' },
  ]

  const saveDialogOpen = ref(false)
  const saveDialogCardIdx = ref(-1)
  const saveDialogSummary = ref('')

  function buildCumulativeSummary(): string {
    return props.cards
      .map((card, idx) => {
        const mode = cardModes.value[idx]
        if (mode === 'default' || mode === 'published') return null
        if (card.type === 'remove-duplicate') return 'Removed duplicate link'
        if (card.type === 'add-citation') {
          const url = (citationInputs.value[idx] ?? '').trim()
          return url ? `Added citation: ${url}` : 'Added citation'
        }
        if (card.type === 'ai-content') return 'Removed potential AI-generated content'
        return null
      })
      .filter(Boolean)
      .join('\n')
  }

  function openSaveDialog(idx: number) {
    saveDialogCardIdx.value = idx
    saveDialogSummary.value = buildCumulativeSummary()
    saveDialogOpen.value = true
  }

  function onSaveDialogPublish() {
    saveDialogOpen.value = false
    cardModes.value = cardModes.value.map(m =>
      (m !== 'default' && m !== 'published') ? 'published' : m
    )
    emit('close')
  }

  const INACTIVE_MODES: CardMode[] = ['default', 'published', 'citing', 'editing', 'rejecting', 'rejected']
  const ACTIVE_MODES: CardMode[] = ['default', 'citing', 'editing', 'rejecting']

  const anyEdits = computed(() => cardModes.value.some(m => !INACTIVE_MODES.includes(m)))
  const numEdits = computed(() => cardModes.value.filter(m => !INACTIVE_MODES.includes(m)).length)
  const numSuggestionsLeft = computed(() => cardModes.value.filter(m => ACTIVE_MODES.includes(m)).length)

  const activeCardPosition = computed(() => {
    let count = 0
    for (let i = 0; i <= activeCardIndex.value; i++) {
      if (ACTIVE_MODES.includes(cardModes.value[i])) count++
    }
    return Math.max(count, 1)
  })

  const bottomHeights = ref<number[]>([])
  const resizeObservers: ResizeObserver[] = []
  let rafId: number | null = null
  const pendingHeights: number[] = []

  function scheduleHeightUpdate() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      bottomHeights.value = [...pendingHeights]
      rafId = null
    })
  }

  onMounted(async () => {
    await nextTick()
    const carousel = document.querySelector<HTMLElement>('.edit-view__carousel')
    const bottoms = Array.from(carousel?.querySelectorAll<HTMLElement>('.card__bottom') ?? [])
    pendingHeights.length = 0
    bottoms.forEach((el, i) => {
      pendingHeights[i] = el.offsetHeight
      const ro = new ResizeObserver(() => {
        pendingHeights[i] = el.offsetHeight
        scheduleHeightUpdate()
      })
      ro.observe(el)
      resizeObservers[i] = ro
    })
    scheduleHeightUpdate()

    if (carousel) {
      cardIntersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Array.from(carousel.children).indexOf(entry.target as HTMLElement)
            if (idx !== -1) activeCardIndex.value = idx
          }
        }
      }, { root: carousel, threshold: 0.5 })

      Array.from(carousel.children).forEach(card => cardIntersectionObserver!.observe(card as HTMLElement))
    }
  })

  onUnmounted(() => {
    resizeObservers.forEach(ro => ro.disconnect())
    cardIntersectionObserver?.disconnect()
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (publish2Timeout) clearTimeout(publish2Timeout)
  })

  function removedLinksHTML(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    const duplicates = div.querySelectorAll('a.card__preview-duplicate')
    duplicates.forEach((a, idx) => {
      if (idx === 0) {
        // Preserve the first instance, remove highlight
        a.classList.remove('card__preview-duplicate')
      } else {
        // Unlink duplicate instances by turning them into text
        a.replaceWith(document.createTextNode(a.textContent ?? ''))
      }
    })
    return div.innerHTML
  }

  function citedLinksHTML(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    const target = div.querySelector('.card__preview-duplicate')
    if (target) {
      const sup = document.createElement('sup')
      sup.className = 'mw-reflink'
      sup.style.color = 'var(--color-progressive, #3366cc)'
      sup.style.fontWeight = 'bold'
      sup.style.marginLeft = '2px'
      sup.textContent = '[1]'
      target.after(sup)
      target.classList.remove('card__preview-duplicate')
    }
    return div.innerHTML
  }

  function editedContentHTML(idx: number): string {
    const card = props.cards[idx]
    const text = editTexts.value[idx]
    const div = document.createElement('div')
    div.innerHTML = card.previewHTML
    const target = div.querySelector('.card__preview-duplicate')
    if (target) {
      target.textContent = text
      target.classList.remove('card__preview-duplicate')
    }
    return div.innerHTML
  }

  function resolvedPreviewHTML(card: CardData, idx: number): string {
    const mode = cardModes.value[idx]
    if (card.type === 'remove-duplicate' && (mode === 'removing' || mode === 'published')) {
      return removedLinksHTML(card.previewHTML)
    }
    if (card.type === 'add-citation' && (mode === 'cited' || mode === 'published')) {
      return citedLinksHTML(card.previewHTML)
    }
    if (card.type === 'ai-content' && (mode === 'edited' || mode === 'published')) {
      return editedContentHTML(idx)
    }
    return card.previewHTML
  }

  function titleFor(type: CardData['type']): string {
    return {
      'remove-duplicate': 'Remove duplicate link',
      'add-citation': 'Add a citation',
      'ai-content': 'Potential AI-generated content',
    }[type]
  }

  function descriptionFor(type: CardData['type']): string {
    return {
      'remove-duplicate': 'This link appears more than once in this section. Help readers navigate more easily by removing <a href="#">repeated links</a>.',
      'add-citation': 'Help readers understand where this information is coming from by adding a citation.',
      'ai-content': 'This text may include <a href="#">AI-generated content</a>. Help readers trust the article by removing any AI content or rewriting any inaccurate, unverifiable, or unencyclopedic information.',
    }[type]
  }

  function handlePrimaryAction(card: CardData, idx: number) {
    if (card.type === 'remove-duplicate') cardModes.value[idx] = 'removing'
    else if ((props.showPublish || props.showPublish2) && card.type === 'add-citation') cardModes.value[idx] = 'citing'
    else if ((props.showPublish || props.showPublish2) && card.type === 'ai-content') cardModes.value[idx] = 'editing'
  }



  function handleCited(idx: number) {
    if (citationInputs.value[idx].trim()) {
      citationErrors.value[idx] = false
      cardModes.value[idx] = 'cited'
    } else {
      citationErrors.value[idx] = true
    }
  }

  function handleEdited(idx: number) {
    if (editTexts.value[idx].trim()) {
      cardModes.value[idx] = 'edited'
    }
  }

  function handleRevert(idx: number) {
    cardModes.value[idx] = 'default'
    citationErrors.value[idx] = false
  }

  function handleReject(idx: number) {
    cardModes.value[idx] = 'rejecting'
    rejectionSelections.value[idx] = ''
    rejectionErrors.value[idx] = false
  }

  function handleRejectSubmit(card: CardData, idx: number) {
    if (!rejectionSelections.value[idx]) {
      rejectionErrors.value[idx] = true
      return
    }
    console.log('Rejection reason:', card.type, rejectionSelections.value[idx])
    cardModes.value[idx] = 'rejected'
  }

  function handleContinue(idx: number) {
    const nextIdx = idx + 1
    if (nextIdx >= props.cards.length) return
    const carousel = document.querySelector<HTMLElement>('.edit-view__carousel')
    const card = carousel?.children[nextIdx] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const carouselRef = ref<HTMLElement | null>(null)
  const activeCardIndex = ref(0)
  let cardIntersectionObserver: IntersectionObserver | null = null

  function is(idx: number, ...modes: CardMode[]) {
    return modes.includes(cardModes.value[idx])
  }
  const citingDisabled = (idx: number) => (citationInputs.value[idx] ?? '').trim() === ''
  const aiEditDisabled = (idx: number) => {
    const cur = (editTexts.value[idx] ?? '').trim()
    return cur === (props.cards[idx].plainText ?? '').trim() || cur === ''
  }
</script>

<template>
  <div class="edit-view">
    <header class="edit-view__header">
      <h3 class="edit-view__title">Edit: Alan Kay</h3>
      <CdxButton weight="quiet" aria-label="Close" @click="emit('close')">
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
    </header>
    <p v-if="numSuggestionsLeft > 0" class="edit-view__suggestion-count">
      {{ numSuggestionsLeft }} suggestion{{ numSuggestionsLeft === 1 ? '' : 's' }}
    </p>
    <div class="edit-view__body">
      <div ref="carouselRef" class="edit-view__carousel">
        <div v-for="(card, i) in cards" :key="i" class="edit-view__card">
          <div
            class="card__preview"
            :style="{ paddingBottom: `calc(${bottomHeights[i] ?? 0}px + var(--spacing-100, 16px))` }"
            :class="{ 'card__preview--removing': is(i, 'removing', 'published'), 'card__preview--done': is(i, 'published'), 'card__preview--rejected': is(i, 'rejected') }"
            v-html="resolvedPreviewHTML(card, i)"
          />
          <div class="card__bottom">
            <Transition name="card-confirm" mode="out-in">
              <div v-if="is(i, 'published')" key="published" class="card__message">
                <CdxIcon :icon="showPublish2 ? cdxIconSuccess : cdxIconCheck" class="card__message-icon" />
                <span class="card__message-label">Published</span>
              </div>

              <div v-else-if="is(i, 'removing')" key="removing" class="card__message">
                <CdxIcon :icon="showPublish2 ? cdxIconSuccess : cdxIconCheck" class="card__message-icon" />
                <span class="card__message-label">{{ titleFor(card.type) }}</span>
                <div class="card__message-actions">
                  <CdxButton weight="quiet" size="small" aria-label="Undo" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconUndo" />
                  </CdxButton>

                </div>
              </div>

              <div v-else-if="is(i, 'cited')" key="cited" class="card__message">
                <CdxIcon :icon="showPublish2 ? cdxIconSuccess : cdxIconCheck" class="card__message-icon" />
                <span class="card__message-label">{{ titleFor(card.type) }}</span>
                <div class="card__message-actions">
                  <CdxButton weight="quiet" size="small" aria-label="Undo" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconUndo" />
                  </CdxButton>

                </div>
              </div>

              <div v-else-if="is(i, 'edited')" key="edited" class="card__message">
                <CdxIcon :icon="showPublish2 ? cdxIconSuccess : cdxIconCheck" class="card__message-icon" />
                <span class="card__message-label">{{ titleFor(card.type) }}</span>
                <div class="card__message-actions">
                  <CdxButton weight="quiet" size="small" aria-label="Undo" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconUndo" />
                  </CdxButton>

                </div>
              </div>

              <div v-else-if="is(i, 'rejected')" key="rejected" class="card__message card__message--error">
                <CdxIcon :icon="cdxIconClear" class="card__message-icon" />
                <span class="card__message-label">{{ titleFor(card.type) }}</span>
                <div class="card__message-actions">
                  <CdxButton weight="quiet" size="small" aria-label="Undo" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconUndo" />
                  </CdxButton>
                </div>
              </div>

              <div v-else-if="is(i, 'citing')" key="citing" class="card__instructions">
                <div class="card__instructions-header">
                  <p class="card__instructions-title">Add a citation</p>
                  <CdxButton weight="quiet" class="card__instructions-menu" aria-label="Cancel" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconClose" />
                  </CdxButton>
                </div>
                <CdxField
                  class="card__citation-field"
                  :status="citationErrors[i] ? 'error' : 'default'"
                  :messages="{ error: 'Enter a website or ISBN' }"
                >
                  <template #label>Website or ISBN</template>
                  <CdxTextInput
                    v-model="citationInputs[i]"
                    placeholder="https://example.com/source"
                    input-type="url"
                    @input="citationErrors[i] = false"
                  />
                </CdxField>
                <div class="card__actions">
                  <CdxButton @click="handleCited(i)">Add citation</CdxButton>
                </div>
              </div>

              <div v-else-if="is(i, 'editing')" key="editing" class="card__instructions">
                <div class="card__instructions-header">
                  <p class="card__instructions-title">Edit content</p>
                  <CdxButton weight="quiet" class="card__instructions-menu" aria-label="Cancel" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconClose" />
                  </CdxButton>
                </div>
                <p class="card__instructions-description">Remove or rewrite any inaccurate text.</p>
                <CdxField class="card__edit-field">
                  <template #label>Article text</template>
                  <CdxTextArea v-model="editTexts[i]" :rows="5" class="card__edit-textarea" />
                </CdxField>
                <div class="card__actions">
                  <CdxButton action="progressive" weight="primary" :disabled="aiEditDisabled(i)" @click="handleEdited(i)">Apply edit</CdxButton>
                </div>
              </div>

              <div v-else-if="is(i, 'rejecting')" key="rejecting" class="card__instructions">
                <div class="card__instructions-header">
                  <p class="card__instructions-title">Why did you reject this?</p>
                  <CdxButton weight="quiet" class="card__instructions-menu" aria-label="Close" @click="handleRevert(i)">
                    <CdxIcon :icon="cdxIconClose" />
                  </CdxButton>
                </div>
                <div class="card__rejection-options">
                  <CdxRadio
                    v-for="option in REJECTION_OPTIONS[card.type]"
                    :key="option.value"
                    v-model="rejectionSelections[i]"
                    :input-value="option.value"
                    :name="`rejection-${i}`"
                    @update:model-value="rejectionErrors[i] = false"
                  >
                    {{ option.label }}
                  </CdxRadio>
                  <CdxMessage v-if="rejectionErrors[i]" type="error" :inline="true">
                    Select an option to continue.
                  </CdxMessage>
                </div>
                <div class="card__actions">
                  <CdxButton action="progressive" weight="normal" @click="handleRejectSubmit(card, i)">Submit</CdxButton>
                </div>
              </div>

              <div v-else key="instructions" class="card__instructions">
                <div class="card__instructions-header">
                  <p class="card__instructions-title">{{ titleFor(card.type) }}</p>
                  <CdxMenuButton
                    v-if="showPublish2"
                    v-model:selected="cardMenuSelected"
                    :menu-items="cardMenuItems"
                    weight="quiet"
                    class="card__instructions-menu"
                  >
                    <CdxIcon :icon="cdxIconEllipsis" />
                  </CdxMenuButton>
                </div>
                <p class="card__instructions-description" v-html="descriptionFor(card.type)" />
                <div class="card__actions">
                  <template v-if="showPublish2">
                    <CdxButton @click="handlePrimaryAction(card, i)">Accept</CdxButton>
                    <CdxButton @click="handleReject(i)">Reject</CdxButton>
                  </template>
                  <template v-else>
                    <CdxButton action="progressive" weight="primary" @click="handlePrimaryAction(card, i)">
                      <template v-if="card.type === 'remove-duplicate'">Remove link</template>
                      <template v-else-if="card.type === 'add-citation'">Add citation</template>
                      <template v-else>Edit</template>
                    </CdxButton>
                    <CdxButton weight="quiet" aria-label="More options" class="card__actions-more">
                      <CdxIcon :icon="cdxIconEllipsis" />
                    </CdxButton>
                  </template>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
    <footer class="edit-view__footer">
      <template v-if="showPublish2">
        <div class="edit-view__footer-slot">
          <Transition name="footer-swap">
            <CdxButton
              v-if="anyEdits"
              key="publish"
              action="progressive"
              weight="primary"
              size="large"
              class="edit-view__publish-button"
              :class="{
                'animate__animated animate__shakeX': anyEdits && numSuggestionsLeft === 0,
                'edit-view__publish-button--counting': isPublishing2
              }"
              @click="isPublishing2 ? cancelPublish2() : startPublish2()"
            >
              Publish {{ numEdits }} {{ numEdits === 1 ? 'edit' : 'edits' }}
            </CdxButton>
          </Transition>
          <Transition name="footer-swap">
            <CdxButton v-if="!anyEdits" key="edit-full" weight="quiet" size="large">
              <CdxIcon :icon="cdxIconEdit" />
              Edit full article
            </CdxButton>
          </Transition>
        </div>
        <div class="edit-view__footer-cancel" :class="{ 'edit-view__footer-cancel--open': isPublishing2 }">
          <div>
            <CdxButton weight="quiet" size="large" @click="cancelPublish2">
              Cancel
            </CdxButton>
          </div>
        </div>
      </template>
      <template v-else>
        <Transition name="card-confirm">
          <CdxButton
            v-if="anyEdits"
            key="publish"
            action="progressive"
            weight="primary"
            size="large"
            class="edit-view__publish-button"
            :class="{ 'animate__animated animate__shakeX': anyEdits && numSuggestionsLeft === 0 }"
            @click="showPublish ? openSaveDialog(-1) : emit('close')"
          >
            Publish {{ numEdits }} {{ numEdits === 1 ? 'edit' : 'edits' }}
          </CdxButton>
        </Transition>
        <CdxButton weight="quiet" size="large">
          <CdxIcon :icon="cdxIconEdit" />
          Edit full article
        </CdxButton>
      </template>
    </footer>

    <SaveChangesDialog
      v-if="showPublish && !showPublish2"
      :open="saveDialogOpen"
      :initial-summary="saveDialogSummary"
      :change-count="numEdits"
      @back="saveDialogOpen = false"
      @publish="onSaveDialogPublish"
    />
  </div>
</template>

<style scoped>
  .edit-view {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    overflow: clip;
    background-color: var(--background-color-neutral-subtle, #f8f9fa);
  }

  .edit-view__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-100, 16px);
    position: relative;
  }

  .edit-view__title {
    flex: 1;
    margin: 0;
    font-family: var(--font-family-system-sans);
    text-align: center;
  }

  .edit-view__header > button {
    position: absolute;
    right: var(--spacing-100);
  }

  .edit-view__suggestion-count {
    text-align: center;
    font-weight: bold;
    color: var(--color-success);
    font-size: var(--font-size-small);
    line-height: var(--line-height-small);
  }

  .edit-view__body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .edit-view__carousel {
    flex: 1;
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: var(--spacing-100, 16px);
    padding-inline: var(--spacing-200, 32px);
    scroll-padding-inline: var(--spacing-200, 32px);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .edit-view__carousel::-webkit-scrollbar {
    display: none;
  }

  .edit-view__card {
    flex-shrink: 0;
    width: 100%;
    scroll-snap-align: center;
    background-color: var(--background-color-base, #fff);
    position: relative;
    overflow: hidden;
  }

  .card__preview {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: var(--spacing-100, 16px);
    font-size: var(--font-size-medium, 1rem);
    line-height: var(--line-height-medium, 1.6);
    transition: opacity 200ms ease;
  }

  .card__preview--done { opacity: 0.45; }

  .card__preview :deep(a) {
    color: var(--color-progressive, #3366cc);
    text-decoration: none;
  }

  .card__preview :deep(.card__preview-duplicate) {
    background-color: var(--background-color-warning-subtle, #fef6e7);
  }

  .card__preview--rejected :deep(.card__preview-duplicate) {
    background-color: transparent;
  }

  .card__preview :deep(blockquote) {
    border-left: 3px solid var(--border-color-base, #a2a9b1);
    margin: var(--spacing-100, 16px) 0 0 var(--spacing-150, 24px);
    padding-left: var(--spacing-150, 24px);
  }

  .card__preview :deep(h2),
  .card__preview :deep(h3) {
    font-size: 1.5rem;
    border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
    padding-bottom: var(--spacing-75, 6px);
    margin: 0 0 var(--spacing-100, 16px);
  }

  .card__bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  .card__instructions {
    padding: var(--spacing-75, 12px) var(--spacing-100, 16px) var(--spacing-100, 16px);
    background-color: var(--background-color-neutral);
  }

  .card__instructions-description {
    margin: 0 0 var(--spacing-75, 12px);
    color: var(--color-base, #202122);
    line-height: var(--line-height-small);
  }

  .card__instructions-description :deep(a) {
    color: var(--color-progressive, #3366cc);
    text-decoration: none;
  }

  .card__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-75, 12px);
  }

  .card__actions-more {
    margin-inline-start: auto;
  }

  .card__instructions-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-75, 12px);
    justify-content: space-between;
  }

  .card__instructions-title {
    margin: var(--spacing-12, 2px) 0 0 0;
    font-weight: var(--font-weight-bold, 700);
    flex: 1;
  }

  .card__instructions-menu {
    margin-inline-end: calc(-1 * var(--spacing-25, 4px));
  }

  .card__message {
    display: flex;
    align-items: normal;
    gap: var(--spacing-50, 8px);
    padding: var(--spacing-100, 16px);
    background-color: var(--background-color-success-subtle);
    color: var(--color-success);
  }

  .card__message-icon {
    color: var(--color-icon-success);
  }

  .card__message-label {
    font-weight: var(--font-weight-bold, 700);
    line-height: var(--line-height-small);
    flex: 1;
  }

  .card__message-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-25, 4px);
    margin-inline-start: auto;
  }

  .card__message--error {
    background-color: var(--background-color-error-subtle);
    color: var(--color-error);
  }

  .card__message--error .card__message-icon {
    color: var(--color-icon-error);
  }

  .card__message-undo {
    color: var(--color-neutral);
  }

  .card__rejection-options {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-100, 16px);
  }

  .card__citation-field, .card__edit-field {
    margin: 0 0 var(--spacing-100, 16px) 0;
  }

  .card__citation-field :deep(.cdx-label__label__text) {
    font-weight: 400;
  }

  .card__edit-textarea {
    width: 100%;
    font-size: var(--font-size-small);
    font-family: var(--font-family-system-sans);
  }

  .card-confirm-enter-active {
    transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .card-confirm-leave-active {
    transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .card-confirm-enter-from,
  .card-confirm-leave-to {
    transform: translateY(100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .card-confirm-enter-active,
    .card-confirm-leave-active {
      transition: opacity 200ms ease;
      transform: none;
    }

    .card-confirm-enter-from,
    .card-confirm-leave-to {
      opacity: 0;
    }
  }

  .edit-view__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-75, 12px);
    padding: var(--spacing-100, 16px);
  }

  .edit-view__publish-button {
    width: 100%;
  }

  .edit-view__publish-button--counting {
    background-image: linear-gradient(
      var(--background-color-progressive--active),
      var(--background-color-progressive--active)
    );
    background-repeat: no-repeat;
    background-position: left center;
    animation: publish-countdown 3s linear forwards;
  }

  .edit-view__footer-slot {
    display: grid;
    width: 100%;
  }

  .edit-view__footer-cancel {
    display: grid;
    grid-template-rows: 0fr;
    width: 100%;
    transition: grid-template-rows 350ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .edit-view__footer-cancel--open {
    grid-template-rows: 1fr;
  }

  .edit-view__footer-cancel > div {
    overflow: hidden;
    min-height: 0;
  }

  .edit-view__footer-cancel .cdx-button {
    width: 100%;
  }

  .footer-swap-enter-active {
    transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .footer-swap-leave-active {
    transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .footer-swap-enter-from,
  .footer-swap-leave-to {
    transform: translateY(100vh);
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-swap-enter-active,
    .footer-swap-leave-active {
      transition: opacity 200ms ease;
      transform: none;
    }

    .footer-swap-enter-from,
    .footer-swap-leave-to {
      opacity: 0;
    }
  }

  .edit-view__footer-slot > .cdx-button {
    grid-area: 1 / 1;
    width: 100%;
  }
</style>

<style>
  :root {
    --animate-duration: 1s;
  }

  .animate__animated {
    animation-duration: var(--animate-duration);
    animation-fill-mode: both;
  }

  @keyframes publish-countdown {
    from { background-size: 100% 100%; }
    to { background-size: 0% 100%; }
  }

  @keyframes shakeX {
    from,
    to {
      transform: translate3d(0, 0, 0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translate3d(-10px, 0, 0);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translate3d(10px, 0, 0);
    }
  }

  .animate__shakeX {
    animation-name: shakeX;
  }

  @media print, (prefers-reduced-motion: reduce) {
    .animate__animated {
      animation-duration: 1ms !important;
      transition-duration: 1ms !important;
      animation-iteration-count: 1 !important;
    }
  }
</style>
