import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  UserResult, 
  ForgetPasswordRequest, 
  ResetPasswordRequest,
  User
} from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser';
  private readonly REMEMBER_KEY = 'rememberMe';
  private readonly REMEMBERED_EMAIL_KEY = 'rememberedEmail';
  
  // BehaviorSubject لتتبع حالة المصادقة ديناميكياً
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private userSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  constructor(private apiService: ApiService) {}

  // Observable يمكن الاشتراك فيه لمتابعة حالة المصادقة
  getAuthStatus(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  // Observable يمكن الاشتراك فيه لمتابعة بيانات المستخدم
  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  login(loginData: LoginRequest, rememberMe: boolean = false): Observable<UserResult> {
    return this.apiService.post<UserResult>('Authentication/login', loginData).pipe(
      tap(response => console.log('✅ Login response:', response)),
      map(response => {
        // تحويل UserResult إلى User لحفظه محلياً
        const userToStore: User = {
          id: undefined, // سيرسلها الباك إند
          email: response.email,
          name: response.displayName
        };
        
        this.storeUserData(userToStore, response.token, rememberMe);
        
        // تحديث BehaviorSubjects
        this.authStatusSubject.next(true);
        this.userSubject.next(userToStore);
        
        return response;
      }),
      catchError(error => {
        console.error('❌ Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<UserResult> {
    return this.apiService.post<UserResult>('Authentication/register', registerData).pipe(
      tap(response => console.log('✅ Register response:', response)),
      map(response => {
        // تحويل UserResult إلى User لحفظه محلياً
        const userToStore: User = {
          id: undefined,
          email: response.email,
          name: response.displayName
        };
        
        this.storeUserData(userToStore, response.token, false); // Default no remember me for registration
        
        // تحديث BehaviorSubjects
        this.authStatusSubject.next(true);
        this.userSubject.next(userToStore);
        
        return response;
      }),
      catchError(error => {
        console.error('❌ Register error:', error);
        return throwError(() => error);
      })
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.apiService.get<User>(`Authentication/user/${email}`).pipe(
      catchError(error => {
        console.error('❌ Get user error:', error);
        return throwError(() => error);
      })
    );
  }

  checkIfEmailExists(email: string): Observable<boolean> {
    return this.apiService.get<boolean>(`Authentication/emailexists?email=${email}`).pipe(
      catchError(() => of(false))
    );
  }

  sendResetPasswordEmail(email: string): Observable<boolean> {
    const request: ForgetPasswordRequest = { email };
    return this.apiService.post<boolean>('Authentication/forgot-password', request).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<boolean> {
    return this.apiService.post<any>('Authentication/reset-password', request).pipe(
      map(() => true),
      catchError(error => {
        console.error('❌ Password reset error:', error);
        let userMessage = 'Failed to reset password. ';
        if (error.message?.includes('Invalid or expired reset token')) {
          userMessage += 'The reset link has expired or is invalid. Please request a new password reset link.';
        } else if (error.message) {
          userMessage += error.message;
        } else {
          userMessage += 'Please try again.';
        }
        return throwError(() => new Error(userMessage));
      })
    );
  }

  logout(): void {
    // مسح كل التخزين
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_KEY);
    localStorage.removeItem(this.REMEMBERED_EMAIL_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
    // تحديث BehaviorSubjects
    this.authStatusSubject.next(false);
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    // البحث في كلا المكانين
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  getRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_KEY) === 'true';
  }

  // دالة لتخزين البريد الإلكتروني لخاصية Remember Me
  storeRememberedEmail(email: string): void {
    localStorage.setItem(this.REMEMBERED_EMAIL_KEY, email);
  }

  getRememberedEmail(): string | null {
    return localStorage.getItem(this.REMEMBERED_EMAIL_KEY);
  }

  clearRememberedEmail(): void {
    localStorage.removeItem(this.REMEMBERED_EMAIL_KEY);
  }

  // تحديث بيانات المستخدم (مثل الاسم أو الصورة)
  updateUserData(updatedUser: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      
      // تحديث التخزين
      if (this.getRememberMe()) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
      } else {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
      }
      
      // تحديث BehaviorSubject
      this.userSubject.next(newUser);
    }
  }

  // التحقق من صلاحية التوكن (يمكن إضافة مزيد من المنطق هنا)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // يمكن إضافة منطق للتحقق من صلاحية التوكن
    // مثلاً التحقق من تاريخ الانتهاء إذا كان JWT
    return true;
  }

  // إعادة تحميل بيانات المستخدم من السيرفر
  refreshUserData(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.getUserByEmail(currentUser.email).pipe(
      tap(user => {
        this.updateUserData(user);
      }),
      catchError(error => {
        console.error('❌ Refresh user data error:', error);
        return throwError(() => error);
      })
    );
  }

  private storeUserData(user: User, token: string, rememberMe: boolean): void {
    localStorage.setItem(this.REMEMBER_KEY, rememberMe.toString());
    
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }
}