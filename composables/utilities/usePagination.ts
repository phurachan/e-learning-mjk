import { ref, computed } from 'vue'

export function usePagination(initialPageSize: number = 10) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const totalItems = ref(0)
  
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value)
  })
  
  const startIndex = computed(() => {
    return (currentPage.value - 1) * pageSize.value
  })
  
  const endIndex = computed(() => {
    return Math.min(startIndex.value + pageSize.value, totalItems.value)
  })
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  const changePageSize = (newSize: number) => {
    pageSize.value = newSize
    // Reset to first page when changing page size
    currentPage.value = 1
  }
  
  const reset = () => {
    currentPage.value = 1
    totalItems.value = 0
  }
  
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset
  }
}