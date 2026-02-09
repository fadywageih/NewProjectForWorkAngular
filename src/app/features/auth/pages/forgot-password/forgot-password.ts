import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../../../layout/header/header';
import { Footer } from '../../../../layout/footer/footer';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    Header,
    Footer
  ],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.forgotPasswordForm.get('email')?.value;

      console.log('📤 Sending reset password request for email:', email);

      this.authService.sendResetPasswordEmail(email).subscribe({
        next: (success) => {
          if (success) {
            this.isSubmitted = true;
            this.successMessage = 'If your email is registered, you will receive a password reset link shortly.';
            console.log('✅ Reset password email sent successfully');
          } else {
            this.errorMessage = 'Failed to send reset email. Please try again.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error sending reset password email:', error);
          this.errorMessage = error.message || 'An error occurred. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}