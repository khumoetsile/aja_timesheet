import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AdminReportDetailComponent } from '../admin/admin-report-detail.component';

@Component({
  selector: 'app-supervisor-report-detail',
  standalone: true,
  imports: [
    CommonModule,
    AdminReportDetailComponent
  ],
  template: `
    <app-admin-report-detail 
      [userRole]="'SUPERVISOR'" 
      [userDepartment]="supervisorDepartment">
    </app-admin-report-detail>
  `,
  styles: []
})
export class SupervisorReportDetailComponent implements OnInit {
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
