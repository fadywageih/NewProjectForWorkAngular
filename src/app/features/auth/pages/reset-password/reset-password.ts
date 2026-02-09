import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordRequest } from '../../../../core/models/user.model';
import { PasswordService } from '../../services/password.service';
import { Footer } from '../../../../layout/footer/footer';
import { Header } from '../../../../layout/header/header';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    Header,
    Footer
  ],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit, OnDestroy {
  resetPasswordForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';
  successMessage = '';
  
  email: string = '';
  token: string = '';
  private routeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeFromQueryParams();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const resetRequest: ResetPasswordRequest = {
      email: this.getEmailValue(),
      token: this.token,
      password: this.resetPasswordForm.get('password')?.value,
      confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value
    };

    console.log('📤 Sending reset password request');
    console.log('📧 Email:', resetRequest.email);
    console.log('🔑 Token length:', this.token?.length || 0);

    this.passwordService.resetPassword(resetRequest).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.isSubmitted = true;
          this.successMessage = 'Your password has been reset successfully!';
          console.log('✅ Password reset successful');
        } else {
          this.errorMessage = 'The reset link has expired or is invalid. Please request a new password reset link.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Password reset error:', error);
        this.errorMessage = error.message || 'An error occurred. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private initializeFromQueryParams(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (this.email && this.token) {
        // URL-decode the email
        this.email = decodeURIComponent(this.email);

        this.resetPasswordForm.patchValue({
          email: this.email
        });

        // Disable the email field since it came from the URL
        this.resetPasswordForm.get('email')?.disable();
      }
    });
  }

  private getEmailValue(): string {
    if (this.resetPasswordForm.get('email')?.disabled) {
      return this.resetPasswordForm.getRawValue().email;
    }
    return this.resetPasswordForm.get('email')?.value;
  }

  private markAllAsTouched(): void {
    Object.values(this.resetPasswordForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private cleanupSubscriptions(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // Template getters
  get emailControl(): AbstractControl | null {
    return this.resetPasswordForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.resetPasswordForm.get('password');
  }

  get confirmPasswordControl(): AbstractControl | null {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get isFromUrl(): boolean {
    return !!this.email && !!this.token;
  }

  get passwordHasMinLength(): boolean {
    const password = this.passwordControl?.value || '';
    return password.length >= 6;
  }

  get passwordHasNumber(): boolean {
    const password = this.passwordControl?.value || '';
    return /\d/.test(password);
  }

  get passwordIsValid(): boolean {
    return this.passwordHasMinLength && this.passwordHasNumber;
  }
}