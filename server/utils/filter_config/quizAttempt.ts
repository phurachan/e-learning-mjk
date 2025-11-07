import { FilterConfig, commonFieldHandlers } from '../queryParser'

export function createQuizAttemptFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['submittedAt', 'score', 'percentage', 'createdAt'],
    defaultSortField: 'submittedAt',
    defaultSortOrder: 'desc',
    searchFields: [],
    filterFields: {
      quiz: commonFieldHandlers.string('quiz'),
      student: commonFieldHandlers.string('student'),
      isGraded: commonFieldHandlers.boolean('isGraded'),
      isPassed: commonFieldHandlers.boolean('isPassed'),
      attemptNumber: commonFieldHandlers.number('attemptNumber')
    }
  }
}
