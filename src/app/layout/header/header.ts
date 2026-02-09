import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  userEmail: string = '';
  userName: string = '';
  userInitial: string = 'U';
  
  private authStatusSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // الاشتراك في حالة المصادقة
    this.authStatusSubscription = this.authService.getAuthStatus().subscribe(
      (status: boolean) => {
        this.isLoggedIn = status;
        if (status) {
          this.loadUserInfo();
        } else {
          this.clearUserInfo();
        }
      }
    );

    // الاشتراك في بيانات المستخدم
    this.userSubscription = this.authService.getUser().subscribe(
      (user) => {
        if (user) {
          this.userName = user.name || 'User';
          this.userEmail = user.email || '';
          this.userInitial = this.getUserInitial();
        } else {
          this.clearUserInfo();
        }
      }
    );

    // تحميل البيانات الأولية
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    // تنظيف الاشتراكات لمنع تسرب الذاكرة
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadInitialData(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadUserInfo();
    }
  }

  private loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
      this.userInitial = this.getUserInitial();
    }
  }

  private clearUserInfo(): void {
    this.userName = '';
    this.userEmail = '';
    this.userInitial = 'U';
  }

  private getUserInitial(): string {
    if (this.userName && this.userName.length > 0) {
      return this.userName.charAt(0).toUpperCase();
    }
    return 'U';
  }
}