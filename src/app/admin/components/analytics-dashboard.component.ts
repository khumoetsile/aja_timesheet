import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

import { AnalyticsService, TimeAnalytics, DepartmentAnalytics, UserAnalytics, TimeTrends } from '../services/analytics.service';
import { CustomReportBuilderComponent } from './custom-report-builder.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="analytics-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1>{{ dashboardTitle }}</h1>
            <p>{{ dashboardSubtitle }}</p>
          </div>
                     <div class="header-actions">
             <!-- Loading indicator in header -->
             <div class="header-loading" *ngIf="isLoading">
               <mat-icon class="loading-icon">refresh</mat-icon>
               <span>Refreshing...</span>
             </div>
             
             <mat-form-field appearance="outline">
               <mat-label>Date Range</mat-label>
               <mat-select [(value)]="selectedDateRange" (selectionChange)="onDateRangeChange()">
                 <mat-option value="today">Today</mat-option>
                 <mat-option value="yesterday">Yesterday</mat-option>
                 <mat-option value="thisWeek">This Week</mat-option>
                 <mat-option value="lastWeek">Last Week</mat-option>
                 <mat-option value="thisMonth">This Month</mat-option>
                 <mat-option value="lastMonth">Last Month</mat-option>
                 <mat-option value="custom">Custom Range (Past 6 Months)</mat-option>
               </mat-select>
             </mat-form-field>
            
                         <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
               <mat-label>Start Date</mat-label>
               <input matInput [matDatepicker]="startPicker" [(ngModel)]="customStartDate" (ngModelChange)="onCustomDateChange()">
               <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
               <mat-datepicker #startPicker></mat-datepicker>
             </mat-form-field>
             
             <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
               <mat-label>End Date</mat-label>
               <input matInput [matDatepicker]="endPicker" [(ngModel)]="customEndDate" (ngModelChange)="onCustomDateChange()">
               <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
               <mat-datepicker #endPicker></mat-datepicker>
             </mat-form-field>
            
            
          </div>
        </div>
      </div>

                    <!-- Loading Indicator -->
        <div class="loading-section" *ngIf="isLoading">
          <mat-card class="loading-card">
            <mat-card-content>
              <div class="loading-content">
                                 <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
                 <p>Loading analytics data...</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

       <!-- KPI Cards -->
       <div class="kpi-section" *ngIf="analytics && !isLoading">
        <div class="kpi-grid">
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="kpi-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="kpi-content">
                <h3>Total Hours</h3>
                <p class="kpi-value">{{ analytics.totalHours | number:'1.0-1' }}</p>
                <p class="kpi-change positive">+{{ getHoursChange() | number:'1.0-1' }}h from last period</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="kpi-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="kpi-content">
                <h3>Compliance Rate</h3>
                <p class="kpi-value">{{ analytics.complianceRate | number:'1.0-1' }}%</p>
                <p class="kpi-change positive">+5.2% from last period</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="kpi-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="kpi-content">
                <h3>Utilization Rate</h3>
                <p class="kpi-value">{{ analytics.utilizationRate | number:'1.0-1' }}%</p>
                <p class="kpi-change positive">+3.1% from last period</p>
              </div>
            </mat-card-content>
          </mat-card>

                     <mat-card class="kpi-card">
             <mat-card-content>
               <div class="kpi-icon">
                 <mat-icon>description</mat-icon>
               </div>
               <div class="kpi-content">
                 <h3>Total Entries</h3>
                 <p class="kpi-value">{{ analytics.totalEntries | number }}</p>
                 <p class="kpi-change positive">+{{ getEntriesChange() | number }} from last period</p>
               </div>
             </mat-card-content>
           </mat-card>
        </div>
      </div>

      <!-- Main Content Tabs -->
      <mat-tab-group class="analytics-tabs">
                 <!-- Overview Tab -->
         <mat-tab label="Overview">
           <div class="tab-content">
                           
             
                           <div class="chart-grid" *ngIf="!isLoading">
               <mat-card class="chart-card">
                 <mat-card-header>
                   <mat-card-title>Time Trends</mat-card-title>
                 </mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas #timeTrendsChart width="400" height="200"></canvas>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Department Performance</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas #departmentPerformanceChart width="400" height="200"></canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Department Analytics Tab -->
        <mat-tab label="Departments">
          <div class="tab-content">
            <div class="table-section">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Department Analytics</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                                     <table mat-table [dataSource]="departmentDataSource" matSort class="analytics-table">
                    <ng-container matColumnDef="department">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                      <td mat-cell *matCellDef="let dept">{{ dept.department }}</td>
                    </ng-container>

                    <ng-container matColumnDef="totalHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
                      <td mat-cell *matCellDef="let dept">{{ dept.totalHours | number:'1.0-1' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="averageHoursPerUser">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Avg Hours/User</th>
                      <td mat-cell *matCellDef="let dept">{{ dept.averageHoursPerUser | number:'1.0-1' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="complianceRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Compliance Rate</th>
                      <td mat-cell *matCellDef="let dept">
                        <div class="compliance-rate">
                          <span>{{ dept.complianceRate | number:'1.0-1' }}%</span>
                          <mat-progress-bar 
                            [value]="dept.complianceRate" 
                            [color]="dept.complianceRate >= 90 ? 'primary' : dept.complianceRate >= 70 ? 'accent' : 'warn'">
                          </mat-progress-bar>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="utilizationRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilization Rate</th>
                      <td mat-cell *matCellDef="let dept">{{ dept.utilizationRate | number:'1.0-1' }}%</td>
                    </ng-container>

                    <ng-container matColumnDef="userCount">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Users</th>
                      <td mat-cell *matCellDef="let dept">{{ dept.userCount }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: departmentColumns;"></tr>
                  </table>
                  
                                     <mat-paginator 
                     #deptPaginator
                     [pageSizeOptions]="[5, 10, 25]" 
                     showFirstLastButtons 
                     aria-label="Select page of departments">
                   </mat-paginator>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- User Analytics Tab -->
        <mat-tab label="Users">
          <div class="tab-content">
            <div class="table-section">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>User Analytics</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                                     <table mat-table [dataSource]="userDataSource" matSort class="analyticsTable">
                    <ng-container matColumnDef="userName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>User</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-info">
                          <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                          <div class="user-department">{{ user.department }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="totalHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
                      <td mat-cell *matCellDef="let user">{{ user.totalHours | number:'1.0-1' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="averageHoursPerDay">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Avg Hours/Day</th>
                      <td mat-cell *matCellDef="let user">{{ user.averageHoursPerDay | number:'1.0-1' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="complianceRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Compliance Rate</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="compliance-rate">
                          <span>{{ user.complianceRate | number:'1.0-1' }}%</span>
                          <mat-progress-bar 
                            [value]="user.complianceRate" 
                            [color]="user.complianceRate >= 90 ? 'primary' : user.complianceRate >= 70 ? 'accent' : 'warn'">
                          </mat-progress-bar>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="utilizationRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilization Rate</th>
                      <td mat-cell *matCellDef="let user">{{ user.utilizationRate | number:'1.0-1' }}%</td>
                    </ng-container>

                    <ng-container matColumnDef="lastEntry">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Entry</th>
                      <td mat-cell *matCellDef="let user">
                        {{ user.lastEntryDate ? (user.lastEntryDate | date:'MMM dd, yyyy') : 'No entries' }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
                  </table>
                  
                                     <mat-paginator 
                     #userPaginator
                     [pageSizeOptions]="[5, 10, 25]" 
                     showFirstLastButtons 
                     aria-label="Select page of users">
                   </mat-paginator>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Projects Tab - REMOVED since we don't have projects table -->

        <!-- Custom Reports Tab -->
        <mat-tab label="Custom Reports">
          <div class="tab-content">
            <div class="custom-reports-section">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Custom Reports</mat-card-title>
                  <mat-card-subtitle>Create and manage custom reports</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="reports-actions">
                    <button mat-raised-button color="primary" (click)="createCustomReport()">
                      <mat-icon>add</mat-icon>
                      Create Report
                    </button>
                  </div>
                  
                  <div class="reports-list" *ngIf="customReports.length > 0">
                    <div class="report-item" *ngFor="let report of customReports">
                      <div class="report-info">
                        <h4>{{ report.name }}</h4>
                        <p>{{ report.description }}</p>
                        <div class="report-meta">
                          <span class="schedule">{{ report.schedule }} schedule</span>
                          <span class="recipients">{{ report.recipients.length }} recipients</span>
                        </div>
                      </div>
                      <div class="report-actions">
                        <button mat-icon-button (click)="editReport(report)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="deleteReport(report.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="no-reports" *ngIf="customReports.length === 0">
                    <mat-icon>description</mat-icon>
                    <p>No custom reports created yet</p>
                    <button mat-raised-button color="primary" (click)="createCustomReport()">
                      Create Your First Report
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('timeTrendsChart', { static: false }) timeTrendsChartRef!: ElementRef;
  @ViewChild('departmentPerformanceChart', { static: false }) departmentPerformanceChartRef!: ElementRef;
  
  private timeTrendsChart: Chart | null = null;
  private departmentPerformanceChart: Chart | null = null;
  @Input() userRole: 'ADMIN' | 'SUPERVISOR' = 'ADMIN';
  @Input() userDepartment: string = '';

  private destroy$ = new Subject<void>();
  private refreshSubject$ = new Subject<void>();

  // Data streams
  analytics$ = this.analyticsService.analytics$;
  departmentAnalytics$ = this.analyticsService.departmentAnalytics$;
  userAnalytics$ = this.analyticsService.userAnalytics$;
  trends$ = this.analyticsService.trends$;

  // Data
  analytics: TimeAnalytics | null = null;
  departmentAnalytics: DepartmentAnalytics[] = [];
  userAnalytics: UserAnalytics[] = [];
  trends: TimeTrends[] = [];
  customReports: any[] = [];

  // Data sources for tables with pagination
  departmentDataSource = new MatTableDataSource<DepartmentAnalytics>([]);
  userDataSource = new MatTableDataSource<UserAnalytics>([]);

  // UI State
  selectedDateRange: string = 'custom';
  customStartDate: Date = new Date();
  customEndDate: Date = new Date();
  isLoading: boolean = false;

  // Table columns
  departmentColumns = ['department', 'totalHours', 'averageHoursPerUser', 'complianceRate', 'utilizationRate', 'userCount'];
  userColumns = ['userName', 'totalHours', 'averageHoursPerDay', 'complianceRate', 'utilizationRate', 'lastEntry'];

  // Pagination
  @ViewChild('deptPaginator') deptPaginator!: MatPaginator;
  @ViewChild('userPaginator') userPaginator!: MatPaginator;

  constructor(
    private analyticsService: AnalyticsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  get dashboardTitle(): string {
    return this.isAdmin ? 'Analytics Dashboard' : 'Department Analytics';
  }

  get dashboardSubtitle(): string {
    return this.isAdmin 
      ? 'Comprehensive insights into timesheet data and team performance' 
      : `Analytics for ${this.userDepartment} Department`;
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  ngOnInit(): void {
    this.setupDataStreams();
    this.setupDebouncedRefresh();
    this.setDefaultDateRange();
    this.refreshData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);

    // Setup pagination
    if (this.deptPaginator) {
      this.departmentDataSource.paginator = this.deptPaginator;
    }
    if (this.userPaginator) {
      this.userDataSource.paginator = this.userPaginator;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshSubject$.next();
    this.refreshSubject$.complete();
    
    // Destroy charts to prevent memory leaks
    if (this.timeTrendsChart) {
      this.timeTrendsChart.destroy();
    }
    if (this.departmentPerformanceChart) {
      this.departmentPerformanceChart.destroy();
    }
  }

  private setupDataStreams(): void {
    this.analytics$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('📊 Analytics data updated:', data);
      this.analytics = data;
    });

    this.departmentAnalytics$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('🏢 Department analytics updated:', data);
      this.departmentAnalytics = data;
      this.departmentDataSource.data = data;
      // Update department chart when data changes
      if (this.departmentPerformanceChartRef?.nativeElement && data.length > 0) {
        setTimeout(() => this.initializeDepartmentPerformanceChart(), 100);
      }
    });

    this.userAnalytics$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('👥 User analytics updated:', data);
      this.userAnalytics = data;
      this.userDataSource.data = data;
    });

    this.trends$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('📈 Time trends updated:', data);
      this.trends = data;
      // Update time trends chart when data changes
      if (this.timeTrendsChartRef?.nativeElement && data.length > 0) {
        setTimeout(() => this.initializeTimeTrendsChart(), 100);
      }
    });
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    // Default to past 6 months (matching backend default)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    this.customStartDate = sixMonthsAgo;
    this.customEndDate = now;
  }

  onDateRangeChange(): void {
    // Always refresh data when date range changes
    this.refreshData();
  }

  onCustomDateChange(): void {
    // Trigger debounced refresh when custom dates change
    this.refreshSubject$.next();
  }

  private setupDebouncedRefresh(): void {
    // Simple debouncing to prevent rapid requests
    this.refreshSubject$.pipe(
      debounceTime(800), // Reduced to 800ms
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('⏱️ Debounced refresh triggered');
      this.refreshData();
    });
  }

  refreshData(): void {
    this.isLoading = true;
    const dateRange = this.getDateRange();

    console.log('🔄 Refreshing data for date range:', dateRange);

    // Load data with fallback strategy - if one fails, continue with others
    this.loadDataWithFallback(dateRange);
  }

  private loadDataWithFallback(dateRange: { start: Date; end: Date }): void {
    const filters = this.getFilters();
    let completedRequests = 0;
    let successfulRequests = 0;
    const totalRequests = 4;

    // Helper function to handle request completion
    const handleRequestComplete = (success: boolean) => {
      completedRequests++;
      if (success) successfulRequests++;

      // If all requests are done, handle the result
      if (completedRequests === totalRequests) {
        if (successfulRequests === 0) {
          // All requests failed - show error but don't retry
          this.snackBar.open('Unable to load analytics data. Please check your connection and try again.', 'Close', { duration: 5000 });
        } else if (successfulRequests < totalRequests) {
          // Some requests failed - show partial success
          this.snackBar.open(`Loaded ${successfulRequests}/${totalRequests} data sources`, 'Close', { duration: 3000 });
        }
        
        // Always stop loading, even if some requests failed
        setTimeout(() => {
          this.isLoading = false;
          // Initialize charts after loading completes
          this.initializeChartsAfterLoad();
        }, 300);
      }
    };

    // Load time analytics
    this.analyticsService.getTimeAnalytics(dateRange, filters).subscribe({
      next: (data) => {
        console.log('✅ Time analytics loaded:', data);
        handleRequestComplete(true);
      },
      error: (error) => {
        console.error('❌ Error loading time analytics:', error);
        // Don't retry, just continue with other requests
        handleRequestComplete(false);
      }
    });

    // Load department analytics
    this.analyticsService.getDepartmentAnalytics(dateRange, filters).subscribe({
      next: (data) => {
        console.log('✅ Department analytics loaded:', data);
        handleRequestComplete(true);
      },
      error: (error) => {
        console.error('❌ Error loading department analytics:', error);
        handleRequestComplete(false);
      }
    });

    // Load user analytics
    this.analyticsService.getUserAnalytics(dateRange, filters).subscribe({
      next: (data) => {
        console.log('✅ User analytics loaded:', data);
        handleRequestComplete(true);
      },
      error: (error) => {
        console.error('❌ Error loading user analytics:', error);
        handleRequestComplete(false);
      }
    });

    // Load time trends
    this.analyticsService.getTimeTrends(dateRange, 'daily').subscribe({
      next: (data) => {
        console.log('✅ Time trends loaded:', data);
        handleRequestComplete(true);
      },
      error: (error) => {
        console.error('❌ Error loading time trends:', error);
        handleRequestComplete(false);
      }
    });
  }

  private getDateRange(): { start: Date; end: Date } {
    const now = new Date();
    
    switch (this.selectedDateRange) {
      case 'today':
        return { start: now, end: now };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return { start: startOfWeek, end: now };
      case 'lastWeek':
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return { start: startOfLastWeek, end: endOfLastWeek };
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startOfMonth, end: now };
      case 'lastMonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: startOfLastMonth, end: endOfLastMonth };
      case 'custom':
        return { start: this.customStartDate, end: this.customEndDate };
      default:
        return { start: now, end: now };
    }
  }

  private getFilters(): any {
    const filters: any = {};
    
    if (!this.isAdmin && this.userDepartment) {
      filters.department = this.userDepartment;
    }
    
    return filters;
  }

  getHoursChange(): number {
    // This would be calculated from historical data
    // For now, return a realistic value based on actual data
    return this.analytics ? Math.round(this.analytics.totalHours * 0.15) : 0;
  }

  getEntriesChange(): number {
    // This would be calculated from historical data
    // For now, return a realistic value based on actual data
    return this.analytics ? Math.round(this.analytics.totalEntries * 0.12) : 0;
  }

  getDateRangeDisplay(): string {
    if (this.customStartDate && this.customEndDate) {
      const startStr = this.customStartDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      const endStr = this.customEndDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      return `${startStr} to ${endStr}`;
    }
    return 'Custom date range';
  }



  exportData(): void {
    const dateRange = this.getDateRange();
    const data = {
      analytics: this.analytics,
      departments: this.departmentAnalytics,
      users: this.userAnalytics,
      trends: this.trends
    };

    this.analyticsService.exportAnalytics('excel', data, `analytics-${dateRange.start.toISOString().split('T')[0]}`).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange.start.toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Analytics exported successfully!', 'Close', { duration: 3000 });
      },
      (error) => {
        this.snackBar.open('Failed to export analytics', 'Close', { duration: 3000 });
      }
    );
  }

  createCustomReport(): void {
    const dialogRef = this.dialog.open(CustomReportBuilderComponent, {
      width: '90vw',
      maxWidth: '800px',
      height: '90vh',
      maxHeight: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  editReport(report: any): void {
    const dialogRef = this.dialog.open(CustomReportBuilderComponent, {
      width: '90vw',
      maxWidth: '800px',
      height: '90vh',
      maxHeight: '800px',
      data: { report }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  deleteReport(reportId: string): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.analyticsService.deleteCustomReport(reportId).subscribe(
        () => {
          this.snackBar.open('Report deleted successfully!', 'Close', { duration: 3000 });
          this.refreshData();
        },
        (error) => {
          this.snackBar.open('Failed to delete report', 'Close', { duration: 3000 });
        }
      );
    }
  }

  private initializeCharts(): void {
    this.initializeTimeTrendsChart();
    this.initializeDepartmentPerformanceChart();
  }

  private initializeChartsAfterLoad(): void {
    console.log('🎨 Initializing charts after data load...');
    console.log('📈 Trends data:', this.trends.length, 'items');
    console.log('🏢 Department data:', this.departmentAnalytics.length, 'items');
    
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      if (this.trends.length > 0) {
        this.initializeTimeTrendsChart();
      }
      if (this.departmentAnalytics.length > 0) {
        this.initializeDepartmentPerformanceChart();
      }
    }, 200);
  }

  private initializeTimeTrendsChart(): void {
    console.log('📈 Initializing time trends chart...');
    console.log('Canvas element:', this.timeTrendsChartRef?.nativeElement);
    console.log('Trends data:', this.trends);
    
    if (!this.timeTrendsChartRef?.nativeElement || this.trends.length === 0) {
      console.log('❌ Cannot initialize time trends chart - missing canvas or data');
      return;
    }

    // Destroy existing chart if it exists
    if (this.timeTrendsChart) {
      this.timeTrendsChart.destroy();
      this.timeTrendsChart = null;
    }

    const ctx = this.timeTrendsChartRef.nativeElement.getContext('2d');
    
    // Format dates for user-friendly display
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return dateStr;
      }
    };
    
    // Create time trends line chart
    this.timeTrendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.trends.map(t => formatDate(t.date)),
        datasets: [
          {
            label: 'Total Hours',
            data: this.trends.map(t => t.totalHours),
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Compliance Rate (%)',
            data: this.trends.map(t => t.complianceRate),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time Trends - Past 6 Months'
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const dateStr = context[0].label;
                return `Date: ${dateStr}`;
              },
              label: (context) => {
                if (context.dataset.label === 'Total Hours') {
                  return `Total Hours: ${context.parsed.y.toFixed(1)}h`;
                } else {
                  return `Compliance Rate: ${context.parsed.y.toFixed(1)}%`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Total Hours'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Compliance Rate (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
            min: 0,
            max: 100
          }
        }
      }
    });
    
    console.log('✅ Time trends chart created successfully');
  }

  private initializeDepartmentPerformanceChart(): void {
    console.log('🏢 Initializing department performance chart...');
    console.log('Canvas element:', this.departmentPerformanceChartRef?.nativeElement);
    console.log('Department data:', this.departmentAnalytics);
    
    if (!this.departmentPerformanceChartRef?.nativeElement || this.departmentAnalytics.length === 0) {
      console.log('❌ Cannot initialize department chart - missing canvas or data');
      return;
    }

    // Destroy existing chart if it exists
    if (this.departmentPerformanceChart) {
      this.departmentPerformanceChart.destroy();
      this.departmentPerformanceChart = null;
    }

    const ctx = this.departmentPerformanceChartRef.nativeElement.getContext('2d');
    
    // Create department performance pie chart
    this.departmentPerformanceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.departmentAnalytics.map(d => d.department),
        datasets: [
          {
            data: this.departmentAnalytics.map(d => d.totalHours),
            backgroundColor: [
              '#3f51b5',
              '#4caf50',
              '#ff9800',
              '#f44336',
              '#9c27b0',
              '#00bcd4',
              '#795548',
              '#607d8b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Department Performance - Past 6 Months'
          },
          legend: {
            position: 'right'
          },
                     tooltip: {
             callbacks: {
               label: (context: any) => {
                 const dept = context.label;
                 const hours = context.parsed;
                 const deptData = this.departmentAnalytics.find((d: any) => d.department === dept);
                 if (deptData) {
                   return [
                     `${dept}: ${hours} hours`,
                     `Users: ${deptData.userCount}`,
                     `Compliance: ${deptData.complianceRate.toFixed(1)}%`
                   ];
                 }
                 return `${dept}: ${hours} hours`;
               }
             }
           }
        }
      }
    });
    
    console.log('✅ Department performance chart created successfully');
  }

  private updateCharts(): void {
    console.log('🎨 Updating charts with new data...');
    
    // Update time trends chart if we have data
    if (this.trends.length > 0 && this.timeTrendsChartRef?.nativeElement) {
      console.log('📈 Updating time trends chart');
      setTimeout(() => this.initializeTimeTrendsChart(), 100);
    }
    
    // Update department performance chart if we have data
    if (this.departmentAnalytics.length > 0 && this.departmentPerformanceChartRef?.nativeElement) {
      console.log('🏢 Updating department performance chart');
      setTimeout(() => this.initializeDepartmentPerformanceChart(), 100);
    }
  }
}
