import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { TimesheetMonitoringService, TimesheetCompliance, ComplianceSummary } from '../services/timesheet-monitoring.service';
import { ComplianceNotificationService } from '../services/compliance-notification.service';

@Component({
  selector: 'app-timesheet-compliance-dashboard',
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
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    FormsModule
  ],
  template: `
    <div class="compliance-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1>{{ dashboardTitle }}</h1>
            <p>{{ dashboardSubtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Header with Summary Cards -->
      <div class="summary-section">
        <div class="summary-card total-users">
          <div class="card-icon">
            <mat-icon>group</mat-icon>
          </div>
          <div class="card-content">
            <h3>{{ (summary$ | async)?.totalUsers || 0 }}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div class="summary-card compliant-users">
          <div class="card-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="card-content">
            <h3>{{ (summary$ | async)?.compliantUsers || 0 }}</h3>
            <p>Compliant</p>
            <span class="compliance-rate">{{ (summary$ | async)?.overallComplianceRate || 0 | number:'1.0-0' }}%</span>
          </div>
        </div>

        <div class="summary-card warning-users">
          <div class="card-icon">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="card-content">
            <h3>{{ (summary$ | async)?.warningUsers || 0 }}</h3>
            <p>Warning</p>
            <span class="status-badge warning">8+ hours</span>
          </div>
        </div>

        <div class="summary-card critical-users">
          <div class="card-icon">
            <mat-icon>error</mat-icon>
          </div>
          <div class="card-content">
            <h3>{{ (summary$ | async)?.criticalUsers || 0 }}</h3>
            <p>Critical</p>
            <span class="status-badge critical">24+ hours</span>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="filters-section">
        

        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field" *ngIf="isAdmin">
            <mat-label>Department</mat-label>
            <mat-select [(value)]="selectedDepartment" (selectionChange)="applyFilters()">
              <mat-option value="">All Departments</mat-option>
              <mat-option *ngFor="let dept of departments" [value]="dept">{{ dept }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="compliant">Compliant</mat-option>
              <mat-option value="warning">Warning</mat-option>
              <mat-option value="critical">Critical</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Search Users</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by name or email...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="refreshData()" [disabled]="isLoading">
            <mat-icon *ngIf="!isLoading">refresh</mat-icon>
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            {{ isLoading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Compliance Table -->
      <div class="table-section">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading compliance data...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && (compliance$ | async)?.length === 0" class="empty-state">
          <mat-icon class="empty-icon">info</mat-icon>
          <h3>No compliance data available</h3>
          <p>Compliance data will be loaded automatically. If you continue to see this message, try refreshing the page.</p>
        </div>

        <!-- Data Table -->
        <div *ngIf="!isLoading && hasComplianceData">
          <div class="table-header">
            <h3>{{ isAdmin ? 'Timesheet Compliance Status' : 'Department Compliance Status' }}</h3>
          <div class="table-actions">
            <button mat-stroked-button (click)="exportComplianceReport()" [disabled]="filteredCompliance.length === 0">
              <mat-icon>download</mat-icon>
              Export Report
            </button>
            <button mat-stroked-button (click)="sendBulkNotifications()" [disabled]="criticalUsers.length === 0">
              <mat-icon>notifications</mat-icon>
              Notify Critical Users
            </button>
          </div>
        </div>

        <div class="table-container" *ngIf="!isLoading; else loadingSpinner">
          <table mat-table [dataSource]="paginatedCompliance" matSort class="compliance-table">
            <!-- User Name Column -->
            <ng-container matColumnDef="userName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Staff Member</th>
              <td mat-cell *matCellDef="let user">
                                 <div class="user-info">
                   <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                   <div class="user-email">{{ user.userEmail }}</div>
                   <div class="user-department">{{ user.department }}</div>
                 </div>
              </td>
            </ng-container>

            <!-- Last Entry Column -->
            <ng-container matColumnDef="lastEntry">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Entry</th>
              <td mat-cell *matCellDef="let user">
                <div class="last-entry-info">
                  <div class="entry-date" *ngIf="user.lastEntryDate; else noEntry">
                    {{ user.lastEntryDate | date:'MMM dd, yyyy' }}
                  </div>
                  <div class="entry-time" *ngIf="user.lastEntryTime">
                    {{ user.lastEntryTime }}
                  </div>
                  <ng-template #noEntry>
                    <span class="no-entry">No entries</span>
                  </ng-template>
                </div>
              </td>
            </ng-container>



            <!-- Compliance Status Column -->
            <ng-container matColumnDef="complianceStatus">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let user">
                <div class="status-container">
                  <div [class]="'status-pill ' + user.complianceStatus">
                    {{ getStatusDisplayName(user.complianceStatus) }}
                  </div>
                  <div class="compliance-details" *ngIf="user.complianceStatus !== 'compliant'">
                    <div class="detail-item" *ngIf="user.businessHoursMissed > 0">
                      <mat-icon class="detail-icon">schedule</mat-icon>
                      {{ user.businessHoursMissed }} business hours missed
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Next Expected Entry Column -->
            <ng-container matColumnDef="nextExpectedEntry">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Next Expected Entry</th>
              <td mat-cell *matCellDef="let user">
                <div class="next-entry-info">
                  <div class="next-entry-date">
                    {{ user.nextExpectedEntry | date:'MMM dd, yyyy' }}
                  </div>
                  <div class="next-entry-time">
                    {{ user.nextExpectedEntry | date:'HH:mm' }}
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <div class="action-buttons">
                  <button mat-icon-button 
                          matTooltip="Send reminder notification"
                          (click)="sendNotification(user)"
                          [disabled]="user.complianceStatus === 'compliant'">
                    <mat-icon>notifications</mat-icon>
                  </button>
                  <button mat-icon-button 
                          matTooltip="View user profile"
                          (click)="viewUserProfile(user)">
                    <mat-icon>person</mat-icon>
                  </button>
                  <button mat-icon-button 
                          matTooltip="View timesheet entries"
                          (click)="viewTimesheetEntries(user)">
                    <mat-icon>schedule</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- Pagination -->
          <mat-paginator 
            [length]="filteredCompliance.length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageIndex]="currentPage"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      </div>

      <!-- Business Hours Info -->
      <div class="business-hours-info">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>schedule</mat-icon>
              How Compliance Works
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="compliance-rules">
              <div class="rule-item">
                <mat-icon class="rule-icon">check_circle</mat-icon>
                <div class="rule-text">
                  <strong>Compliant:</strong> Submitted timesheet within 8 business hours
                </div>
              </div>
              <div class="rule-item">
                <mat-icon class="rule-icon">warning</mat-icon>
                <div class="rule-text">
                  <strong>Warning:</strong> No timesheet for 8+ business hours
                </div>
              </div>
              <div class="rule-item">
                <mat-icon class="rule-icon">error</mat-icon>
                <div class="rule-text">
                  <strong>Critical:</strong> No timesheet for 16+ business hours (2 business days)
                </div>
              </div>
              <div class="rule-item">
                <mat-icon class="rule-icon">schedule</mat-icon>
                <div class="rule-text">
                  <strong>Business Hours:</strong> {{ businessHours.startHour }}:00 AM - {{ businessHours.endHour }}:00 PM (Mon-Fri only)
                </div>
              </div>
              <div class="rule-item">
                <mat-icon class="rule-icon">info</mat-icon>
                <div class="rule-text">
                  <strong>Note:</strong> Weekends and non-business hours are automatically excluded from compliance calculations
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <ng-template #loadingSpinner>
      <div class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading compliance data...</p>
      </div>
    </ng-template>
  `,
  styleUrls: ['./timesheet-compliance-dashboard.component.scss']
})
export class TimesheetComplianceDashboardComponent implements OnInit, OnDestroy {
  @Input() userRole: 'ADMIN' | 'SUPERVISOR' = 'ADMIN';
  @Input() userDepartment: string = '';

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get dashboardTitle(): string {
    return this.isAdmin ? 'Timesheet Compliance' : 'Department Compliance';
  }

