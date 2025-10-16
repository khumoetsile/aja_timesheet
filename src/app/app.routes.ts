import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './shared/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Admin Routes
      { 
        path: 'admin', 
        redirectTo: '/admin/reports', 
        pathMatch: 'full'
      },
      { 
        path: 'admin/reports', 
        loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        data: { title: 'Reports', roles: ['ADMIN'] }
      },
      { 
        path: 'admin/reports/detail', 
        loadComponent: () => import('./admin/admin-report-detail.component').then(m => m.AdminReportDetailComponent),
        data: { title: 'Report Detail', roles: ['ADMIN'] }
      },
      { 
        path: 'admin/users', 
        loadComponent: () => import('./admin/admin-user-management.component').then(m => m.AdminUserManagementComponent),
        data: { title: 'User Management', roles: ['ADMIN'] }
      },
      { 
        path: 'admin/tasks', 
        loadComponent: () => import('./admin/admin-tasks.component').then(m => m.AdminTasksComponent),
        data: { title: 'Department Tasks', roles: ['ADMIN'] }
      },
      { 
        path: 'admin/departments', 
        loadComponent: () => import('./admin/components/departments-management.component').then(m => m.DepartmentsManagementComponent),
        data: { title: 'Departments Management', roles: ['ADMIN'] }
      },
      { 
        path: 'admin/users-management', 
        loadComponent: () => import('./admin/components/users-management.component').then(m => m.UsersManagementComponent),
        data: { title: 'Users Management', roles: ['ADMIN'] }
      },
          {
      path: 'admin/compliance',
      loadComponent: () => import('./admin/components/timesheet-compliance-dashboard.component').then(m => m.TimesheetComplianceDashboardComponent),
      data: { title: 'Timesheet Compliance', roles: ['ADMIN'] }
    },
    {
      path: 'admin/analytics',
      loadComponent: () => import('./admin/components/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
      data: { title: 'Analytics Dashboard', roles: ['ADMIN'] }
    },
      { 
        path: 'admin/profile', 
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'Profile', roles: ['ADMIN'] }
      },
      
      // Supervisor Routes
      { 
        path: 'supervisor/dashboard', 
        loadComponent: () => import('./supervisor/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent),
        data: { title: 'Supervisor Dashboard', roles: ['SUPERVISOR'] }
      },
      { 
        path: 'supervisor/reports', 
        loadComponent: () => import('./supervisor/supervisor-reports.component').then(m => m.SupervisorReportsComponent),
        data: { title: 'Department Reports', roles: ['SUPERVISOR'] }
      },
      { 
        path: 'supervisor/tasks', 
        loadComponent: () => import('./supervisor/supervisor-tasks.component').then(m => m.SupervisorTasksComponent),
        data: { title: 'Department Tasks', roles: ['SUPERVISOR'] }
      },
      { 
        path: 'supervisor/reports/detail', 
        loadComponent: () => import('./supervisor/supervisor-report-detail.component').then(m => m.SupervisorReportDetailComponent),
        data: { title: 'Report Detail', roles: ['SUPERVISOR'] }
      },
          {
      path: 'supervisor/compliance',
      loadComponent: () => import('./supervisor/supervisor-compliance.component').then(m => m.SupervisorComplianceComponent),
      data: { title: 'Department Compliance', roles: ['SUPERVISOR'] }
    },
    {
      path: 'supervisor/analytics',
      loadComponent: () => import('./supervisor/supervisor-analytics.component').then(m => m.SupervisorAnalyticsComponent),
      data: { title: 'Department Analytics', roles: ['SUPERVISOR'] }
    },
      { 
        path: 'supervisor/profile', 
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'Profile', roles: ['SUPERVISOR'] }
      },
      
      // Staff Routes
      { 
        path: 'dashboard', 
        loadComponent: () => import('./timesheet/components/timesheet-dashboard.component').then(m => m.TimesheetDashboardComponent),
        data: { title: 'Dashboard', roles: ['STAFF'] }
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        data: { title: 'Settings', roles: ['ADMIN','SUPERVISOR','STAFF'] }
      },
      { 
        path: 'timesheet', 
        loadChildren: () => import('./timesheet/timesheet.module').then(m => m.TimesheetModule),
        data: { roles: ['STAFF'] }
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'Profile', roles: ['STAFF'] }
      },
      
      // Default redirects based on role
      { path: '', redirectTo: '/admin/reports', pathMatch: 'full' }
    ]
  }
]; 