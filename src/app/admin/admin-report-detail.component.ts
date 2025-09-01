import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TimesheetService, FilterParams, PaginationParams } from '../timesheet/services/timesheet.service';
import { TimesheetEntry } from '../timesheet/models/timesheet-entry.interface';
import { ReportService, ReportData, ReportFilters } from '../services/report.service';

@Component({
  selector: 'app-admin-report-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    NgChartsModule
  ],
  template: `
    <div class="detail-container">
      <div class="header">
        <button mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Reports
        </button>
        <div class="spacer"></div>
        <button mat-raised-button color="primary" (click)="export('pdf')">
          <mat-icon>picture_as_pdf</mat-icon>
          Export PDF
        </button>
        <button mat-raised-button color="primary" (click)="export('xlsx')">
          <mat-icon>grid_on</mat-icon>
          Export Excel
        </button>
        <button mat-raised-button color="primary" (click)="export('csv')">
          <mat-icon>table_view</mat-icon>
          Export CSV
        </button>
      </div>

      <mat-card class="filters">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.status" (selectionChange)="reload()">
              <mat-option value="">All</mat-option>
              <mat-option value="Completed">Completed</mat-option>
              <mat-option value="CarriedOut">Carried Out</mat-option>
              <mat-option value="NotStarted">Not Started</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isAdmin">
            <mat-label>Department</mat-label>
            <input matInput [(ngModel)]="filters.department" (keyup.enter)="reload()" placeholder="e.g. Legal" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>User Email</mat-label>
            <input matInput [(ngModel)]="filters.userEmail" (keyup.enter)="reload()" placeholder="name@aja.com" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>From</mat-label>
            <input matInput [matDatepicker]="fromDp" [(ngModel)]="dateFrom" (dateChange)="onDateChange()" />
            <mat-datepicker-toggle matSuffix [for]="fromDp"></mat-datepicker-toggle>
            <mat-datepicker #fromDp></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>To</mat-label>
            <input matInput [matDatepicker]="toDp" [(ngModel)]="dateTo" (dateChange)="onDateChange()" />
            <mat-datepicker-toggle matSuffix [for]="toDp"></mat-datepicker-toggle>
            <mat-datepicker #toDp></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-card>

      <div class="kpis">
        <mat-card class="kpi"><div class="label">Entries</div><div class="value">{{ report?.metrics?.totalEntries ?? 0 }}</div></mat-card>
        <mat-card class="kpi"><div class="label">Hours</div><div class="value">{{ (report?.metrics?.totalHours ?? 0) | number:'1.1-1' }}</div></mat-card>
        <mat-card class="kpi"><div class="label">Billable</div><div class="value">{{ (report?.metrics?.billableHours ?? 0) | number:'1.1-1' }}</div></mat-card>
        <mat-card class="kpi"><div class="label">Users</div><div class="value">{{ report?.metrics?.activeUsers ?? 0 }}</div></mat-card>
      </div>

      <div class="charts">
        <mat-card class="chart">
          <h3>Status Distribution</h3>
          <canvas baseChart [data]="statusChartData" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
        </mat-card>
        <mat-card class="chart">
          <h3>Top Departments</h3>
          <canvas baseChart [data]="deptChartData" [type]="'bar'" [options]="barOptions"></canvas>
        </mat-card>
      </div>

      <mat-card>
        <h3>Timesheet Entries</h3>
        <div class="table-wrap">
          <table mat-table [dataSource]="report?.entries || []" class="mat-elevation-z0">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let e">{{e.date | date:'mediumDate'}}</td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let e">{{e.user_first_name}} {{e.user_last_name}}</td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let e">{{e.department}}</td>
            </ng-container>
            <ng-container matColumnDef="task">
              <th mat-header-cell *matHeaderCellDef>Task</th>
              <td mat-cell *matCellDef="let e">{{e.task}}</td>
            </ng-container>
            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef>Hours</th>
              <td mat-cell *matCellDef="let e">{{e.total_hours}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">{{e.status === 'CarriedOut' ? 'Carried Out' : (e.status === 'NotStarted' ? 'Not Started' : e.status)}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .detail-container { padding: var(--spacing-md); display: grid; gap: var(--spacing-md); }
    .header { display: flex; align-items: center; gap: 8px; }
    .spacer { flex: 1; }
    .filters { padding: 12px; }
    .filters-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 12px; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; }
    .kpi { padding: 12px; display: grid; gap: 6px; }
    .kpi .label { color: var(--aja-grey); font-size: 12px; }
    .kpi .value { font-size: 22px; color: var(--aja-charcoal); }
    .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); gap: 12px; }
    .chart { padding: 12px; }
    .table-wrap { overflow: auto; }
  `]
})
export class AdminReportDetailComponent implements OnInit {
  @Input() userRole: 'ADMIN' | 'SUPERVISOR' = 'ADMIN';
  @Input() userDepartment: string = '';

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  displayedColumns = ['date','user','department','task','hours','status'];
  report: ReportData | null = null;
  filters: FilterParams = {};
  dateFrom?: Date;
  dateTo?: Date;

