import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { TimesheetService } from '../timesheet/services/timesheet.service';
import { AuthService } from '../services/auth.service';
import { TimesheetEntry } from '../timesheet/models/timesheet-entry.interface';
import { ReportDialogComponent } from './report-dialog.component';
import { ComplianceNotificationService } from './services/compliance-notification.service';
import { TimesheetMonitoringService } from './services/timesheet-monitoring.service';
import { AnalyticsService, DashboardMetrics, DepartmentStats, UserStats } from './services/analytics.service';

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
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
    MatBadgeModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDialogModule,
    NgChartsModule,
  ],
  template: `
    <div class="dashboard-container" id="admin-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1>{{ dashboardTitle }}</h1>
            <p>{{ dashboardSubtitle }}</p>
          </div>
          <div class="header-right">
            <button mat-icon-button 
                    class="notification-btn" 
                    [matBadge]="criticalAlertsCount$ | async" 
                    matBadgeColor="warn"
                    matTooltip="Compliance Alerts"
                    (click)="showComplianceAlerts()">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-raised-button class="export-btn" (click)="exportReport()">
              <mat-icon>download</mat-icon>
              Export Report
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-row" [formGroup]="dateRange">
          <mat-form-field appearance="outline" class="filter-field" *ngIf="isAdmin">
            <mat-label>Department</mat-label>
            <input type="text" matInput [matAutocomplete]="deptAuto" 
                   [(ngModel)]="selectedDepartment" 
                   (input)="filterDepartments($event)" 
                   placeholder="Type to search departments...">
            <mat-icon matSuffix>search</mat-icon>
            <mat-autocomplete #deptAuto="matAutocomplete" (optionSelected)="onDepartmentSelected($event)">
              <mat-option value="">All Departments</mat-option>
              <mat-option *ngFor="let dept of filteredDepartments" [value]="dept">{{dept}}</mat-option>
            </mat-autocomplete>
            <mat-hint>Start typing to search departments</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Employee</mat-label>
            <input type="text" matInput [matAutocomplete]="empAuto" 
                   [(ngModel)]="selectedEmployeeName" 
                   (input)="filterEmployees($event)" 
                   placeholder="Type to search employees...">
            <mat-icon matSuffix>search</mat-icon>
            <mat-autocomplete #empAuto="matAutocomplete" (optionSelected)="onEmployeeSelected($event)">
              <mat-option value="">All Employees</mat-option>
              <mat-option *ngFor="let user of filteredEmployees" [value]="user.userName" [id]="user.userId">{{user.userName}}</mat-option>
            </mat-autocomplete>
            <mat-hint>Start typing to search employees</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" placeholder="Start date" formControlName="start" (dateChange)="onDateChange()">
            <mat-datepicker-toggle matSuffix [for]="startPicker">
              <mat-icon>calendar_today</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" placeholder="End date" formControlName="end" (dateChange)="onDateChange()">
            <mat-datepicker-toggle matSuffix [for]="endPicker">
              <mat-icon>calendar_today</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="Completed">Completed</mat-option>
              <mat-option value="CarriedOut">Ongoing</mat-option>
              <mat-option value="NotStarted">Not Started</mat-option>
            </mat-select>
            <mat-select-trigger>
              <span *ngIf="selectedStatus">{{getStatusDisplayName(selectedStatus)}}</span>
              <span *ngIf="!selectedStatus">All Statuses</span>
            </mat-select-trigger>
          </mat-form-field>
        </div>

        <div class="filter-actions">
          <button mat-raised-button class="apply-btn" (click)="applyFilters()">Apply Filters</button>
          <button mat-stroked-button class="clear-btn" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="metrics-section">
        <div class="metric-card clickable" (click)="goToReportDetail({})">
          <div class="metric-icon total-entries">
            <mat-icon>assignment</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.totalEntries}}</h3>
            <p>Total Entries</p>
          </div>
        </div>

        <div class="metric-card clickable" (click)="goToReportDetail({})">
          <div class="metric-icon total-hours">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.totalHours.toFixed(1)}}</h3>
            <p>Total Hours</p>
          </div>
        </div>

        <div class="metric-card clickable" (click)="goToReportDetail({ billable: true })">
          <div class="metric-icon billable-hours">
            <mat-icon>attach_money</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.billableHours.toFixed(1)}}</h3>
            <p>Billable Hours</p>
          </div>
        </div>

        <div class="metric-card clickable" (click)="goToReportDetail({})">
          <div class="metric-icon active-users">
            <mat-icon>people</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.activeUsers}}</h3>
            <p>Staff with Entries</p>
          </div>
        </div>

        <div class="metric-card clickable" (click)="goToReportDetail({ status: 'NotStarted' })">
          <div class="metric-icon pending">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.notStartedTasks}}</h3>
            <p>Not Started Tasks</p>
          </div>
        </div>

        <div class="metric-card clickable" (click)="goToReportDetail({ status: 'CarriedOut' })">
          <div class="metric-icon in-progress">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="metric-content">
            <h3>{{metrics.carriedOutTasks}}</h3>
            <p>Carried Out Tasks</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Top Row Charts -->
        <div class="chart-row">
          <!-- Task Completion by Status & Department -->
          <div class="chart-card">
            <h3>Task Completion by Status & Department</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="taskCompletionChartData"
                [type]="'bar'"
                [options]="taskCompletionChartOptions">
              </canvas>
            </div>
          </div>

          <!-- Department Utilization -->
          <div class="chart-card">
            <h3>Department Utilization</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="departmentUtilizationChartData"
                [type]="'doughnut'"
                [options]="departmentUtilizationChartOptions">
              </canvas>
            </div>
          </div>

          <!-- Employee Hours by Department -->
          <div class="chart-card">
            <h3>Employee Hours by Department</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="employeeHoursChartData"
                [type]="'bar'"
                [options]="employeeHoursChartOptions">
              </canvas>
            </div>
          </div>
      </div>

        <!-- Bottom Row Charts -->
        <div class="chart-row">
          <!-- Task Completion Rate by Priority -->
          <div class="chart-card">
            <h3>Task Completion Rate by Priority</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="priorityCompletionChartData"
                [type]="'bar'"
                [options]="priorityCompletionChartOptions">
              </canvas>
            </div>
          </div>

          <!-- Task Completion Rate by Status -->
          <div class="chart-card">
            <h3>Task Completion Rate by Status</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="statusCompletionChartData"
                [type]="'bar'"
                [options]="statusCompletionChartOptions">
              </canvas>
            </div>
          </div>

          <!-- Employee Utilization by Month -->
          <div class="chart-card">
            <h3>Employee Utilization by Month</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="monthlyUtilizationChartData"
                [type]="'bar'"
                [options]="monthlyUtilizationChartOptions">
              </canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables Section -->
      <div class="tables-section">
        <!-- Department Performance Table -->
        <div class="table-card" *ngIf="isAdmin">
          <h3>Department Performance</h3>
        <div class="table-container">
          <table mat-table [dataSource]="departmentDataSource" matSort class="analytics-table">
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let element">{{element.department}}</td>
            </ng-container>

            <ng-container matColumnDef="totalEntries">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Entries</th>
              <td mat-cell *matCellDef="let element">{{element.totalEntries}}</td>
            </ng-container>

            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
              <td mat-cell *matCellDef="let element">{{element.totalHours.toFixed(1)}}</td>
            </ng-container>

            <ng-container matColumnDef="billableHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Billable Hours</th>
              <td mat-cell *matCellDef="let element">{{element.billableHours.toFixed(1)}}</td>
            </ng-container>

              <ng-container matColumnDef="utilization">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilization</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [class]="'utilization-' + getUtilizationClass(element.utilization)">
                    {{element.utilization.toFixed(1)}}%
                  </mat-chip>
                </td>
            </ng-container>

            <ng-container matColumnDef="completionRate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Completion Rate</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip [class]="'completion-' + getCompletionClass(element.completionRate)">
                  {{element.completionRate.toFixed(1)}}%
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: departmentColumns;" class="dashboard-row clickable" (click)="goToReportDetail({ department: row.department })"></tr>
          </table>
          <mat-paginator #deptPaginator
            [pageSizeOptions]="[5, 10, 25]"
            [pageSize]="5"
            showFirstLastButtons
            aria-label="Select page of departments">
          </mat-paginator>
        </div>
      </div>

        <!-- User Performance Table -->
        <div class="table-card">
          <h3>{{ isAdmin ? 'User Performance' : 'Team Performance' }}</h3>
        <div class="table-container">
          <table mat-table [dataSource]="userDataSource" matSort class="analytics-table">
            <ng-container matColumnDef="userName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ isAdmin ? 'User' : 'Team Member' }}</th>
              <td mat-cell *matCellDef="let element">{{element.userName}}</td>
            </ng-container>

            <ng-container matColumnDef="userEmail">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
              <td mat-cell *matCellDef="let element">{{element.userEmail}}</td>
            </ng-container>

            <ng-container matColumnDef="totalEntries">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Entries</th>
              <td mat-cell *matCellDef="let element">{{element.totalEntries}}</td>
            </ng-container>

            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Hours</th>
              <td mat-cell *matCellDef="let element">{{element.totalHours.toFixed(1)}}</td>
            </ng-container>

              <ng-container matColumnDef="utilization">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilization</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [class]="'utilization-' + getUtilizationClass(element.utilization)">
                    {{element.utilization.toFixed(1)}}%
                  </mat-chip>
                </td>
            </ng-container>

            <ng-container matColumnDef="lastActivity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Activity</th>
              <td mat-cell *matCellDef="let element">{{element.lastActivity | date:'short'}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: userColumns;" class="dashboard-row clickable" (click)="goToReportDetail({ userEmail: row.userEmail })"></tr>
          </table>
          <mat-paginator #userPaginator
            [pageSizeOptions]="[5, 10, 25]"
            [pageSize]="5"
            showFirstLastButtons
            aria-label="Select page of users">
          </mat-paginator>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-md);
      background: var(--aja-surface-2);
      min-height: 100vh;
      color: var(--aja-charcoal);
    }

    .dashboard-header {
      background: var(--aja-surface-1);
      color: var(--aja-charcoal);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-xl);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-md);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
    }

    .header-left p {
      margin: var(--spacing-sm) 0 0 0;
      font-size: 1rem;
      color: var(--aja-grey);
    }

    .export-btn {
      background: var(--aja-slate);
      color: var(--aja-white);
    }

    .notification-btn {
      margin-right: var(--spacing-md);
      color: var(--aja-charcoal);
      
      &:hover {
        background: var(--aja-grey-lightest);
      }
    }

    /* Filters Section */
    .filters-section {
      background: var(--aja-surface-1);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-xl);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .filter-field {
      width: 100%;
    }

    .filter-field ::ng-deep .mat-select-panel {
      max-height: 300px;
    }

    .filter-field ::ng-deep .mat-option {
      height: auto;
      line-height: 1.2;
      padding: 8px 16px;
    }

    .filter-field ::ng-deep .mat-select-search {
      padding: 8px 16px;
      border-bottom: 1px solid var(--aja-grey-lighter);
    }

    .filter-field ::ng-deep .mat-form-field-suffix {
      color: var(--aja-grey);
    }

    .filter-field ::ng-deep .mat-hint {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .filter-field ::ng-deep .mat-form-field-outline {
      border-color: var(--aja-grey-lighter);
    }

    .filter-field ::ng-deep .mat-form-field-outline-thick {
      border-color: var(--aja-slate);
    }

    .filter-field ::ng-deep .mat-form-field-label {
      color: var(--aja-charcoal);
    }

    .filter-field ::ng-deep .mat-form-field-label.mat-form-field-empty {
      color: var(--aja-grey);
    }

    .filter-field ::ng-deep .mat-form-field-infix {
      padding: 8px 0;
    }

    .filter-field ::ng-deep input[matInput] {
      font-size: 14px;
      color: var(--aja-charcoal);
    }

    .filter-field ::ng-deep input[matInput]::placeholder {
      color: var(--aja-grey);
    }

    .filter-field ::ng-deep .mat-datepicker-toggle {
      color: var(--aja-slate);
    }

    .filter-field ::ng-deep .mat-datepicker-toggle:hover {
      color: var(--aja-primary);
    }

    .filter-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }

    .apply-btn {
      background: var(--aja-slate);
      color: var(--aja-white);
    }

    .clear-btn {
      color: var(--aja-grey);
      border-color: var(--aja-grey-lighter);
    }

    /* Metrics Section */
    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .metric-card {
      background: var(--aja-surface-1);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .clickable { cursor: pointer; }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--aja-white);
    }

    .metric-icon.total-entries { background: var(--aja-slate); }
    .metric-icon.total-hours { background: var(--aja-charcoal); }
    .metric-icon.billable-hours { background: var(--aja-crimson); }
    .metric-icon.active-users { background: var(--aja-grey); }
    .metric-icon.pending { background: var(--aja-orange); }
    .metric-icon.in-progress { background: var(--aja-light-green); }

    .metric-content h3 {
      margin: 0;
      font-size: 32px;
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
      line-height: 1.2;
    }

    .metric-content p {
      margin: var(--spacing-xs) 0 0 0;
      color: var(--aja-slate);
      font-size: 12px;
      font-weight: var(--font-weight-regular);
    }

    /* Charts Section */
    .charts-section {
      margin-bottom: var(--tabler-spacing-xl);
    }

    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--tabler-spacing-lg);
      margin-bottom: var(--tabler-spacing-lg);
    }

    .chart-card {
      background: var(--tabler-color-surface);
      border-radius: var(--tabler-radius-lg);
      padding: var(--tabler-spacing-lg);
      box-shadow: var(--tabler-shadow-sm);
      border: 1px solid var(--tabler-color-border-light);
    }

    .chart-card h3 {
      margin: 0 0 var(--tabler-spacing-md) 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--tabler-color-text-primary);
      line-height: 1.3;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    /* Tables Section */
    .tables-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
      gap: var(--spacing-lg);
    }

    .table-card {
      background: var(--aja-surface-1);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
    }

    .table-card h3 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: 1.25rem;
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
    }

    .table-container {
      overflow-x: auto;
    }

    .analytics-table {
      width: 100%;
    }

    .analytics-table ::ng-deep .mat-header-cell {
      background: var(--aja-surface-2);
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-regular);
      text-transform: uppercase;
      border-bottom: 2px solid var(--aja-slate-light);
      padding: var(--spacing-md);
    }

    .analytics-table ::ng-deep .mat-cell {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--aja-grey-lighter);
    }

    .dashboard-row ::ng-deep .mat-chip {
      border-radius: 9999px !important;
      font-weight: 600 !important;
      padding: 4px 10px !important;
      border: 1px solid transparent !important;
    }

    /* Status/priority badges - aligned with global palette */
    .status-completed { background: #dcfce7 !important; color: #065f46 !important; border: 1px solid #86efac !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }
    .status-carriedout { background: #fff7ed !important; color: #92400e !important; border: 1px solid #fdba74 !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }
    .status-notstarted { background: #eef2ff !important; color: #3730a3 !important; border: 1px solid #c7d2fe !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }

    .priority-high { background: #fee2e2 !important; color: #991b1b !important; border: 1px solid #fca5a5 !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }
    .priority-medium { background: #e2e8f0 !important; color: #1f2937 !important; border: 1px solid #cbd5e1 !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }
    .priority-low { background: #f3f4f6 !important; color: #374151 !important; border: 1px solid #e5e7eb !important; border-radius: 9999px; padding: 4px 10px; font-weight: 600; }

    .utilization-low {
      background: #fef3c7 !important;
      color: #92400e !important;
      border: 1px solid #fbbf24 !important;
    }

    .utilization-medium {
      background: #dbeafe !important;
      color: #1e40af !important;
      border: 1px solid #60a5fa !important;
    }

    .utilization-high {
      background: #d1fae5 !important;
      color: #065f46 !important;
      border: 1px solid #34d399 !important;
    }

    .completion-low {
      background: #fee2e2 !important;
      color: #991b1b !important;
      border: 1px solid #fca5a5 !important;
    }

    .completion-medium {
      background: #fef3c7 !important;
      color: #92400e !important;
      border: 1px solid #fbbf24 !important;
    }

    .completion-high {
      background: #d1fae5 !important;
      color: #065f46 !important;
      border: 1px solid #34d399 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .chart-row {
        grid-template-columns: 1fr;
      }

      .tables-section {
        grid-template-columns: 1fr;
      }

      .filter-row {
        grid-template-columns: 1fr;
      }

      .metrics-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Compliance Section */
    .compliance-section {
      margin-top: var(--spacing-xl);
      
      .section-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
        
        h2 {
          font-size: 2rem;
          font-weight: var(--font-weight-regular);
          color: var(--aja-charcoal);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        p {
          font-size: 1.1rem;
          color: var(--aja-grey);
          margin: 0;
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @ViewChild('deptPaginator') deptPaginator!: MatPaginator;
  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Input properties to make this component reusable
  @Input() userRole: 'ADMIN' | 'SUPERVISOR' = 'ADMIN';
  @Input() userDepartment: string = '';

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get dashboardTitle(): string {
    return this.isAdmin ? 'Reports' : 'Department Reports';
  }

  get dashboardSubtitle(): string {
    return this.isAdmin 
      ? 'Key insights and drill-down analytics' 
      : `Analytics for ${this.userDepartment} Department`;
  }

  metrics: DashboardMetrics = {
    totalEntries: 0,
    totalHours: 0,
    billableHours: 0,
    activeUsers: 0,
    departments: 0,
    averageHoursPerEntry: 0,
    notStartedTasks: 0,
    carriedOutTasks: 0,
    completedTasks: 0
  };

  entries: TimesheetEntry[] = [];
  departmentStats: DepartmentStats[] = [];
  userStats: UserStats[] = [];
  departments: string[] = [];
  selectedDepartment: string = '';
  selectedEmployee: string = '';
  selectedEmployeeName: string = '';
  selectedStatus: string = '';
  filteredDepartments: string[] = [];
  filteredEmployees: UserStats[] = [];
  dateRange: FormGroup;

  // Data sources for tables with pagination
  departmentDataSource = new MatTableDataSource<DepartmentStats>([]);
  userDataSource = new MatTableDataSource<UserStats>([]);

  departmentColumns: string[] = ['department', 'totalEntries', 'totalHours', 'billableHours', 'utilization', 'completionRate'];
  userColumns: string[] = ['userName', 'userEmail', 'totalEntries', 'totalHours', 'utilization', 'lastActivity'];

  // Chart Data
  taskCompletionChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  departmentUtilizationChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  employeeHoursChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  priorityCompletionChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  statusCompletionChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  monthlyUtilizationChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  billableDistributionChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  employeeUtilizationChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  // Notification properties
  criticalAlertsCount$ = this.notificationService.criticalAlertsCount$;

  // Chart Options
  taskCompletionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  departmentUtilizationChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  employeeHoursChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  priorityCompletionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  statusCompletionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  monthlyUtilizationChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  billableDistributionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      }
    }
  };

  employeeUtilizationChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  constructor(
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: ComplianceNotificationService,
    private timesheetMonitoringService: TimesheetMonitoringService
  ) {
    this.dateRange = this.fb.group({
      start: [''],
      end: ['']
    });
  }

  ngOnInit(): void {
    // Auto-set department filter for supervisors
    if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      this.selectedDepartment = this.userDepartment;
    }
    
    // Watch for date range changes and auto-apply filters
    this.dateRange.valueChanges.subscribe(value => {
      console.log('📅 Date range changed (valueChanges):', value);
      if (value.start && value.end) {
        console.log('  → Both dates selected, auto-applying filters in 300ms');
        // Small delay to allow for manual date typing
        setTimeout(() => {
          if (this.dateRange.value.start && this.dateRange.value.end) {
            this.applyFilters();
          }
        }, 300);
      }
    });
    
    this.loadDashboardData();
    this.timesheetMonitoringService.compliance$.subscribe(compliance => {
      this.notificationService.generateComplianceAlerts(compliance);
    });
  }

  ngAfterViewInit(): void {
    // Connect paginators and sort to data sources
    this.departmentDataSource.paginator = this.deptPaginator;
    this.userDataSource.paginator = this.userPaginator;
    this.departmentDataSource.sort = this.sort;
    this.userDataSource.sort = this.sort;
  }

  loadDashboardData(): void {
    console.log('🔄 Loading optimized dashboard metrics (NO entries loaded to frontend)...');
    
    // Build filters
    const filters: any = {};
    if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      filters.department = this.userDepartment;
    }
    
    // Use optimized backend endpoint - calculates everything in SQL
    this.analyticsService.getDashboardMetrics(filters).subscribe({
      next: (response) => {
        console.log('✅ Dashboard metrics loaded from backend:', response);
        
        // Update metrics directly from backend
        this.metrics = response.metrics;
        
        // Update department stats
        this.departmentStats = response.departmentStats;
        this.departmentDataSource.data = this.departmentStats;
        
        // Update user stats
        this.userStats = response.userStats;
        this.userDataSource.data = this.userStats;
        
        // Extract departments for filters
        this.departments = response.departmentStats.map(d => d.department);
        this.filteredDepartments = [...this.departments];
        
        // Load limited entries for charts (only need 1000 for visualization)
        this.loadChartData(filters);
        
        this.snackBar.open(`Dashboard loaded: ${response.metrics.totalEntries} entries`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error loading dashboard metrics:', error);
        this.snackBar.open('Error loading dashboard. Please try again.', 'Close', { duration: 5000 });
      }
    });
  }
  
  loadChartData(filters: any): void {
    console.log('📊 Loading ALL chart data for complete visualization...');
    
    // Load ALL entries for complete chart visualization
    this.timesheetService.getAllEntries({ page: 1, limit: 100000 }, filters).subscribe({
      next: (response: any) => {
        const entries = response.entries || [];
        console.log('📊 Chart data loaded:', entries.length, 'entries');
        this.entries = entries;
        this.updateCharts(entries);
      },
      error: (error) => {
        console.error('❌ Error loading chart data:', error);
      }
    });
  }

  private loadSampleData(): void {
    const sampleEntries: TimesheetEntry[] = [
      {
        id: '1',
        date: '2024-08-04',
        client_file_number: 'CL001',
        department: 'Legal',
        task: 'Contract Review',
        activity: 'Document Analysis',
        priority: 'High',
        start_time: '09:00',
        end_time: '12:00',
        status: 'Completed',
        billable: true,
        total_hours: 3.0,
        user_id: 'user1',
        user_first_name: 'John',
        user_last_name: 'Doe',
        user_email: 'john.doe@aja.com'
      },
      {
        id: '2',
        date: '2024-08-04',
        client_file_number: 'CL002',
        department: 'Finance',
        task: 'Financial Analysis',
        activity: 'Data Processing',
        priority: 'Medium',
        start_time: '13:00',
        end_time: '16:00',
        status: 'CarriedOut',
        billable: true,
        total_hours: 3.0,
        user_id: 'user2',
        user_first_name: 'Jane',
        user_last_name: 'Smith',
        user_email: 'jane.smith@aja.com'
      },
      {
        id: '3',
        date: '2024-08-04',
        client_file_number: 'CL003',
        department: 'HR',
        task: 'Policy Review',
        activity: 'Documentation',
        priority: 'Low',
        start_time: '10:00',
        end_time: '11:00',
        status: 'NotStarted',
        billable: false,
        total_hours: 1.0,
        user_id: 'user3',
        user_first_name: 'Mike',
        user_last_name: 'Johnson',
        user_email: 'mike.johnson@aja.com'
      },
      {
        id: '4',
        date: '2024-08-03',
        client_file_number: 'CL004',
        department: 'Legal',
        task: 'Case Research',
        activity: 'Legal Research',
        priority: 'High',
        start_time: '08:00',
        end_time: '11:00',
        status: 'Completed',
        billable: true,
        total_hours: 3.0,
        user_id: 'user1',
        user_first_name: 'John',
        user_last_name: 'Doe',
        user_email: 'john.doe@aja.com'
      },
      {
        id: '5',
        date: '2024-08-03',
        client_file_number: 'CL005',
        department: 'Finance',
        task: 'Budget Planning',
        activity: 'Financial Planning',
        priority: 'Medium',
        start_time: '14:00',
        end_time: '17:00',
        status: 'Completed',
        billable: true,
        total_hours: 3.0,
        user_id: 'user2',
        user_first_name: 'Jane',
        user_last_name: 'Smith',
        user_email: 'jane.smith@aja.com'
      }
    ];
    
    this.entries = sampleEntries;
    this.calculateMetrics(sampleEntries);
    this.calculateDepartmentStats(sampleEntries);
    this.calculateUserStats(sampleEntries);
    this.extractDepartments(sampleEntries);
    this.updateCharts(sampleEntries);
  }

  calculateMetrics(entries: TimesheetEntry[]): void {
    // Create unique users based on email (more reliable than user_id)
    const uniqueUsers = new Set(entries.map(entry => entry.user_email || 'unknown'));
    const uniqueDepartments = new Set(entries.map(entry => entry.department));

    // Debug logging
    console.log('🔍 Debug - All entries:', entries);
    console.log('🔍 Debug - Unique user emails:', Array.from(uniqueUsers));
    console.log('🔍 Debug - Unique departments:', Array.from(uniqueDepartments));

    // Ensure all numeric values are properly converted to numbers
    const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0);
    const billableHours = entries.filter(entry => entry.billable).reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0);

    this.metrics = {
      totalEntries: entries.length,
      totalHours: totalHours,
      billableHours: billableHours,
      activeUsers: uniqueUsers.size, // Count of unique staff members who have timesheet entries
      departments: uniqueDepartments.size,
      averageHoursPerEntry: entries.length > 0 ? totalHours / entries.length : 0,
      notStartedTasks: entries.filter(entry => entry.status === 'NotStarted').length,
      carriedOutTasks: entries.filter(entry => entry.status === 'CarriedOut').length,
      completedTasks: entries.filter(entry => entry.status === 'Completed').length
    };

    console.log('📊 Calculated metrics:', this.metrics);
  }

  calculateDepartmentStats(entries: TimesheetEntry[]): void {
    const departmentMap = new Map<string, DepartmentStats>();
    
    entries.forEach(entry => {
      if (!departmentMap.has(entry.department)) {
        departmentMap.set(entry.department, {
          department: entry.department,
          totalEntries: 0,
          totalHours: 0,
          billableHours: 0,
          averageHours: 0,
          completionRate: 0,
          utilization: 0
        });
      }

      const stats = departmentMap.get(entry.department)!;
      const hours = parseFloat(entry.total_hours?.toString() || '0') || 0;
      
      stats.totalEntries++;
      stats.totalHours += hours;
      if (entry.billable) {
        stats.billableHours += hours;
      }
    });

    // Calculate averages and rates
    departmentMap.forEach(stats => {
      stats.averageHours = stats.totalEntries > 0 ? stats.totalHours / stats.totalEntries : 0;
      stats.completionRate = stats.totalEntries > 0 ? 
        (entries.filter(e => e.department === stats.department && e.status === 'Completed').length / stats.totalEntries) * 100 : 0;
      stats.utilization = stats.totalHours > 0 ? Math.min((stats.totalHours / 40) * 100, 100) : 0; // Assuming 40 hours as full utilization
    });

    this.departmentStats = Array.from(departmentMap.values());
    this.departmentDataSource.data = this.departmentStats;
  }

  calculateUserStats(entries: TimesheetEntry[]): void {
    const userMap = new Map<string, UserStats>();
    
    entries.forEach(entry => {
      // Use email as the unique identifier instead of user_id
      const userEmail = entry.user_email || 'unknown@aja.com';
      if (!userMap.has(userEmail)) {
        userMap.set(userEmail, {
          userId: entry.user_id || 'unknown',
          userName: `${entry.user_first_name || 'Unknown'} ${entry.user_last_name || 'User'}`,
          userEmail: userEmail,
          totalEntries: 0,
          totalHours: 0,
          billableHours: 0,
          averageHours: 0,
          lastActivity: entry.updated_at || entry.created_at || entry.date,
          utilization: 0
        });
      }

      const stats = userMap.get(userEmail)!;
      const hours = parseFloat(entry.total_hours?.toString() || '0') || 0;
      
      stats.totalEntries++;
      stats.totalHours += hours;
      if (entry.billable) {
        stats.billableHours += hours;
      }
      // Use the most recent timestamp for last activity
      const entryTimestamp = entry.updated_at || entry.created_at || entry.date;
      if (new Date(entryTimestamp) > new Date(stats.lastActivity)) {
        stats.lastActivity = entryTimestamp;
      }
    });

    // Calculate averages and utilization
    userMap.forEach(stats => {
      stats.averageHours = stats.totalEntries > 0 ? stats.totalHours / stats.totalEntries : 0;
      stats.utilization = stats.totalHours > 0 ? Math.min((stats.totalHours / 40) * 100, 100) : 0;
    });

    this.userStats = Array.from(userMap.values());
    this.filteredEmployees = [...this.userStats];
    this.userDataSource.data = this.userStats;
    
    console.log('👥 Debug - User stats calculated:', this.userStats);
  }

  extractDepartments(entries: TimesheetEntry[]): void {
    this.departments = [...new Set(entries.map(entry => entry.department))];
    this.filteredDepartments = [...this.departments];
  }

  updateCharts(entries: TimesheetEntry[]): void {
    console.log('📊 Updating ALL charts with', entries.length, 'filtered entries');
    console.log('  → Departments:', [...new Set(entries.map(e => e.department))].length);
    console.log('  → Users:', [...new Set(entries.map(e => e.user_email))].length);
    console.log('  → Date range:', entries.length > 0 ? `${entries[0]?.date} to ${entries[entries.length - 1]?.date}` : 'No data');
    
    this.updateTaskCompletionChart(entries);
    this.updateDepartmentUtilizationChart(entries);
    this.updateEmployeeHoursChart(entries);
    this.updatePriorityCompletionChart(entries);
    this.updateStatusCompletionChart(entries);
    this.updateMonthlyUtilizationChart(entries);
    this.updateBillableDistributionChart(entries);
    this.updateEmployeeUtilizationChart(entries);
    
    console.log('✅ All 8 charts updated successfully');
  }

  updateTaskCompletionChart(entries: TimesheetEntry[]): void {
    const statuses = ['Completed', 'CarriedOut', 'NotStarted'];
    const departments = [...new Set(entries.map(entry => entry.department))];
    
    console.log('Task completion chart - Statuses:', statuses);
    console.log('Task completion chart - Departments:', departments);
    
    this.taskCompletionChartData = {
      labels: statuses.map(s => s === 'CarriedOut' ? 'Ongoing' : s === 'NotStarted' ? 'Not Started' : s),
      datasets: departments.map((dept, index) => ({
        label: dept,
        data: statuses.map(status => 
          entries.filter(entry => entry.department === dept && entry.status === status).length
        ),
        backgroundColor: this.getDepartmentColor(index),
        borderColor: this.getDepartmentColor(index),
        borderWidth: 1
      }))
    };
    
    console.log('Task completion chart data:', this.taskCompletionChartData);
  }

  updateDepartmentUtilizationChart(entries: TimesheetEntry[]): void {
    // Calculate department stats from filtered entries
    const departmentMap = new Map<string, { totalHours: number, count: number }>();
    
    entries.forEach(entry => {
      if (!departmentMap.has(entry.department)) {
        departmentMap.set(entry.department, { totalHours: 0, count: 0 });
      }
      const stats = departmentMap.get(entry.department)!;
      stats.totalHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
      stats.count++;
    });

    const departmentStats = Array.from(departmentMap.entries())
      .map(([dept, stats]) => ({
        department: dept,
        utilization: stats.totalHours > 0 ? Math.min((stats.totalHours / 40) * 100, 100) : 0
      }))
      .slice(0, 7); // Top 7 departments
    
    this.departmentUtilizationChartData = {
      labels: departmentStats.map(stat => stat.department),
      datasets: [{
        data: departmentStats.map(stat => stat.utilization),
        backgroundColor: departmentStats.map((_, index) => this.getDepartmentColor(index)),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  updateEmployeeHoursChart(entries: TimesheetEntry[]): void {
    // Calculate employee stats from filtered entries
    const employeeMap = new Map<string, { userName: string, totalHours: number }>();
    
    entries.forEach(entry => {
      const userEmail = entry.user_email || 'unknown@aja.com';
      const userName = `${entry.user_first_name || 'Unknown'} ${entry.user_last_name || 'User'}`;
      
      if (!employeeMap.has(userEmail)) {
        employeeMap.set(userEmail, { userName, totalHours: 0 });
      }
      const stats = employeeMap.get(userEmail)!;
      stats.totalHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
    });

    const employees = Array.from(employeeMap.entries())
      .map(([email, stats]) => ({ userEmail: email, userName: stats.userName, totalHours: stats.totalHours }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5); // Top 5 employees by hours

    const departments = [...new Set(entries.map(entry => entry.department))];
    
    this.employeeHoursChartData = {
      labels: employees.map(emp => emp.userName),
      datasets: departments.map((dept, index) => ({
        label: dept,
        data: employees.map(emp => 
          entries.filter(entry => entry.user_email === emp.userEmail && entry.department === dept)
            .reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0)
        ),
        backgroundColor: this.getDepartmentColor(index),
        borderColor: this.getDepartmentColor(index),
        borderWidth: 1
      }))
    };
  }

  updatePriorityCompletionChart(entries: TimesheetEntry[]): void {
    const priorities = ['High', 'Medium', 'Low'];
    const completionRates = priorities.map(priority => {
      const priorityEntries = entries.filter(entry => entry.priority === priority);
      const completedEntries = priorityEntries.filter(entry => entry.status === 'Completed');
      return priorityEntries.length > 0 ? (completedEntries.length / priorityEntries.length) * 100 : 0;
    });

    this.priorityCompletionChartData = {
      labels: priorities.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
      datasets: [{
        data: completionRates,
        backgroundColor: ['#C83131', '#FFA500', '#6C757D'],
        borderColor: ['#C83131', '#FFA500', '#6C757D'],
        borderWidth: 1
      }]
    };
  }

  updateStatusCompletionChart(entries: TimesheetEntry[]): void {
    const statuses = ['Completed', 'CarriedOut', 'NotStarted'];
    const completionRates = statuses.map(status => {
      const statusEntries = entries.filter(entry => entry.status === status);
      return entries.length > 0 ? (statusEntries.length / entries.length) * 100 : 0;
    });

    this.statusCompletionChartData = {
      labels: statuses.map(s => s === 'CarriedOut' ? 'Ongoing' : s === 'NotStarted' ? 'Not Started' : s),
      datasets: [{
        data: completionRates,
        backgroundColor: ['#90EE90', '#FFFFE0', '#FFA500'],
        borderColor: ['#90EE90', '#FFFFE0', '#FFA500'],
        borderWidth: 1
      }]
    };
  }

  updateMonthlyUtilizationChart(entries: TimesheetEntry[]): void {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = new Date().getMonth();
    const recentMonths = months.slice(Math.max(0, currentMonth - 3), currentMonth + 1);
    
    const utilizationRates = recentMonths.map(month => {
      const monthEntries = entries.filter(entry => {
        const entryMonth = new Date(entry.date).getMonth();
        return months[entryMonth] === month;
      });
      const totalHours = monthEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0);
      return totalHours > 0 ? Math.min((totalHours / 40) * 100, 100) : 0;
    });

    this.monthlyUtilizationChartData = {
      labels: recentMonths,
      datasets: [{
        data: utilizationRates,
        backgroundColor: '#44505E',
        borderColor: '#44505E',
        borderWidth: 1
      }]
    };
  }

  updateBillableDistributionChart(entries: TimesheetEntry[]): void {
    const billableHours = entries.filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0);
    const nonBillableHours = entries.filter(entry => !entry.billable)
      .reduce((sum, entry) => sum + (parseFloat(entry.total_hours?.toString() || '0') || 0), 0);
    
    const totalHours = billableHours + nonBillableHours;
    const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    const nonBillablePercentage = totalHours > 0 ? (nonBillableHours / totalHours) * 100 : 0;

    this.billableDistributionChartData = {
      labels: ['Non Billable', 'Billable'],
      datasets: [{
        data: [nonBillablePercentage, billablePercentage],
        backgroundColor: ['#2196F3', '#FF9800'],
        borderColor: ['#2196F3', '#FF9800'],
        borderWidth: 2
      }]
    };
  }

  updateEmployeeUtilizationChart(entries: TimesheetEntry[]): void {
    // Calculate employee utilization from filtered entries
    const employeeMap = new Map<string, { totalHours: number, count: number }>();
    
    entries.forEach(entry => {
      const userEmail = entry.user_email || 'unknown@aja.com';
      if (!employeeMap.has(userEmail)) {
        employeeMap.set(userEmail, { totalHours: 0, count: 0 });
      }
      const stats = employeeMap.get(userEmail)!;
      stats.totalHours += parseFloat(entry.total_hours?.toString() || '0') || 0;
      stats.count++;
    });

    const employeeStats = Array.from(employeeMap.entries())
      .map(([email, stats]) => ({
        userEmail: email,
        userName: entries.find(e => e.user_email === email)?.user_first_name + ' ' + entries.find(e => e.user_email === email)?.user_last_name || 'Unknown User',
        utilization: stats.totalHours > 0 ? Math.min((stats.totalHours / 40) * 100, 100) : 0
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5); // Top 5 employees by utilization
    
    this.employeeUtilizationChartData = {
      labels: employeeStats.map(emp => emp.userName),
      datasets: [{
        data: employeeStats.map(emp => emp.utilization),
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 2
      }]
    };
  }

  getDepartmentColor(index: number): string {
    const colors = ['#44505E', '#162037', '#6C757D', '#ADB5BD', '#C83131', '#90EE90', '#FFA500'];
    return colors[index % colors.length];
  }

  applyFilters(): void {
    console.log('🔍 Applying filters:', {
      department: this.selectedDepartment,
      employee: this.selectedEmployee,
      status: this.selectedStatus,
      dateRange: this.dateRange.value
    });
    
    // Build filter parameters
    const filters: any = {};
    
    if (this.selectedDepartment) {
      filters.department = this.selectedDepartment;
    } else if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      // Supervisors always have department filter
      filters.department = this.userDepartment;
    }
    
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }
    
    if (this.selectedEmployee) {
      filters.userEmail = this.selectedEmployee;
    }
    
    if (this.dateRange.value.start && this.dateRange.value.end) {
      // Use local date formatting to avoid timezone issues
      const startDate = this.dateRange.value.start;
      const endDate = this.dateRange.value.end;
      
      filters.dateFrom = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      filters.dateTo = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      console.log('📅 Date filter applied (local timezone):');
      console.log('  → Start:', this.dateRange.value.start, '→', filters.dateFrom);
      console.log('  → End:', this.dateRange.value.end, '→', filters.dateTo);
      console.log('  → Full filters object:', filters);
    } else {
      console.log('⚠️ No date range selected - showing all data');
      console.log('  → Start value:', this.dateRange.value.start);
      console.log('  → End value:', this.dateRange.value.end);
    }
    
    // Use optimized backend endpoint - NO entries loaded for metrics
    console.log('🔍 Applying filters with optimized backend:', filters);
    this.analyticsService.getDashboardMetrics(filters).subscribe({
      next: (response) => {
        console.log('✅ Filtered metrics loaded:', response);
        
        // Update metrics directly from backend
        this.metrics = response.metrics;
        
        // Update department stats
        this.departmentStats = response.departmentStats;
        this.departmentDataSource.data = this.departmentStats;
        
        // Update user stats
        this.userStats = response.userStats;
        this.userDataSource.data = this.userStats;
        
        // Update departments list
        this.departments = response.departmentStats.map(d => d.department);
        this.filteredDepartments = [...this.departments];
        
        // Load limited entries for charts
        this.loadChartData(filters);
        
        this.snackBar.open(`Filtered: ${response.metrics.totalEntries} entries`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error applying filters:', error);
        this.snackBar.open('Error applying filters', 'Close', { duration: 3000 });
      }
    });
  }

  onDateChange(): void {
    console.log('📅 Date changed:', {
      start: this.dateRange.value.start,
      end: this.dateRange.value.end
    });
    // Auto-apply filters when both dates are selected
    if (this.dateRange.value.start && this.dateRange.value.end) {
      this.applyFilters();
    }
  }

  clearFilters(): void {
    console.log('🧹 Clearing all filters');
    this.selectedEmployee = '';
    this.selectedEmployeeName = '';
    this.selectedStatus = '';
    this.filteredDepartments = [...this.departments];
    this.filteredEmployees = [...this.userStats];
    this.dateRange.reset();
    
    // For supervisors, keep department filter
    if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
      this.selectedDepartment = this.userDepartment;
    } else {
      this.selectedDepartment = '';
    }
    
    this.loadDashboardData();
  }

  exportReport(): void {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      panelClass: 'report-dialog-panel',
      data: {
        departments: this.departments,
        userRole: this.userRole,
        userDepartment: this.userDepartment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Report generated successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  getCompletionClass(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 50) return 'medium';
    return 'low';
  }

  getUtilizationClass(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 50) return 'medium';
    return 'low';
  }

  getUserName(userId: string): string {
    const user = this.userStats.find(u => u.userId === userId);
    return user ? user.userName : 'Unknown User';
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'Completed': return 'Completed';
      case 'CarriedOut': return 'Ongoing';
      case 'NotStarted': return 'Not Started';
      default: return status;
    }
  }

  filterDepartments(event: any): void {
    const value = event.target.value.toLowerCase();
    this.filteredDepartments = this.departments.filter(dept => 
      dept.toLowerCase().includes(value)
    );
    
    // Show visual feedback when searching
    if (value.length > 0) {
      console.log(`🔍 Searching departments for: "${value}" - Found ${this.filteredDepartments.length} matches`);
    }
  }

  filterEmployees(event: any): void {
    const value = event.target.value.toLowerCase();
    this.filteredEmployees = this.userStats.filter(user => 
      user.userName.toLowerCase().includes(value)
    );
    
    // Show visual feedback when searching
    if (value.length > 0) {
      console.log(`🔍 Searching employees for: "${value}" - Found ${this.filteredEmployees.length} matches`);
    }
  }

  onDepartmentSelected(event: any): void {
    this.selectedDepartment = event.option.value;
    this.applyFilters();
  }

  onEmployeeSelected(event: any): void {
    const selectedUser = this.userStats.find(user => user.userName === event.option.value);
    this.selectedEmployee = selectedUser ? selectedUser.userEmail : '';
    this.selectedEmployeeName = event.option.value;
    this.applyFilters();
  }

  goToReportDetail(filters: any): void {
    const queryParams: any = {};
    if (filters.department) queryParams.department = filters.department;
    if (filters.userEmail) queryParams.userEmail = filters.userEmail;
    if (filters.status) queryParams.status = filters.status;
    if (filters.billable !== undefined) queryParams.billable = filters.billable;
    if (this.dateRange.value.start && this.dateRange.value.end) {
      // Use local date formatting to avoid timezone issues
      const startDate = this.dateRange.value.start;
      const endDate = this.dateRange.value.end;
      
      queryParams.dateFrom = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      queryParams.dateTo = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    }
    const route = this.isAdmin ? '/admin/reports/detail' : '/supervisor/reports/detail';
    this.router.navigate([route], { queryParams });
  }

  showComplianceAlerts(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/compliance']);
    } else if (this.userRole === 'SUPERVISOR') {
      this.router.navigate(['/supervisor/compliance']);
    }
  }
} 