import { ref } from 'vue'
import { articleSections } from '../config/articleSections.js'

const accordionStates = ref(
  Object.fromEntries(articleSections.map((section, index) => [section.title, index === 0])),
)

export function useAccordionState() {
  function updateAccordionState(section, newValue) {
    const isEmpty = !section.paragraphs || section.paragraphs.length === 0
    if (isEmpty && newValue) return
    accordionStates.value[section.title] = newValue
  }

  return { accordionStates, updateAccordionState }
}
