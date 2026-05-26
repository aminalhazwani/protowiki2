<template>
  <CdxDialog
    v-model:open="dialogOpen"
    title="Create your Wikipedia account"
    :use-close-button="true"
    class="create-account-dialog"
  >
    <form @submit.prevent="onFormSubmit" novalidate>
      <Transition :name="transitionName" mode="out-in" @after-enter="() => focusCurrentField()">
        <div :key="currentStep" class="step-content">

          <!-- Step 1: Email -->
          <div v-if="currentStep === 'email'" class="field-wrapper">
            <CdxField
              :status="validation.email.status"
              :messages="{}"
            >
              <template #label>Email address</template>
              <CdxTextInput
                ref="emailInputRef"
                v-model="form.email"
                input-type="email"
                placeholder="Enter your email address"
                @blur="validate('email', { onBlur: true })"
              />
            </CdxField>
            <div
              class="validation-area"
              :class="{ active: !!validationMessage('email') }"
            >
              <Transition name="slide-down">
                <div v-if="validationMessage('email')" class="validation-message">
                  <CdxMessage :type="validationMessage('email')!.type" :inline="true">
                    {{ validationMessage('email')!.text }}
                  </CdxMessage>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Step 2: Username -->
          <div v-else-if="currentStep === 'username'" class="field-wrapper">
            <CdxField
              :status="usernameFieldStatus"
              :messages="{}"
            >
              <template #label>Username</template>
              <template #description>
                <a href="#" class="public-link" @click.prevent="showPolicy = true"
                  >Choose carefully</a
                >
                — it's how the community will know you.
              </template>
              <CdxTextInput
                ref="usernameInputRef"
                v-model="form.username"
                input-type="text"
                placeholder="Enter your username"
                @input="onUsernameInput"
                @blur="onUsernameBlur"
              />
            </CdxField>
            <div
              class="validation-area"
              :class="{ active: usernameCheckState === 'checking' || !!usernameMessage }"
            >
              <Transition name="slide-down">
                <div v-show="usernameCheckState === 'checking'" class="validation-message">
                  <CdxProgressIndicator :show-label="true">
                    Checking availability
                  </CdxProgressIndicator>
                </div>
              </Transition>
              <Transition name="slide-down">
                <div v-show="!!usernameMessage" class="validation-message">
                  <CdxMessage v-if="usernameMessage" :type="usernameMessage.type" :inline="true">
                    {{ usernameMessage.text }}
                  </CdxMessage>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Step 3: Password + Confirm password -->
          <div v-else-if="currentStep === 'password'" class="field-wrapper">
            <CdxField
              :status="validation.password.status"
              :messages="{}"
            >
              <template #label>Password</template>
              <div
                :class="{ 'password-visible': passwordVisible }"
                @click="onPasswordToggleClick($event, 'password')"
                @keydown="onPasswordToggleKeydown($event, 'password')"
              >
                <CdxTextInput
                  ref="passwordInputRef"
                  v-model="form.password"
                  :input-type="passwordInputType"
                  :end-icon="passwordEndIcon"
                  placeholder="Enter a password"
                  @blur="validate('password', { onBlur: true })"
                />
              </div>
            </CdxField>
            <div
              class="validation-area"
              :class="{ active: !!validationMessage('password') }"
            >
              <Transition name="slide-down">
                <div v-if="validationMessage('password')" class="validation-message">
                  <CdxMessage :type="validationMessage('password')!.type" :inline="true">
                    {{ validationMessage('password')!.text }}
                  </CdxMessage>
                </div>
              </Transition>
            </div>

            <CdxField
              :status="validation.confirmPassword.status"
              :messages="{}"
            >
              <template #label>Confirm password</template>
              <div
                :class="{ 'password-visible': confirmPasswordVisible }"
                @click="onPasswordToggleClick($event, 'confirmPassword')"
                @keydown="onPasswordToggleKeydown($event, 'confirmPassword')"
              >
                <CdxTextInput
                  ref="confirmPasswordInputRef"
                  v-model="form.confirmPassword"
                  :input-type="confirmPasswordInputType"
                  :end-icon="confirmPasswordEndIcon"
                  placeholder="Enter password again"
                  @blur="validate('confirmPassword', { onBlur: true })"
                />
              </div>
            </CdxField>
            <div
              class="validation-area"
              :class="{ active: !!validationMessage('confirmPassword') }"
            >
              <Transition name="slide-down">
                <div v-if="validationMessage('confirmPassword')" class="validation-message">
                  <CdxMessage :type="validationMessage('confirmPassword')!.type" :inline="true">
                    {{ validationMessage('confirmPassword')!.text }}
                  </CdxMessage>
                </div>
              </Transition>
            </div>
          </div>

        </div>
      </Transition>

      <Transition name="fade-step" mode="out-in">
      <div :key="currentStep" class="form-actions">
        <div class="step-navigation" :class="{ 'full-width-nav': fullWidthNextButton }">
          <CdxButton
            v-if="!isFirstStep && !fullWidthNextButton"
            weight="quiet"
            size="large"
            type="button"
            class="nav-button"
            aria-label="Back"
            @click="handleBack"
          >
            <CdxIcon :icon="cdxIconPrevious" />
          </CdxButton>
          <span v-else-if="!fullWidthNextButton" />

          <CdxButton
            v-if="!isLastStep"
            action="progressive"
            weight="primary"
            size="large"
            type="button"
            class="nav-button"
            @click="handleContinue"
          >
            Next
          </CdxButton>
          <CdxButton
            v-else
            action="progressive"
            weight="primary"
            size="large"
            type="submit"
            class="nav-button"
          >
            Create your account
          </CdxButton>
        </div>
      </div>
      </Transition>

      <template v-if="currentStep === 'email'">
        <div class="register-or-divider"><span>or</span></div>
        <CdxButton
          weight="quiet"
          size="large"
          type="button"
          class="register-without-email-btn"
          @click="goToRegisterWithoutEmail"
        >
          Register without email
        </CdxButton>
      </template>
    </form>

    <UsernamePolicy :visible="showPolicy" @close="showPolicy = false" />
  </CdxDialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watchEffect, watch, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  CdxDialog,
  CdxField,
  CdxTextInput,
  CdxButton,
  CdxIcon,
  CdxMessage,
  CdxProgressIndicator,
} from '@wikimedia/codex'
import { cdxIconEye, cdxIconPrevious } from '@wikimedia/codex-icons'
import UsernamePolicy from './UsernamePolicy.vue'
import { useFormValidation } from '../composables/useFormValidation'
import { useMultiStep } from '../composables/useMultiStep'
import { useAdminSettings } from '../composables/useAdminSettings'

