import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="header-content">
          <button mat-icon-button (click)="goBack()" class="back-button" matTooltip="Go Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1>Profile</h1>
            <p>View your account information</p>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="profile-content" *ngIf="currentUser">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <mat-icon>person</mat-icon>
            </div>
            <div class="status-indicator" [class.active]="isUserActive()">
              <mat-icon>{{ isUserActive() ? 'check_circle' : 'cancel' }}</mat-icon>
            </div>
          </div>
          
          <div class="profile-info">
            <h2>{{ getUserFullName() }}</h2>
            <p class="user-email">{{ currentUser.email }}</p>
            <div class="user-role">
              <mat-chip [class]="'role-' + currentUser.role.toLowerCase()" class="role-chip">
                {{ currentUser.role }}
              </mat-chip>
            </div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="details-section">
          <div class="details-card">
            <div class="card-header">
              <h3>Account Details</h3>
              <mat-icon>account_circle</mat-icon>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">
                  <mat-icon>person</mat-icon>
                  <span>Full Name</span>
                </div>
                <div class="detail-value">{{ getUserFullName() }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <mat-icon>email</mat-icon>
                  <span>Email Address</span>
                </div>
                <div class="detail-value">{{ currentUser.email }}</div>
              </div>

              <div class="detail-item" *ngIf="getUserDepartment()">
                <div class="detail-label">
                  <mat-icon>business</mat-icon>
                  <span>Department</span>
                </div>
                <div class="detail-value">{{ getUserDepartment() }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <mat-icon>security</mat-icon>
                  <span>Role</span>
                </div>
                <div class="detail-value">
                  <mat-chip [class]="'role-' + currentUser.role.toLowerCase()" class="role-chip-small">
                    {{ getRoleDisplayName() }}
                  </mat-chip>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <mat-icon>verified_user</mat-icon>
                  <span>Account Status</span>
                </div>
                <div class="detail-value">
                  <mat-chip [class]="isUserActive() ? 'status-active' : 'status-inactive'" class="status-chip">
                    {{ isUserActive() ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </div>
              </div>

              <div class="detail-item" *ngIf="getUserCreatedDate()">
                <div class="detail-label">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Member Since</span>
                </div>
                <div class="detail-value">{{ getUserCreatedDate() | date:'mediumDate' }}</div>
              </div>
            </div>
          </div>

          <!-- Activity Section -->
          <div class="activity-card">
            <div class="card-header">
              <h3>Recent Activity</h3>
              <mat-icon>history</mat-icon>
            </div>
            
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">
                  <mat-icon>login</mat-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">Last Login</div>
                  <div class="activity-time">
                    {{ getUserLastLoginFormatted() }}
                  </div>
                </div>
              </div>

              <div class="activity-item" *ngIf="getUserUpdatedDate()">
                <div class="activity-icon">
                  <mat-icon>update</mat-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">Profile Updated</div>
                  <div class="activity-time">
                    {{ getUserUpdatedDate() | date:'medium' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="actions-section">
          <div class="actions-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
              <mat-icon>settings</mat-icon>
            </div>
            
            <div class="actions-grid">
              <button mat-stroked-button class="action-btn" (click)="goToDashboard()" matTooltip="Go to Dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Go to Dashboard</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="goToTimesheet()" matTooltip="View Timesheet">
                <mat-icon>schedule</mat-icon>
                <span>View Timesheet</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="exportProfile()" matTooltip="Export Profile Data">
                <mat-icon>download</mat-icon>
                <span>Export Profile</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="debugUserData()" matTooltip="Debug User Data (Check Console)">
                <mat-icon>bug_report</mat-icon>
                <span>Debug Data</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="logout()" matTooltip="Sign Out">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="!currentUser && !error">
        <div class="loading-spinner">
          <mat-icon>hourglass_empty</mat-icon>
        </div>
        <p>Loading profile...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <div class="error-icon">
          <mat-icon>error_outline</mat-icon>
        </div>
        <h3>Unable to Load Profile</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="retryLoad()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: var(--spacing-md);
      background: var(--aja-surface-2);
      min-height: 100vh;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: var(--spacing-xl);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .back-button {
      color: var(--aja-charcoal);
    }

    .header-text h1 {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: 1.75rem;
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
    }

    .header-text p {
      margin: 0;
      color: var(--aja-grey);
      font-size: 14px;
    }

    .profile-content {
      display: grid;
      gap: var(--spacing-xl);
    }

    .profile-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      padding: var(--spacing-xl);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .profile-avatar {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: var(--aja-slate);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .avatar-circle mat-icon {
      color: var(--aja-white);
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .status-indicator {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--aja-white);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      border: 2px solid var(--aja-white);
    }

    .status-indicator.active mat-icon {
      color: #10b981;
    }

    .status-indicator:not(.active) mat-icon {
      color: #ef4444;
    }

    .status-indicator mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .profile-info {
      flex: 1;
    }

    .profile-info h2 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: 1.5rem;
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
    }

    .user-email {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--aja-grey);
      font-size: 16px;
    }

    .user-role {
      margin-bottom: var(--spacing-md);
    }

    .role-chip {
      font-size: 12px !important;
      font-weight: 600 !important;
      padding: 8px 16px !important;
      border-radius: 20px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      min-height: 32px !important;
      line-height: 1.2 !important;
    }

    .role-admin {
      background: var(--aja-slate) !important;
      color: var(--aja-white) !important;
    }

    .role-supervisor {
      background: var(--aja-light-yellow) !important;
      color: var(--aja-charcoal) !important;
    }

    .role-staff {
      background: var(--aja-light-green) !important;
      color: var(--aja-charcoal) !important;
    }

    .details-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-xl);
    }

    .details-card,
    .activity-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--aja-grey-lighter);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--aja-surface-2);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
    }

    .card-header mat-icon {
      color: var(--aja-grey);
    }

    .details-grid {
      padding: var(--spacing-lg);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--aja-grey);
      font-size: 14px;
      font-weight: var(--font-weight-medium);
    }

    .detail-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .detail-value {
      color: var(--aja-charcoal);
      font-size: 16px;
      font-weight: var(--font-weight-medium);
    }

    .role-chip-small {
      font-size: 11px !important;
      font-weight: 600 !important;
      padding: 4px 12px !important;
      border-radius: 16px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      min-height: 24px !important;
      line-height: 1.2 !important;
    }

    .status-chip {
      font-size: 12px !important;
      font-weight: 600 !important;
      padding: 6px 12px !important;
      border-radius: 16px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      min-height: 24px !important;
      line-height: 1.2 !important;
    }

    .status-active {
      background: var(--aja-light-green) !important;
      color: var(--aja-charcoal) !important;
    }

    .status-inactive {
      background: var(--aja-orange) !important;
      color: var(--aja-white) !important;
    }

    .activity-list {
      padding: var(--spacing-lg);
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--aja-grey-lighter);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--aja-surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon mat-icon {
      color: var(--aja-grey);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: var(--font-weight-medium);
      color: var(--aja-charcoal);
      font-size: 14px;
      margin-bottom: var(--spacing-xs);
    }

    .activity-time {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .actions-section {
      margin-top: var(--spacing-xl);
    }

    .actions-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .actions-grid {
      padding: var(--spacing-lg);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s ease;
      height: 48px;
    }

    .action-btn:hover {
      background: var(--aja-surface-2);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .action-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--aja-grey);
    }

    .loading-spinner {
      margin-bottom: var(--spacing-md);
    }

    .loading-spinner mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      animation: spin 2s linear infinite;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      text-align: center;
      color: var(--aja-grey);
    }

    .error-icon {
      margin-bottom: var(--spacing-md);
    }

    .error-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ef4444;
    }

    .error-state h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--aja-charcoal);
      font-size: 1.25rem;
      font-weight: var(--font-weight-semibold);
    }

    .error-state p {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--aja-grey);
      font-size: 14px;
      max-width: 400px;
    }

    .error-state button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .profile-card {
        flex-direction: column;
        text-align: center;
      }

      .details-section {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .profile-container {
        padding: var(--spacing-sm);
      }

      .profile-header {
        margin-bottom: var(--spacing-lg);
      }

      .header-text h1 {
        font-size: 1.5rem;
      }

      .avatar-circle {
        width: 100px;
        height: 100px;
      }

      .avatar-circle mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }

    @media (max-width: 480px) {
      .profile-container {
        padding: var(--spacing-xs);
      }

      .profile-card {
        padding: var(--spacing-lg);
      }

      .details-card,
      .activity-card,
      .actions-card {
        border-radius: var(--radius-md);
      }

      .card-header {
        padding: var(--spacing-md);
      }

      .details-grid {
        padding: var(--spacing-md);
        gap: var(--spacing-md);
      }

      .actions-grid {
        padding: var(--spacing-md);
        gap: var(--spacing-sm);
      }

      .action-btn {
        height: 44px;
        font-size: 14px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.error = 'User not found. Please log in again.';
      this.router.navigate(['/login']);
      return;
    }
  }

  goBack() {
    this.navigateToAppropriateDashboard();
  }

  goToDashboard() {
    this.navigateToAppropriateDashboard();
  }

  private navigateToAppropriateDashboard() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Get the current route to determine where we came from
    const currentRoute = this.router.url;
    
    // If we're already in a dashboard route, go to the appropriate one
    if (currentRoute.includes('/admin/')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (currentRoute.includes('/supervisor/')) {
      this.router.navigate(['/supervisor/dashboard']);
    } else if (currentRoute.includes('/dashboard')) {
      this.router.navigate(['/dashboard']);
    } else {
      // Default navigation based on user role
      switch (this.currentUser.role) {
        case 'ADMIN':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'SUPERVISOR':
          this.router.navigate(['/supervisor/dashboard']);
          break;
        case 'STAFF':
          this.router.navigate(['/dashboard']);
          break;
        default:
          this.router.navigate(['/dashboard']);
          break;
      }
    }
  }

  goToTimesheet() {
    // Navigate to timesheet based on user role
    if (this.currentUser?.role === 'ADMIN') {
      this.router.navigate(['/admin/timesheet']);
    } else if (this.currentUser?.role === 'SUPERVISOR') {
      this.router.navigate(['/supervisor/timesheet']);
    } else {
      this.router.navigate(['/timesheet']);
    }
  }

  exportProfile() {
    if (!this.currentUser) {
      this.snackBar.open('No user data available to export', 'Close', { duration: 3000 });
      return;
    }

    try {
      // Create profile data object
      const profileData = {
        fullName: this.getUserFullName(),
        email: this.currentUser.email,
        role: this.currentUser.role,
        department: this.getUserDepartment() || 'Not specified',
        accountStatus: this.isUserActive() ? 'Active' : 'Inactive',
        memberSince: this.getUserCreatedDate()?.toLocaleDateString() || 'Unknown',
        lastLogin: this.getUserLastLogin(),
        profileUpdated: this.getUserUpdatedDate()?.toLocaleDateString() || 'Unknown',
        exportDate: new Date().toLocaleString()
      };

      // Convert to JSON string
      const dataStr = JSON.stringify(profileData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile_${this.currentUser.email}_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Profile exported successfully', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error exporting profile:', error);
      this.snackBar.open('Failed to export profile', 'Close', { duration: 3000 });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isUserActive(): boolean {
    // Check both camelCase and snake_case properties
    return this.currentUser?.isActive || this.currentUser?.is_active || false;
  }

  // Debug method to help troubleshoot user data
  debugUserData(): void {
    if (this.currentUser) {
      console.log('🔍 User Data Debug:');
      console.log('Full user object:', this.currentUser);
      console.log('--- Name Properties ---');
      console.log('firstName (camelCase):', this.currentUser.firstName);
      console.log('lastName (camelCase):', this.currentUser.lastName);
      console.log('first_name (snake_case):', this.currentUser.first_name);
      console.log('last_name (snake_case):', this.currentUser.last_name);
      console.log('--- Status Properties ---');
      console.log('isActive (camelCase):', this.currentUser.isActive);
      console.log('is_active (snake_case):', this.currentUser.is_active);
      console.log('--- Other Properties ---');
      console.log('Role:', this.currentUser.role);
      console.log('Department:', this.currentUser.department);
      console.log('Email:', this.currentUser.email);
      console.log('Created At:', this.currentUser.createdAt);
      console.log('Updated At:', this.currentUser.updatedAt);
      console.log('Last Login:', this.currentUser.lastLogin);
      console.log('--- Computed Values ---');
      console.log('Full Name (computed):', this.getUserFullName());
      console.log('Is Active (computed):', this.isUserActive());
    } else {
      console.log('❌ No user data available');
    }
  }

  getUserFullName(): string {
    // Check both camelCase and snake_case properties
    const firstName = this.currentUser?.firstName || this.currentUser?.first_name || '';
    const lastName = this.currentUser?.lastName || this.currentUser?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // If no name found, return email as fallback
    return fullName || this.currentUser?.email || 'Unknown User';
  }

  getUserDepartment(): string | null {
    return this.currentUser?.department || null;
  }

  getUserCreatedDate(): Date | null {
    return this.currentUser?.createdAt ? new Date(this.currentUser.createdAt) : null;
  }

  getUserLastLogin(): string {
    return this.currentUser?.lastLogin ? new Date(this.currentUser.lastLogin).toLocaleDateString() : 'Never';
  }

  getUserUpdatedDate(): Date | null {
    return this.currentUser?.updatedAt ? new Date(this.currentUser.updatedAt) : null;
  }

  getUserLastLoginFormatted(): string {
    if (!this.currentUser?.lastLogin) return 'Never';
    
    try {
      const lastLogin = new Date(this.currentUser.lastLogin);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
      
      return lastLogin.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case 'ADMIN': return 'Administrator';
      case 'SUPERVISOR': return 'Supervisor';
      case 'STAFF': return 'Staff Member';
      default: return this.currentUser.role;
    }
  }

  retryLoad() {
    this.error = null;
    this.loadProfile();
  }
} 