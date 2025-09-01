import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route has role requirements
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        this.authService.hasRole(role as 'ADMIN' | 'SUPERVISOR' | 'STAFF')
      );
      
      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user role
        this.redirectToAppropriateDashboard(currentUser.role);
        return false;
      }
    }

    return true;
  }

  private redirectToAppropriateDashboard(userRole: string): void {
    switch (userRole) {
      case 'ADMIN':
        this.router.navigate(['/admin/reports']);
        break;
      case 'SUPERVISOR':
        this.router.navigate(['/supervisor/dashboard']);
        break;
      case 'STAFF':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
} 