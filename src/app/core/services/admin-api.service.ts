import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AdminLoginRequest, AdminAuthResult, AdminCreateRequest, RefreshTokenRequest, AdminResult } from "../models/admin.models";
@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private baseUrl = environment.adminApiUrl;

  constructor(private http: HttpClient) {}

  login(loginData: AdminLoginRequest): Observable<AdminAuthResult> {
    return this.http.post<AdminAuthResult>(`${this.baseUrl}/login`, loginData);
  }

  register(registerData: AdminCreateRequest): Observable<AdminAuthResult> {
    return this.http.post<AdminAuthResult>(`${this.baseUrl}/register`, registerData);
  }

  refreshToken(refreshToken: string): Observable<AdminAuthResult> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AdminAuthResult>(`${this.baseUrl}/refresh-token`, request);
  }

  logout(adminId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, { adminId });
  }

  getAllAdmins(): Observable<AdminResult[]> {
    return this.http.get<AdminResult[]>(`${this.baseUrl}/admins`);
  }

  getAdminById(id: string): Observable<AdminResult> {
    return this.http.get<AdminResult>(`${this.baseUrl}/admins/${id}`);
  }
}