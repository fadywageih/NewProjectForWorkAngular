import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { AdminResult } from "../../../../../core/models/admin.models";
import { AdminService } from "../../../services/admin.service";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: []
})
export class AdminDashboard implements OnInit {
  currentAdmin: AdminResult | null = null;
  allAdmins: AdminResult[] = [];
  loading = true;
  adminsLoading = false;
  isSuperAdmin = false;
  stats = {
    totalAdmins: 0,
    totalProducts: 127,
    recentActivities: [] as Activity[]
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
    this.loadDashboardStats();
  }

  loadAdminData(): void {
    this.currentAdmin = this.adminService.getCurrentAdmin();
    
    this.adminService.getAdminObservable().subscribe(admin => {
      this.currentAdmin = admin;
      if (admin?.role === 'SuperAdmin') {
        this.isSuperAdmin = true;
        this.loadAllAdmins();
      }
    });
    
    this.loading = false;
  }
  loadAllAdmins(): void {
    if (!this.isSuperAdmin) return;
    
    this.adminsLoading = true;
    this.adminService.getAllAdmins().subscribe({
      next: (admins) => {
        this.allAdmins = admins;
        this.stats.totalAdmins = admins.length;
        this.adminsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load admins:', error);
        this.adminsLoading = false;
      }
    });
  }
  loadDashboardStats(): void {
    this.stats = {
      totalAdmins: 0,
      totalProducts: 127,
      recentActivities: [
        {
          id: '1',
          user: 'John Doe',
          action: 'Added new product',
          target: 'iPhone 14 Pro',
          time: '5 minutes ago',
          type: 'add'
        },
        {
          id: '2',
          user: 'Jane Smith',
          action: 'Created new admin',
          target: 'Ahmed Hassan',
          time: '2 hours ago',
          type: 'user'
        }
      ]
    };
  }
  openAddAdmin(): void {
    console.log('Navigating to admin register...');
    this.router.navigate(['/admin/register']);
  }

  logout(): void {
    const adminId = this.currentAdmin?.id;
    if (adminId) {
      this.adminService.logout(adminId).subscribe({
        next: () => this.router.navigate(['/admin/login']),
        error: () => this.router.navigate(['/admin/login'])
      });
    }
  }
}
interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'add' | 'update' | 'delete' | 'user';
}