const dialogOpen = defineModel<boolean>('open', { default: false })

const showPolicy = ref(false)

const toggleAdmin = inject<() => void>('toggleAdmin')
const router = useRouter()

const { settings } = useAdminSettings()

const fullWidthNextButton = computed(() => settings.value.general.fullWidthNextButton)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
})

const { validation, validate, validateAll, resetValidation } = useFormValidation(form, settings)

const {
  currentStep,
  isFirstStep,
  isLastStep,
  direction,
  goNext,
  goBack,
  reset: resetSteps,
} = useMultiStep()

const transitionName = computed(() =>
  direction.value === 'forward' ? 'slide-left' : 'slide-right',
)

// Validation message helper
function validationMessage(field: 'email' | 'password' | 'confirmPassword' | 'username') {
  const v = validation[field]
  if (v.messages.error) return { type: 'error' as const, text: v.messages.error }
  if (v.messages.warning) return { type: 'warning' as const, text: v.messages.warning }
  return null
}

// Username auto-capitalize
function applyAutoCapitalize({ force = false } = {}) {
  if (!settings.value.fields.username.behaviors.autoCapitalize) return
  if (!force && form.username.length < 2) return
  let value = form.username
  value = value.replace(/^_+/, '')
  value = value.replace(/_(.)/g, '\u00A0$1')
  if (force) value = value.replace(/_+$/, '')
  value = value.charAt(0).toUpperCase() + value.slice(1)
  if (value !== form.username) form.username = value
}

