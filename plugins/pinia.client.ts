import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = nuxtApp.$pinia as any
  pinia.use(createPersistedState({
    storage: localStorage
  }))
})