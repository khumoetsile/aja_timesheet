import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService, ReportData, ReportFilters } from '../services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimesheetService } from '../timesheet/services/timesheet.service';
import { ReportLoadingDialogComponent } from './report-loading-dialog.component';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="report-dialog">
      <h2 mat-dialog-title>
        <mat-icon>assessment</mat-icon>
        Generate Report
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="reportForm" class="report-form">
          <!-- Basic Settings Section -->
          <div class="basic-settings-section">
            <h4>📊 Basic Settings</h4>
            <div class="two-column-grid">
              <!-- Report Type -->
              <mat-form-field appearance="outline">
                <mat-label>Report Type</mat-label>
                <mat-select formControlName="reportType">
                  <mat-option value="comprehensive">Comprehensive Report</mat-option>
                  <mat-option value="summary">Summary Report</mat-option>
                  <mat-option value="department">Department Report</mat-option>
                  <mat-option value="user">User Report</mat-option>
                  <mat-option value="timesheet">Timesheet Entries</mat-option>
                </mat-select>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>

              <!-- Export Format -->
              <mat-form-field appearance="outline">
                <mat-label>Export Format</mat-label>
                <mat-select formControlName="exportFormat">
                  <mat-option value="pdf">PDF Document</mat-option>
                  <mat-option value="excel">Excel Spreadsheet</mat-option>
                  <mat-option value="csv">CSV File</mat-option>
                </mat-select>
                <mat-icon matSuffix>file_download</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Date Range -->
          <div class="date-range-section">
            <h4>Date Range</h4>
            <div class="date-inputs">
              <mat-form-field appearance="outline">
                <mat-label>From Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="dateFrom">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>To Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="dateTo">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>

          <!-- Additional Filters -->
          <div class="filters-section">
            <h4>🔍 Additional Filters</h4>
            
            <div class="two-column-grid">
              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="department">
                  <mat-option value="">All Departments</mat-option>
                  <mat-option *ngFor="let dept of departments" [value]="dept">
                    {{ dept }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">All Statuses</mat-option>
                  <mat-option value="Completed">Completed</mat-option>
                  <mat-option value="CarriedOut">Carried Out</mat-option>
                  <mat-option value="NotStarted">Not Started</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- User Email Filter -->
              <mat-form-field appearance="outline">
                <mat-label>User Email</mat-label>
                <input matInput formControlName="userEmail" placeholder="name@aja.com" />
                <mat-icon matSuffix>person_search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="">All Priorities</mat-option>
                  <mat-option value="High">High</mat-option>
                  <mat-option value="Medium">Medium</mat-option>
                  <mat-option value="Low">Low</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="checkbox-container">
                <mat-checkbox formControlName="billableOnly">
                  Billable Entries Only
                </mat-checkbox>
              </div>
            </div>
          </div>

          <!-- Report Options -->
          <div class="options-section">
            <h4>⚙️ Report Options</h4>
            
            <div class="options-grid">
              <mat-checkbox formControlName="includeCharts">
                Include Charts and Graphs
              </mat-checkbox>
              
              <mat-checkbox formControlName="includeSummary">
                Include Summary Metrics
              </mat-checkbox>
              
              <mat-checkbox formControlName="includeDetails">
                Include Detailed Entries
              </mat-checkbox>
            </div>
          </div>


        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()" [disabled]="isGenerating">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="generateReport()" 
                [disabled]="reportForm.invalid || isGenerating">
          <mat-icon>download</mat-icon>
          Generate Report
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .report-dialog {
      min-width: 600px;
      max-width: 700px;
      border-radius: 16px !important;
      overflow: hidden;
    }

    .report-dialog ::ng-deep .mat-dialog-container {
      padding: 0;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 
                  0 9px 46px 8px rgba(0,0,0,0.12), 
                  0 11px 15px -7px rgba(0,0,0,0.20);
    }

    /* Dialog Title */
    h2[mat-dialog-title] {
      background: linear-gradient(135deg, var(--aja-navy) 0%, var(--aja-slate) 100%);
      color: var(--aja-white);
      padding: var(--spacing-lg);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: 1.5rem;
      font-weight: var(--font-weight-semibold);
      border-bottom: none;
    }

    h2[mat-dialog-title] mat-icon {
      color: var(--aja-white);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    /* Dialog Content */
    mat-dialog-content {
      padding: var(--spacing-xl);
      background: var(--aja-surface-2);
      max-height: 70vh;
      overflow-y: auto;
    }

    .report-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    /* Form Field Styling */
    ::ng-deep .mat-form-field-outline {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
    }

    ::ng-deep .mat-form-field-outline-start,
    ::ng-deep .mat-form-field-outline-end {
      border-radius: var(--radius-lg) !important;
    }

    ::ng-deep .mat-form-field-outline-thick {
      color: var(--aja-slate);
      border-width: 2px;
    }

    ::ng-deep .mat-form-field-label {
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-medium);
    }

    ::ng-deep .mat-form-field-label.mat-focused {
      color: var(--aja-slate);
    }

    ::ng-deep .mat-select-arrow {
      color: var(--aja-slate);
    }

    ::ng-deep .mat-datepicker-toggle {
      color: var(--aja-slate);
    }

    /* Section Styling */
    .basic-settings-section,
    .date-range-section,
    .filters-section,
    .options-section {
      background: var(--aja-surface-1);
      border: 1px solid var(--aja-grey-lighter);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      margin: 0;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .basic-settings-section:hover,
    .date-range-section:hover,
    .filters-section:hover,
    .options-section:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .basic-settings-section h4,
    .date-range-section h4,
    .filters-section h4,
    .options-section h4 {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-semibold);
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding-bottom: var(--spacing-sm);
      border-bottom: 2px solid var(--aja-surface-3);
    }

    /* Two-column grid layout */
    .two-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    /* Options grid for checkboxes */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
    }

    /* Checkbox container styling */
    .checkbox-container {
      display: flex;
      align-items: center;
      min-height: 56px; /* Match form field height */
    }

    .date-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    /* Checkbox Styling */
    ::ng-deep .mat-checkbox {
      margin: var(--spacing-md) 0;
    }

    ::ng-deep .mat-checkbox-checked .mat-checkbox-background {
      background-color: var(--aja-slate);
    }

    ::ng-deep .mat-checkbox-ripple .mat-ripple-element {
      background-color: var(--aja-slate) !important;
    }

    ::ng-deep .mat-checkbox-label {
      font-weight: var(--font-weight-medium);
      color: var(--aja-charcoal);
    }

    mat-checkbox {
      display: block;
      margin: var(--spacing-md) 0;
      transition: all 0.2s ease;
    }

    mat-checkbox:hover {
      transform: translateX(4px);
    }



    /* Dialog Actions */
    mat-dialog-actions {
      padding: var(--spacing-md) var(--spacing-xl) var(--spacing-lg);
      background: var(--aja-surface-1);
      border-top: 1px solid var(--aja-grey-lighter);
      gap: var(--spacing-md);
    }

    ::ng-deep mat-dialog-actions .mat-button {
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      padding: 0 var(--spacing-md);
      height: 40px;
      color: var(--aja-grey);
      border: 1px solid var(--aja-grey-lighter);
      transition: all 0.2s ease;
    }

    ::ng-deep mat-dialog-actions .mat-button:hover {
      background: var(--aja-surface-2);
      border-color: var(--aja-grey);
      transform: translateY(-1px);
    }

    ::ng-deep mat-dialog-actions .mat-raised-button {
      background: linear-gradient(135deg, var(--aja-slate) 0%, var(--aja-navy) 100%);
      color: var(--aja-white);
      border: none;
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-semibold);
      padding: 0 var(--spacing-lg);
      height: 44px;
      box-shadow: var(--shadow-md);
      transition: all 0.2s ease;
    }

    ::ng-deep mat-dialog-actions .mat-raised-button:hover:not([disabled]) {
      background: linear-gradient(135deg, var(--aja-charcoal) 0%, var(--aja-navy) 100%);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    ::ng-deep mat-dialog-actions .mat-raised-button:disabled {
      background: var(--aja-grey-lighter);
      color: var(--aja-grey);
      box-shadow: none;
      cursor: not-allowed;
    }

    ::ng-deep mat-dialog-actions .mat-raised-button mat-icon {
      color: var(--aja-white);
      margin-right: var(--spacing-sm);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .report-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      mat-dialog-content {
        padding: var(--spacing-md);
      }

      .two-column-grid,
      .date-inputs {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .basic-settings-section,
      .date-range-section,
      .filters-section,
      .options-section {
        padding: var(--spacing-md);
      }

      mat-dialog-actions {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-md);
        flex-direction: column;
      }

      ::ng-deep mat-dialog-actions .mat-button,
      ::ng-deep mat-dialog-actions .mat-raised-button {
        width: 100%;
        margin: var(--spacing-xs) 0;
      }

      .checkbox-container {
        min-height: auto;
        padding: var(--spacing-sm) 0;
      }
    }

    /* Animation for form fields */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .report-form > * {
      animation: fadeInUp 0.3s ease forwards;
    }

    .report-form > *:nth-child(1) { animation-delay: 0.1s; }
    .report-form > *:nth-child(2) { animation-delay: 0.2s; }
    .report-form > *:nth-child(3) { animation-delay: 0.3s; }
    .report-form > *:nth-child(4) { animation-delay: 0.4s; }
    .report-form > *:nth-child(5) { animation-delay: 0.5s; }
    .report-form > *:nth-child(6) { animation-delay: 0.6s; }
  `]
})
export class ReportDialogComponent implements OnInit {
  reportForm!: FormGroup;
  isGenerating = false;
  departments: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private reportService: ReportService,
    private timesheetService: TimesheetService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.departments = data?.departments || [];
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reportForm = this.fb.group({
      reportType: ['comprehensive', Validators.required],
      exportFormat: ['pdf', Validators.required],
      dateFrom: [null],
      dateTo: [null],
      department: [''],
      status: [''],
      userEmail: [''],
      priority: [''],
      billableOnly: [false],
      includeCharts: [true],
      includeSummary: [true],
      includeDetails: [true]
    });
  }

  async generateReport() {
    if (this.reportForm.invalid) {
      return;
    }

    const formValue = this.reportForm.value;
    
    // Prepare report data for the loading modal
    const reportData = {
      reportType: this.getReportTypeDisplay(formValue.reportType),
      exportFormat: formValue.exportFormat,
      dateRange: this.getDateRangeDisplay(formValue.dateFrom, formValue.dateTo)
    };

    // Close this dialog first
    this.dialogRef.close();

    // Open the loading modal
    const loadingDialogRef = this.dialog.open(ReportLoadingDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      panelClass: 'loading-dialog-panel',
      data: { reportData }
    });

    // Get reference to the loading dialog component
    const loadingComponent = loadingDialogRef.componentInstance;

    try {
      // Step 1: Prepare filters
      loadingComponent.updateProgress(1, 'Preparing filters...', 'Setting up report parameters');
      await this.delay(500);
      
      // Create backend filter parameters - ONLY from the modal filters
      const backendFilters: any = {};
      
      // Add report dialog filters only
      if (formValue.department) {
        backendFilters.department = formValue.department;
      }
      if (formValue.status) {
        backendFilters.status = formValue.status;
      }
      if (formValue.userEmail) {
        backendFilters.userEmail = formValue.userEmail;
      }
      if (formValue.dateFrom) {
        backendFilters.dateFrom = this.formatDate(formValue.dateFrom);
      }
      if (formValue.dateTo) {
        backendFilters.dateTo = this.formatDate(formValue.dateTo);
      }
      if (formValue.priority) {
        backendFilters.priority = formValue.priority;
      }
      if (formValue.billableOnly) {
        backendFilters.billable = true;
      }

      console.log('🔍 Fetching data for report with modal filters:', backendFilters);
      
      // Step 2: Fetch data
      loadingComponent.updateProgress(2, 'Fetching data...', 'Retrieving timesheet entries from database');
      
      // Fetch filtered data from backend using only modal filters
      this.timesheetService.getAllEntries({ page: 1, limit: 1000 }, backendFilters).subscribe({
        next: async (response: any) => {
          const entries = response.entries || [];
          console.log('✅ Report data fetched with modal filters:', entries.length, 'entries');
          
          // Step 3: Process data
          loadingComponent.updateProgress(3, 'Processing data...', `Analyzing ${entries.length} entries`);
          await this.delay(800);
          
          // Create report filters for the report service
          const reportFilters: ReportFilters = {
            department: formValue.department || undefined,
            status: formValue.status || undefined,
            dateFrom: formValue.dateFrom ? this.formatDate(formValue.dateFrom) : undefined,
            dateTo: formValue.dateTo ? this.formatDate(formValue.dateTo) : undefined,
            priority: formValue.priority || undefined,
            billable: formValue.billableOnly ? true : undefined,
            userEmail: formValue.userEmail || undefined
          };

          // Create report data with proper filtering
          const reportData = this.reportService.createReportData(entries, reportFilters);

          // Step 4: Generate report
          loadingComponent.updateProgress(4, 'Generating report...', `Creating ${formValue.exportFormat.toUpperCase()} document`);
          await this.delay(1000);

          // Generate report based on format
          switch (formValue.exportFormat) {
            case 'pdf':
              this.reportService.generatePDFReport(reportData, 'admin-dashboard');
              break;
            case 'excel':
              this.reportService.generateExcelReport(reportData);
              break;
            case 'csv':
              this.reportService.generateCSVReport(reportData);
              break;
          }

          // Complete
          loadingComponent.showSuccess('Download should start automatically');
          await this.delay(2000);

          this.snackBar.open('Report generated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });

          loadingDialogRef.close(true);
        },
        error: (error) => {
          console.error('❌ Error fetching report data:', error);
          loadingComponent.showError('Failed to fetch data. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error generating report:', error);
      loadingComponent.showError('An unexpected error occurred. Please try again.');
    }
  }

  private getReportTypeDisplay(reportType: string): string {
    const types: { [key: string]: string } = {
      'comprehensive': 'Comprehensive Report',
      'summary': 'Summary Report',
      'department': 'Department Report',
      'user': 'User Report',
      'timesheet': 'Timesheet Entries'
    };
    return types[reportType] || reportType;
  }

  private getDateRangeDisplay(dateFrom: Date, dateTo: Date): string {
    if (!dateFrom && !dateTo) return '';
    if (dateFrom && dateTo) {
      return `${this.formatDate(dateFrom)} to ${this.formatDate(dateTo)}`;
    }
    if (dateFrom) return `From ${this.formatDate(dateFrom)}`;
    if (dateTo) return `Until ${this.formatDate(dateTo)}`;
    return '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  closeDialog() {
    this.dialogRef.close();
  }
} 