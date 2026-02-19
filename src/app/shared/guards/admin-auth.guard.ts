import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable, map, catchError, of } from "rxjs";
import { AdminService } from "../../features/admin/services/admin.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
  if (!this.adminService.isAuthenticated()) {
    this.router.navigate(['/admin/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Array<string>;
  const currentAdmin = this.adminService.getCurrentAdmin();
  
  if (requiredRoles && currentAdmin) {
    const userRole = 'Admin'; 
    
    if (!requiredRoles.includes(userRole)) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
  }

  return true;
}
}

@Injectable({
  providedIn: 'root'
})
export class AdminNoAuthGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.adminService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}