  get dashboardSubtitle(): string {
    return this.isAdmin 
      ? 'Monitor timesheet compliance across all departments' 
      : `Compliance monitoring for ${this.userDepartment} Department`;
  }

  private destroy$ = new Subject<void>();

  // Data streams
  compliance$ = this.monitoringService.compliance$;
  summary$ = this.monitoringService.summary$;

  // Filtered and paginated data
  originalComplianceData: TimesheetCompliance[] = [];
  filteredCompliance: TimesheetCompliance[] = [];
  paginatedCompliance: TimesheetCompliance[] = [];
  
  // Filter states
  selectedDepartment: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';

  // Pagination
  currentPage: number = 0;
  pageSize: number = 25;

  // Loading state
  isLoading: boolean = false;

  // Table configuration
  displayedColumns: string[] = ['userName', 'lastEntry', 'complianceStatus', 'nextExpectedEntry', 'actions'];

  // Computed properties
  departments: string[] = [];
  criticalUsers: TimesheetCompliance[] = [];

  constructor(
    private monitoringService: TimesheetMonitoringService,
    private notificationService: ComplianceNotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Auto-set department filter for supervisors
    if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      this.selectedDepartment = this.userDepartment;
    }
    
    this.setupDataStreams();
    // Auto-load data - service handles rate limiting gracefully
    this.refreshData();
  }

  // Helper method to check if compliance data exists and has items
  get hasComplianceData(): boolean {
    return this.filteredCompliance && this.filteredCompliance.length > 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataStreams(): void {
    // Combine compliance data with filters
    combineLatest([
      this.compliance$,
      this.monitoringService.summary$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([compliance, summary]) => {
      if (compliance && compliance.length > 0) {
        // Store the original compliance data
        this.originalComplianceData = [...compliance];
        this.departments = [...new Set(compliance.map(c => c.department))];
        this.criticalUsers = compliance.filter(c => c.complianceStatus === 'critical');
        
        // Generate compliance alerts
        this.notificationService.generateComplianceAlerts(compliance);
        
        this.applyFilters();
      }
    });
  }

  refreshData(): void {
    this.isLoading = true;
    this.monitoringService.refreshComplianceData().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Compliance data refreshed successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to refresh compliance data', 'Close', { duration: 3000 });
        console.error('Error refreshing compliance data:', error);
      }
    });
  }

  applyFilters(): void {
    // Start with the original compliance data
    let filtered = [...this.originalComplianceData];

    // Apply department filter
    if (this.selectedDepartment) {
      filtered = filtered.filter(c => c.department === this.selectedDepartment);
    } else if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      // Supervisors always have department filter
      filtered = filtered.filter(c => c.department === this.userDepartment);
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(c => c.complianceStatus === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower) ||
        c.userEmail.toLowerCase().includes(searchLower) ||
        c.department.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCompliance = filtered;
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCompliance = this.filteredCompliance.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }



  getStatusDisplayName(status: string): string {
    const names: { [key: string]: string } = {
      'compliant': 'Compliant',
      'warning': 'Warning',
      'critical': 'Critical'
    };
    return names[status] || status;
  }



  get businessHours() {
    return this.monitoringService.getBusinessHours();
  }

  sendNotification(user: TimesheetCompliance): void {
    const type = user.complianceStatus === 'critical' ? 'critical' : 'warning';
    
    this.monitoringService.sendComplianceNotification(user.userId, type).subscribe({
      next: () => {
        this.snackBar.open(`Notification sent to ${user.firstName} ${user.lastName}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to send notification', 'Close', { duration: 3000 });
        console.error('Error sending notification:', error);
      }
    });
  }

  sendBulkNotifications(): void {
    const criticalCount = this.criticalUsers.length;
    if (criticalCount === 0) return;

    // Send notifications to all critical users
    const notifications = this.criticalUsers.map(user => 
      this.monitoringService.sendComplianceNotification(user.userId, 'critical')
    );

    // Wait for all notifications to complete
    Promise.all(notifications.map(n => n.toPromise())).then(() => {
      this.snackBar.open(`Sent ${criticalCount} critical notifications`, 'Close', { duration: 3000 });
    }).catch(error => {
      this.snackBar.open('Some notifications failed to send', 'Close', { duration: 3000 });
      console.error('Error sending bulk notifications:', error);
    });
  }

  viewUserProfile(user: TimesheetCompliance): void {
    // Navigate to user profile or open dialog
    this.snackBar.open(`Viewing profile for ${user.firstName} ${user.lastName}`, 'Close', { duration: 2000 });
  }

  viewTimesheetEntries(user: TimesheetCompliance): void {
    // Navigate to user's timesheet entries
    this.snackBar.open(`Viewing timesheet entries for ${user.firstName} ${user.lastName}`, 'Close', { duration: 2000 });
  }

  exportComplianceReport(): void {
    // Export compliance data to CSV/Excel
    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = this.isAdmin 
      ? `timesheet-compliance-${new Date().toISOString().split('T')[0]}.csv`
      : `${this.userDepartment}-compliance-${new Date().toISOString().split('T')[0]}.csv`;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.snackBar.open('Compliance report exported successfully', 'Close', { duration: 3000 });
  }

  private generateCSVContent(): string {
    const headers = ['Name', 'Email', 'Department', 'Status', 'Last Entry', 'Business Hours Missed', 'Next Expected Entry'];
    const rows = this.filteredCompliance.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.userEmail,
      user.department,
      this.getStatusDisplayName(user.complianceStatus),
      user.lastEntryDate ? user.lastEntryDate.toISOString() : 'No entries',
      user.businessHoursMissed.toString(),
      user.nextExpectedEntry.toISOString()
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}
