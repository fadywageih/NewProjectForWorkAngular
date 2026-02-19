import { Observable } from "rxjs";
import { AdminAuthResult, AdminCreateRequest, AdminLoginRequest, AdminResult } from "../models/admin.models";

export interface IAdminService {
  login(loginData: AdminLoginRequest): Observable<AdminAuthResult>;
  register(registerData: AdminCreateRequest): Observable<AdminAuthResult>;
  refreshToken(refreshToken: string): Observable<AdminAuthResult>;
  logout(adminId: string): Observable<boolean>;
  getAllAdmins(): Observable<AdminResult[]>;
  getAdminById(id: string): Observable<AdminResult>;
  getCurrentAdmin(): AdminResult | null;
  isAuthenticated(): boolean;
}