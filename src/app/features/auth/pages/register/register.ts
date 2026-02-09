import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../../../layout/header/header';
import { Footer } from '../../../../layout/footer/footer';
import { RegisterRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    Header,
    Footer
  ],
  templateUrl: './register.html',
  styles: []
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  errorMessages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessages = [];

      const registerData: RegisterRequest = this.registerForm.value;
      console.log('📤 Sending register request:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('✅ Register successful:', response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('❌ Register error:', error);
          
          if (error.message.includes('Cannot connect to server')) {
            this.errorMessages = ['Cannot connect to server. Please check if backend is running.'];
          } else if (error.message.includes('Invalid request data')) {
            this.errorMessages = ['Please check your registration data and try again.'];
          } else {
            this.errorMessages = [error.message || 'Registration failed. Please try again.'];
          }
          
          this.isLoading = false;
        },
        complete: () => {
          console.log('✅ Register request completed');
          this.isLoading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}