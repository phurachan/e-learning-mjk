import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createQuizFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['title', 'totalPoints', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['title', 'description'],
    filterFields: {
      title: commonFieldHandlers.string('title'),
      course: commonFieldHandlers.string('course'),
      lesson: commonFieldHandlers.string('lesson'),
      isActive: commonFieldHandlers.boolean('isActive')
    }
  }
}
