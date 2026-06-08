<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, createApp, defineComponent, h } from 'vue'

  definePage({
    meta: {
      title: 'Suggestion mode: Default',
      description: 'Prototype for suggestion mode default state.',
    },
  })

  import { CdxButton, CdxIcon, CdxMessage, CdxAccordion } from '@wikimedia/codex'
  import { cdxIconUserAvatarOutline, cdxIconCheck } from '@wikimedia/codex-icons'
  import Article from './Article.vue'
  import ChromeWrapper from './ChromeWrapper.vue'
  import EditView from './EditView.vue'
  import type { CardData } from './types'
  import alanKaySnapshotHtml from './alan-kay.html?raw'
  import './mobile-wiki-overrides.css'

  const editViewOpen = ref(false)
  const publishSuccess = ref(false)

  function onPublished() {
    editViewOpen.value = false
    publishSuccess.value = true
  }
  const editViewCards = ref<CardData[]>([])
  const cardMapRef = ref(new Map<string, CardData>())
  const containerRef = ref<HTMLElement | null>(null)
  const snapshotHtml = ref<string | undefined>(undefined)

  const params = new URLSearchParams(window.location.search)
  const showHatnotes = params.get('hatnotes') === '1'
  const showHatnoteToast = params.get('toast') === '1'
  const showSummary = params.get('summary') === '1'
  const showImprove = params.get('improve') === '1'
  const showPublish = params.get('publish') === '1'
  const showPublish2 = params.get('publish') === '2'

  const improveTabActive = ref(false)

  const HATNOTE_INJECTIONS: { selector: string; text: string }[] = [
    { selector: '#mwEw', text: '[<i>remove duplicate link?</i>]' },
    { selector: '#mwKg', text: '[<i>add a citation?</i>]' },
    { selector: '#mwMQ', text: '[<i>add a citation?</i>]' },
    { selector: '#mwNQ', text: '[<i>add a citation?</i>]' },
    { selector: '#mwOg', text: '[<i>add a citation?</i>]' },
    { selector: '#mwPw', text: '[<i>add a citation?</i>]' },
    { selector: '#mwbg', text: '[<i>add a citation?</i>]' },
    { selector: '#mwfQ', text: '[<i>potential AI-generated content?</i>]' },
    { selector: '#mwnw', text: '[<i>add a citation?</i>]' },
    { selector: '#mwsQ', text: '[<i>add a citation?</i>]' },
    { selector: '#mwyw', text: '[<i>add a citation?</i>]' },
    { selector: '#mw0g', text: '[<i>add a citation?</i>]' },
    { selector: '#mw5g', text: '[<i>add a citation?</i>]' },
    { selector: '#mw7g', text: '[<i>add a citation?</i>]' },
    { selector: '#mw8Q', text: '[<i>add a citation?</i>]' },
    { selector: '#mwAVk', text: '[<i>add a citation?</i>]' },
  ]

  // --- summary accordion injection ---

  let summaryApp: ReturnType<typeof createApp> | null = null

  async function fetchPageviews(title: string): Promise<string> {
    const end = new Date()
    end.setDate(end.getDate() - 1)
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encodeURIComponent(title)}/daily/${fmt(start)}/${fmt(end)}`
    const res = await fetch(url)
    const data = await res.json()
    const total: number = (data.items as { views: number }[]).reduce((sum, item) => sum + item.views, 0)
    return total.toLocaleString()
  }

  async function fetchEditStats(title: string): Promise<{ edits: number; authors: number }> {
    const end = new Date()
    end.setDate(end.getDate() - 1)
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    const fmt = (d: Date) => d.toISOString().slice(0, 19) + 'Z'
    const params = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      titles: title,
      rvprop: 'user',
      rvlimit: '500',
      rvstart: fmt(end),
      rvend: fmt(start),
      rvdir: 'older',
      format: 'json',
      origin: '*',
    })
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`)
    const data = await res.json()
    const pages = data.query?.pages ?? {}
    const revisions: { user: string }[] = (Object.values(pages)[0] as { revisions?: { user: string }[] })?.revisions ?? []
    const authors = new Set(revisions.map((r) => r.user)).size
    return { edits: revisions.length, authors }
  }

  function buildSummary(cardList: CardData[]): string {
    const citationCount = cardList.filter(c => c.type === 'add-citation').length
    const aiCount = cardList.filter(c => c.type === 'ai-content').length
    const duplicateCount = cardList.filter(c => c.type === 'remove-duplicate').length

    const parts: string[] = []

    if (citationCount > 0) {
      parts.push(citationCount === 1
        ? 'a citation is missing'
        : citationCount <= 4
          ? 'a few citations are missing'
          : 'several citations are missing')
    }
    if (aiCount > 0) {
      parts.push(aiCount === 1
        ? 'one section may need a human review'
        : 'some sections may need a human review')
    }
    if (duplicateCount > 0) {
      parts.push(duplicateCount === 1
        ? 'a duplicate link could be cleaned up'
        : 'some duplicate links could be cleaned up')
    }

    if (parts.length === 0) return ''
    const [first, ...rest] = parts
    const lead = first[0].toUpperCase() + first.slice(1)
    if (rest.length === 0) return `${lead}.`
    const last = rest.pop()!
    return rest.length > 0
      ? `${lead}, ${rest.join(', ')}, and ${last}.`
      : `${lead}, and ${last}.`
  }

  function injectSummaryAccordion(container: HTMLElement, cardList: CardData[]) {
    if (container.querySelector('.protowiki-summary')) return
    const articleContent = container.querySelector('.article-content')
    if (!articleContent) return

    const count = new Set(cardList.map(c => c.type)).size
    const summary = buildSummary(cardList)
    const wrapper = document.createElement('div')
    wrapper.className = 'protowiki-summary'
    articleContent.before(wrapper)

    const SummaryAccordion = defineComponent({
      setup() {
        const isOpen = ref(false)
        const views = ref<string | null>(null)
        const editStats = ref<{ edits: number; authors: number } | null>(null)
        Promise.all([
          fetchPageviews('Alan Kay'),
          fetchEditStats('Alan_Kay'),
        ]).then(([v, s]) => {
          views.value = v
          editStats.value = s
        })
        return () => h(CdxAccordion, {
          modelValue: isOpen.value,
          'onUpdate:modelValue': (v: boolean) => { isOpen.value = v },
        }, {
          title: () => h('span', `${count} ways to improve this article`),
          description: (views.value && editStats.value)
            ? () => {
                const { edits, authors } = editStats.value!
                const editLabel = edits === 1 ? 'edit' : 'edits'
                const authorLabel = authors === 1 ? 'author' : 'authors'
                return h('span', `${edits} ${editLabel} by ${authors} ${authorLabel} and ${views.value} views in the past 30 days`)
              }
            : undefined,
          default: () => h('div', { class: 'protowiki-summary__body' }, [
            h('span', { class: 'protowiki-summary__label' }, 'Machine-generated'),
            h('p', { class: 'protowiki-summary__text' }, summary),
            h(CdxButton, { onClick: () => { editViewCards.value = cardList; editViewOpen.value = true } }, () => 'Open suggestions'),
          ]),
        })
      },
    })

    summaryApp = createApp(SummaryAccordion)
    summaryApp.mount(wrapper)
  }

  const BLOCK_TAGS = new Set(['P', 'DIV', 'SECTION', 'BLOCKQUOTE', 'LI'])
  const PREVIEW_BLOCK_TAGS = new Set([...BLOCK_TAGS, 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'])

  // --- hatnote injection helpers ---

  function collapsedHTML(label: string): string {
    return `[<i>${label}</i>]`
  }

  function expandedHTML(label: string): string {
    return (
      `<span class="protowiki-hatnote__bracket">[</span>` +
      `<i class="protowiki-hatnote__label">${label}</i> ` +
      `<span class="protowiki-hatnote__action protowiki-hatnote__action--yes">yes</span>` +
      `<span class="protowiki-hatnote__bracket"> / </span>` +
      `<span class="protowiki-hatnote__action protowiki-hatnote__action--no">no</span>` +
      `<span class="protowiki-hatnote__bracket">]</span>`
    )
  }

  function injectHatnotes(root: Element, cardMap: Map<string, CardData>) {
    for (const { selector, text } of HATNOTE_INJECTIONS) {
      const el = root.querySelector(selector)
      if (!el || el.classList.contains('protowiki-hatnote-group') || el.hasAttribute('data-hatnote-injected')) continue
      const label = text.replace(/^\[/, '').replace(/\]$/, '').replace(/<\/?i>/g, '')
      const card = cardMap.get(selector)
      const sup = document.createElement('sup')
      sup.className = 'protowiki-hatnote'
      sup.dataset.hatnoteLabel = label
      sup.innerHTML = collapsedHTML(label)
      sup.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.closest('.protowiki-hatnote__action--yes')) {
          if (card) {
            editViewCards.value = [card]
            editViewOpen.value = true
          }
          sup.classList.remove('protowiki-hatnote--expanded')
          sup.innerHTML = collapsedHTML(label)
          return
        }
        if (target.closest('.protowiki-hatnote__action--no')) {
          sup.classList.remove('protowiki-hatnote--expanded')
          sup.innerHTML = collapsedHTML(label)
          return
        }
        const expanded = sup.classList.toggle('protowiki-hatnote--expanded')
        sup.innerHTML = expanded ? expandedHTML(label) : collapsedHTML(label)
      })
      if (BLOCK_TAGS.has(el.tagName)) {
        // Wrap content in an inner inline span so box-decoration-break: clone
        // draws a border around each visual line, not the whole block box.
        let inner = el.querySelector(':scope > .protowiki-hatnote-group') as HTMLElement | null
        if (!inner) {
          inner = document.createElement('span')
          inner.className = 'protowiki-hatnote-group'
          while (el.firstChild) inner.appendChild(el.firstChild)
          el.appendChild(inner)
        }
        el.dataset.hatnoteInjected = '1'
        el.appendChild(sup)
      } else {
        if (el.classList.contains('protowiki-hatnote-group')) continue
        el.classList.add('protowiki-hatnote-group')
        el.parentNode!.insertBefore(sup, el.nextSibling)
      }
    }
  }

  // --- card building helpers ---

  function getParentBlock(el: Element): Element | null {
    let current: Element | null = el
    while (current && !PREVIEW_BLOCK_TAGS.has(current.tagName)) {
      current = current.parentElement
    }
    return current
  }

  function cleanClone(el: Element): Element {
    const STRIP = ['id', 'about', 'data-mw', 'typeof', 'rel']
    ;[el, ...Array.from(el.querySelectorAll('*'))].forEach(node => {
      STRIP.forEach(attr => node.removeAttribute(attr))
    })
    el.querySelectorAll('a[href]').forEach(a => a.setAttribute('href', '#'))
    el.querySelectorAll('.protowiki-hatnote').forEach(n => n.remove())
    return el
  }

  // Tighter block set for duplicate link: skip large containers like DIV/SECTION
  const INLINE_BLOCK_TAGS = new Set(['P', 'BLOCKQUOTE', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'])

  function getNearestInlineBlock(el: Element): Element | null {
    let current: Element | null = el
    while (current && !INLINE_BLOCK_TAGS.has(current.tagName)) {
      current = current.parentElement
    }
    return current
  }

  function buildDuplicateCard(root: Element, el: Element): CardData | null {
    const targetHref = el.getAttribute('href')
    if (!targetHref) return null

    // Anchor to the flagged element's nearest inline block (P, BLOCKQUOTE, LI…)
    const primaryBlock = getNearestInlineBlock(el)
    if (!primaryBlock) return null

    // Find another occurrence in a different inline block
    let secondaryBlock: Element | null = null
    for (const link of root.querySelectorAll<HTMLAnchorElement>(`a[href="${targetHref}"]`)) {
      const block = getNearestInlineBlock(link)
      if (block && block !== primaryBlock) {
        secondaryBlock = block
        break
      }
    }

    // Show blocks in document order
    let blocks: Element[]
    if (secondaryBlock) {
      const primFirst = !!(primaryBlock.compareDocumentPosition(secondaryBlock) & Node.DOCUMENT_POSITION_FOLLOWING)
      blocks = primFirst ? [primaryBlock, secondaryBlock] : [secondaryBlock, primaryBlock]
    } else {
      blocks = [primaryBlock]
    }

    const previewHTML = blocks.map(block => {
      const clone = block.cloneNode(true) as Element
      clone.querySelectorAll<HTMLAnchorElement>(`a[href="${targetHref}"]`).forEach(a => {
        a.classList.add('card__preview-duplicate')
      })
      return cleanClone(clone).outerHTML
    }).join('')

    return { type: 'remove-duplicate', previewHTML }
  }

  function nextMeaningfulSibling(el: Element): Element | null {
    let sib = el.nextElementSibling
    while (sib?.tagName === 'STYLE') sib = sib.nextElementSibling
    return sib ?? null
  }

  function prevMeaningfulSibling(el: Element): Element | null {
    let sib = el.previousElementSibling
    while (sib?.tagName === 'STYLE') sib = sib.previousElementSibling
    return sib ?? null
  }

  function wrapAllContent(el: Element): void {
    const wrapper = document.createElement('span')
    wrapper.className = 'card__preview-duplicate'
    while (el.firstChild) wrapper.appendChild(el.firstChild)
    el.appendChild(wrapper)
  }

  function findInlineTarget(el: Element, blockRoot: Element): Element {
    if (el.tagName === 'A') return el
    const sup = el.closest('sup')
    if (sup && sup !== blockRoot && blockRoot.contains(sup)) return sup
    const inline = el.closest('a, b, strong, em, i')
    if (inline && inline !== blockRoot && blockRoot.contains(inline)) return inline
    return el
  }

  function buildCitationCard(el: Element, block: Element): CardData | null {
    let blockClone: Element

    if (el === block) {
      blockClone = block.cloneNode(true) as Element
      wrapAllContent(blockClone)
    } else {
      // Clone AFTER marking so the attribute is captured in the snapshot
      el.setAttribute('data-highlight-target', '1')
      blockClone = block.cloneNode(true) as Element
      el.removeAttribute('data-highlight-target')
      const targetInClone = blockClone.querySelector('[data-highlight-target]') as Element | null
      if (targetInClone) {
        targetInClone.removeAttribute('data-highlight-target')
        findInlineTarget(targetInClone, blockClone).classList.add('card__preview-duplicate')
      }
    }

    let previewHTML = ''
    if (block.tagName === 'BLOCKQUOTE') {
      const prev = prevMeaningfulSibling(block)
      if (prev?.tagName === 'P' && (prev.textContent?.length ?? 0) < 200) {
        previewHTML = cleanClone(prev.cloneNode(true) as Element).outerHTML
      }
      previewHTML += cleanClone(blockClone).outerHTML
    } else {
      previewHTML = cleanClone(blockClone).outerHTML
      const next = nextMeaningfulSibling(block)
      if (next?.tagName === 'BLOCKQUOTE') {
        previewHTML += cleanClone(next.cloneNode(true) as Element).outerHTML
      }
    }

    return { type: 'add-citation', previewHTML }
  }

  function buildAiCard(el: Element, block: Element): CardData | null {
    const blockquote = block.closest('blockquote') ?? (block.tagName === 'BLOCKQUOTE' ? block : null)

    if (blockquote) {
      const blockClone = blockquote.cloneNode(true) as Element
      blockClone.classList.add('templatequote')
      blockClone.querySelectorAll('p').forEach(p => wrapAllContent(p))
      let previewHTML = ''
      const prev = prevMeaningfulSibling(blockquote)
      if (prev?.tagName === 'P') {
        previewHTML = cleanClone(prev.cloneNode(true) as Element).outerHTML
      }
      previewHTML += cleanClone(blockClone).outerHTML
      return { type: 'ai-content', previewHTML }
    }

    let blockClone: Element
    if (el === block) {
      blockClone = block.cloneNode(true) as Element
      wrapAllContent(blockClone)
    } else {
      // Clone AFTER marking so the attribute is captured in the snapshot
      el.setAttribute('data-highlight-target', '1')
      blockClone = block.cloneNode(true) as Element
      el.removeAttribute('data-highlight-target')
      const targetInClone = blockClone.querySelector('[data-highlight-target]') as Element | null
      if (targetInClone) {
        targetInClone.removeAttribute('data-highlight-target')
        findInlineTarget(targetInClone, blockClone).classList.add('card__preview-duplicate')
      } else {
        wrapAllContent(blockClone)
      }
    }
    return { type: 'ai-content', previewHTML: cleanClone(blockClone).outerHTML }
  }

  function buildCardMap(root: Element): Map<string, CardData> {
    const map = new Map<string, CardData>()
    for (const { selector, text } of HATNOTE_INJECTIONS) {
      const el = root.querySelector(selector)
      if (!el) continue

      const type: CardData['type'] = text.includes('duplicate')
        ? 'remove-duplicate'
        : text.toLowerCase().includes('ai-generated')
          ? 'ai-content'
          : 'add-citation'

      let card: CardData | null = null
      if (type === 'remove-duplicate') {
        card = buildDuplicateCard(root, el)
      } else {
        const block = getParentBlock(el)
        if (block) {
          card = type === 'add-citation'
            ? buildCitationCard(el, block)
            : buildAiCard(el, block)
        }
      }

      if (card) map.set(selector, card)
    }
    return map
  }

  function onSectionEditCapture(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest('.protowiki-mobile-h2__edit')
    if (!btn) return

    e.stopPropagation()

    const section = btn.closest('section[data-mw-section-id]')
    if (!section) return

    const cardMap = cardMapRef.value
    const sectionCards: CardData[] = []
    for (const { selector } of HATNOTE_INJECTIONS) {
      const el = section.querySelector(selector)
      if (!el) continue
      const card = cardMap.get(selector)
      if (card) sectionCards.push(card)
    }

    if (sectionCards.length > 0) {
      editViewCards.value = sectionCards
      editViewOpen.value = true
    }
  }

  // --- viewport/toast observer ---

  const visibleSelectors = ref(new Set<string>())
  const visibleCount = computed(() => visibleSelectors.value.size)
  const cards = ref<CardData[]>([])
  let observer: MutationObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let observedTargets: Element[] = []

  function startViewportObserver(root: Element) {
    const elementToSelector = new Map<Element, string>()
    for (const { selector } of HATNOTE_INJECTIONS) {
      const el = root.querySelector(selector)
      if (el) elementToSelector.set(el, selector)
    }
    observedTargets = [...elementToSelector.keys()]

    intersectionObserver = new IntersectionObserver((entries) => {
      const next = new Set(visibleSelectors.value)
      entries.forEach((e) => {
        const sel = elementToSelector.get(e.target)
        if (!sel) return
        e.isIntersecting ? next.add(sel) : next.delete(sel)
      })
      visibleSelectors.value = next
    })

    observedTargets.forEach((el) => intersectionObserver!.observe(el))
  }

  function onToastEditClick() {
    const map = cardMapRef.value
    const visibleCards = [...visibleSelectors.value]
      .map(sel => map.get(sel))
      .filter((c): c is CardData => !!c)
    editViewCards.value = visibleCards.length ? visibleCards : cards.value
    editViewOpen.value = true
  }

  function injectAmboxIcon(root: Element) {
    const ambox = root.querySelector('.ambox')
    if (!ambox || ambox.querySelector('.minerva-ambox-icon')) return
    const mboxText = ambox.querySelector('.mbox-text-span, .mbox-text-div')
    if (!mboxText) return
    const learnMore = document.createElement('span')
    learnMore.className = 'ambox-learn-more'
    learnMore.textContent = 'Learn more'
    mboxText.before(learnMore)
    const icon = document.createElement('div')
    icon.className = 'minerva-icon--issue-severity-medium-mediumColor minerva-ambox-icon'
    mboxText.before(icon)
  }

  function injectImproveTab() {
    const nav = containerRef.value?.querySelector('.article-header__tabs')
    if (!nav || nav.querySelector('.protowiki-improve-tab')) return

    nav.querySelectorAll('.article-header__tab').forEach(el => {
      el.addEventListener('click', () => { improveTabActive.value = false })
    })

    const tab = document.createElement('a')
    tab.href = '#'
    tab.className = 'article-header__tab protowiki-improve-tab'
    tab.textContent = 'Improve'
    tab.addEventListener('click', (e) => {
      e.preventDefault()
      improveTabActive.value = true
    })
    nav.appendChild(tab)
  }

  function tryActivate() {
    const root = containerRef.value?.querySelector('.mw-parser-output')
    if (!root || root.children.length === 0) return false

    injectAmboxIcon(root)

    const hasTarget = HATNOTE_INJECTIONS.some(({ selector }) => root.querySelector(selector))
    if (!hasTarget) return false

    const cardMap = buildCardMap(root)
    cardMapRef.value = cardMap
    cards.value = [...cardMap.values()]

    if (showSummary) injectSummaryAccordion(containerRef.value!, cards.value)
    if (showHatnotes) injectHatnotes(root, cardMap)
    if (showHatnoteToast) {
      // Only restart if the observed nodes themselves are stale (detached by v-html re-render)
      if (intersectionObserver && observedTargets[0]?.isConnected) return true
      intersectionObserver?.disconnect()
      visibleSelectors.value = new Set()
      startViewportObserver(root)
    }
    return true
  }

  onMounted(() => {
    {
      const bodyMatch = alanKaySnapshotHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      snapshotHtml.value = bodyMatch ? bodyMatch[1] : alanKaySnapshotHtml
    }

    if (!containerRef.value) return
    containerRef.value.addEventListener('click', onSectionEditCapture, true)
    tryActivate()
    if (showImprove) injectImproveTab()
    let activateDebounce: ReturnType<typeof setTimeout> | null = null
    observer = new MutationObserver(() => {
      if (activateDebounce) clearTimeout(activateDebounce)
      activateDebounce = setTimeout(() => {
        activateDebounce = null
        const activated = tryActivate()
        if (showImprove) injectImproveTab()
        if (activated && !showHatnoteToast) {
          observer?.disconnect()
          observer = null
        }
      }, 80)
    })
    observer.observe(containerRef.value, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('click', onSectionEditCapture, true)
    observer?.disconnect()
    intersectionObserver?.disconnect()
    summaryApp?.unmount()
    observer = null
    intersectionObserver = null
    summaryApp = null
    document.body.style.overflow = ''
  })

  function onArticleClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('[aria-label="Edit"]')) {
      editViewCards.value = cards.value
      editViewOpen.value = true
    }
  }

  watch(editViewOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  })

  const duplicateCount = computed(() => cards.value.filter(c => c.type === 'remove-duplicate').length)
  const citationCount = computed(() => cards.value.filter(c => c.type === 'add-citation').length)
  const aiCount = computed(() => cards.value.filter(c => c.type === 'ai-content').length)
