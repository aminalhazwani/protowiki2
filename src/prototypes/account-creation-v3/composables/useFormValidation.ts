import { reactive, type Ref } from 'vue'

interface FieldBehaviors {
  [key: string]: boolean
}

interface FieldSettings {
  visible: boolean
  behaviors: FieldBehaviors
}

interface Settings {
  fields: {
    username: FieldSettings
    password: FieldSettings
    confirmPassword: FieldSettings
    email: FieldSettings
  }
}

interface FormData {
  username: string
  password: string
  confirmPassword: string
  email: string
}

interface FieldState {
  status: 'default' | 'error' | 'warning'
  messages: Record<string, string>
}

type FieldName = keyof FormData

const baselineValidators: Record<
  FieldName,
  (value: string, form: FormData, behaviors: FieldBehaviors) => { status: string; message: string } | null
> = {
  username: (value) => {
    if (!value.trim()) {
      return { status: 'error', message: 'Please enter a username.' }
    }
    return null
  },
  password: (value, _form, behaviors) => {
    if (!value) {
      return { status: 'error', message: 'Please enter a password.' }
    }
    if (behaviors.enforceLength !== false && value.length < 8) {
      return { status: 'error', message: 'Passwords must be at least 8 characters.' }
    }
    return null
  },
  confirmPassword: (value, form, behaviors) => {
    if (!value) {
      return { status: 'error', message: 'Please confirm your password.' }
    }
    if (behaviors.matchValidation !== false && value !== form.password) {
      return { status: 'error', message: 'The passwords you entered do not match.' }
    }
    return null
  },
  email: (value, _form, behaviors) => {
    if (behaviors.emailValidation !== false && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { status: 'error', message: 'Please enter a valid email address.' }
    }
    return null
  },
}

function makeFieldState(): FieldState {
  return { status: 'default', messages: {} }
}

export function useFormValidation(form: FormData, settings: Ref<Settings>) {
  const validation = reactive<Record<FieldName, FieldState>>({
    username: makeFieldState(),
    password: makeFieldState(),
    confirmPassword: makeFieldState(),
    email: makeFieldState(),
  })

  function validate(fieldName: FieldName, { onBlur = false, forSubmit = false } = {}): boolean {
    const value = form[fieldName]
    const fieldSettings = settings.value.fields[fieldName]

    if (!fieldSettings || !fieldSettings.visible) {
      validation[fieldName] = makeFieldState()
      return true
    }

    if (onBlur && !value) {
      validation[fieldName] = makeFieldState()
      return true
    }

    // Behavior-based validators
    if (fieldName === 'username' && fieldSettings.behaviors.taken) {
      if (value.trim()) {
        const status = forSubmit ? 'error' : 'warning'
        validation[fieldName] = {
          status,
          messages: { [status]: `"${value}" is taken.` },
        }
        return !forSubmit
      }
    }

    if (fieldName === 'password' && fieldSettings.behaviors.weak) {
      if (value) {
        validation[fieldName] = {
          status: 'warning',
          messages: {
            warning: 'This password is commonly used and could be easily guessed.',
          },
        }
        return true
      }
    }

    // Baseline validator
    const baselineValidator = baselineValidators[fieldName]
    if (baselineValidator) {
      const result = baselineValidator(value, form, fieldSettings.behaviors)
      if (result) {
        validation[fieldName] = {
          status: result.status as FieldState['status'],
          messages: { [result.status]: result.message },
        }
        return result.status !== 'error'
      }
    }

    validation[fieldName] = makeFieldState()
    return true
  }

  function validateAll(): boolean {
    const fields: FieldName[] = ['username', 'password', 'confirmPassword', 'email']
    let allValid = true
    for (const field of fields) {
      if (settings.value.fields[field]?.visible) {
        if (!validate(field, { forSubmit: true })) allValid = false
      }
    }
    return allValid
  }

  function resetValidation() {
    for (const key of Object.keys(validation) as FieldName[]) {
      validation[key] = makeFieldState()
    }
  }

  return { validation, validate, validateAll, resetValidation }
}
