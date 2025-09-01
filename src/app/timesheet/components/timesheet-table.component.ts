import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TimesheetService } from '../services/timesheet.service';
import { TimesheetEntry } from '../models/timesheet-entry.interface';
import { TimesheetDialogComponent } from './timesheet-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-timesheet-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
    <div class="timesheet-container">
      <!-- Header -->
      <div class="timesheet-header">
        <div class="header-content">
          <div class="header-left">
            <h1>Timesheet Management</h1>
            <p class="subtitle">Track your time with precision and professionalism</p>
          </div>
          <div class="toolbar-right">
            <button mat-icon-button [matMenuTriggerFor]="menu" class="action-button">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="exportCSV()">
            <mat-icon>download</mat-icon>
            <span>Export CSV</span>
          </button>
              <button mat-menu-item>
                <mat-icon>print</mat-icon>
                <span>Print Report</span>
              </button>
        </mat-menu>

            <!-- Dashboard Link -->
            <button mat-stroked-button 
                    (click)="navigateToDashboard()" 
                    class="dashboard-button">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>

            <!-- Toggle button for admin/supervisor -->
            <button *ngIf="isAdminOrSupervisor" 
                    mat-stroked-button 
                    (click)="toggleView()" 
                    class="toggle-button">
              <mat-icon>{{showAllEntries ? 'person' : 'people'}}</mat-icon>
              {{showAllEntries ? 'My Entries' : 'All Entries'}}
            </button>

            <button mat-raised-button color="primary" (click)="openDialog()" class="add-button">
          <mat-icon>add</mat-icon>
              New Entry
        </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Search</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search entries..." #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Date Range</mat-label>
          <mat-date-range-input [formGroup]="dateRange" >
            <input matStartDate formControlName="start" placeholder="Start date">
            <input matEndDate formControlName="end" placeholder="End date">
          </mat-date-range-input>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(value)]="selectedStatus" (selectionChange)="applyStatusFilter()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="Completed">Completed</mat-option>
            <mat-option value="CarriedOut">Carried Out</mat-option>
            <mat-option value="NotStarted">Not Started</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Priority</mat-label>
          <mat-select [(value)]="selectedPriority" (selectionChange)="applyFilters()">
            <mat-option value="">All Priorities</mat-option>
            <mat-option value="Low">Low</mat-option>
            <mat-option value="Medium">Medium</mat-option>
            <mat-option value="High">High</mat-option>
            <mat-option value="Critical">Critical</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Department</mat-label>
          <mat-select [(value)]="selectedDepartment" (selectionChange)="applyFilters()">
            <mat-option value="">All Departments</mat-option>
            <mat-option value="Legal">Legal</mat-option>
            <mat-option value="Finance">Finance</mat-option>
            <mat-option value="IT">IT</mat-option>
            <mat-option value="HR">HR</mat-option>
            <mat-option value="Marketing">Marketing</mat-option>
            <mat-option value="Operations">Operations</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="filter-field">
          <mat-slide-toggle [checked]="billableOnly" (change)="billableOnly = $event.checked; applyFilters()">
            Billable Only
          </mat-slide-toggle>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <!-- Loading bar -->
        <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>

        <!-- Error banner -->
        <div *ngIf="!isLoading && errorMessage" class="error-banner">
          <mat-icon>error</mat-icon>
          <span>{{errorMessage}}</span>
          <button mat-stroked-button color="primary" (click)="loadEntries()">Retry</button>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoading && !errorMessage && dataSource?.data?.length === 0" class="empty-state">
          <mat-icon class="empty-icon">schedule</mat-icon>
          <h3>No entries yet</h3>
          <p>Create your first timesheet entry to get started.</p>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            New Entry
          </button>
        </div>
        <table mat-table [dataSource]="dataSource" matSort class="timesheet-table">
          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let element">{{element.date | date:'MMM dd, yyyy'}}</td>
          </ng-container>

          <!-- User Column (Admin/Supervisor only) -->
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>User</th>
            <td mat-cell *matCellDef="let element">
              <div class="user-info">
                <div class="user-name">{{element.user_first_name}} {{element.user_last_name}}</div>
                <div class="user-email">{{element.user_email}}</div>
              </div>
            </td>
          </ng-container>

          <!-- Client File Number Column -->
          <ng-container matColumnDef="client_file_number">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Client File</th>
            <td mat-cell *matCellDef="let element">{{element.client_file_number}}</td>
          </ng-container>

          <!-- Department Column -->
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
            <td mat-cell *matCellDef="let element">{{element.department}}</td>
          </ng-container>

          <!-- Task Column -->
          <ng-container matColumnDef="task">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Task</th>
            <td mat-cell *matCellDef="let element">{{element.task}}</td>
          </ng-container>

          <!-- Activity Column -->
          <ng-container matColumnDef="activity">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Activity</th>
            <td mat-cell *matCellDef="let element">{{element.activity}}</td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [class]="'priority-' + element.priority.toLowerCase()">
                {{element.priority}}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Time Column -->
          <ng-container matColumnDef="time">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Time</th>
            <td mat-cell *matCellDef="let element">
              {{element.start_time}} - {{element.end_time}}
            </td>
          </ng-container>

          <!-- Hours Column -->
          <ng-container matColumnDef="total_hours">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Hours</th>
            <td mat-cell *matCellDef="let element">{{element.total_hours | number:'1.2-2'}}</td>
          </ng-container>

          <!-- Status Column -->
            <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let element">
              <mat-chip [ngClass]="{
                'status-completed': element.status === 'Completed',
                'status-carriedout': element.status === 'CarriedOut',
                'status-notstarted': element.status === 'NotStarted'
              }">{{ element.status === 'CarriedOut' ? 'Carried Out' : (element.status === 'NotStarted' ? 'Not Started' : element.status) }}</mat-chip>
            </td>
          </ng-container>

          <!-- Billable Column -->
          <ng-container matColumnDef="billable">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Billable</th>
            <td mat-cell *matCellDef="let element">
              <mat-icon [class]="element.billable ? 'billable-yes' : 'billable-no'">
                {{element.billable ? 'check_circle' : 'cancel'}}
              </mat-icon>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editEntry(element)">
                <mat-icon>edit</mat-icon>
                  <span>Edit</span>
              </button>
                <button mat-menu-item (click)="deleteEntry(element.id)" class="delete-action">
                <mat-icon>delete</mat-icon>
                  <span>Delete</span>
              </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
      </div>

      <!-- Summary -->
      <div class="summary-section">
        <div class="summary-card">
          <h3>Today's Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Total Hours:</span>
              <span class="stat-value">{{todayTotalHours | number:'1.2-2'}}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Billable Hours:</span>
              <span class="stat-value">{{todayBillableHours | number:'1.2-2'}}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Entries:</span>
              <span class="stat-value">{{todayEntries}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Dialog global style hook */
    :host ::ng-deep .aja-dialog-panel .mdc-dialog__surface {
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: 0 24px 64px rgba(2,6,23,0.35) !important;
      border: 1px solid rgba(15,23,42,0.06) !important;
    }
    :host ::ng-deep .aja-dialog-backdrop.mdc-dialog__scrim {
      background: rgba(2,6,23,0.48) !important;
      backdrop-filter: blur(2px);
    }
    .timesheet-container {
      padding: var(--spacing-md);
      background: var(--aja-surface-2);
      min-height: 100vh;
      color: var(--aja-charcoal);
    }

    .timesheet-header {
      background: var(--aja-surface-1);
      color: var(--aja-charcoal);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-xl);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
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

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .action-button {
      color: var(--aja-grey);
      transition: color 0.2s ease;
    }

    .action-button:hover {
      color: var(--aja-slate);
    }

    .dashboard-button {
      color: var(--aja-slate);
      border-color: var(--aja-slate);
      font-weight: var(--font-weight-regular);
    }

    .dashboard-button:hover {
      background: var(--aja-slate);
      color: var(--aja-white);
    }

    .toggle-button {
      color: var(--aja-slate);
      border-color: var(--aja-slate);
      font-weight: var(--font-weight-regular);
    }

    .toggle-button:hover {
      background: var(--aja-slate);
      color: var(--aja-white);
    }

    .add-button {
      background: var(--aja-slate);
      color: var(--aja-white);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-weight: var(--font-weight-regular);
      border: none;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .add-button:hover {
      background: var(--aja-slate-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .filters-section {
      background: var(--aja-surface-1);
      padding: var(--spacing-lg);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      align-items: end;
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
    }

    .filter-field {
      color: var(--aja-charcoal);
    }

    .filter-field ::ng-deep .mat-form-field-outline {
      color: var(--aja-grey-lighter);
    }

    .filter-field ::ng-deep .mat-form-field-label {
      color: var(--aja-grey);
    }

    .filter-field ::ng-deep .mat-form-field-outline-thick {
      color: var(--aja-slate);
    }

    .table-container {
      background: var(--aja-surface-1);
      border-radius: var(--radius-md);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--aja-grey-lighter);
      margin-bottom: var(--spacing-xl);
    }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #991b1b;
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 16px;
        color: var(--aja-grey);
      }

      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--aja-grey);
      }

    .timesheet-table {
      width: 100%;
      color: var(--aja-charcoal);
    }

    .timesheet-table ::ng-deep .mat-header-cell {
      background: var(--aja-surface-2);
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-regular);
      text-transform: uppercase;
      border-bottom: 2px solid var(--aja-slate-light);
      padding: var(--spacing-md);
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .timesheet-table ::ng-deep .mat-cell {
      color: var(--aja-charcoal);
      border-bottom: 1px solid var(--aja-grey-lighter);
      padding: var(--spacing-md);
      height: 48px;
    }

    .timesheet-table ::ng-deep .mat-row:hover {
      background: var(--aja-surface-2);
    }

    .timesheet-table ::ng-deep .mat-row:nth-child(even) {
      background: var(--aja-surface-3);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
      font-size: 14px;
    }

    .user-email {
      color: var(--aja-grey);
      font-size: 12px;
    }

    /* Professional badge styles with better contrast */
    .timesheet-table ::ng-deep mat-chip {
      padding: 4px 10px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.3px !important;
      border-radius: 9999px !important;
      border: 1px solid transparent !important;
    }

    /* Priority */
    .priority-high {
      background: #fee2e2 !important;        /* red-100 */
      color: #991b1b !important;             /* red-800 */
      border-color: #fca5a5 !important;      /* red-300 */
    }
    .priority-medium {
      background: #e2e8f0 !important;        /* slate-200 */
      color: #1f2937 !important;             /* slate-800 */
      border-color: #cbd5e1 !important;      /* slate-300 */
    }
    .priority-low {
      background: #f3f4f6 !important;        /* gray-100 */
      color: #374151 !important;             /* gray-700 */
      border-color: #e5e7eb !important;      /* gray-200 */
    }

    .status-completed {
      background: #dcfce7 !important;        /* green-100 */
      color: #065f46 !important;             /* green-800 */
      border-color: #86efac !important;      /* green-300 */
      text-transform: uppercase !important;
    }
    .status-carriedout {
      background: #fff7ed !important;        /* orange-50 */
      color: #92400e !important;             /* orange-800 */
      border-color: #fdba74 !important;      /* orange-300 */
      text-transform: uppercase !important;
    }
    .status-notstarted {
      background: #eef2ff !important;        /* indigo-50 */
      color: #3730a3 !important;             /* indigo-800 */
      border-color: #c7d2fe !important;      /* indigo-300 */
      text-transform: uppercase !important;
    }

    .billable-yes {
      color: var(--aja-slate);
    }

    .billable-no {
      color: var(--aja-grey);
    }

    .delete-action {
      color: var(--aja-crimson);
    }

    .delete-action:hover {
      background: var(--aja-surface-2);
      border-radius: var(--radius-sm);
    }

    .summary-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .summary-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: var(--spacing-lg);
      border: 1px solid var(--aja-grey-lighter);
      transition: all 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .summary-card h3 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: 1.25rem;
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
    }

    .summary-stats {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--aja-grey-lighter);
    }

    .stat:last-child {
      border-bottom: none;
    }

    .stat-label {
      color: var(--aja-grey);
      font-weight: var(--font-weight-medium);
      font-size: 14px;
    }

    .stat-value {
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-semibold);
      font-size: 16px;
    }

    @media (max-width: 1440px) {
      .summary-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 960px) {
      .summary-section {
        grid-template-columns: 1fr;
      }

      .filters-section {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-md);
      }

      .toolbar-right {
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .timesheet-container {
        padding: var(--spacing-sm);
      }

      .timesheet-header {
        padding: var(--spacing-lg);
      }

      .table-container {
        padding: var(--spacing-md);
        overflow-x: auto;
      }

      .timesheet-table {
        min-width: 800px;
      }
    }
  `]
})
export class TimesheetTableComponent implements OnInit {
  displayedColumns: string[] = [
    'date', 'client_file_number', 'department', 'task', 'activity', 
    'priority', 'time', 'total_hours', 'status', 'billable', 'actions'
  ];
  
  // Columns for admin/supervisor view (includes user info)
  adminDisplayedColumns: string[] = [
    'date', 'user', 'client_file_number', 'department', 'task', 'activity', 
    'priority', 'time', 'total_hours', 'status', 'billable', 'actions'
  ];
  
  dataSource: MatTableDataSource<TimesheetEntry>;
  dateRange: FormGroup;
  selectedStatus: string = '';
  selectedPriority: string = '';
  selectedDepartment: string = '';
  billableOnly: boolean = false;
  todayTotalHours: number = 0;
  todayBillableHours: number = 0;
  todayEntries: number = 0;
  isAdminOrSupervisor: boolean = false;
  showAllEntries: boolean = false;
  isLoading = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private timesheetService: TimesheetService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<TimesheetEntry>([]);
    this.dateRange = this.fb.group({
      start: [''],
      end: ['']
    });
    
    // Check if user is admin or supervisor
    this.isAdminOrSupervisor = this.authService.hasRole('SUPERVISOR');
    
    // Set appropriate columns based on role
    this.updateDisplayedColumns();
  }

  private updateDisplayedColumns(): void {
    if (this.isAdminOrSupervisor && this.showAllEntries) {
      this.displayedColumns = this.adminDisplayedColumns;
    } else {
      this.displayedColumns = [
        'date', 'client_file_number', 'department', 'task', 'activity', 
        'priority', 'time', 'total_hours', 'status', 'billable', 'actions'
      ];
    }
  }

  toggleView(): void {
    this.showAllEntries = !this.showAllEntries;
    this.updateDisplayedColumns();
    this.loadEntries();
  }

  ngOnInit() {
    this.loadEntries();
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'add') {
        this.openDialog();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Listen for pagination changes
    this.paginator.page.subscribe(() => {
      this.loadEntries();
    });
    
    // Listen for sort changes
    this.sort.sortChange.subscribe(() => {
      this.loadEntries();
    });
  }

  loadEntries(): void {
    console.log('🔄 Loading timesheet entries...');
    this.isLoading = true;
    this.errorMessage = '';
    console.log('👤 Is admin/supervisor:', this.isAdminOrSupervisor);
    console.log('👥 Show all entries:', this.showAllEntries);
    
    // Set up pagination parameters
    const pagination = {
      page: this.paginator?.pageIndex || 0,
      limit: this.paginator?.pageSize || 10,
      // Default to created_at to show newest entries first immediately after add
      sortBy: this.sort?.active || 'created_at',
      sortOrder: this.sort?.direction || 'desc'
    };
    
    // Set up filter parameters
    const filters = {
      dateFrom: this.dateRange.get('start')?.value,
      dateTo: this.dateRange.get('end')?.value,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
      department: this.selectedDepartment || undefined,
      billable: this.billableOnly ? true : undefined,
      search: this.dataSource?.filter || undefined
    };
    
    const observable = this.showAllEntries && this.isAdminOrSupervisor 
      ? this.timesheetService.getAllEntries(pagination, filters)
      : this.timesheetService.getEntries(pagination, filters);
    
    observable.subscribe({
      next: (response: any) => {
        console.log('✅ Entries loaded successfully:', response);
        console.log('Entries count:', response.entries.length);
        console.log('Total entries:', response.total);
        console.log('Current page:', response.page);
        console.log('Total pages:', response.totalPages);
        
        this.dataSource.data = response.entries;
        
        // Update paginator with total count
        if (this.paginator) {
          this.paginator.length = response.total;
          this.paginator.pageIndex = response.page;
        }
        
        this.calculateTodaySummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading entries:', error);
        console.error('Error details:', error.error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load entries. Please check your connection and try again.';
      }
    });
  }

  calculateTodaySummary(): void {
    console.log('📊 Calculating today\'s summary...');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log('📅 Today\'s date string:', todayString);
    
    // Log all entry dates for debugging
    console.log('📋 All entry dates in database:');
    this.dataSource.data.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`, entry.date);
    });
    
    // Reset counters
    this.todayTotalHours = 0;
    this.todayBillableHours = 0;
    this.todayEntries = 0;
    
    // Filter entries for today
    const todayEntries = this.dataSource.data.filter(entry => {
      // Handle different date formats from database
      let entryDate = entry.date;
      
      // If entry.date is a full ISO string, extract just the date part
      if (entry.date && entry.date.includes('T')) {
        entryDate = entry.date.split('T')[0];
      }
      
      console.log('📋 Checking entry date:', entryDate, 'vs today:', todayString);
      return entryDate === todayString;
    });
    
    console.log('📋 Today\'s entries found:', todayEntries.length);
    
    // Calculate summary
    todayEntries.forEach(entry => {
      this.todayEntries++;
      const hours = parseFloat(entry.total_hours?.toString() || '0');
      this.todayTotalHours += hours;
      
      if (entry.billable) {
        this.todayBillableHours += hours;
      }
    });
    
    console.log('📊 Summary calculated:', {
      totalHours: this.todayTotalHours,
      billableHours: this.todayBillableHours,
      entries: this.todayEntries
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter() {
    this.applyFilters();
  }

  applyFilters() {
    this.loadEntries();
  }

  openDialog(entry?: TimesheetEntry) {
    console.log('🔍 Opening dialog with entry:', entry);
    const dialogRef = this.dialog.open(TimesheetDialogComponent, {
      width: '820px',
      maxWidth: '90vw',
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'aja-dialog-panel',
      backdropClass: 'aja-dialog-backdrop',
      data: entry || null  // Pass null instead of empty object for new entries
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('🔍 Dialog closed with result:', result);
      if (result) {
        console.log('✅ Dialog closed successfully, refreshing data...');
        this.loadEntries();
        
        // Check if we should return to dashboard
        this.route.queryParams.subscribe(params => {
          if (params['returnTo'] === 'dashboard') {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  editEntry(entry: TimesheetEntry) {
    this.openDialog(entry);
  }

  createEntry(entry: TimesheetEntry) {
    this.timesheetService.createEntry(entry).subscribe({
      next: (response) => {
        this.snackBar.open('Timesheet entry created successfully', 'Close', {
          duration: 3000
        });
        this.loadEntries();
      },
      error: (error) => {
        console.error('Error creating entry:', error);
        this.snackBar.open('Error creating timesheet entry', 'Close', {
          duration: 3000
        });
      }
    });
  }

  updateEntry(entry: TimesheetEntry) {
    if (entry.id) {
      this.timesheetService.updateEntry(entry.id, entry).subscribe({
        next: (response) => {
          this.snackBar.open('Timesheet entry updated successfully', 'Close', {
            duration: 3000
          });
          this.loadEntries();
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.snackBar.open('Error updating timesheet entry', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  deleteEntry(id?: string) {
    if (id) {
      if (confirm('Are you sure you want to delete this timesheet entry?')) {
        this.timesheetService.deleteEntry(id).subscribe({
          next: (response) => {
            this.snackBar.open('Timesheet entry deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadEntries();
          },
          error: (error) => {
            console.error('Error deleting entry:', error);
            this.snackBar.open('Error deleting timesheet entry', 'Close', {
              duration: 3000
            });
          }
        });
      }
    }
  }

  exportCSV() {
    console.log('Exporting CSV...');
    // Implement CSV export logic here
    // This would involve converting the current dataSource.data to CSV format
    // and triggering a download.
    // For now, we'll just log the action.
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

} 
