import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { AdminLoginRequest } from "../../../../../core/models/admin.models";
import { AdminService } from "../../../services/admin.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-admin-login',
   standalone: true,
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
    imports: [
    CommonModule,   
    ReactiveFormsModule,
    RouterModule     
  ],
})
export class AdminLogin implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    
    // Redirect if already logged in
    if (this.adminService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginRequest: AdminLoginRequest = this.loginForm.value;

    this.adminService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}