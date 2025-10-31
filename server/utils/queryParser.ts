// Global Query Parser Utilities for API endpoints

export interface ParsedQuery {
  pagination: {
    page: number
    limit: number
  }
  filter: Record<string, any>
  search: string
}

export interface FilterFieldHandler {
  (value: any): Record<any, any> | null
}

export interface FilterConfig {
  searchFields?: string[]
  allowedSortFields?: string[]
  defaultSortField?: string | string[]
  defaultSortOrder?: 'asc' | 'desc'
  filterFields: Record<any, FilterFieldHandler>
}

/**
 * Parse bracket notation query parameters into structured object
 */
export function parseQuery(query: Record<string, any>): ParsedQuery {
  // Initialize parsed structure
  const parsedQuery: ParsedQuery = {
    pagination: {
      page: parseInt(query['pagination[page]'] ?? "1"),
      limit: parseInt(query['pagination[limit]'] ?? "50")
    },
    filter: {} as Record<string, any>,
    search: query.search || ""
  }

  // Extract filter parameters
  Object.keys(query).forEach(key => {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      let filterKey: string

      // Handle array parameters like filter[role][]
      if (key.endsWith('[]')) {
        filterKey = key.slice(7, -3) // Remove 'filter[' and '][]'
      } else {
        filterKey = key.slice(7, -1) // Remove 'filter[' and ']'
      }

      let value = query[key]

      // Convert string values to appropriate types
      if (value === 'true') value = true
      if (value === 'false') value = false
      if (key.endsWith('[]')) {
        // Handle array parameters
        value = Array.isArray(value) ? value : [value]
      }

      parsedQuery.filter[filterKey] = value
    }
  })

  return parsedQuery
}

/**
 * Validate and build MongoDB filter from parsed query
 */
export function buildMongoFilter(
  parsedQuery: ParsedQuery,
  allowedFields: FilterConfig
): Record<string, any> {
  const filter: Record<string, any> = {}

  // Handle search (special case for text search)
  if (parsedQuery.search) {
    const defaultSearchFields = allowedFields.searchFields || ['name', 'email']
    filter.$or = defaultSearchFields.map(field => ({
      [field]: { $regex: parsedQuery.search, $options: 'i' }
    }))
  }

  // Handle dynamic filters with validation
  Object.keys(parsedQuery.filter).forEach(field => {
    const handler: any = allowedFields.filterFields[field as keyof typeof allowedFields.filterFields]
    if (handler) {
      const fieldFilter = handler(parsedQuery.filter[field])
      if (fieldFilter) {
        Object.assign(filter, fieldFilter)
      }
    } else {
      console.warn(`Filter field '${field}' is not allowed`)
    }
  })

  return filter
}

/**
 * Common field handlers for different data types
 */
export const commonFieldHandlers = {
  /**
   * Boolean field handler
   */
  boolean: (field: string): FilterFieldHandler =>
    (value: any) => typeof value === 'boolean' ? { [field]: value } : null,

  /**
   * String field handler (exact match)
   */
  string: (field: string): FilterFieldHandler =>
    (value: any) => typeof value === 'string' && value.trim() ? { [field]: value.trim() } : null,

  /**
   * String or Array field handler (using $in for arrays)
   */
  stringOrArray: (field: string): FilterFieldHandler =>
    (value: any) => {
      if (typeof value === 'string' && value.trim()) return { [field]: value.trim() }
      if (Array.isArray(value) && value.length > 0) return { [field]: { $in: value } }
      return null
    },

  /**
   * Number field handler
   */
  number: (field: string): FilterFieldHandler =>
    (value: any) => {
      const num = typeof value === 'string' ? parseInt(value) : value
      return typeof num === 'number' && !isNaN(num) ? { [field]: num } : null
    },

  /**
   * Date field handler (accepts ISO strings)
   */
  date: (field: string): FilterFieldHandler =>
    (value: any) => {
      const date = new Date(value)
      return !isNaN(date.getTime()) ? { [field]: date } : null
    },

  /**
   * ObjectId or Array field handler (for MongoDB ObjectId fields)
   * Note: Uses string comparison as fallback if ObjectId conversion fails
   */
  objectIdOrArray: (field: string): FilterFieldHandler =>
    (value: any) => {
      // For now, use string-based filtering since ObjectId conversion
      // requires special handling in the server environment
      if (typeof value === 'string' && value.trim()) {
        return { [field]: value.trim() }
      }
      if (Array.isArray(value) && value.length > 0) {
        return { [field]: { $in: value } }
      }
      return null
    },

  /**
   * Date range handler (for fields like createdAt)
   */
  dateRange: (field: string): FilterFieldHandler =>
    (value: any) => {
      if (typeof value === 'object' && value !== null) {
        const filter: Record<string, any> = {}
        if (value.from) {
          const fromDate = new Date(value.from)
          if (!isNaN(fromDate.getTime())) filter.$gte = fromDate
        }
        if (value.to) {
          const toDate = new Date(value.to)
          if (!isNaN(toDate.getTime())) filter.$lte = toDate
        }
        return Object.keys(filter).length > 0 ? { [field]: filter } : null
      }
      return null
    }
}

/**
 * All-in-one function to parse query and build MongoDB filter
 */
export function parseQueryAndBuildFilter(
  query: Record<string, any>,
  allowedFields: FilterConfig,
): { parsedQuery: ParsedQuery; mongoFilter: Record<string, any> } {
  const parsedQuery = parseQuery(query)
  const mongoFilter = buildMongoFilter(parsedQuery, allowedFields)

  return { parsedQuery, mongoFilter }
}