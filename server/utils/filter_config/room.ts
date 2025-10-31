import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createRoomFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['name', 'code', 'grade', 'academicYear', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['name', 'code', 'academicYear'],
    filterFields: {
      name: commonFieldHandlers.string('name'),
      code: commonFieldHandlers.string('code'),
      grade: commonFieldHandlers.number('grade'),
      section: commonFieldHandlers.string('section'),
      academicYear: commonFieldHandlers.string('academicYear'),
      isActive: commonFieldHandlers.boolean('isActive')
    }
  }
}
