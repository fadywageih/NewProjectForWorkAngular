export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
}
export interface ValidationError {
  field: string;
  errors: string[];
}
export interface ValidationErrorResponse {
  statusCode: number;
  errorMessage: string;
  errors: ValidationError[];
}