import { computed, readonly, ref, watch, type ComputedRef, type DeepReadonly, type Ref } from 'vue'

import {
  loadConfig,
  resetUserPageListField,
  saveConfig,
  type Config,
  type ConfigTheme,
  type ConfigUser,
  type PageListKey,
  type UserPageLists,
} from '@/lib/config'

const config = ref<Config>(loadConfig())

watch(
  config,
  (value) => {
    saveConfig(value)
  },
  { deep: true },
)

export function useConfig(): {
  config: DeepReadonly<Ref<Config>>
  theme: Ref<ConfigTheme>
  user: Ref<ConfigUser>
  currentUserPageLists: ComputedRef<UserPageLists>
  setCurrentUserPageList: (field: PageListKey, pages: string[]) => void
  resetCurrentUserPageListField: (field: PageListKey) => void
} {
  const theme = computed({
    get: () => config.value.theme,
    set: (value: ConfigTheme) => {
      config.value = { ...config.value, theme: value }
    },
  })

  const user = computed({
    get: () => config.value.user,
    set: (value: ConfigUser) => {
      config.value = { ...config.value, user: value }
    },
  })

  const currentUserPageLists = computed(() => config.value.userPageLists[user.value])

  function setCurrentUserPageList(field: PageListKey, pages: string[]) {
    const activeUser = user.value
    config.value = {
      ...config.value,
      userPageLists: {
        ...config.value.userPageLists,
        [activeUser]: {
          ...config.value.userPageLists[activeUser],
          [field]: [...pages],
        },
      },
    }
  }

  function resetCurrentUserPageListField(field: PageListKey) {
    const activeUser = user.value
    config.value = {
      ...config.value,
      userPageLists: {
        ...config.value.userPageLists,
        [activeUser]: resetUserPageListField(
          config.value.userPageLists[activeUser],
          activeUser,
          field,
        ),
      },
    }
  }

  return {
    config: readonly(config),
    theme,
    user,
    currentUserPageLists,
    setCurrentUserPageList,
    resetCurrentUserPageListField,
  }
}
