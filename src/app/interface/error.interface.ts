export interface TErrorSource {
  path: string;
  message: string;
}

export interface TGenericErrorResponse {
  success: boolean;
  message: string;
  errorSource: TErrorSource[];
  error: any;
  statusCode?: number;
  stack?: string;
}
