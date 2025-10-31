import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createStudentFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['studentId', 'firstname', 'lastname', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['studentId', 'firstname', 'lastname'],
    filterFields: {
      studentId: commonFieldHandlers.string('studentId'),
      firstname: commonFieldHandlers.string('firstname'),
      lastname: commonFieldHandlers.string('lastname'),
      room: commonFieldHandlers.string('room'),
      isActive: commonFieldHandlers.boolean('isActive')
    }
  }
}
