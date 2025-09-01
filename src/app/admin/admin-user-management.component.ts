import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { AuthService, User } from '../services/auth.service';
import { UserDialogComponent } from './user-dialog.component';

interface UserManagementData {
  users: User[];
}

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    UserDialogComponent
  ],
  template: `
    <div class="user-management-container">
      <!-- Header -->
      <div class="management-header">
        <div class="header-content">
          <div class="header-left">
            <div class="page-title">
              <h1>User Management</h1>
              <div class="title-badge">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Administration</span>
              </div>
            </div>
            <p class="page-description">Manage supervisors and staff users for AJA Law Firm</p>
          </div>
          <div class="header-right">
            <button mat-raised-button class="add-user-btn" (click)="openAddUserDialog()">
              <mat-icon>person_add</mat-icon>
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      <!-- User Statistics -->
      <div class="stats-section">
        <div class="stat-card total-users-card">
          <div class="stat-icon-wrapper total-users">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{userStats.totalUsers}}</h3>
            <p class="stat-label">Total Users</p>
            <div class="stat-trend">
              <mat-icon class="trend-icon">trending_up</mat-icon>
              <span class="trend-text">Active</span>
            </div>
          </div>
        </div>

        <div class="stat-card supervisors-card">
          <div class="stat-icon-wrapper supervisors">
            <mat-icon>supervisor_account</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{userStats.supervisors}}</h3>
            <p class="stat-label">Supervisors</p>
            <div class="stat-trend">
              <mat-icon class="trend-icon">verified</mat-icon>
              <span class="trend-text">Active</span>
            </div>
          </div>
        </div>

        <div class="stat-card staff-card">
          <div class="stat-icon-wrapper staff">
            <mat-icon>work</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{userStats.staff}}</h3>
            <p class="stat-label">Staff Members</p>
            <div class="stat-trend">
              <mat-icon class="trend-icon">schedule</mat-icon>
              <span class="trend-text">Active</span>
            </div>
          </div>
        </div>

        <div class="stat-card active-users-card">
          <div class="stat-icon-wrapper active-users">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{userStats.activeUsers}}</h3>
            <p class="stat-label">Active Users</p>
            <div class="stat-trend">
              <mat-icon class="trend-icon">check_circle</mat-icon>
              <span class="trend-text">Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-section">
        <div class="table-card">
          <div class="table-header">
            <div class="header-left">
              <mat-icon>people</mat-icon>
              <span>User Directory</span>
            </div>
            <div class="header-right">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search Users</mat-label>
                <input matInput placeholder="Search by name, email, or department" (input)="onSearch($any($event.target).value)" />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
          </div>
          
          <div class="table-container">
            <table mat-table [dataSource]="paginatedUsers" matSort class="users-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <div class="user-avatar">
                      <mat-icon>account_circle</mat-icon>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ getUserFullName(user) }}</div>
                      <div class="user-role">{{user.role}}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let user">{{user.email}}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                <td mat-cell *matCellDef="let user">
                  <div class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                    <mat-icon>{{getRoleIcon(user.role)}}</mat-icon>
                    <span>{{user.role}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let user">{{user.department}}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let user">
                  <div class="status-cell">
                    <div class="status-indicator" [ngClass]="getStatusInfo(user).class"></div>
                    <span class="status-text">{{getStatusInfo(user).label}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Login</th>
                <td mat-cell *matCellDef="let user">{{formatDate(user.last_login)}}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <div class="action-buttons">
                    <button mat-icon-button class="action-btn edit-btn" (click)="editUser(user)" matTooltip="Edit User">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button class="action-btn toggle-btn" (click)="toggleUserStatus(user)" 
                            [matTooltip]="user.isActive ? 'Deactivate User' : 'Activate User'">
                      <mat-icon>{{user.isActive ? 'block' : 'check_circle'}}</mat-icon>
                    </button>
                    <button mat-icon-button class="action-btn reset-btn" (click)="resetPassword(user)" matTooltip="Reset Password">
                      <mat-icon>lock_reset</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
            </table>
            
            <!-- Paginator -->
            <div class="table-paginator">
              <mat-paginator 
                [length]="totalItems"
                [pageSize]="pageSize"
                [pageSizeOptions]="pageSizeOptions"
                [pageIndex]="currentPage"
                (page)="onPageChange($event)"
                showFirstLastButtons
                aria-label="Select page of users">
              </mat-paginator>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management-container {
      padding: 32px;
      background: #f8fafc;
      min-height: 100vh;
      color: #1e293b;
    }

    .management-header {
      background: white;
      color: #1e293b;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .page-title h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .title-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f1f5f9;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .page-description {
      margin: 8px 0 0 0;
      font-size: 1.125rem;
      color: #64748b;
      line-height: 1.5;
      font-weight: 400;
    }

    .add-user-btn {
      background: #dc2626;
      color: white;
      border-radius: 12px;
      padding: 16px 24px;
      font-weight: 600;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      font-size: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .add-user-btn:hover {
      background: #b91c1c;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .stat-icon-wrapper mat-icon {
      font-size: 28px;
      color: white;
    }

    .total-users { background: #1e40af; }
    .supervisors { background: #7c3aed; }
    .staff { background: #059669; }
    .active-users { background: #dc2626; }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .stat-label {
      margin: 4px 0 0 0;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }

    .trend-icon {
      font-size: 16px;
      color: #059669;
    }

    .trend-text {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .table-section {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f1f5f9;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-left mat-icon {
      color: #3b82f6;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-left span {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .search-field {
      width: 320px;
    }

    .search-field ::ng-deep .mat-form-field-outline {
      color: #cbd5e1;
    }

    .search-field ::ng-deep .mat-form-field-label {
      color: #475569;
      font-weight: 500;
    }

    .search-field ::ng-deep .mat-form-field-outline-thick {
      color: #3b82f6;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .users-table {
      width: 100%;
      color: #1e293b;
      border-collapse: separate;
      border-spacing: 0;
    }

    .users-table ::ng-deep .mat-header-cell {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      border-bottom: 2px solid #e2e8f0;
      padding: 20px 16px;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .users-table ::ng-deep .mat-cell {
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      padding: 20px 16px;
      height: 60px;
      font-size: 0.875rem;
    }

    .users-table ::ng-deep .mat-row:hover {
      background: #f8fafc;
    }

    .users-table ::ng-deep .mat-row:nth-child(even) {
      background: #fafafa;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-avatar mat-icon {
      color: white;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
      font-size: 0.875rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    .role-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .role-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .role-admin {
      background: #dc2626;
      color: white;
    }

    .role-supervisor {
      background: #1e40af;
      color: white;
    }

    .role-staff {
      background: #475569;
      color: white;
    }

    .status-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .status-indicator.active {
      background: #059669;
    }

    .status-indicator.inactive {
      background: #64748b;
    }

    .status-text {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .edit-btn {
      color: #3b82f6;
    }

    .edit-btn:hover {
      background: #eff6ff;
      color: #1d4ed8;
      transform: scale(1.05);
    }

    .toggle-btn {
      color: #dc2626;
    }

    .toggle-btn:hover {
      background: #fef2f2;
      color: #b91c1c;
      transform: scale(1.05);
    }

    .reset-btn {
      color: #64748b;
    }

    .reset-btn:hover {
      background: #f8fafc;
      color: #475569;
      transform: scale(1.05);
    }

    .table-paginator {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 2px solid #f1f5f9;
    }

    /* Paginator styling */
    .table-paginator ::ng-deep .mat-mdc-paginator {
      background: transparent;
    }

    .table-paginator ::ng-deep .mat-mdc-paginator-page-size {
      color: #475569;
    }

    .table-paginator ::ng-deep .mat-mdc-paginator-range-label {
      color: #64748b;
      font-weight: 500;
    }

    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-previous,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-next,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-first,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-last {
      color: #3b82f6;
    }

    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-previous:hover,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-next:hover,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-first:hover,
    .table-paginator ::ng-deep .mat-mdc-paginator-navigation-last:hover {
      background: #eff6ff;
    }

    /* Compact spacing overrides to reduce whitespace */
    .user-management-container { padding: 24px; }
    .management-header { padding: 24px; margin-bottom: 24px; }
    .page-description { font-size: 1rem; }
    .stats-section { gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 20px; }
    .stat-number { font-size: 2rem; }
    .table-section { padding: 24px; }
    .table-header { margin-bottom: 16px; padding-bottom: 12px; }
    .header-left span { font-size: 1.25rem; }
    .users-table ::ng-deep .mat-header-cell { padding: 14px 12px; }
    .users-table ::ng-deep .mat-cell { padding: 12px; height: 48px; }
    .user-info { gap: 12px; }
    .user-avatar { width: 36px; height: 36px; }
    .user-avatar mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .action-btn { width: 32px; height: 32px; }
    .table-paginator { margin-top: 16px; padding-top: 12px; }

    @media (max-width: 1440px) {
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 960px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 24px;
      }

      .table-header {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .search-field {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .user-management-container {
        padding: 20px;
      }

      .management-header {
        padding: 24px;
      }

      .page-title h1 {
        font-size: 2rem;
      }

      .stats-section {
        gap: 16px;
      }

      .stat-card {
        padding: 24px 20px;
      }

      .table-section {
        padding: 24px;
      }
    }
  `]
})
export class AdminUserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats = {
    totalUsers: 0,
    supervisors: 0,
    staff: 0,
    activeUsers: 0
  };
  userColumns: string[] = ['name', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'];
  
  // Pagination properties
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalItems = 0;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.totalItems = this.filteredUsers.length;
        this.calculateUserStats();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  // Get paginated users
  get paginatedUsers(): User[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  onSearch(term: string): void {
    const q = (term || '').trim().toLowerCase();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => {
        const name = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const department = (u.department || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        return name.includes(q) || email.includes(q) || department.includes(q) || role.includes(q);
      });
    }
    this.totalItems = this.filteredUsers.length;
    this.currentPage = 0;
  }

  // Handle page changes
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  calculateUserStats(): void {
    this.userStats.totalUsers = this.users.length;
    this.userStats.supervisors = this.users.filter(u => u.role === 'SUPERVISOR').length;
    this.userStats.staff = this.users.filter(u => u.role === 'STAFF').length;
    this.userStats.activeUsers = this.users.filter(u => u.isActive).length;
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'admin_panel_settings';
      case 'SUPERVISOR':
        return 'supervisor_account';
      case 'STAFF':
        return 'work';
      default:
        return 'person';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleDateString();
  }

  // Get status display info
  getStatusInfo(user: User): { label: string; class: string; icon: string } {
    const isActive = user.isActive !== undefined ? user.isActive : user.is_active !== undefined ? user.is_active : true;
    
    return {
      label: isActive ? 'Active' : 'Inactive',
      class: isActive ? 'status-active' : 'status-inactive',
      icon: isActive ? 'check_circle' : 'cancel'
    };
  }

  getUserFullName(user: User): string {
    const first = (user.firstName || (user as any).first_name || '').trim();
    const last = (user.lastName || (user as any).last_name || '').trim();
    const full = `${first} ${last}`.trim();
    return full || (user.email || '');
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'add' },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'edit', user },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.authService.toggleUserStatus(user.id).subscribe({
      next: () => {
        const action = user.isActive ? 'deactivated' : 'activated';
        this.snackBar.open(`User ${action} successfully!`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  resetPassword(user: User): void {
    this.snackBar.open('Password reset functionality coming soon!', 'Close', { duration: 3000 });
  }
} 