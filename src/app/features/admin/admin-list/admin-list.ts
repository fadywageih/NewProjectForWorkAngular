import { Component, OnInit } from "@angular/core";
import { AdminResult } from "../../../core/models/admin.models";
import { AdminService } from "../services/admin.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
@Component({
  selector: 'app-admin-list',
    standalone: true, 
  templateUrl: './admin-list.html',
  styleUrls: ['./admin-list.css'],
    imports: [
    CommonModule,  
    RouterModule     
  ],
})
export class AdminList implements OnInit {
  admins: AdminResult[] = [];
  loading = true;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load admins';
        this.loading = false;
      }
    });
  }
}