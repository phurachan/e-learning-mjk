export interface BaseState<R1 = any, R2 = any> {
    list?: R2[];
    current?: R2;
    pagination?: BasePagination | null
    //
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    requestData?: BaseRequestData<R1>;
    responseData?: BaseResponseData<R2>;
}

export interface BaseRequestQuery {
    pagination?: {
        page?: number;
        limit?: number;
    };
    filter?: any;
    sort?: any;
    search?: string;
}

export interface BaseRequestData<T = any> {
    body?: T;
    query?: BaseRequestQuery;
}

export interface BasePagination {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
    hasNext?: boolean
    hasPrev?: boolean
}

export interface MultiMessage {
    th?: string
    en?: string
}

export interface BaseResponseData<T = any> {
    success?: boolean
    data?: T
    message?: string | null
    pagination?: BasePagination | null
    //// Error handling fields
    error?: boolean
    url?: string | null
    statusCode?: number | null
    statusMessage?: string | null
    stack?: string[] | null
    messages?: MultiMessage | null
    details?: string[] | null
}

// Initial state
export const initState: BaseState = {
    isLoading: false,
    isError: false,
    isSuccess: false,
    requestData: { body: {}, query: {} },
    responseData: { success: false, data: null, message: null, pagination: null },
};

// Loading state
export const loadingState = (requestData: BaseRequestData<any> = { body: {}, query: {} }): BaseState => ({
    isLoading: true,
    isError: false,
    isSuccess: false,
    requestData: { ...requestData },
    responseData: { success: false, data: null, message: null, pagination: null },
});

// Success state
export const successState = (responseData: BaseResponseData<any> = { success: false, data: null, message: null, pagination: null }): BaseState => ({
    isLoading: false,
    isError: false,
    isSuccess: true,
    responseData: { ...responseData },
});

// Error state
export const errorState = (responseData: BaseResponseData<any> = { success: false, data: null, message: null, pagination: null }): BaseState => ({
    isLoading: false,
    isError: true,
    isSuccess: false,
    responseData: { ...responseData },
});