<template>
  <form @submit.prevent="onFormSubmit" novalidate :class="inputHeightClass">
    <Transition :name="transitionName" mode="out-in">
      <div :key="isMultiStep ? currentField : 'all'" class="step-content">
        <div v-if="isFieldActive('username')" class="username-field-wrapper">
          <CdxField :status="usernameFieldStatus" :messages="{}">
            <template #label>Username</template>
            <template #description>
              <template v-if="settings.fields.username.behaviors.learnMoreLink">
                Your username is public and cannot be made private later.
                <a
                  href="https://en.wikipedia.org/wiki/Wikipedia:Username_policy"
                  rel="noopener"
                  class="learn-more-link"
                  >Learn more</a
                >
              </template>
              <template v-else-if="settings.fields.username.behaviors.chooseCarefullyCopy">
                <a href="#" class="public-link" @click.prevent="showPolicy = true"
                  >Choose carefully</a
                >
                — it's how the community will know you.
              </template>
              <template v-else-if="settings.fields.username.behaviors.thingsToKnowCopy">
                There are some
                <a href="#" class="public-link" @click.prevent="showPolicy = true">things to know</a
                >.
              </template>
              <template v-else>
                Your username is
                <a href="#" class="public-link" @click.prevent="showPolicy = true">public</a>.
              </template>
            </template>
            <CdxTextInput
              ref="usernameInputRef"
              v-model="form.username"
              input-type="text"
              placeholder="Enter your username"
              :autofocus="settings.fields.username.behaviors.autoFocus || undefined"
              @input="onUsernameInput"
              @blur="onUsernameBlur"
            />
          </CdxField>
          <div
            class="username-validation-area"
            :class="{ active: usernameCheckState === 'checking' || !!usernameMessage }"
          >
            <Transition name="slide-down">
              <div v-show="usernameCheckState === 'checking'" class="username-check-progress">
                <CdxProgressIndicator :show-label="true">
                  Checking availability
                </CdxProgressIndicator>
              </div>
            </Transition>
            <Transition name="slide-down">
              <div v-show="!!usernameMessage" class="username-check-progress">
                <CdxMessage v-if="usernameMessage" :type="usernameMessage.type" :inline="true">
                  {{ usernameMessage.text }}
                </CdxMessage>
              </div>
            </Transition>
          </div>
        </div>

        <CdxField
          v-if="isFieldActive('password')"
          :status="emailPasswordInstead ? 'default' : validation.password.status"
          :messages="emailPasswordInstead ? {} : validation.password.messages"
        >
          <template #label>Password</template>
          <template v-if="!emailPasswordInstead && !settings.fields.password.behaviors.hideHelperText" #help-text>
            It is recommended to use a unique password that you are not using on any other website.
          </template>
          <CdxCheckbox
            v-if="settings.fields.password.behaviors.emailPassword"
            v-model="emailPasswordInstead"
          >
            Email me a password instead
          </CdxCheckbox>
          <div
            v-if="!emailPasswordInstead"
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

        <CdxField
          v-if="isFieldActive('confirmPassword') && !emailPasswordInstead"
          :status="validation.confirmPassword.status"
          :messages="validation.confirmPassword.messages"
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

        <CdxField
          v-if="isFieldActive('email')"
          :optional="!emailPasswordInstead && !settings.fields.email.behaviors.hideOptionalFlag"
          :status="validation.email.status"
          :messages="validation.email.messages"
        >
          <template #label>Email address</template>
          <template v-if="!emailPasswordInstead && !settings.fields.email.behaviors.hideDescription" #description>
            Email is required to recover your account if you lose your password or log in from a
            unfamiliar location or new browser.
          </template>
          <CdxTextInput
            ref="emailInputRef"
            v-model="form.email"
            input-type="email"
            placeholder="Enter your email address"
            @blur="validate('email', { onBlur: true })"
          />
        </CdxField>
      </div>
    </Transition>

    <HCaptchaDisclaimer
      v-if="(!isMultiStep || isLastStep) && settings.hcaptcha.position === 'above'"
    />

    <div
      class="form-actions"
      :class="{
        'hcaptcha-above': (!isMultiStep || isLastStep) && settings.hcaptcha.position === 'above',
      }"
    >
      <template v-if="isMultiStep">
        <div class="step-navigation">
          <CdxButton
            v-if="!isFirstStep"
            weight="quiet"
            size="large"
            type="button"
            @click="handleBack"
          >
            <CdxIcon :icon="cdxIconPrevious" />
          </CdxButton>
          <span v-else />

          <CdxButton
            v-if="!isLastStep"
            action="progressive"
            weight="primary"
            size="large"
            type="button"
            @click="handleContinue"
          >
            Continue
          </CdxButton>
          <CdxButton v-else action="progressive" weight="primary" size="large" type="submit">
            Create your account
          </CdxButton>
        </div>
      </template>
      <template v-else>
        <CdxButton action="progressive" weight="primary" size="large">
          Create your account
        </CdxButton>
      </template>
    </div>

    <HCaptchaDisclaimer
      v-if="(!isMultiStep || isLastStep) && settings.hcaptcha.position === 'below'"
    />
  </form>

  <UsernamePolicy :visible="showPolicy" @close="showPolicy = false" />
