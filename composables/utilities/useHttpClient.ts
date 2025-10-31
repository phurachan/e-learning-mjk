// HTTP Client Composable using $fetch only
// Features:
// - Dynamic interface support
// - Custom onRequest/onResponse interceptors
// - Base API from .env
// - Bearer token + un-auth support
// - Custom headers
// - HTTP methods: GET, POST, PUT, DELETE
// - FormData file upload
// - Query object conversion to query string

import type { HttpClientConfig, RequestOptions } from '~/composables/utility_models/http'
import { getApiBaseUrl, API_TIMEOUTS } from '~/composables/constants/api'

// Query object to query string conversion
const objectToQueryString = (obj: Record<string, any>, prefix?: string): string => {
  const params = new URLSearchParams()
  
  const flatten = (object: any, currentPrefix = '') => {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key]
        const newKey = currentPrefix ? `${currentPrefix}[${key}]` : key
        
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, newKey)
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object') {
                flatten(item, `${newKey}[${index}]`)
              } else {
                params.append(`${newKey}[]`, String(item))
              }
            })
          } else {
            params.append(newKey, String(value))
          }
        }
      }
    }
  }
  
  flatten(obj, prefix)
  return params.toString()
}

export const useHttpClient = (config: HttpClientConfig = {}) => {
  const tokenCookie = useCookie('token')
  
  // Default configuration
  const defaultConfig: HttpClientConfig = {
    baseURL: getApiBaseUrl(),
    useAuth: true,
    timeout: API_TIMEOUTS.DEFAULT,
    headers: {
      'Content-Type': 'application/json',
    }
  }
  
  const mergedConfig = { ...defaultConfig, ...config }
  
  // Custom headers state
  const customHeaders = ref<Record<string, string>>({})
  
  // Set custom header
  const setHeader = (key: string, value: string) => {
    customHeaders.value[key] = value
  }
  
  // Remove custom header
  const removeHeader = (key: string) => {
    delete customHeaders.value[key]
  }
  
  // Clear all custom headers
  const clearHeaders = () => {
    customHeaders.value = {}
  }
  
  // Build headers
  const buildHeaders = (additionalHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
      ...mergedConfig.headers,
      ...customHeaders.value,
      ...additionalHeaders
    }
    
    // Add Bearer token if auth is enabled and token exists
    if (mergedConfig.useAuth && tokenCookie.value) {
      headers.Authorization = `Bearer ${tokenCookie.value}`
    }
    
    return headers
  }
  
  // Core request function
  const request = async <T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    try {
      // Build URL with query parameters
      let url = endpoint
      if (options.query) {
        const queryString = objectToQueryString(options.query)
        url += (url.includes('?') ? '&' : '?') + queryString
      }
      
      // Prepare request options
      const requestOptions: any = {
        method: options.method || 'GET',
        baseURL: mergedConfig.baseURL,
        headers: buildHeaders(options.headers),
        timeout: mergedConfig.timeout
      }
      
      // Override auth setting per request
      if (options.useAuth === false) {
        delete requestOptions.headers.Authorization
      }
      
      // Handle body
      if (options.body) {
        if (options.body instanceof FormData) {
          // Remove Content-Type for FormData (browser will set it with boundary)
          delete requestOptions.headers['Content-Type']
          requestOptions.body = options.body
        } else {
          requestOptions.body = options.body
        }
      }
      
      // Call onRequest interceptor
      if (mergedConfig.onRequest) {
        await mergedConfig.onRequest({
          url,
          options: requestOptions
        })
      }
      
      // Make the request
      const response: any = await $fetch<T>(url, requestOptions)
      
      // Call onResponse interceptor
      if (mergedConfig.onResponse) {
        await mergedConfig.onResponse(response)
      }
      
      return response
      
    } catch (error: any) {
      // Call onError interceptor
      if (mergedConfig.onError) {
        await mergedConfig.onError(error)
      }
      
      // Handle specific error cases
      if (error.status === 401) {
        // Token expired, clear auth
        tokenCookie.value = null
        await navigateTo('/login')
      }
      
      throw error
    }
  }
  
  // HTTP Methods
  const get = <T = any>(endpoint: string, query?: Record<string, any>, options: Partial<HttpClientConfig> = {}) => {
    return request<T>(endpoint, { method: 'GET', query, ...options })
  }
  
  const post = <T = any>(endpoint: string, body?: any, options: Partial<HttpClientConfig> = {}) => {
    return request<T>(endpoint, { method: 'POST', body, ...options })
  }
  
  const put = <T = any>(endpoint: string, body?: any, options: Partial<HttpClientConfig> = {}) => {
    return request<T>(endpoint, { method: 'PUT', body, ...options })
  }
  
  const del = <T = any>(endpoint: string, options: Partial<HttpClientConfig> = {}) => {
    return request<T>(endpoint, { method: 'DELETE', ...options })
  }
  
  // File upload helper
  const upload = <T = any>(endpoint: string, files: File[] | File, data?: Record<string, any>) => {
    const formData = new FormData()
    
    // Add files
    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach((file, index) => {
      formData.append(fileArray.length === 1 ? 'file' : `files[${index}]`, file)
    })
    
    // Add additional data
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]))
      })
    }
    
    return request<T>(endpoint, {
      method: 'POST',
      body: formData
    })
  }
  
  return {
    // Core methods
    request,
    get,
    post,
    put,
    delete: del,
    upload,
    
    // Header management
    setHeader,
    removeHeader,
    clearHeaders,
    
    // Utilities
    objectToQueryString
  }
}

// Pre-configured instances
export const useApi = () => useHttpClient()
export const useApiUnauth = () => useHttpClient({ useAuth: false })