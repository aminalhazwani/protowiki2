import { computed, ref } from 'vue'

const allSteps = ['email', 'username', 'password'] as const
export type Step = (typeof allSteps)[number]

export function useMultiStep() {
  const currentStepIndex = ref(0)
  const direction = ref<'forward' | 'backward'>('forward')

  const currentStep = computed(() => allSteps[currentStepIndex.value])
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === allSteps.length - 1)

  function goNext() {
    if (!isLastStep.value) {
      direction.value = 'forward'
      currentStepIndex.value++
    }
  }

  function goBack() {
    if (!isFirstStep.value) {
      direction.value = 'backward'
      currentStepIndex.value--
    }
  }

  function reset() {
    currentStepIndex.value = 0
    direction.value = 'forward'
  }

  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    direction,
    goNext,
    goBack,
    reset,
  }
}
