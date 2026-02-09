import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../../../layout/header/header';
import { Footer } from '../../../../layout/footer/footer';
import { LoginRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    Header,
    Footer
  ],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  loginForm: FormGroup;
  isLoading = false;
  emailErrorMessage = '';
  passwordErrorMessage = '';
  generalErrorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    
    const rememberedEmail = this.authService.getRememberedEmail();
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  // دالة مبسطة للضغط على Enter بدون مشاكل TypeScript
  handleKeyDown(event: any): void {
    // أي نوع يصلنا، نحول إلى KeyboardEvent فقط إذا كان يحتوي على key
    if (event && event.key === 'Enter' && !this.isLoading && this.loginForm.valid) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearAllErrors();

      const formData = this.loginForm.value;
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password
      };
      
      const rememberMe = formData.rememberMe;

      console.log('📤 Sending login request:', loginData);
      
      if (rememberMe) {
        this.authService.storeRememberedEmail(formData.email);
      } else {
        this.authService.clearRememberedEmail();
      }

      // أولاً: التحقق من وجود الإيميل
      this.authService.checkIfEmailExists(loginData.email).subscribe({
        next: (emailExists) => {
          if (!emailExists) {
            // الإيميل غير موجود
            this.handleEmailError('Email not found in our system');
            return;
          }
          
          // الإيميل موجود، الآن جرب تسجيل الدخول
          this.attemptLogin(loginData, rememberMe);
        },
        error: (emailCheckError) => {
          console.error('❌ Email check error:', emailCheckError);
          this.generalErrorMessage = 'Unable to verify email. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.validateForm();
    }
  }

  private attemptLogin(loginData: LoginRequest, rememberMe: boolean): void {
    this.authService.login(loginData, rememberMe).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.handleLoginError(error, loginData.email);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleLoginError(error: any, email: string): void {
    const errorMsg = error.message?.toLowerCase() || '';
    const status = error.status;
    
    // مسح الرسائل القديمة
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    
    // معالجة الأخطاء حسب النوع
    if (status === 401) {
      // Unauthorized - تحليل الرسالة
      if (errorMsg.includes('email') || errorMsg.includes('not found')) {
        this.handleEmailError('Email not found in our system');
      } else if (errorMsg.includes('password') || errorMsg.includes('incorrect')) {
        this.handlePasswordError('Incorrect password. Please try again.');
      } else {
        this.handlePasswordError('Invalid credentials. Please try again.');
      }
    } else if (status === 0) {
      // مشكلة في الاتصال
      this.generalErrorMessage = 'Cannot connect to server. Please check your internet connection.';
    } else if (status === 400) {
      // Bad request
      this.generalErrorMessage = 'Invalid request. Please check your input.';
    } else {
      // أخطاء أخرى
      this.generalErrorMessage = this.getErrorMessage(error);
    }
  }

  private handleEmailError(message: string): void {
    this.emailErrorMessage = message;
    
    // التركيز على حقل الإيميل بعد فترة قصيرة
    setTimeout(() => {
      if (this.emailInput?.nativeElement) {
        this.emailInput.nativeElement.focus();
        this.emailInput.nativeElement.select();
      }
    }, 50);
  }

  private handlePasswordError(message: string): void {
    this.passwordErrorMessage = message;
    
    // التركيز على حقل الباسورد بعد فترة قصيرة
    setTimeout(() => {
      if (this.passwordInput?.nativeElement) {
        this.passwordInput.nativeElement.focus();
        this.passwordInput.nativeElement.select();
      }
    }, 50);
  }

  private clearAllErrors(): void {
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.generalErrorMessage = '';
  }

  private validateForm(): void {
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');
    
    if (emailControl?.invalid && emailControl?.touched) {
      if (emailControl.errors?.['required']) {
        this.emailErrorMessage = 'Email is required';
      } else if (emailControl.errors?.['email']) {
        this.emailErrorMessage = 'Please enter a valid email';
      }
    }
    
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        this.passwordErrorMessage = 'Password is required';
      } else if (passwordControl.errors?.['minlength']) {
        this.passwordErrorMessage = 'Password must be at least 6 characters';
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.message?.includes('Cannot connect to server')) {
      return 'Cannot connect to server. Please check if backend is running.';
    } else if (error.message?.includes('Invalid request data')) {
      return 'Invalid email or password format.';
    } else {
      return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // دالة لتحديث رسائل الخطأ عند تغيير المدخلات
  onInputChange(field: 'email' | 'password'): void {
    if (field === 'email' && this.emailErrorMessage) {
      this.emailErrorMessage = '';
    }
    if (field === 'password' && this.passwordErrorMessage) {
      this.passwordErrorMessage = '';
    }
    
    // مسح الرسالة العامة إذا كان هناك كتابة
    if (this.generalErrorMessage) {
      this.generalErrorMessage = '';
    }
  }
}