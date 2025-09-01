import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AdminDashboardComponent } from '../admin/admin-dashboard.component';

@Component({
  selector: 'app-supervisor-reports',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent
  ],
  template: `
    <app-admin-dashboard 
      [userRole]="'SUPERVISOR'" 
      [userDepartment]="supervisorDepartment">
    </app-admin-dashboard>
  `,
  styles: []
})
export class SupervisorReportsComponent implements OnInit {
  supervisorDepartment: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get the current user's department
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.department) {
      this.supervisorDepartment = currentUser.department;
    }
  }
}