  statusChartData: ChartData<'doughnut'> = { labels: ['Completed','Carried Out','Not Started'], datasets: [{ data: [0,0,0], backgroundColor: ['#059669','#f59e0b','#dc2626'] }] };
  deptChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#44505E' }] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const { department, userEmail, status, billable, dateFrom, dateTo } = params;
      
      // For supervisors, always filter by their department
      let deptFilter = department;
      if (this.userRole === 'SUPERVISOR' && this.userDepartment) {
        deptFilter = this.userDepartment;
      }
      
      this.filters = {
        department: deptFilter || undefined,
        userEmail: userEmail || undefined,
        status: status || undefined,
        billable: billable !== undefined ? (billable === 'true' || billable === true) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };
      if (dateFrom) this.dateFrom = new Date(dateFrom);
      if (dateTo) this.dateTo = new Date(dateTo);
      this.reload();
    });
  }

  reload(): void {
    const pagination: PaginationParams = { page: 1, limit: 1000 };
    this.timesheetService.getAllEntries(pagination, this.filters).subscribe(res => {
      const reportFilters: ReportFilters = {
        department: this.filters.department,
        userEmail: this.filters.userEmail,
        status: this.filters.status,
        dateFrom: this.filters.dateFrom,
        dateTo: this.filters.dateTo,
        billable: this.filters.billable
      };
      this.report = this.reportService.createReportData(res.entries, reportFilters);
      this.updateCharts();
    });
  }

  updateCharts(): void {
    if (!this.report) return;
    const completed = this.report.entries.filter(e => e.status === 'Completed').length;
    const carried = this.report.entries.filter(e => e.status === 'CarriedOut').length;
    const notStarted = this.report.entries.filter(e => e.status === 'NotStarted').length;
    this.statusChartData = {
      labels: ['Completed','Carried Out','Not Started'],
      datasets: [{ data: [completed, carried, notStarted], backgroundColor: ['#059669','#f59e0b','#dc2626'] }]
    };

    const deptMap = new Map<string, number>();
    this.report.entries.forEach(e => {
      const hours = parseFloat((e.total_hours as any)?.toString() || '0') || 0;
      deptMap.set(e.department, (deptMap.get(e.department) || 0) + hours);
    });
    const top = Array.from(deptMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,7);
    this.deptChartData = { labels: top.map(t=>t[0]), datasets: [{ data: top.map(t=>t[1]), backgroundColor: '#44505E' }] };
  }

  onDateChange(): void {
    if (this.dateFrom) this.filters.dateFrom = this.dateFrom.toISOString().split('T')[0];
    if (this.dateTo) this.filters.dateTo = this.dateTo.toISOString().split('T')[0];
    this.reload();
  }

  export(type: 'pdf'|'xlsx'|'csv'): void {
    if (!this.report) return;
    // Attach current filters to the report payload for PDF so they can be rendered as summary
    const payload = { ...this.report, filters: {
      department: this.filters.department,
      userEmail: this.filters.userEmail,
      status: this.filters.status,
      dateFrom: this.filters.dateFrom,
      dateTo: this.filters.dateTo,
      billable: this.filters.billable
    }} as any;

    if (type === 'pdf') this.reportService.generatePDFReport(payload, '');
    if (type === 'xlsx') this.reportService.generateExcelReport(this.report);
    if (type === 'csv') this.reportService.generateCSVReport(this.report);
  }

  goBack(): void { 
    const route = this.isAdmin ? '/admin/reports' : '/supervisor/reports';
    this.router.navigate([route]); 
  }
}