</script>

<template>
  <ChromeWrapper>
    <template #mobile-actions-extra>
      <CdxButton weight="quiet" size="large" aria-label="User menu">
        <CdxIcon :icon="cdxIconUserAvatarOutline" />
      </CdxButton>
    </template>
    <div
      ref="containerRef"
      class="article-container"
      :class="{ 'protowiki-improve-active': showImprove && improveTabActive }"
      @click="onArticleClick"
    >
      <Article display-title="Alan Kay" :html="snapshotHtml" />
      <div v-if="showImprove && improveTabActive" class="protowiki-improve-content">
        <div class="protowiki-improve-banner">
          <p class="protowiki-improve-banner__title">Machine-generated</p>
          <p class="protowiki-improve-banner__body">
            This <a href="https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level_5">level-5 vital article</a> is <strong>C-class</strong> - useful to casual readers but not complete enough for detailed study. Adding citations and fixing accessibility issues could meet <a href="https://en.wikipedia.org/wiki/Wikipedia:Content_assessment#Grades">B-class standards</a>.
          </p>
        </div>
        <!-- Verifiability -->
        <div class="protowiki-improve-card">
          <h3 class="protowiki-improve-section-title">Verifiability</h3>
          <div class="protowiki-improve-card__rows">
            <div class="protowiki-improve-card__row">
              <div class="protowiki-improve-card__header">
                <span class="protowiki-improve-card__badge protowiki-improve-card__badge--error">{{ citationCount }}</span>
                <span class="protowiki-improve-card__title">Add a citation</span>
              </div>
              <p class="protowiki-improve-card__description">Help readers understand where this information is coming from by adding a citation.</p>
              <CdxButton action="progressive" weight="primary" @click="editViewCards = cards.filter(c => c.type === 'add-citation'); editViewOpen = true">Find references</CdxButton>
            </div>
          </div>
        </div>
        <!-- Accessibility -->
        <div class="protowiki-improve-card">
          <h3 class="protowiki-improve-section-title">Accessibility</h3>
          <div class="protowiki-improve-card__rows">
            <div class="protowiki-improve-card__row">
              <div class="protowiki-improve-card__header">
                <span class="protowiki-improve-card__badge protowiki-improve-card__badge--warning">4</span>
                <span class="protowiki-improve-card__title">Alt text</span>
              </div>
              <p class="protowiki-improve-card__description">Visually-impaired readers rely on alt text to understand what images show.</p>
              <CdxButton action="progressive" weight="primary">Add alt text</CdxButton>
            </div>
            <div class="protowiki-improve-card__row">
              <div class="protowiki-improve-card__header">
                <span class="protowiki-improve-card__badge protowiki-improve-card__badge--warning">3</span>
                <span class="protowiki-improve-card__title">Simplify complex sentences</span>
              </div>
              <p class="protowiki-improve-card__description">Some sentences may be difficult to read for people to read.</p>
              <CdxButton action="progressive" weight="primary">Revise tone</CdxButton>
            </div>
          </div>
        </div>
        <!-- Neutrality -->
        <div class="protowiki-improve-card">
          <h3 class="protowiki-improve-section-title">Neutrality</h3>
          <div class="protowiki-improve-card__rows">
            <div class="protowiki-improve-card__row">
              <div class="protowiki-improve-card__header">
                <span class="protowiki-improve-card__badge protowiki-improve-card__badge--success">{{ aiCount }}</span>
                <span class="protowiki-improve-card__title">Potential AI-generated content</span>
              </div>
              <p class="protowiki-improve-card__description">Help readers trust the article by removing any AI content or rewriting any inaccurate, unverifiable, or unencyclopedic information.</p>
              <CdxButton action="progressive" weight="primary" @click="editViewCards = cards.filter(c => c.type === 'ai-content'); editViewOpen = true">Review text</CdxButton>
            </div>
          </div>
        </div>
        <!-- Cleanup -->
        <div class="protowiki-improve-card">
          <h3 class="protowiki-improve-section-title">Cleanup</h3>
          <div class="protowiki-improve-card__rows">
            <div class="protowiki-improve-card__row">
              <div class="protowiki-improve-card__header">
                <span class="protowiki-improve-card__badge protowiki-improve-card__badge--success">{{ duplicateCount }}</span>
                <span class="protowiki-improve-card__title">Remove duplicate link</span>
              </div>
              <p class="protowiki-improve-card__description">Help readers navigate more easily by removing repeated links.</p>
              <CdxButton action="progressive" weight="primary" @click="editViewCards = cards.filter(c => c.type === 'remove-duplicate'); editViewOpen = true">Remove link</CdxButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ChromeWrapper>
  <Transition name="edit-view">
    <EditView v-if="editViewOpen" :cards="editViewCards" :show-publish="showPublish || showPublish2" :show-publish2="showPublish2" @close="editViewOpen = false" @published="onPublished" />
  </Transition>
  <Transition name="hatnote-toast">
    <div v-if="publishSuccess" class="protowiki-publish-success">
      <CdxMessage type="success" :icon="cdxIconCheck" :allow-user-dismiss="true" :auto-dismiss="30000" @user-dismissed="publishSuccess = false" @auto-dismissed="publishSuccess = false">
        Your edit was published
      </CdxMessage>
    </div>
  </Transition>
  <Transition name="hatnote-toast">
    <div v-if="showHatnoteToast && visibleCount > 0" class="protowiki-hatnote-toast">
      <CdxMessage type="progressive">
        <div class="protowiki-hatnote-toast__inner">
          <span><span class="protowiki-hatnote-toast__count">{{ visibleCount }}</span> edit suggestions in this section.</span>
          <CdxButton action="progressive" weight="primary" size="small" @click="onToastEditClick">Open</CdxButton>
        </div>
      </CdxMessage>
    </div>
  </Transition>
