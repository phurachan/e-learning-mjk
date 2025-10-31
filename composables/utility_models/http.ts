// HTTP Client related interfaces and types

export interface HttpClientConfig {
  baseURL?: string
  headers?: Record<string, string>
  timeout?: number
  useAuth?: boolean
  onRequest?: (request: any) => void | Promise<void>
  onResponse?: (response: any) => void | Promise<void>
  onError?: (error: any) => void | Promise<void>
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: any
}

export interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  query?: Record<string, any>
  useAuth?: boolean
}

export interface UploadOptions {
  endpoint: string
  files: File[] | File
  data?: Record<string, any>
  onProgress?: (progress: number) => void
}

// src/exceptions/custom-error.ts
export class BaseResponseError extends Error {
  // A property to hold a specific error code
  public response: BaseResponseData;

  constructor(responseError: any) {
    // Call the super constructor to set the message
    super(responseError?.statusMessage || '[BaseResponseError] An error occurred');

    // Set the name of the error class for identification
    this.name = 'BaseResponseError';

    // Set the custom error code
    this.response = { 
      ...(responseError || {}), 
      messages: responseError?.data?.messages || null,
      details: responseError?.data?.details || null,
      message: responseError?.data?.message || responseError?.statusMessage || this.message 
    };
  }

  static getMessageTh(resErr: any, defaultMsg: string = "Unable to proceed. Please try again."): string {
    const err = new BaseResponseError({ ...(resErr || {}), ...(resErr?.response || {}) });
    let msg = err.response?.messages?.th || err.response?.message || err.response?.statusMessage || defaultMsg;
    if (err.response?.details?.length) {
      msg = `${msg} (${err.response.details.join(', ')})`;
    }
    return msg;
  }
}