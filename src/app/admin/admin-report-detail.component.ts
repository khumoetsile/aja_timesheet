import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
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
              <mat-option value="CarriedOut">Ongoing</mat-option>
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
          <div class="chart-container">
            <canvas baseChart [data]="statusChartData" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
          </div>
        </mat-card>
        <mat-card class="chart">
          <h3>{{ getDepartmentChartTitle() }}</h3>
          <div class="chart-container">
            <canvas baseChart [data]="deptChartData" [type]="'bar'" [options]="barOptions"></canvas>
          </div>
        </mat-card>
      </div>

      <mat-card>
        <div class="table-header">
          <h3>Timesheet Entries (All Data)</h3>
          <div class="table-controls">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="applyTableFilter($event)" placeholder="Search all columns..." #searchInput />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(ngModel)]="tableStatusFilter" (selectionChange)="applyStatusFilter()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="Completed">Completed</mat-option>
                <mat-option value="CarriedOut">Ongoing</mat-option>
                <mat-option value="NotStarted">Not Started</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="clearTableFilters()" matTooltip="Clear filters" *ngIf="tableStatusFilter || searchInput.value">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table mat-table [dataSource]="entriesDataSource" matSort class="mat-elevation-z0">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let e">{{e.date | date:'mediumDate'}}</td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
              <td mat-cell *matCellDef="let e">{{e.user_first_name}} {{e.user_last_name}}</td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let e">{{e.department}}</td>
            </ng-container>
            <ng-container matColumnDef="task">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Task</th>
              <td mat-cell *matCellDef="let e">{{e.task}}</td>
            </ng-container>
            <ng-container matColumnDef="timeRange">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Time Range</th>
              <td mat-cell *matCellDef="let e">{{e.start_time}} - {{e.end_time}}</td>
            </ng-container>
            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Hours</th>
              <td mat-cell *matCellDef="let e">{{e.total_hours}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let e">{{e.status === 'CarriedOut' ? 'Ongoing' : (e.status === 'NotStarted' ? 'Not Started' : e.status)}}</td>
            </ng-container>
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let e">{{e.created_at | date:'medium'}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator 
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageSize]="10"
            showFirstLastButtons
            aria-label="Select page of entries">
          </mat-paginator>
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
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .chart { padding: 16px; }
    .chart h3 { margin: 0 0 16px 0; font-size: 16px; color: var(--aja-charcoal); font-weight: 500; }
    .chart-container { height: 280px; position: relative; }
    .chart-container canvas { max-height: 280px !important; height: 280px !important; }
    @media (max-width: 1200px) {
      .charts { grid-template-columns: 1fr; }
    }
    .table-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
    .table-header h3 { margin: 8px 0 0 0; }
    .table-controls { display: flex; gap: 12px; align-items: center; }
    .search-field { min-width: 280px; }
    .status-filter { min-width: 180px; }
    .table-wrap { overflow: auto; }
  `]
})
export class AdminReportDetailComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  @Input() userRole: 'ADMIN' | 'SUPERVISOR' = 'ADMIN';
  @Input() userDepartment: string = '';

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  displayedColumns = ['date','user','department','task','timeRange','hours','status','created'];
  report: ReportData | null = null;
  filters: FilterParams = {};
  dateFrom?: Date;
  dateTo?: Date;

  // Data source for paginated table
  entriesDataSource = new MatTableDataSource<TimesheetEntry>([]);
  
  // Table filtering
  tableStatusFilter: string = '';
  allEntries: TimesheetEntry[] = []; // Store all entries for filtering

  statusChartData: ChartData<'doughnut'> = { labels: ['Completed','Ongoing','Not Started'], datasets: [{ data: [0,0,0], backgroundColor: ['#059669','#f59e0b','#dc2626'] }] };
  deptChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], backgroundColor: '#44505E' }] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  barOptions: ChartConfiguration<'bar'>['options'] = { 
    responsive: true, 
    maintainAspectRatio: false, 
    indexAxis: 'y',
    scales: { 
      x: { beginAtZero: true },
      y: {
        ticks: {
          autoSkip: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

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

  ngAfterViewInit(): void {
    this.entriesDataSource.paginator = this.paginator;
    this.entriesDataSource.sort = this.sort;
    
    // Custom filter predicate to search across all columns
    this.entriesDataSource.filterPredicate = (data: TimesheetEntry, filter: string) => {
      const searchStr = filter.toLowerCase();
      const statusDisplay = data.status === 'CarriedOut' ? 'Ongoing' : (data.status === 'NotStarted' ? 'Not Started' : data.status);
      
      return (
        data.date?.toString().toLowerCase().includes(searchStr) ||
        data.user_first_name?.toLowerCase().includes(searchStr) ||
        data.user_last_name?.toLowerCase().includes(searchStr) ||
        `${data.user_first_name} ${data.user_last_name}`.toLowerCase().includes(searchStr) ||
        data.department?.toLowerCase().includes(searchStr) ||
        data.task?.toLowerCase().includes(searchStr) ||
        data.total_hours?.toString().includes(searchStr) ||
        statusDisplay.toLowerCase().includes(searchStr) ||
        data.activity?.toLowerCase().includes(searchStr) ||
        data.client_file_number?.toLowerCase().includes(searchStr)
      );
    };
  }

  reload(): void {
    // Limit to 100 entries for detail view to prevent browser crash with large datasets
    // Load ALL entries - no limitations, optimized SQL handles performance
    const pagination: PaginationParams = { page: 1, limit: 100000 };
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
      this.allEntries = res.entries; // Store all entries
      this.applyTableFiltersInternal(); // Apply any existing table filters
      this.updateCharts();
    });
  }

  applyTableFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.entriesDataSource.filter = filterValue.trim().toLowerCase();

    if (this.entriesDataSource.paginator) {
      this.entriesDataSource.paginator.firstPage();
    }
  }

  applyStatusFilter(): void {
    this.applyTableFiltersInternal();
  }

  applyTableFiltersInternal(): void {
    let filteredData = [...this.allEntries];

    // Apply status filter
    if (this.tableStatusFilter) {
      filteredData = filteredData.filter(entry => entry.status === this.tableStatusFilter);
    }

    this.entriesDataSource.data = filteredData;

    if (this.entriesDataSource.paginator) {
      this.entriesDataSource.paginator.firstPage();
    }
  }

  clearTableFilters(): void {
    this.tableStatusFilter = '';
    this.entriesDataSource.filter = '';
    this.applyTableFiltersInternal();
    
    // Clear search input
    const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  updateCharts(): void {
    if (!this.report || !this.report.entries || this.report.entries.length === 0) {
      console.log('No report data available for charts');
      return;
    }
    
    console.log('Updating charts with', this.report.entries.length, 'entries');
    
    // Status distribution chart
    const completed = this.report.entries.filter(e => e.status === 'Completed').length;
    const carried = this.report.entries.filter(e => e.status === 'CarriedOut').length;
    const notStarted = this.report.entries.filter(e => e.status === 'NotStarted').length;
    
    console.log('Status counts:', { completed, carried, notStarted });
    
    this.statusChartData = {
      labels: ['Completed','Ongoing','Not Started'],
      datasets: [{ 
        data: [completed, carried, notStarted], 
        backgroundColor: ['#059669','#f59e0b','#dc2626'],
        borderWidth: 0
      }]
    };

    // Department hours chart - aggregate efficiently
    const deptMap = new Map<string, number>();
    this.report.entries.forEach(e => {
      const hours = parseFloat((e.total_hours as any)?.toString() || '0') || 0;
      deptMap.set(e.department, (deptMap.get(e.department) || 0) + hours);
    });
    
    // Limit to top 7 departments to prevent chart overload
    const top = Array.from(deptMap.entries())
      .sort((a,b) => b[1] - a[1]);
      // Show all departments instead of limiting to top 7
    
    console.log('Top departments:', top);
      
    this.deptChartData = { 
      labels: top.map(t => t[0]), 
      datasets: [{ 
        data: top.map(t => t[1]), 
        backgroundColor: '#44505E',
        borderWidth: 0,
        label: 'Hours'
      }] 
    };
    
    console.log('Charts updated successfully');
  }

  onDateChange(): void {
    // Use local date formatting to avoid timezone issues
    if (this.dateFrom) {
      this.filters.dateFrom = `${this.dateFrom.getFullYear()}-${String(this.dateFrom.getMonth() + 1).padStart(2, '0')}-${String(this.dateFrom.getDate()).padStart(2, '0')}`;
    }
    if (this.dateTo) {
      this.filters.dateTo = `${this.dateTo.getFullYear()}-${String(this.dateTo.getMonth() + 1).padStart(2, '0')}-${String(this.dateTo.getDate()).padStart(2, '0')}`;
    }
    this.reload();
  }

  getDepartmentChartTitle(): string {
    const deptCount = this.deptChartData?.labels?.length || 0;
    
    if (this.filters.userEmail && !this.filters.department) {
      return deptCount > 1 ? 'Departments Worked On (Hours)' : 'Department (Hours)';
    } else if (this.filters.department) {
      return 'Department Hours';
    } else {
      return `All Departments (Hours)`;
    }
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

