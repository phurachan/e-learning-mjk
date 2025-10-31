import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createLessonFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['title', 'order', 'publishDate', 'createdAt'],
    defaultSortField: 'order',
    defaultSortOrder: 'asc',
    searchFields: ['title', 'description'],
    filterFields: {
      title: commonFieldHandlers.string('title'),
      course: commonFieldHandlers.string('course'),
      isPublished: commonFieldHandlers.boolean('isPublished'),
      isActive: commonFieldHandlers.boolean('isActive')
    }
  }
}
