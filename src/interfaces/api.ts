export interface ApiResponse {
    code: number;
    key: string;
    error?: any;
    data?: any;
}

export interface ApiError {
    code?: string | number;
    message?: string;
}
