import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ResetPasswordRequest } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  constructor(private apiService: ApiService) {}

  resetPassword(request: ResetPasswordRequest): Observable<boolean> {
    const apiRequest = {
      email: request.email,
      token: request.token,
      password: request.password,
      confirmPassword: request.confirmPassword
    };

    return this.apiService.post<any>('Authentication/reset-password', apiRequest).pipe(
      map(response => {
        console.log('✅ Password reset successful');
        return true;
      }),
      catchError(error => {
        console.error('❌ Password reset failed:', error);

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
}