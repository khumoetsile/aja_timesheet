import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatChipsModule
  ],
  template: `
    <div class="reports-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-left">
          <h1 class="page-title">Reports</h1>
          <p class="page-subtitle">Key insights and drill-down analytics</p>
        </div>
        <div class="header-right">
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu">
            <mat-icon>account_circle</mat-icon>
            <span>Admin User</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/admin/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <button mat-menu-item>
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
          
          <button mat-icon-button class="theme-toggle">
            <mat-icon>light_mode</mat-icon>
          </button>
          
          <button mat-raised-button color="primary" class="export-btn">
            <mat-icon>download</mat-icon>
            Export Report
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <mat-card class="filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Department</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput placeholder="Start typing to search departments">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Employee</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput placeholder="Start typing to search employees">
            </mat-form-field>
          </div>
          
          <div class="filter-group">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Start Date</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="startPicker">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>End Date</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="endPicker">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>
          
          <div class="filter-group">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="selectedStatus">
                <mat-option value="all">All Statuses</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="in-progress">Ongoing</mat-option>
                <mat-option value="not-started">Not Started</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        
        <div class="filter-actions">
          <button mat-raised-button color="primary">Apply Filters</button>
          <button mat-stroked-button>Clear Filters</button>
        </div>
      </mat-card>

      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon document">
              <mat-icon>description</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ totalEntries }}</div>
              <div class="metric-label">Total Entries</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon clock">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ totalHours }}</div>
              <div class="metric-label">Total Hours</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon dollar">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ billableHours }}</div>
              <div class="metric-label">Billable Hours</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon people">
              <mat-icon>group</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ staffWithEntries }}</div>
              <div class="metric-label">Staff with Entries</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon not-started">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ notStartedTasks }}</div>
              <div class="metric-label">Not Started Tasks</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon completed">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ carriedOutTasks }}</div>
              <div class="metric-label">Carried Out Tasks</div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-row">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Task Completion by Status & Department</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-placeholder">
                <mat-icon>bar_chart</mat-icon>
                <p>Bar chart showing task completion across departments</p>
                <div class="chart-legend">
                  <div class="legend-item" *ngFor="let dept of departments">
                    <div class="legend-color" [style.background-color]="dept.color"></div>
                    <span>{{ dept.name }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Department Utilization</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-placeholder">
                <mat-icon>donut_large</mat-icon>
                <p>Donut chart showing department utilization</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="chart-card full-width">
          <mat-card-header>
            <mat-card-title>Employee Hours by Department</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>bar_chart</mat-icon>
              <p>Bar chart showing employee hours per department</p>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let dept of departments">
                  <div class="legend-color" [style.background-color]="dept.color"></div>
                  <span>{{ dept.name }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reports-dashboard {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-left .page-title {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #1a1a1a;
    }

    .header-left .page-subtitle {
      font-size: 1rem;
      color: #666;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .export-btn {
      background-color: #1976d2;
      color: white;
    }

    .filter-section {
      margin-bottom: 24px;
      padding: 24px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-group {
      display: flex;
      gap: 16px;
    }

    .filter-field {
      flex: 1;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      padding: 20px;
    }

    .metric-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-icon.document {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .metric-icon.clock {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .metric-icon.dollar {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .metric-icon.people {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .metric-icon.not-started {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .metric-icon.completed {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #666;
      margin-top: 4px;
    }

    .charts-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .chart-card {
      padding: 24px;
    }

    .chart-card.full-width {
      grid-column: 1 / -1;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      background-color: #fafafa;
      border: 2px dashed #ddd;
      border-radius: 8px;
      text-align: center;
    }

    .chart-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .chart-placeholder p {
      color: #666;
      margin: 0;
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .reports-dashboard {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
      }

      .filter-row {
        grid-template-columns: 1fr;
      }

      .filter-group {
        flex-direction: column;
      }

      .chart-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  selectedStatus = 'all';
  
  // Key Metrics
  totalEntries = 0;
  totalHours = 0;
  billableHours = 0;
  staffWithEntries = 0;
  notStartedTasks = 0;
  carriedOutTasks = 0;

  // Department data for charts
  departments = [
    { name: 'IT', color: '#e3f2fd' },
    { name: 'Operations', color: '#f3e5f5' },
    { name: 'HR', color: '#e8f5e8' },
    { name: 'Finance', color: '#fff3e0' },
    { name: 'Legal', color: '#ffebee' },
    { name: 'Support', color: '#f1f8e9' }
  ];

  constructor() {}

  ngOnInit() {
    this.loadReportData();
  }

  private loadReportData() {
    // Load real data from the API
    // This will be implemented to fetch actual metrics, chart data, and filtering options
    console.log('Loading real report data...');
  }
}
