import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createCourseFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['name', 'code', 'academicYear', 'semester', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['name', 'code'],
    filterFields: {
      name: commonFieldHandlers.string('name'),
      code: commonFieldHandlers.string('code'),
      teacher: commonFieldHandlers.string('teacher'),
      academicYear: commonFieldHandlers.string('academicYear'),
      semester: commonFieldHandlers.number('semester'),
      isActive: commonFieldHandlers.boolean('isActive')
    }
  }
}