// Password toggle state
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const passwordInputRef = ref<InstanceType<typeof CdxTextInput> | null>(null)
const confirmPasswordInputRef = ref<InstanceType<typeof CdxTextInput> | null>(null)
const usernameInputRef = ref<InstanceType<typeof CdxTextInput> | null>(null)
const emailInputRef = ref<InstanceType<typeof CdxTextInput> | null>(null)

const passwordInputType = computed(() => (passwordVisible.value ? 'text' : 'password'))
const confirmPasswordInputType = computed(() =>
  confirmPasswordVisible.value ? 'text' : 'password',
)

const passwordEndIcon = computed(() =>
  settings.value.fields.password.behaviors.showToggle ? cdxIconEye : undefined,
)
const confirmPasswordEndIcon = computed(() =>
  settings.value.fields.confirmPassword.behaviors.showToggle ? cdxIconEye : undefined,
)

function onPasswordToggleClick(event: MouseEvent, field: 'password' | 'confirmPassword') {
  if ((event.target as HTMLElement).closest('.cdx-text-input__end-icon')) {
    if (field === 'password') {
      passwordVisible.value = !passwordVisible.value
    } else {
      confirmPasswordVisible.value = !confirmPasswordVisible.value
    }
  }
}

function onPasswordToggleKeydown(event: KeyboardEvent, field: 'password' | 'confirmPassword') {
  if (
    (event.key === 'Enter' || event.key === ' ') &&
    (event.target as HTMLElement).closest('.cdx-text-input__end-icon')
  ) {
    event.preventDefault()
    onPasswordToggleClick(event as unknown as MouseEvent, field)
  }
}

// Accessibility attributes on end-icon elements
watchEffect(() => {
  const setA11y = (
    elRef: typeof passwordInputRef,
    isVisible: boolean,
  ) => {
    if (!elRef.value?.$el) return
    const endIcon = elRef.value.$el.querySelector('.cdx-text-input__end-icon')
    if (endIcon) {
      endIcon.setAttribute('role', 'button')
      endIcon.setAttribute('tabindex', '0')
      endIcon.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password')
    }
  }

  nextTick(() => {
    if (settings.value.fields.password.behaviors.showToggle) {
      setA11y(passwordInputRef, passwordVisible.value)
    }
    if (settings.value.fields.confirmPassword.behaviors.showToggle) {
      setA11y(confirmPasswordInputRef, confirmPasswordVisible.value)
    }
  })
})

// Username availability check state machine
const usernameCheckState = ref<'idle' | 'checking' | 'available'>('idle')
let usernameDebounceTimer: ReturnType<typeof setTimeout> | null = null
let usernameShowSpinnerTimer: ReturnType<typeof setTimeout> | null = null

const usernameFieldStatus = computed(() => {
  if (usernameCheckState.value === 'available') return 'success'
  if (usernameCheckState.value === 'checking') return 'default'
  return validation.username.status
})

const usernameMessage = computed(() => {
  if (usernameCheckState.value === 'available')
    return { type: 'success' as const, text: 'Username available' }
  if (validation.username.messages.error)
    return { type: 'error' as const, text: validation.username.messages.error }
  if (validation.username.messages.warning)
    return { type: 'warning' as const, text: validation.username.messages.warning }
  return null
})

