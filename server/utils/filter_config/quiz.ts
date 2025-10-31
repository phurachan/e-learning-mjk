import { FilterConfig } from '../queryParser'

export function createQuizFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['title', 'totalPoints', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['title', 'description'],
    filterFields: {
      title: { type: 'string', mongoField: 'title' },
      course: { type: 'string', mongoField: 'course' },
      lesson: { type: 'string', mongoField: 'lesson' },
      isActive: { type: 'boolean', mongoField: 'isActive' }
    }
  }
}
