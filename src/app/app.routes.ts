import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/pages/reset-password/reset-password';
import { NoAuthGuard } from './shared/guards/auth.guard';
export const routes: Routes = [
  { path: '', component: Home,data: { title: 'Home' }},
  { path: 'login', component: Login,canActivate: [NoAuthGuard],data: { title: 'Login' }},
  { path: 'register', component: Register,canActivate: [NoAuthGuard],data: { title: 'Register' }},
  { path: 'forgot-password', component: ForgotPassword,canActivate: [NoAuthGuard],data: { title: 'Forgot Password' }},
  { path: 'reset-password', component: ResetPassword,canActivate: [NoAuthGuard],data: { title: 'Reset Password' }},
  { path: '**', redirectTo: '' }
];

console.log('Routes loaded:', routes.map(r => ({ path: r.path, component: r.component?.name })));