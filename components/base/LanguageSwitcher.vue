<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2">
      <BaseIcon name="language" size="sm" />
      <span class="hidden sm:inline">{{ currentLocale?.name }}</span>
      <BaseIcon name="chevron-down" size="xs" />
    </div>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[9999] w-40 p-2 shadow">
      <li v-for="localeItem in availableLocales" :key="localeItem.code">
        <a @click="switchLanguage(localeItem.code)" :class="{ 'active': localeItem.code === locale }">
          <span>{{ localeItem.name }}</span>
          <BaseIcon v-if="localeItem.code === locale" name="check" size="xs" class="text-primary" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from 'vue-i18n';
const { locales, locale, setLocale } = useI18n()

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() =>
  availableLocales.value.find(l => l.code === locale.value) || availableLocales.value[0]
)

const switchLanguage = async (localeCode: string) => {
  if (availableLocales.value.some(l => l.code === localeCode)) {
    await setLocale(localeCode as Locale)
  }
}
</script>