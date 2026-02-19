export interface AdminLoginRequest {
  email: string;
  password: string;
}
export interface AdminCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
export interface AdminAuthResult {
  id: string;
  email: string;
  fullName: string;
  token: string;
  refreshToken: string;
  role: string;
  lastLogin?: string;
}
export interface AdminResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface LogoutRequest {
  adminId: string;
}