function onUsernameInput() {
  applyAutoCapitalize()

  if (!settings.value.fields.username.behaviors.validateWhileTyping) return

  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)
  if (usernameShowSpinnerTimer) clearTimeout(usernameShowSpinnerTimer)

  if (!form.username.trim()) {
    usernameCheckState.value = 'idle'
    validation.username = { status: 'default', messages: {} }
    return
  }

  validation.username = { status: 'default', messages: {} }

  usernameShowSpinnerTimer = setTimeout(() => {
    usernameCheckState.value = 'checking'
  }, 250)

  usernameDebounceTimer = setTimeout(() => {
    runUsernameValidation()
  }, 2000)
}

function onUsernameBlur() {
  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)
  if (usernameShowSpinnerTimer) clearTimeout(usernameShowSpinnerTimer)

  if (settings.value.fields.username.behaviors.validateWhileTyping && form.username.trim()) {
    runUsernameValidation()
  } else {
    usernameCheckState.value = 'idle'
    validate('username', { onBlur: true })
  }

  applyAutoCapitalize({ force: true })
}

function runUsernameValidation() {
  validate('username')
  if (validation.username.status === 'default') {
    usernameCheckState.value = 'available'
  } else {
    usernameCheckState.value = 'idle'
  }
}

function clearUsernameTimers() {
  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)
  if (usernameShowSpinnerTimer) clearTimeout(usernameShowSpinnerTimer)
  usernameCheckState.value = 'idle'
}

// Focus the first input in the current step.
// Called via @after-enter on the step Transition (navigation case) and
// directly with immediate=true when the dialog first opens.
// Queries the dialog DOM directly since CdxDialog teleports content
// outside the component tree, making Vue refs unreliable.
function focusCurrentField({ immediate = false } = {}) {
  const run = () => {
    const dialog = document.querySelector('[role="dialog"]')
    const input = dialog?.querySelector<HTMLInputElement>('.step-content input')
    input?.focus()
  }
  if (immediate) {
    setTimeout(run, 0)
  } else {
    run()
  }
}

function goToRegisterWithoutEmail() {
  dialogOpen.value = false
  router.push('/account-creation-v3/register')
}

// Step navigation
function handleContinue() {
  const step = currentStep.value

  if (step === 'username') clearUsernameTimers()

  if (step === 'email') {
    if (!form.email.trim()) {
      validation.email = { status: 'error', messages: { error: 'Please enter an email address.' } }
      return
    }
    if (!validate('email', { forSubmit: true })) return
  } else if (step === 'username') {
    if (!validate('username', { forSubmit: true })) return
  }

  goNext()
  // focus is handled by @after-enter on the Transition
}

function handleBack() {
  goBack()
  // focus is handled by @after-enter on the Transition
}

function handleSubmit() {
  usernameCheckState.value = 'idle'

  // Validate current step fields
  const passwordValid = validate('password', { forSubmit: true })
  const confirmValid = validate('confirmPassword', { forSubmit: true })
  if (!passwordValid || !confirmValid) return

  if (validateAll()) {
    alert('Account created successfully! (prototype)')
    dialogOpen.value = false
  }
}

function onFormSubmit() {
  if (!isLastStep.value) {
    handleContinue()
  } else {
    handleSubmit()
  }
}

// Focus on open; reset form on close; wire title click to open admin panel
let titleClickCleanup: (() => void) | null = null

watch(dialogOpen, (open) => {
  if (open) {
    focusCurrentField({ immediate: true })
    nextTick(() => {
      const title = document.querySelector<HTMLElement>(
        '.create-account-dialog .cdx-dialog__header__title',
      )
      if (title && toggleAdmin) {
        title.addEventListener('click', toggleAdmin)
        titleClickCleanup = () => title.removeEventListener('click', toggleAdmin!)
      }
    })
    return
  }
  titleClickCleanup?.()
  titleClickCleanup = null
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.email = ''
  passwordVisible.value = false
  confirmPasswordVisible.value = false
  showPolicy.value = false
  resetValidation()
  resetSteps()
  clearUsernameTimers()
})
</script>

<!-- Non-scoped styles for CdxDialog (teleported content loses scoped attributes) -->
<style>
.create-account-dialog .cdx-dialog__header__title {
  cursor: pointer;
}

