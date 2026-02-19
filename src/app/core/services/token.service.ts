import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface TokenData {
  token: string;
  expiresAt: number;
  email: string;
}
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_DATA_KEY = 'token_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenValid());

  constructor() {}

  // Token Management
  setToken(token: string, email: string, rememberMe: boolean = false): void {
    const tokenData: TokenData = {
      token,
      expiresAt: this.calculateExpirationTime(),
      email
    };

    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
      sessionStorage.removeItem(this.REMEMBER_ME_KEY);
    }

    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  getTokenData(): TokenData | null {
    const data = localStorage.getItem(this.TOKEN_DATA_KEY) || 
                 sessionStorage.getItem(this.TOKEN_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_DATA_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_DATA_KEY);
    
    this.tokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Observables
  getTokenObservable(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  getAuthStatusObservable(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Validation
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const tokenData = this.getTokenData();
    if (!tokenData) return false;

    return Date.now() < tokenData.expiresAt;
  }

  getRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  private calculateExpirationTime(): number {
    // Default 24 hours expiration
    return Date.now() + (24 * 60 * 60 * 1000);
  }
}