</template>

<script setup>
import { reactive, ref, computed, watchEffect, watch, nextTick } from 'vue'
import {
  CdxField,
  CdxTextInput,
  CdxButton,
  CdxIcon,
  CdxMessage,
  CdxProgressIndicator,
  CdxCheckbox,
} from '@wikimedia/codex'
import { cdxIconEye, cdxIconPrevious } from '@wikimedia/codex-icons'
import HCaptchaDisclaimer from './HCaptchaDisclaimer.vue'
import UsernamePolicy from './UsernamePolicy.vue'
import { useFormValidation } from '../composables/useFormValidation'
import { useAdminSettings } from '../composables/useAdminSettings'
import { useMultiStep } from '../composables/useMultiStep'

const showPolicy = ref(false)
const { settings } = useAdminSettings()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
})

const inputHeightClass = computed(() => {
  const size = settings.value.inputHeight.size
  return size !== '32' ? `input-height-${size}` : ''
})

const emailPasswordInstead = ref(false)
const { validation, validate, validateAll } = useFormValidation(form, { emailPasswordInstead })

// Multi-step form
const {
  isMultiStep,
  currentField,
  isFirstStep,
  isLastStep,
  direction,
  goNext,
  goBack,
  reset: resetSteps,
} = useMultiStep(settings, { emailPasswordInstead })

const transitionName = computed(() =>
  direction.value === 'forward' ? 'slide-left' : 'slide-right',
)

function isFieldActive(fieldName) {
  if (!settings.value.fields[fieldName]?.visible) return false
  if (!isMultiStep.value) return true
  return currentField.value === fieldName
}

function applyAutoCapitalize({ force = false } = {}) {
  if (!settings.value.fields.username.behaviors.autoCapitalize) return
  if (!force && form.username.length < 2) return
  let value = form.username
  // Strip leading underscores (remove, don't replace with space)
  value = value.replace(/^_+/, '')
  // Replace underscore followed by a character with NBSP + that character
  value = value.replace(/_(.)/g, '\u00A0$1')
  // On blur, strip trailing underscores
  if (force) value = value.replace(/_+$/, '')
  // Capitalize first letter
  value = value.charAt(0).toUpperCase() + value.slice(1)
  if (value !== form.username) form.username = value
}

// Show/hide password toggle state
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const passwordInputRef = ref(null)
const confirmPasswordInputRef = ref(null)
const usernameInputRef = ref(null)
const emailInputRef = ref(null)

const passwordInputType = computed(() => (passwordVisible.value ? 'text' : 'password'))
const confirmPasswordInputType = computed(() =>
  confirmPasswordVisible.value ? 'text' : 'password',
)

const passwordEndIcon = computed(() => {
  if (!settings.value.fields.password.behaviors.showToggle) return undefined
  return cdxIconEye
})
const confirmPasswordEndIcon = computed(() => {
  if (!settings.value.fields.confirmPassword.behaviors.showToggle) return undefined
  return cdxIconEye
})

function onPasswordToggleClick(event, field) {
  if (event.target.closest('.cdx-text-input__end-icon')) {
    if (field === 'password') {
      passwordVisible.value = !passwordVisible.value
    } else {
      confirmPasswordVisible.value = !confirmPasswordVisible.value
    }
  }
}

function onPasswordToggleKeydown(event, field) {
  if (
    (event.key === 'Enter' || event.key === ' ') &&
    event.target.closest('.cdx-text-input__end-icon')
  ) {
    event.preventDefault()
    onPasswordToggleClick(event, field)
  }
}

