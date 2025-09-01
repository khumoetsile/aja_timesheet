import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TimesheetComplianceDashboardComponent } from '../admin/components/timesheet-compliance-dashboard.component';

@Component({
  selector: 'app-supervisor-compliance',
  standalone: true,
  imports: [
    CommonModule,
    TimesheetComplianceDashboardComponent
  ],
  template: `
    <app-timesheet-compliance-dashboard 
      [userRole]="'SUPERVISOR'" 
      [userDepartment]="supervisorDepartment">
    </app-timesheet-compliance-dashboard>
  `,
  styles: []
})
export class SupervisorComplianceComponent implements OnInit {
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
