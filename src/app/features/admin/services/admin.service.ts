import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from "rxjs";
import { IAdminService } from "../../../core/interfaces/admin-service.interface";
import { AdminResult, AdminLoginRequest, AdminAuthResult, AdminCreateRequest } from "../../../core/models/admin.models";
import { AdminApiService } from "../../../core/services/admin-api.service";
@Injectable({
  providedIn: 'root'
})
export class AdminService implements IAdminService {
  private readonly ADMIN_TOKEN_KEY = 'admin_token';
  private readonly ADMIN_DATA_KEY = 'admin_data';
  private readonly ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
  
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private adminSubject = new BehaviorSubject<AdminResult | null>(this.getCurrentAdmin());

  constructor(private adminApiService: AdminApiService) {}

  login(loginData: AdminLoginRequest): Observable<AdminAuthResult> {
    return this.adminApiService.login(loginData).pipe(
      tap(response => {
        this.storeAdminData(response);
        this.authStatusSubject.next(true);
        this.adminSubject.next(this.mapAuthResultToAdmin(response));
      }),
      catchError(error => {
        console.error('Admin login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: AdminCreateRequest): Observable<AdminAuthResult> {
    return this.adminApiService.register(registerData).pipe(
      tap(response => {
        this.storeAdminData(response);
        this.authStatusSubject.next(true);
        this.adminSubject.next(this.mapAuthResultToAdmin(response));
      }),
      catchError(error => {
        console.error('Admin registration error:', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(refreshToken: string): Observable<AdminAuthResult> {
    return this.adminApiService.refreshToken(refreshToken).pipe(
      tap(response => {
        this.storeAdminData(response);
      }),
      catchError(error => {
        console.error('Refresh token error:', error);
        this.clearAdminData();
        return throwError(() => error);
      })
    );
  }

  logout(adminId: string): Observable<boolean> {
    return this.adminApiService.logout(adminId).pipe(
      map(() => {
        this.clearAdminData();
        this.authStatusSubject.next(false);
        this.adminSubject.next(null);
        return true;
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAdminData();
        return throwError(() => error);
      })
    );
  }

  getAllAdmins(): Observable<AdminResult[]> {
    return this.adminApiService.getAllAdmins();
  }

  getAdminById(id: string): Observable<AdminResult> {
    return this.adminApiService.getAdminById(id);
  }

  getCurrentAdmin(): AdminResult | null {
    const adminJson = localStorage.getItem(this.ADMIN_DATA_KEY);
    return adminJson ? JSON.parse(adminJson) : null;
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  getAdminObservable(): Observable<AdminResult | null> {
    return this.adminSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.getAdminToken();
  }

  getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.ADMIN_REFRESH_TOKEN_KEY);
  }

  private storeAdminData(authResult: AdminAuthResult): void {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, authResult.token);
    localStorage.setItem(this.ADMIN_REFRESH_TOKEN_KEY, authResult.refreshToken);
    
    const adminData: AdminResult = this.mapAuthResultToAdmin(authResult);
    localStorage.setItem(this.ADMIN_DATA_KEY, JSON.stringify(adminData));
  }

  private clearAdminData(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_DATA_KEY);
    localStorage.removeItem(this.ADMIN_REFRESH_TOKEN_KEY);
  }

private mapAuthResultToAdmin(authResult: AdminAuthResult): AdminResult {
  const [firstName = '', lastName = ''] = authResult.fullName.split(' ');
  
  return {
    id: authResult.id,
    email: authResult.email,
    firstName,
    lastName,
    fullName: authResult.fullName,
    role: authResult.role,
    isActive: true,
    lastLogin: authResult.lastLogin,
    createdAt: authResult.lastLogin || new Date().toISOString()
  };
}
}