</template>

<style scoped>
  .article-container {
    padding: 0 var(--spacing-100);
  }

  .protowiki-improve-active :deep(.article-header__icon-toolbar) {
    display: none;
  }

  .protowiki-improve-active :deep(.article-content) {
    display: none;
  }

  .protowiki-improve-active :deep(.protowiki-summary) {
    display: none;
  }

  .protowiki-improve-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-100, 16px);
    padding-bottom: var(--spacing-200, 32px);
  }

  .protowiki-improve-banner {
    background-color: var(--background-color-warning-subtle, #fdf2d5);
    border: 1px solid var(--border-color-warning, #ab7f2a);
    border-radius: var(--border-radius-base, 2px);
    padding: var(--spacing-100, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-25, 4px);
  }

  .protowiki-improve-banner__title {
    margin: 0;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    color: var(--color-subtle);
    line-height: var(--line-height-small);
  }

  .protowiki-improve-banner__body {
    margin: 0;
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-normal);
    color: var(--color-base);
    line-height: var(--line-height-medium);
  }

  .protowiki-improve-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-50, 8px);
    padding: var(--spacing-75);
    background-color: var(--background-color-base, #fff);
    border: 1px solid var(--border-color-subtle, #c8ccd1);
    border-radius: var(--border-radius-base, 2px);
  }

  .protowiki-improve-section-title {
    margin: 0;
    font-size: var(--font-size-large, 18px);
    font-weight: var(--font-weight-bold);
    color: var(--color-base);
    line-height: var(--line-height-large, 28px);
  }

  .protowiki-improve-card__rows {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-100, 16px);
  }

  .protowiki-improve-card__row {
    display: flex;
    flex-direction: column;
  }

  .protowiki-improve-card__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-50, 8px);
    margin-bottom: var(--spacing-0, 0);
  }

  .protowiki-improve-card__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border-radius: var(--border-radius-circle, 9999px);
    background-color: var(--background-color-neutral, #eaecf0);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    color: var(--color-base);
    flex-shrink: 0;
  }

  .protowiki-improve-card__badge--error {
    background-color: var(--color-error, #f54739);
    color: var(--color-inverted, #fff);
  }

  .protowiki-improve-card__badge--warning {
    background-color: #edb537;
    color: var(--color-base, #202122);
  }

  .protowiki-improve-card__badge--success {
    background-color: var(--color-success, #099979);
    color: var(--color-inverted, #fff);
  }

  .protowiki-improve-card__title {
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-bold);
    color: var(--color-base);
    line-height: var(--line-height-small);
  }

  .protowiki-improve-card__description {
    margin: 0 0 var(--spacing-75, 12px);
    padding-left: var(--spacing-200);
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-normal);
    color: var(--color-subtle);
    line-height: var(--line-height-medium);
  }

  .protowiki-improve-card__row .cdx-button {
    margin-left: var(--spacing-200);
    align-self: flex-start;
  }

  :deep(.protowiki-improve-tab) {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-25, 4px);
    padding: var(--spacing-50, 8px) var(--spacing-12, 1px);
    margin: 0;
    color: var(--color-subtle);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-weight: 700;
  }

  :deep(.protowiki-improve-tab::before) {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url('https://upload.wikimedia.org/wikipedia/en/e/e6/Symbol_c_class.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
  }

  /* Deactivate Article/Talk tabs visually when Improve is active */
  .protowiki-improve-active :deep(.article-header__tab--active:not(.protowiki-improve-tab)) {
    color: var(--color-subtle);
    font-weight: 700;
    border-bottom-color: transparent;
  }

  /* Apply active styles to the injected Improve tab */
  .protowiki-improve-active :deep(.protowiki-improve-tab) {
    color: var(--color-subtle);
    font-weight: var(--font-weight-bold);
    border-bottom-color: var(--color-subtle);
  }

  :deep(.protowiki-summary),
  :deep(.protowiki-summary .cdx-accordion),
  :deep(.protowiki-summary .cdx-accordion__header__title),
  :deep(.protowiki-summary .cdx-accordion__header__description),
  :deep(.protowiki-summary .cdx-accordion__content) {
    font-family: var(--font-family-system-sans);
  }

  :deep(.protowiki-summary) {
    padding: 0;
  }

  :deep(.protowiki-summary__body) {
    display: flex;
    flex-direction: column;
  }

  :deep(.protowiki-summary__label) {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    color: var(--color-subtle);
    line-height: var(--line-height-small);
  }

  :deep(.protowiki-summary__text) {
    margin: 0 0 var(--spacing-75);
    line-height: var(--line-height-small);
  }

  :deep(.protowiki-summary__body > .cdx-button) {
    align-self: flex-start;
  }

  .edit-view-enter-active {
    transition: opacity 200ms ease-out;
  }

  .edit-view-leave-active {
    transition: opacity 150ms ease-out;
  }

  .edit-view-enter-from,
  .edit-view-leave-to {
    opacity: 0;
  }

  :deep(.protowiki-hatnote-group) {
    border: 1px solid var(--border-color-subtle, #c8ccd1);
    border-radius: 0!important;
    padding: 0 1px;
  }

  :deep(.protowiki-hatnote) {
    font-family: var(--font-family-system-sans);
    color: var(--color-base);
    cursor: pointer;
  }

  :deep(.protowiki-hatnote i) {
    color: var(--color-progressive);
  }

  :deep(sup.mw-ref > a) {
    text-decoration: none;
  }

  /* :deep(.protowiki-hatnote__bracket) {
    color: var(--color-base);
  } */

  :deep(.protowiki-hatnote__label) {
    color: var(--color-progressive);
    font-style: italic;
  }

  :deep(.protowiki-hatnote__action) {
    color: var(--color-progressive);
  }

  .protowiki-publish-success {
    position: fixed;
    bottom: var(--spacing-100, 16px);
    left: var(--spacing-100, 16px);
    right: var(--spacing-100, 16px);
    z-index: 300;
  }

  .protowiki-hatnote-toast {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: var(--spacing-150, 24px);
  }

  .protowiki-hatnote-toast__count {
    font-variant-numeric: tabular-nums;
  }

  .protowiki-hatnote-toast__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-75);
    font-size: var(--font-size-small);
  }

  :deep(.cdx-message--progressive) {
    background-color: var(--background-color-progressive);
    border-color: var(--border-color-progressive);
    color: #fff;
  }

  .protowiki-hatnote-toast :deep(.cdx-message__icon--vue) {
    display: none;
  }

  .protowiki-hatnote-toast :deep(.cdx-message__content) {
    margin-left: 0;
  }

  .hatnote-toast-enter-active {
    transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .hatnote-toast-leave-active {
    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .hatnote-toast-enter-from,
  .hatnote-toast-leave-to {
    transform: translateY(100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .hatnote-toast-enter-active,
    .hatnote-toast-leave-active {
      transition: opacity 200ms ease;
      transform: none;
    }

    .hatnote-toast-enter-from,
    .hatnote-toast-leave-to {
      opacity: 0;
    }
  }
</style>
