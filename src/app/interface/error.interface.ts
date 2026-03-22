export interface TErrorSource {
  path: string;
  message: string;
}

export interface TErrorResponse {
  success: boolean;
  message: string;
  errorSource: TErrorSource[];
  error?: any;
  statusCode?: number;
  stack?: string;
}
