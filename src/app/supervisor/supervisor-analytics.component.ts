import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AnalyticsDashboardComponent } from '../admin/components/analytics-dashboard.component';

@Component({
  selector: 'app-supervisor-analytics',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsDashboardComponent
  ],
  template: `
    <app-analytics-dashboard
      [userRole]="'SUPERVISOR'"
      [userDepartment]="supervisorDepartment">
    </app-analytics-dashboard>
  `,
  styles: []
})
export class SupervisorAnalyticsComponent implements OnInit {
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
