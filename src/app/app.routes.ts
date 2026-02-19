import { Routes } from "@angular/router";
import { AdminLayout } from "./features/admin/admin-layout/admin-layout";
import { AdminDashboard } from "./features/admin/pages/dashboard/admin-dashboard/admin-dashboard";
import { AdminLogin } from "./features/admin/pages/login/admin-login/admin-login";
import { AdminRegister } from "./features/admin/pages/register/admin-register/admin-register";
import { ForgotPassword } from "./features/auth/pages/forgot-password/forgot-password";
import { Login } from "./features/auth/pages/login/login";
import { Register } from "./features/auth/pages/register/register";
import { ResetPassword } from "./features/auth/pages/reset-password/reset-password";
import { Home } from "./features/home/home";
import { AdminNoAuthGuard, AdminAuthGuard } from "./shared/guards/admin-auth.guard";
import { NoAuthGuard } from "./shared/guards/auth.guard";
import { AdminList } from "./features/admin/admin-list/admin-list";

export const routes: Routes = [
  // ===== Public Routes =====
  { path: '', component: Home, data: { title: 'Home' } },
  
  // ===== User Auth Routes =====
  { path: 'login', component: Login, canActivate: [NoAuthGuard], data: { title: 'Login' } },
  //{ path: 'register', component: Register, canActivate: [NoAuthGuard], data: { title: 'Register' } },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [NoAuthGuard], data: { title: 'Forgot Password' } },
  { path: 'reset-password', component: ResetPassword, canActivate: [NoAuthGuard], data: { title: 'Reset Password' } },
  
  // ===== Admin Routes =====
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      // Public Admin Routes (No Auth)
      { path: 'login', component: AdminLogin, canActivate: [AdminNoAuthGuard],data: { title: 'Admin Login' } },
     { path: 'register', component: AdminRegister },
      // Protected Admin Routes (Require Auth)
      { path: 'dashboard', component: AdminDashboard, canActivate: [AdminAuthGuard],data: { title: 'Admin Dashboard' } },
    { path: 'admins', component: AdminList, canActivate: [AdminAuthGuard],data: { roles: ['SuperAdmin'] } },      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // ===== Wildcard =====
  { path: '**', redirectTo: '' }
];

console.log('🚀 Routes loaded:', routes.map(r => ({ 
  path: r.path, 
  component: r.component?.name,
  children: r.children?.map(c => ({ path: c.path, component: c.component?.name }))
})));