// Set accessibility attributes on the end-icon elements
watchEffect(() => {
  const setA11y = (elRef, isVisible) => {
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
const usernameCheckState = ref('idle') // 'idle' | 'checking' | 'available'
let usernameDebounceTimer = null
let usernameShowSpinnerTimer = null

const usernameFieldStatus = computed(() => {
  if (usernameCheckState.value === 'available') return 'success'
  if (usernameCheckState.value === 'checking') return 'default'
  return validation.username.status
})

const usernameFieldMessages = computed(() => {
  if (usernameCheckState.value === 'available') return { success: 'Username available' }
  if (usernameCheckState.value === 'checking') return {}
  return validation.username.messages
})

const usernameMessage = computed(() => {
  if (usernameCheckState.value === 'available') return { type: 'success', text: 'Username available' }
  if (validation.username.messages.error) return { type: 'error', text: validation.username.messages.error }
  if (validation.username.messages.warning) return { type: 'warning', text: validation.username.messages.warning }
  return null
})

function onUsernameInput() {
  applyAutoCapitalize()

  const validateWhileTyping = settings.value.fields.username.behaviors.validateWhileTyping
  if (!validateWhileTyping) return

  clearTimeout(usernameDebounceTimer)
  clearTimeout(usernameShowSpinnerTimer)

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
  clearTimeout(usernameDebounceTimer)
  clearTimeout(usernameShowSpinnerTimer)
  const validateWhileTyping = settings.value.fields.username.behaviors.validateWhileTyping

  if (validateWhileTyping && form.username.trim()) {
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

// Clear password fields when "email me a password" is toggled on
watch(emailPasswordInstead, (checked) => {
  if (checked) {
    form.password = ''
    form.confirmPassword = ''
    validation.password = { status: 'default', messages: {} }
    validation.confirmPassword = { status: 'default', messages: {} }
  }
})

// Reset checkbox when admin disables the behavior
watch(
  () => settings.value.fields.password.behaviors.emailPassword,
  (enabled) => {
    if (!enabled) emailPasswordInstead.value = false
  },
)

// Multi-step: focus the current field after navigation
function focusCurrentField() {
  nextTick(() => {
    const field = currentField.value
    const refMap = {
      username: usernameInputRef,
      password: passwordInputRef,
      confirmPassword: confirmPasswordInputRef,
      email: emailInputRef,
    }
    const inputRef = refMap[field]
    inputRef?.value?.$el?.querySelector('input')?.focus()
  })
}

// Multi-step: clear username debounce timers when leaving the username step
function clearUsernameTimers() {
  clearTimeout(usernameDebounceTimer)
  clearTimeout(usernameShowSpinnerTimer)
  usernameCheckState.value = 'idle'
}

function handleContinue() {
  const field = currentField.value
  if (field === 'username') clearUsernameTimers()

  // Skip validation for password step when "email me a password" is checked
  if (field === 'password' && emailPasswordInstead.value) {
    goNext()
    focusCurrentField()
    return
  }

  if (validate(field, { forSubmit: true })) {
    goNext()
    focusCurrentField()
  }
}

function handleBack() {
  goBack()
  focusCurrentField()
}

function handleSubmit() {
  usernameCheckState.value = 'idle'

  if (isMultiStep.value) {
    const field = currentField.value
    if (!validate(field, { forSubmit: true })) return
  }

  if (validateAll()) {
    alert('Account created successfully! (prototype)')
    resetSteps()
  }
}

// In multi-step mode, intercept form submit to handle Continue
function onFormSubmit() {
  if (isMultiStep.value && !isLastStep.value) {
    handleContinue()
  } else {
    handleSubmit()
  }
}
</script>

<style scoped>
.cdx-field {
  margin-bottom: var(--spacing-150);
}

.username-field-wrapper {
  position: relative;
  margin-bottom: var(--spacing-150);
  display: flex;
  flex-direction: column;
}

.username-field-wrapper .cdx-field {
  margin-bottom: 0;
}

.form-actions {
  margin-bottom: var(--spacing-100);
}

.form-actions.hcaptcha-above {
  margin-bottom: 0;
  margin-top: var(--spacing-100);
}

.form-actions .cdx-button {
  width: var(--size-full);
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-navigation .cdx-button {
  width: auto;
}

.public-link {
  font-weight: var(--font-weight-bold);
}

.username-check-progress {
  margin-top: var(--spacing-25);
  min-height: var(--line-height-medium);
}

.username-check-progress :deep(.cdx-label__label__text) {
  line-height: var(--line-height-medium);
}

/* Grid stacking: enter and leave elements share the same cell so no position:absolute needed */
/* max-height animates the layout shift so fields below slide smoothly instead of jumping */
.username-validation-area {
  display: grid;
  overflow: hidden;
  max-height: 0;
  transition: max-height 200ms ease-out;
}

.username-validation-area.active {
  max-height: calc(var(--spacing-25) + var(--line-height-medium) * 3);
}

.username-validation-area > * {
  grid-area: 1 / 1;
}

/* Slide-down animation */
.slide-down-enter-active {
  transition: opacity 400ms ease-out,
              transform 200ms ease-out;
}
.slide-down-leave-active {
  transition: opacity 100ms ease-out, transform 300ms ease-out;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}


/* Make the end icon clickable when used as show/hide password toggle */
.cdx-field :deep(.cdx-text-input__end-icon) {
  cursor: pointer;
}

/* When password is visible, use color-base instead of default color-subtle */
.password-visible :deep(.cdx-text-input__end-icon) {
  color: var(--color-base) !important;
}

:deep(.cdx-field__help-text:empty) {
  display: none;
}

.input-height-36 :deep(.cdx-text-input__input) {
  min-height: 36px;
}

.input-height-40 :deep(.cdx-text-input__input) {
  min-height: 40px;
}
</style>
