export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
}
export interface UserResult {
  displayName: string;
  email: string;
  token: string;
}
export interface ValidationError {
  field: string;
  errors: string[];
}