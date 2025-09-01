import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// import { NgxChartsModule } from '@swimlane/ngx-charts'; // Will be added later

import { 
  DepartmentAnalyticsService, 
  DepartmentAnalytics, 
  UserPerformanceMetrics,
  ProjectMetrics,
  ProductivityTrend,
  ReportFilters 
} from '../../services/department-analytics.service';

@Component({
  selector: 'app-department-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule
    // NgxChartsModule // Will be added later
  ],
  template: `
    <div class="reports-container">
      <!-- Header with filters -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>Department Analytics & Reports</mat-card-title>
          <mat-card-subtitle>Comprehensive insights for {{departmentName}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtersForm" class="filters-form">
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Team Members</mat-label>
                <mat-select formControlName="userIds" multiple>
                  <mat-option *ngFor="let user of departmentUsers" [value]="user.id">
                    {{user.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-checkbox formControlName="billableOnly">Billable Only</mat-checkbox>
            </div>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon>
                Apply Filters
              </button>
              <button mat-stroked-button (click)="resetFilters()">
                <mat-icon>clear</mat-icon>
                Reset
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('csv')">
                <mat-icon>download</mat-icon>
                Export CSV
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading analytics data...</p>
      </div>

      <!-- Main content -->
      <div *ngIf="!loading && analytics" class="content-container">
        <!-- Overview Cards -->
        <div class="overview-section">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-display">
                <mat-icon class="metric-icon">schedule</mat-icon>
                <div class="metric-info">
                  <h3>{{analytics.overview.totalHours}}</h3>
                  <p>Total Hours</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-display">
                <mat-icon class="metric-icon">attach_money</mat-icon>
                <div class="metric-info">
                  <h3>{{analytics.overview.billableHours}}</h3>
                  <p>Billable Hours</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-display">
                <mat-icon class="metric-icon">check_circle</mat-icon>
                <div class="metric-info">
                  <h3>{{analytics.overview.completionRate}}%</h3>
                  <p>Completion Rate</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-display">
                <mat-icon class="metric-icon">assignment</mat-icon>
                <div class="metric-info">
                  <h3>{{analytics.overview.totalEntries}}</h3>
                  <p>Total Entries</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabbed Content -->
        <mat-tab-group class="reports-tabs" (selectedTabChange)="onTabChange($event)">
          <!-- User Performance Tab -->
          <mat-tab label="Team Performance">
            <div class="tab-content">
              <!-- Performance Summary -->
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Performance Summary</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="performance-summary">
                    <div class="summary-metric" *ngFor="let user of analytics.userPerformance">
                      <div class="metric-header">
                        <strong>{{user.userName}}</strong>
                        <span class="score-badge" [class]="getScoreClass(user.performanceScore)">
                          {{user.performanceScore}}
                        </span>
                      </div>
                      <div class="metric-details">
                        <span>{{user.totalHours}}h total</span>
                        <span>{{user.completionRate}}% completion</span>
                        <span>{{user.billableHours}}h billable</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Performance Table -->
              <mat-card class="table-card">
                <mat-card-header>
                  <mat-card-title>Detailed Performance Metrics</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="analytics.userPerformance" matSort class="performance-table">
                    <ng-container matColumnDef="userName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
                      <td mat-cell *matCellDef="let element">{{element.userName}}</td>
                    </ng-container>

                    <ng-container matColumnDef="totalHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
                      <td mat-cell *matCellDef="let element">{{element.totalHours}}</td>
                    </ng-container>

                    <ng-container matColumnDef="billableHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Billable Hours</th>
                      <td mat-cell *matCellDef="let element">{{element.billableHours}}</td>
                    </ng-container>

                    <ng-container matColumnDef="completionRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Completion Rate</th>
                      <td mat-cell *matCellDef="let element">
                        <span class="completion-badge" [class]="getCompletionClass(element.completionRate)">
                          {{element.completionRate}}%
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="performanceScore">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Performance Score</th>
                      <td mat-cell *matCellDef="let element">
                        <span class="score-badge" [class]="getScoreClass(element.performanceScore)">
                          {{element.performanceScore}}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let element">
                        <mat-icon [class]="'status-' + element.status">
                          {{element.status === 'active' ? 'check_circle' : 'error'}}
                        </mat-icon>
                        {{element.status}}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userPerformanceColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userPerformanceColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Project Analytics Tab -->
          <mat-tab label="Project Analytics">
            <div class="tab-content">
              <!-- Project Summary -->
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Top Projects by Hours</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="project-summary">
                    <div class="summary-metric" *ngFor="let project of analytics.projectBreakdown | slice:0:5">
                      <div class="metric-header">
                        <strong>{{project.projectName}}</strong>
                        <span class="hours-badge">{{project.totalHours}}h</span>
                      </div>
                      <div class="metric-details">
                        <span>{{project.completionRate}}% complete</span>
                        <span>{{project.assignedUsers}} team members</span>
                        <span>{{project.billableHours}}h billable</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Project Table -->
              <mat-card class="table-card">
                <mat-card-header>
                  <mat-card-title>Project Details</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="analytics.projectBreakdown" matSort class="project-table">
                    <ng-container matColumnDef="projectName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Project</th>
                      <td mat-cell *matCellDef="let element">{{element.projectName}}</td>
                    </ng-container>

                    <ng-container matColumnDef="totalHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
                      <td mat-cell *matCellDef="let element">{{element.totalHours}}</td>
                    </ng-container>

                    <ng-container matColumnDef="billableHours">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Billable Hours</th>
                      <td mat-cell *matCellDef="let element">{{element.billableHours}}</td>
                    </ng-container>

                    <ng-container matColumnDef="completionRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Completion Rate</th>
                      <td mat-cell *matCellDef="let element">{{element.completionRate}}%</td>
                    </ng-container>

                    <ng-container matColumnDef="assignedUsers">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Team Members</th>
                      <td mat-cell *matCellDef="let element">{{element.assignedUsers}}</td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let element">
                        <span class="status-badge" [class]="'status-' + element.status.toLowerCase().replace(' ', '-')">
                          {{element.status}}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="projectColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: projectColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Analysis Tab -->
          <mat-tab label="Analysis">
            <div class="tab-content">
              <!-- Status Analysis -->
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Status Distribution</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="status-grid">
                    <div class="status-metric" *ngFor="let status of analytics.statusDistribution">
                      <div class="status-header">
                        <mat-icon [class]="'status-icon-' + status.status.toLowerCase()">
                          {{getStatusIcon(status.status)}}
                        </mat-icon>
                        <strong>{{status.status}}</strong>
                      </div>
                      <div class="status-details">
                        <div class="big-number">{{status.count}}</div>
                        <div class="percentage">{{status.percentage}}%</div>
                        <div class="hours">{{status.totalHours}}h</div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Priority Analysis -->
              <mat-card class="summary-card">
                <mat-card-header>
                  <mat-card-title>Priority Analysis</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="priority-grid">
                    <div class="priority-metric" *ngFor="let priority of analytics.priorityAnalysis">
                      <div class="priority-header">
                        <span class="priority-badge" [class]="'priority-' + priority.priority.toLowerCase()">
                          {{priority.priority}}
                        </span>
                      </div>
                      <div class="priority-details">
                        <div>{{priority.count}} tasks</div>
                        <div>{{priority.totalHours}}h total</div>
                        <div>{{priority.completionRate}}% completed</div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>


        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .overview-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .metric-card {
      text-align: center;
    }

    .metric-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .metric-icon {
      font-size: 32px;
      color: #1976d2;
    }

    .metric-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .metric-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .reports-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 20px;
    }

    .chart-card, .table-card {
      margin-bottom: 20px;
    }

    .chart-card .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-controls {
      display: flex;
      gap: 12px;
    }

    .performance-table, .project-table {
      width: 100%;
    }

    .completion-badge, .score-badge, .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .completion-high, .score-high {
      background: #4caf50;
      color: white;
    }

    .completion-medium, .score-medium {
      background: #ff9800;
      color: white;
    }

    .completion-low, .score-low {
      background: #f44336;
      color: white;
    }

    .status-active mat-icon {
      color: #4caf50;
    }

    .status-inactive mat-icon {
      color: #666;
    }

    .status-completed {
      background: #4caf50;
      color: white;
    }

    .status-in-progress {
      background: #2196f3;
      color: white;
    }

    .status-not-started {
      background: #ff9800;
      color: white;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .performance-summary, .project-summary {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-metric {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-details {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #666;
    }

    .hours-badge {
      background: #1976d2;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-grid, .priority-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .status-metric, .priority-metric {
      text-align: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .status-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .status-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .big-number {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }

    .percentage {
      font-size: 14px;
      color: #666;
    }

    .hours {
      font-size: 12px;
      color: #999;
    }

    .priority-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
    }

    .priority-critical {
      background: #f44336;
      color: white;
    }

    .priority-high {
      background: #ff9800;
      color: white;
    }

    .priority-medium {
      background: #2196f3;
      color: white;
    }

    .priority-low {
      background: #4caf50;
      color: white;
    }

    .status-icon-completed {
      color: #4caf50;
    }

    .status-icon-carriedout {
      color: #ff9800;
    }

    .status-icon-notstarted {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }

      .overview-section {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .analysis-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DepartmentReportsComponent implements OnInit {
  analytics: DepartmentAnalytics | null = null;
  departmentUsers: any[] = [];
  departmentProjects: any[] = [];
  loading = false;
  departmentName = '';
  selectedPeriod = 'weekly';

  filtersForm: FormGroup;

  // Chart data
  userPerformanceChartData: any[] = [];
  projectHoursChartData: any[] = [];
  productivityTrendsData: any[] = [];
  statusDistributionData: any[] = [];
  priorityAnalysisData: any[] = [];

  // Table columns
  userPerformanceColumns = ['userName', 'totalHours', 'billableHours', 'completionRate', 'performanceScore', 'status'];
  projectColumns = ['projectName', 'totalHours', 'billableHours', 'completionRate', 'assignedUsers', 'status'];

  // Chart color scheme
  colorScheme = {
    domain: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#303f9f']
  };

  constructor(
    private analyticsService: DepartmentAnalyticsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtersForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      userIds: [[]],
      projects: [[]],
      billableOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    
    // Load department users and projects for filters
    this.analyticsService.getDepartmentUsers().subscribe({
      next: (users) => {
        this.departmentUsers = users;
      },
      error: (error) => {
        console.error('Error loading department users:', error);
        // Set empty array as fallback
        this.departmentUsers = [];
        
        if (error.status === 401) {
          console.warn('Authentication required for department users');
        }
      }
    });

    this.analyticsService.getDepartmentProjects().subscribe({
      next: (projects) => {
        this.departmentProjects = projects;
      },
      error: (error) => {
        console.error('Error loading department projects:', error);
        // Set empty array as fallback
        this.departmentProjects = [];
        
        if (error.status === 401) {
          console.warn('Authentication required for department projects');
        }
      }
    });

    // Load analytics data
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    const filters = this.getFilters();
    
    this.analyticsService.getDepartmentAnalytics(filters).subscribe({
      next: (data) => {
        this.analytics = data;
        this.departmentName = data.departmentName;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        let errorMessage = 'Error loading analytics data';
        
        if (error.status === 401) {
          errorMessage = 'Authentication required. Please log in to access analytics.';
        } else if (error.status === 403) {
          errorMessage = 'Access denied. Supervisor permissions required.';
        } else if (error.status === 0 || error.status === 404) {
          errorMessage = 'Backend analytics service not available. Please ensure the backend is running on port 3001.';
        } else {
          errorMessage = `Error loading analytics: ${error.message || error.statusText}`;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
        
        // Set fallback empty analytics data
        this.analytics = {
          departmentName: 'Department',
          period: { startDate: '', endDate: '' },
          overview: {
            totalEntries: 0,
            totalHours: 0,
            billableHours: 0,
            nonBillableHours: 0,
            completedTasks: 0,
            pendingTasks: 0,
            averageHoursPerEntry: 0,
            completionRate: 0,
            billableRate: 0
          },
          userPerformance: [],
          projectBreakdown: [],
          timeDistribution: [],
          productivityTrends: [],
          statusDistribution: [],
          priorityAnalysis: []
        };
      }
    });
  }

  loadTrends(): void {
    const filters = this.getFilters();
    
    this.analyticsService.getProductivityTrends(this.selectedPeriod as any, filters).subscribe({
      next: (trends) => {
        this.prepareProductivityTrendsData(trends);
      },
      error: (error) => {
        console.error('Error loading trends:', error);
        this.snackBar.open('Error loading trend data', 'Close', { duration: 3000 });
      }
    });
  }

  prepareChartData(): void {
    if (!this.analytics) return;

    // User performance chart data
    this.userPerformanceChartData = this.analytics.userPerformance.map(user => ({
      name: user.userName,
      value: user.performanceScore
    }));

    // Project hours chart data
    this.projectHoursChartData = this.analytics.projectBreakdown.map(project => ({
      name: project.projectName,
      value: project.totalHours
    }));

    // Status distribution chart data
    this.statusDistributionData = this.analytics.statusDistribution.map(status => ({
      name: status.status,
      value: status.count
    }));

    // Priority analysis chart data
    this.priorityAnalysisData = this.analytics.priorityAnalysis.map(priority => ({
      name: priority.priority,
      value: priority.totalHours
    }));

    // Load trends separately
    this.loadTrends();
  }

  prepareProductivityTrendsData(trends: ProductivityTrend[]): void {
    const completionData = {
      name: 'Completion Rate',
      series: trends.map(t => ({ name: t.period, value: t.completionRate }))
    };

    const billableData = {
      name: 'Billable Rate',
      series: trends.map(t => ({ name: t.period, value: t.billableRate }))
    };

    this.productivityTrendsData = [completionData, billableData];
  }

  getFilters(): ReportFilters {
    const formValue = this.filtersForm.value;
    return {
      startDate: formValue.startDate ? formValue.startDate.toISOString().split('T')[0] : undefined,
      endDate: formValue.endDate ? formValue.endDate.toISOString().split('T')[0] : undefined,
      userIds: formValue.userIds?.length ? formValue.userIds : undefined,
      projects: formValue.projects?.length ? formValue.projects : undefined,
      billableOnly: formValue.billableOnly || undefined
    };
  }

  applyFilters(): void {
    this.loading = true;
    this.loadAnalytics();
  }

  resetFilters(): void {
    this.filtersForm.reset({
      startDate: '',
      endDate: '',
      userIds: [],
      projects: [],
      billableOnly: false
    });
    this.applyFilters();
  }

  exportReport(format: 'csv' | 'pdf' | 'excel'): void {
    const filters = this.getFilters();
    
    this.analyticsService.exportDepartmentReport(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open(`Report exported successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Export error:', error);
        this.snackBar.open('Error exporting report', 'Close', { duration: 3000 });
      }
    });
  }

  onTabChange(event: any): void {
    // Refresh data when switching tabs if needed
    if (event.index === 2) { // Trends tab
      this.loadTrends();
    }
  }

  getCompletionClass(rate: number): string {
    if (rate >= 80) return 'completion-high';
    if (rate >= 60) return 'completion-medium';
    return 'completion-low';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'check_circle';
      case 'carriedout': return 'schedule';
      case 'notstarted': return 'radio_button_unchecked';
      default: return 'help_outline';
    }
  }
}
