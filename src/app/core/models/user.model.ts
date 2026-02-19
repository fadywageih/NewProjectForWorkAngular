export interface User {
  id?: string;
  name?: string;
  email: string;
  address?: string;
  phone?: string;
}
export interface ApplicationUser extends User {
  userName?: string;
  email: string;
  name?: string;
  phoneNumber?: string;
}
export interface UserWithAddress extends User {
  address: string;
}
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
export interface ForgetPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  email: string;
  token: string; // URL-encoded token from link
  password: string;
  confirmPassword: string;
}
export interface ResetPasswordApiRequest {
  email: string;
  token: string; // Decoded token
  password: string;
  confirmPassword: string;
}