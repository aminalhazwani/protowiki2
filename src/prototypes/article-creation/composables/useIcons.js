import { computed } from 'vue'
import {
  cdxIconAdd,
  cdxIconAlert,
  cdxIconBook,
  cdxIconCheckAll,
  cdxIconClose,
  cdxIconCollapse,
  cdxIconEdit,
  cdxIconExpand,
  cdxIconFunnel,
  cdxIconLink,
  cdxIconListBullet,
  cdxIconLogoWikidata,
  cdxIconNext,
  cdxIconQuotes,
  cdxIconReference,
  cdxIconRobot,
  cdxIconSettings,
  cdxIconTextStyle,
  cdxIconUndo,
} from '@wikimedia/codex-icons'
import { useEditorSettings } from './useEditorSettings'
import customIcons from '../config/iconMap'

const codexIcons = {
  cdxIconAdd,
  cdxIconAlert,
  cdxIconBook,
  cdxIconCheckAll,
  cdxIconClose,
  cdxIconCollapse,
  cdxIconEdit,
  cdxIconExpand,
  cdxIconFunnel,
  cdxIconLink,
  cdxIconListBullet,
  cdxIconLogoWikidata,
  cdxIconNext,
  cdxIconQuotes,
  cdxIconReference,
  cdxIconRobot,
  cdxIconSettings,
  cdxIconTextStyle,
  cdxIconUndo,
}

/**
 * Composable that returns the active icon set based on the icons.set setting.
 * When 'custom', returns custom SVG path data; falls back to Codex for unmapped icons.
 */
export function useIcons() {
  const { settings } = useEditorSettings()

  const icons = computed(() => {
    if (settings.value.icons.set === 'custom') {
      const merged = {}
      for (const key of Object.keys(codexIcons)) {
        merged[key] = customIcons[key] ?? codexIcons[key]
      }
      return merged
    }
    return codexIcons
  })

  return icons
}
