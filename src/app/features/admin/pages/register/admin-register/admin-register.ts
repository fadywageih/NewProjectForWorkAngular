import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AdminCreateRequest, AdminResult } from "../../../../../core/models/admin.models";
import { AdminService } from "../../../services/admin.service";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-admin-register',
  standalone: true, 
  templateUrl: './admin-register.html',
  styleUrls: ['./admin-register.css'],
    imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
})
export class AdminRegister implements OnInit {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  currentAdmin: AdminResult | null = null;
  isSuperAdmin = false;
  authorizationError = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    this.currentAdmin = this.adminService.getCurrentAdmin();
    
    if (!this.currentAdmin) {
      // Not logged in, redirect to login
      this.router.navigate(['/admin/login']);
      return;
    }

    // Check if user is SuperAdmin
    if (this.currentAdmin.role !== 'SuperAdmin') {
      this.authorizationError = true;
      this.errorMessage = 'Only SuperAdmin can create new admin accounts. Please contact your administrator.';
    } else {
      this.isSuperAdmin = true;
    }

    // Monitor for changes in authentication
    this.adminService.getAdminObservable().subscribe(admin => {
      this.currentAdmin = admin;
      if (!admin || admin.role !== 'SuperAdmin') {
        this.authorizationError = true;
        this.isSuperAdmin = false;
        this.errorMessage = 'Only SuperAdmin can create new admin accounts. Please contact your administrator.';
      } else {
        this.isSuperAdmin = true;
        this.authorizationError = false;
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (!this.isSuperAdmin) {
      this.errorMessage = 'Only SuperAdmin can create new admin accounts.';
      return;
    }

    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Check if token exists before submitting
    const token = localStorage.getItem('admin_token');
    console.log('🔑 Token Check Before Submit:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      adminData: this.adminService.getCurrentAdmin()
    });

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.disableFormControls(true);

    const registerRequest: AdminCreateRequest = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName
    };

    console.log('📤 Submitting registration request:', registerRequest);

    this.adminService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('✅ Admin registration successful:', response);
        this.successMessage = 'Admin account created successfully! Redirecting...';
        this.registerForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.disableFormControls(false);
        
        if (error.status === 403) {
          this.authorizationError = true;
          this.errorMessage = 'Access Denied: Only SuperAdmin can create new admin accounts. Make sure you are logged in as SuperAdmin.';
        } else if (error.status === 401) {
          this.errorMessage = 'Your session has expired. Please login again.';
          setTimeout(() => this.router.navigate(['/admin/login']), 2000);
        } else if (error.error?.error?.includes('already exists')) {
          this.errorMessage = 'An admin with this email already exists.';
        } else {
          this.errorMessage = error.error?.error || error.message || 'Registration failed. Please try again.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.disableFormControls(false);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private disableFormControls(disable: boolean): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (disable) {
        control?.disable();
      } else {
        control?.enable();
      }
    });
  }

  // Getter methods for form controls
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
