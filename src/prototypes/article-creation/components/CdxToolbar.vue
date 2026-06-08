<template>
  <div class="cdx-toolbar">
    <div class="cdx-toolbar__lhs">
      <CdxButton class="cdx-toolbar__btn cdx-toolbar__btn--close" weight="quiet" aria-label="Close">
        <CdxIcon :icon="icons.cdxIconClose" />
      </CdxButton>
    </div>
    <div class="cdx-toolbar__ctr">
      <CdxButton
        class="cdx-toolbar__btn"
        weight="quiet"
        aria-label="Undo"
        :disabled="!hasContent"
        @click="getEditor()?.chain().focus().undo().run()"
      >
        <CdxIcon :icon="icons.cdxIconUndo" />
      </CdxButton>
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--dropdown"
        weight="quiet"
        aria-label="Style text"
      >
        <CdxIcon :icon="icons.cdxIconTextStyle" />
        <CdxIcon :icon="icons.cdxIconExpand" class="cdx-toolbar__indicator" />
      </CdxButton>
      <CdxButton class="cdx-toolbar__btn" weight="quiet" aria-label="Cite" @click="emit('cite')">
        <span class="cite-icon-wrapper">
          <CdxIcon :icon="icons.cdxIconQuotes" />
          <span v-if="citeBadgeCount > 0" class="cite-badge">{{ citeBadgeCount }}</span>
        </span>
      </CdxButton>
      <CdxButton class="cdx-toolbar__btn" weight="quiet" aria-label="Link">
        <CdxIcon :icon="icons.cdxIconLink" />
      </CdxButton>
      <!-- <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--dropdown"
        weight="quiet"
        aria-label="Insert"
      >
        <CdxIcon :icon="icons.cdxIconAdd" />
        <CdxIcon :icon="icons.cdxIconExpand" class="cdx-toolbar__indicator" />
      </CdxButton> -->
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--dropdown"
        weight="quiet"
        aria-label="Switch editor"
      >
        <CdxIcon :icon="icons.cdxIconEdit" />
        <CdxIcon :icon="icons.cdxIconExpand" class="cdx-toolbar__indicator" />
      </CdxButton>
    </div>
    <div class="cdx-toolbar__rhs">
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--publish"
        action="progressive"
        weight="primary"
        aria-label="Publish"
        :disabled="!hasContent"
      >
        <CdxIcon :icon="icons.cdxIconNext" />
      </CdxButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  citeBadgeCount: { type: Number, default: 0 },
})
const emit = defineEmits(['cite'])
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { useEditorInstance } from '../composables/useEditorInstance'

const { hasContent, getEditor } = useEditorInstance()
import { useIcons } from '../composables/useIcons'

const icons = useIcons()
</script>

<style scoped>
.cdx-toolbar {
  position: fixed;
  z-index: 3;
  display: flex;
  height: 48px;
  background-color: var(--background-color-base, #fff);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border-bottom: var(--border-subtle);
  width: 100%;
}

.cdx-toolbar__lhs {
  flex: 0 0 44px;
  display: flex;
}

.cdx-toolbar__ctr {
  flex: 1;
  display: flex;
  min-width: 0;
  overflow: clip;
}

.cdx-toolbar__rhs {
  flex: 0 0 44px;
  display: flex;
  overflow: clip;
}

/* Base button overrides */
.cdx-toolbar__btn {
  flex: 1 0 0;
  height: 100%;
  border-radius: 0;
  padding: 0;
}

.cdx-toolbar__btn:focus {
  border-color: transparent !important;
  box-shadow: none !important;
}

.cdx-toolbar__btn--close {
  border-right: 1px solid var(--border-color-subtle) !important;
}

.cdx-toolbar__btn--dropdown {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.cdx-toolbar__btn--publish {
  flex: 0 0 44px;
  width: 44px;
  height: 100%;
}

.cite-icon-wrapper {
  position: relative;
  display: inline-flex;
}

.cite-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  min-width: 12px;
  min-height: 12px;
  padding: 1px 2px;
  background-color: var(--background-color-progressive, #36c);
  border: 1px solid var(--border-color-inverted, #fff);
  border-radius: var(--border-radius-base, 2px);
  color: var(--color-inverted, #fff);
  font-size: var(--font-size-x-small, 12px);
  font-weight: var(--font-weight-bold, 700);
  line-height: 12px;
  text-align: center;
}

.cdx-toolbar__indicator {
  min-width: 10px;
  min-height: 10px;
  height: 10px;
  width: 10px;
}
</style>
