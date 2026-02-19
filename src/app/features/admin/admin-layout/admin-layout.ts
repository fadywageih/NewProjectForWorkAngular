import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AdminService } from "../services/admin.service";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayout {
  isAuthenticated = false;
  currentAdmin: any = null;
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    this.adminService.getAuthStatus().subscribe(status => {
      this.isAuthenticated = status;
      if (status) {
        this.currentAdmin = this.adminService.getCurrentAdmin();
      }
    });
  }
  logout(event: Event): void {
    event.preventDefault();
    const admin = this.adminService.getCurrentAdmin();
    if (admin?.id) {
      this.adminService.logout(admin.id).subscribe({
        next: () => this.router.navigate(['/admin/login']),
        error: () => this.router.navigate(['/admin/login'])
      });
    }
  }
}