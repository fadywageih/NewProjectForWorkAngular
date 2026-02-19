import { Observable } from "rxjs";
import { LoginRequest, UserResult, RegisterRequest, ResetPasswordRequest } from "../models/user.model";

export interface IAuthenticationService {
  login(loginData: LoginRequest): Observable<UserResult>;
  register(registerData: RegisterRequest): Observable<UserResult>;
  getUserByEmail(email: string): Observable<UserResult>;
  checkIfEmailExists(email: string): Observable<boolean>;
  sendResetPasswordEmail(email: string): Observable<boolean>;
  resetPassword(request: ResetPasswordRequest): Observable<boolean>;
  logout(): void;
  getCurrentUser(): UserResult | null;
  isAuthenticated(): boolean;
}