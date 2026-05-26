export interface FieldBehaviors {
  [key: string]: boolean
}

export interface FieldConfig {
  visible: boolean
  behaviors: FieldBehaviors
}

export interface AdminSettings {
  general: {
    fullWidthNextButton: boolean
  }
  fields: {
    username: FieldConfig
    password: FieldConfig
    confirmPassword: FieldConfig
    email: FieldConfig
  }
}

export const defaultSettings: AdminSettings = {
  general: {
    fullWidthNextButton: true,
  },
  fields: {
    username: {
      visible: true,
      behaviors: {
        validateWhileTyping: true,
        taken: false,
        autoCapitalize: true,
      },
    },
    password: {
      visible: true,
      behaviors: {
        enforceLength: true,
        weak: false,
        showToggle: true,
      },
    },
    confirmPassword: {
      visible: true,
      behaviors: {
        matchValidation: true,
        showToggle: true,
      },
    },
    email: {
      visible: true,
      behaviors: {
        emailValidation: true,
      },
    },
  },
}

export const generalLabels: Record<string, string> = {
  fullWidthNextButton: 'Full-width next button',
}

export const behaviorLabels: Record<string, Record<string, string>> = {
  username: {
    validateWhileTyping: 'Validate in real time',
    taken: 'Force "username taken" warning',
    autoCapitalize: 'Auto-capitalize username',
  },
  password: {
    enforceLength: 'Enforce length requirement',
    weak: 'Force weak password warning',
    showToggle: 'Show "reveal password" toggle',
  },
  confirmPassword: {
    matchValidation: 'Enforce match validation',
    showToggle: 'Show "reveal password" toggle',
  },
  email: {
    emailValidation: 'Validate email format',
  },
}