.create-account-dialog .step-content {
  overflow: hidden;
}

.create-account-dialog .field-wrapper {
  display: flex;
  flex-direction: column;
}

.create-account-dialog .field-wrapper .cdx-field {
  margin-bottom: 0;
}

.create-account-dialog .form-actions {
  margin-top: var(--spacing-125);
}

.create-account-dialog .step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-account-dialog .nav-button {
  transition: transform 160ms ease-out;
}

.create-account-dialog .nav-button:active {
  transform: scale(0.97);
}

.create-account-dialog .step-navigation.full-width-nav {
  justify-content: stretch;
}

.create-account-dialog .step-navigation.full-width-nav .nav-button {
  width: 100%;
}

.create-account-dialog .public-link {
  font-weight: var(--font-weight-bold);
}

/* Password toggle styling */
.create-account-dialog .cdx-text-input__end-icon {
  cursor: pointer;
}

.create-account-dialog .password-visible .cdx-text-input__end-icon {
  color: var(--color-base) !important;
}

.create-account-dialog .cdx-field__help-text:empty {
  display: none;
}

.create-account-dialog .register-or-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-75);
  margin-top: var(--spacing-150);
  color: var(--color-subtle);
}

.create-account-dialog .register-or-divider::before,
.create-account-dialog .register-or-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-color-subtle);
}

.create-account-dialog .register-without-email-btn {
  width: 100%;
  margin-top: var(--spacing-50);
}

/* Validation area — grid stacking with animated max-height */
.create-account-dialog .validation-area {
  display: grid;
  overflow: hidden;
  max-height: 0;
  transition: max-height 200ms ease-out;
}

.create-account-dialog .validation-area.active {
  max-height: calc(var(--spacing-25) + var(--line-height-medium));
}

.create-account-dialog .validation-area > * {
  grid-area: 1 / 1;
}

.create-account-dialog .validation-message {
  margin-top: var(--spacing-25);
  height: var(--line-height-medium);
}

.create-account-dialog .validation-message .cdx-label__label__text {
  line-height: var(--line-height-medium);
}

/* Button fade on step change */
.create-account-dialog .fade-step-enter-active {
  transition: opacity 400ms ease-out;
  transition-delay: 500ms;
}

.create-account-dialog .fade-step-leave-active {
  transition: opacity 200ms ease-out;
  will-change: opacity;
}

.create-account-dialog .fade-step-enter-from,
.create-account-dialog .fade-step-leave-to {
  opacity: 0;
}

/* Slide-down validation animation */
.create-account-dialog .slide-down-enter-active {
  transition: opacity 200ms ease-out,
              transform 200ms ease-out;
}
.create-account-dialog .slide-down-leave-active {
  transition: opacity 100ms ease-out, transform 300ms ease-out;
}
.create-account-dialog .slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.create-account-dialog .slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.create-account-dialog .slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Step transition animations */
.create-account-dialog .slide-left-enter-active {
  transition: transform 400ms cubic-bezier(0.77, 0, 0.175, 1),
              opacity 400ms cubic-bezier(0.77, 0, 0.175, 1);
}
.create-account-dialog .slide-left-leave-active {
  transition: transform 400ms cubic-bezier(0.77, 0, 0.175, 1),
              opacity 400ms cubic-bezier(0.77, 0, 0.175, 1);
}
.create-account-dialog .slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.create-account-dialog .slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.create-account-dialog .slide-right-enter-active {
  transition: transform 300ms cubic-bezier(0.77, 0, 0.175, 1),
              opacity 300ms cubic-bezier(0.77, 0, 0.175, 1);
}
.create-account-dialog .slide-right-leave-active {
  transition: transform 300ms cubic-bezier(0.77, 0, 0.175, 1),
              opacity 300ms cubic-bezier(0.77, 0, 0.175, 1);
}
.create-account-dialog .slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.create-account-dialog .slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
