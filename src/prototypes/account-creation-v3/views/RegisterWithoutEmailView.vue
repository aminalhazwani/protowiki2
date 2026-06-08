<template>
  <div class="register-view">
    <WikipediaHeader />
    <div class="register-form-container">
      <h1 class="register-heading">Create account</h1>
      <form @submit.prevent="onFormSubmit" novalidate>

        <!-- Username -->
        <div class="field-wrapper">
          <CdxField :status="usernameFieldStatus" :messages="{}">
            <template #label>Username</template>
            <template #description>
              <a href="#" class="public-link" @click.prevent="showPolicy = true"
                >Choose carefully</a
              >
              — it's how the community will know you.
            </template>
            <CdxTextInput
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

        <!-- Password -->
        <div class="field-wrapper">
          <CdxField :status="validation.password.status" :messages="{}">
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
        </div>

        <!-- Confirm password -->
        <div class="field-wrapper">
          <CdxField :status="validation.confirmPassword.status" :messages="{}">
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

        <!-- Email (optional/recommended) -->
        <div class="field-wrapper">
          <CdxField :status="validation.email.status" :messages="{}">
            <template #label>
              <span class="email-field-label">
                <CdxIcon :icon="cdxIconAlert" class="email-alert-icon" />
                Email address
                <span class="email-recommended">(recommended)</span>
              </span>
            </template>
            <template #description>
              Email is required to recover your account if you lose your password or log in from
              an unfamiliar location or new browser.
            </template>
            <CdxTextInput
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

        <div class="form-actions">
          <CdxButton
            action="progressive"
            weight="primary"
            size="large"
            type="submit"
            class="submit-btn"
          >
            Create your account
          </CdxButton>
        </div>

      </form>
    </div>
    <WikipediaFooter />
    <Teleport to="body">
      <AdminPanel v-if="showAdmin" @close="closeAdmin" />
    </Teleport>
    <UsernamePolicy :visible="showPolicy" @close="showPolicy = false" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watchEffect, nextTick, inject, type Ref } from 'vue'
import {
  CdxField,
  CdxTextInput,
  CdxButton,
  CdxIcon,
  CdxMessage,
  CdxProgressIndicator,
} from '@wikimedia/codex'
import { cdxIconEye, cdxIconAlert } from '@wikimedia/codex-icons'
import WikipediaHeader from '../WikipediaHeader.vue'
import WikipediaFooter from '../WikipediaFooter.vue'
import AdminPanel from '../components/AdminPanel.vue'
import UsernamePolicy from '../components/UsernamePolicy.vue'
import { useFormValidation } from '../composables/useFormValidation'
import { useAdminSettings } from '../composables/useAdminSettings'

const showAdmin = inject<Ref<boolean>>('showAdmin')
const toggleAdmin = inject<() => void>('toggleAdmin')

function closeAdmin() {
  if (showAdmin) showAdmin.value = false
}

const showPolicy = ref(false)

const { settings } = useAdminSettings()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
})

const { validation, validate, validateAll } = useFormValidation(form, settings)

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

function onFormSubmit() {
  usernameCheckState.value = 'idle'
  if (validateAll()) {
    alert('Account created successfully! (prototype)')
  }
}

// Wire heading click to admin panel
nextTick(() => {
  const heading = document.querySelector<HTMLElement>('.register-heading')
  if (heading && toggleAdmin) {
    heading.addEventListener('click', toggleAdmin)
  }
})
</script>

<style>
.register-view .register-form-container {
  box-sizing: border-box;
  width: 100%;
  max-width: var(--size-2800);
  padding: var(--spacing-100) var(--spacing-100) 0 var(--spacing-100);
  margin: 0 auto;
}

.register-view .register-heading {
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-x-large);
  margin: 0 0 var(--spacing-150) 0;
  color: var(--color-base);
  cursor: default;
}

.register-view .field-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-150);
}

.register-view .field-wrapper .cdx-field {
  margin-bottom: 0;
}

.register-view .public-link {
  font-weight: var(--font-weight-bold);
}

/* Password toggle styling */
.register-view .cdx-text-input__end-icon {
  cursor: pointer;
}

.register-view .password-visible .cdx-text-input__end-icon {
  color: var(--color-base) !important;
}

.register-view .cdx-field__help-text:empty {
  display: none;
}

/* Validation area */
.register-view .validation-area {
  display: grid;
  overflow: hidden;
  max-height: 0;
  transition: max-height 200ms ease-out;
}

.register-view .validation-area.active {
  max-height: calc(var(--spacing-25) + var(--line-height-medium));
}

.register-view .validation-area > * {
  grid-area: 1 / 1;
}

.register-view .validation-message {
  margin-top: var(--spacing-25);
  height: var(--line-height-medium);
}

.register-view .validation-message .cdx-label__label__text {
  line-height: var(--line-height-medium);
}

/* Slide-down validation animation */
.register-view .slide-down-enter-active {
  transition: opacity 400ms ease-out, transform 200ms ease-out;
}
.register-view .slide-down-leave-active {
  transition: opacity 100ms ease-out, transform 300ms ease-out;
}
.register-view .slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.register-view .slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.register-view .slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Email field label */
.register-view .email-field-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-25);
}

.register-view .email-alert-icon {
  color: var(--color-icon-warning);
}

.register-view .email-recommended {
  color: var(--color-subtle);
  font-weight: var(--font-weight-normal);
}

/* Form actions */
.register-view .form-actions {
  margin-top: var(--spacing-150);
}

.register-view .submit-btn {
  width: 100%;
}
</style>
