import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AnalyticsService, CustomReport } from '../services/analytics.service';

export interface ReportColumn {
  field: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable: boolean;
  filterable: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  value2?: any;
}

@Component({
  selector: 'app-custom-report-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  template: `
    <div class="report-builder-dialog">
      <h2 mat-dialog-title>
        <mat-icon>build</mat-icon>
        {{ isEditMode ? 'Edit Report' : 'Create Custom Report' }}
      </h2>

      <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-sections">
            <!-- Basic Information -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Basic Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Report Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter report name">
                    <mat-error *ngIf="reportForm.get('name')?.hasError('required')">
                      Report name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3" placeholder="Describe what this report shows"></textarea>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Data Source & Filters -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Data Source & Filters</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Data Source</mat-label>
                    <mat-select formControlName="dataSource">
                      <mat-option value="timesheets">Timesheets</mat-option>
                      <mat-option value="users">Users</mat-option>
                      <mat-option value="departments">Departments</mat-option>
                      <mat-option value="projects">Projects</mat-option>
                      <mat-option value="compliance">Compliance</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date Range</mat-label>
                    <mat-select formControlName="dateRange">
                      <mat-option value="today">Today</mat-option>
                      <mat-option value="yesterday">Yesterday</mat-option>
                      <mat-option value="thisWeek">This Week</mat-option>
                      <mat-option value="lastWeek">Last Week</mat-option>
                      <mat-option value="thisMonth">This Month</mat-option>
                      <mat-option value="lastMonth">Last Month</mat-option>
                      <mat-option value="custom">Custom Range</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row" *ngIf="reportForm.get('dateRange')?.value === 'custom'">
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
                </div>

                <!-- Dynamic Filters -->
                <div class="filters-section">
                  <h4>Filters</h4>
                  <div class="filter-list">
                    <div class="filter-item" *ngFor="let filter of filters; let i = index">
                      <div class="filter-controls">
                        <mat-form-field appearance="outline">
                          <mat-label>Field</mat-label>
                          <mat-select [(ngModel)]="filter.field">
                            <mat-option *ngFor="let column of availableColumns" [value]="column.field">
                              {{ column.displayName }}
                            </mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Operator</mat-label>
                          <mat-select [(ngModel)]="filter.operator">
                            <mat-option value="equals">Equals</mat-option>
                            <mat-option value="contains">Contains</mat-option>
                            <mat-option value="greaterThan">Greater Than</mat-option>
                            <mat-option value="lessThan">Less Than</mat-option>
                            <mat-option value="between">Between</mat-option>
                            <mat-option value="in">In List</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Value</mat-label>
                          <input matInput [(ngModel)]="filter.value" placeholder="Enter value">
                        </mat-form-field>

                        <mat-form-field appearance="outline" *ngIf="filter.operator === 'between'">
                          <mat-label>Value 2</mat-label>
                          <input matInput [(ngModel)]="filter.value2" placeholder="Enter second value">
                        </mat-form-field>

                        <button mat-icon-button type="button" (click)="removeFilter(i)" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button mat-stroked-button type="button" (click)="addFilter()">
                    <mat-icon>add</mat-icon>
                    Add Filter
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Columns Selection -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Columns & Display</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="columns-section">
                  <h4>Select Columns</h4>
                  <div class="columns-grid">
                    <div class="column-item" *ngFor="let column of availableColumns">
                      <mat-checkbox 
                        [checked]="isColumnSelected(column.field)"
                        (change)="toggleColumn(column.field)">
                        {{ column.displayName }}
                      </mat-checkbox>
                      <div class="column-options" *ngIf="isColumnSelected(column.field)">
                        <mat-checkbox 
                          [checked]="isColumnSortable(column.field)"
                          (change)="toggleColumnSortable(column.field)">
                          Sortable
                        </mat-checkbox>
                        <mat-checkbox 
                          [checked]="isColumnFilterable(column.field)"
                          (change)="toggleColumnFilterable(column.field)">
                          Filterable
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Scheduling -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Schedule & Delivery</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Schedule</mat-label>
                    <mat-select formControlName="schedule">
                      <mat-option value="none">No Schedule</mat-option>
                      <mat-option value="daily">Daily</mat-option>
                      <mat-option value="weekly">Weekly</mat-option>
                      <mat-option value="monthly">Monthly</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row" *ngIf="reportForm.get('schedule')?.value !== 'none'">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Recipients (comma-separated emails)</mat-label>
                    <input matInput formControlName="recipients" placeholder="email1@example.com, email2@example.com">
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="reportForm.invalid || isSubmitting">
            <mat-icon>save</mat-icon>
            {{ isEditMode ? 'Update Report' : 'Create Report' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styleUrls: ['./custom-report-builder.component.scss']
})
export class CustomReportBuilderComponent implements OnInit {
  reportForm: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  filters: ReportFilter[] = [];
  availableColumns: ReportColumn[] = [];
  selectedColumns: string[] = [];
  sortableColumns: string[] = [];
  filterableColumns: string[] = [];

  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CustomReportBuilderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { report?: CustomReport }
  ) {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      dataSource: ['timesheets', Validators.required],
      dateRange: ['thisMonth', Validators.required],
      startDate: [null],
      endDate: [null],
      schedule: ['none'],
      recipients: ['']
    });
  }

  ngOnInit(): void {
    this.initializeColumns();
    
    if (this.data?.report) {
      this.isEditMode = true;
      this.loadReportData(this.data.report);
    }

    this.setupFormListeners();
  }

  private initializeColumns(): void {
    this.availableColumns = [
      { field: 'userId', displayName: 'User ID', type: 'string', sortable: true, filterable: true },
      { field: 'firstName', displayName: 'First Name', type: 'string', sortable: true, filterable: true },
      { field: 'lastName', displayName: 'Last Name', type: 'string', sortable: true, filterable: true },
      { field: 'department', displayName: 'Department', type: 'string', sortable: true, filterable: true },
      { field: 'totalHours', displayName: 'Total Hours', type: 'number', sortable: true, filterable: true },
      { field: 'averageHoursPerDay', displayName: 'Avg Hours/Day', type: 'number', sortable: true, filterable: true },
      { field: 'complianceRate', displayName: 'Compliance Rate', type: 'number', sortable: true, filterable: true },
      { field: 'lastEntryDate', displayName: 'Last Entry', type: 'date', sortable: true, filterable: true },
      { field: 'utilizationRate', displayName: 'Utilization Rate', type: 'number', sortable: true, filterable: true }
    ];

    // Default selected columns
    this.selectedColumns = ['firstName', 'lastName', 'department', 'totalHours', 'complianceRate'];
    this.sortableColumns = ['firstName', 'lastName', 'totalHours', 'complianceRate'];
    this.filterableColumns = ['department', 'complianceRate'];
  }

  private setupFormListeners(): void {
    this.reportForm.get('dataSource')?.valueChanges.subscribe(source => {
      this.updateColumnsForDataSource(source);
    });
  }

  private updateColumnsForDataSource(source: string): void {
    // Update available columns based on data source
    switch (source) {
      case 'timesheets':
        this.availableColumns = [
          { field: 'entryId', displayName: 'Entry ID', type: 'string', sortable: true, filterable: true },
          { field: 'userId', displayName: 'User ID', type: 'string', sortable: true, filterable: true },
          { field: 'date', displayName: 'Date', type: 'date', sortable: true, filterable: true },
          { field: 'hours', displayName: 'Hours', type: 'number', sortable: true, filterable: true },
          { field: 'description', displayName: 'Description', type: 'string', sortable: true, filterable: true }
        ];
        break;
      case 'users':
        this.availableColumns = [
          { field: 'userId', displayName: 'User ID', type: 'string', sortable: true, filterable: true },
          { field: 'firstName', displayName: 'First Name', type: 'string', sortable: true, filterable: true },
          { field: 'lastName', displayName: 'Last Name', type: 'string', sortable: true, filterable: true },
          { field: 'department', displayName: 'Department', type: 'string', sortable: true, filterable: true },
          { field: 'email', displayName: 'Email', type: 'string', sortable: true, filterable: true }
        ];
        break;
      // Add more cases for other data sources
    }
  }

  private loadReportData(report: CustomReport): void {
    this.reportForm.patchValue({
      name: report.name,
      description: report.description,
      schedule: report.schedule,
      recipients: report.recipients.join(', ')
    });

    if (report.filters) {
      this.filters = report.filters;
    }

    if (report.columns) {
      this.selectedColumns = report.columns;
    }
  }

  addFilter(): void {
    this.filters.push({
      field: '',
      operator: 'equals',
      value: ''
    });
  }

  removeFilter(index: number): void {
    this.filters.splice(index, 1);
  }

  toggleColumn(field: string): void {
    const index = this.selectedColumns.indexOf(field);
    if (index > -1) {
      this.selectedColumns.splice(index, 1);
    } else {
      this.selectedColumns.push(field);
    }
  }

  isColumnSelected(field: string): boolean {
    return this.selectedColumns.includes(field);
  }

  toggleColumnSortable(field: string): void {
    const index = this.sortableColumns.indexOf(field);
    if (index > -1) {
      this.sortableColumns.splice(index, 1);
    } else {
      this.sortableColumns.push(field);
    }
  }

  isColumnSortable(field: string): boolean {
    return this.sortableColumns.includes(field);
  }

  toggleColumnFilterable(field: string): void {
    const index = this.filterableColumns.indexOf(field);
    if (index > -1) {
      this.filterableColumns.splice(index, 1);
    } else {
      this.filterableColumns.push(field);
    }
  }

  isColumnFilterable(field: string): boolean {
    return this.filterableColumns.includes(field);
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.reportForm.value;
    const reportData: Partial<CustomReport> = {
      name: formValue.name,
      description: formValue.description,
      filters: this.filters,
      columns: this.selectedColumns,
      schedule: formValue.schedule,
      recipients: formValue.recipients ? formValue.recipients.split(',').map((email: string) => email.trim()) : []
    };

    if (this.isEditMode && this.data.report) {
      this.analyticsService.saveCustomReport({ ...this.data.report, ...reportData }).subscribe(
        (updatedReport) => {
          this.snackBar.open('Report updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(updatedReport);
        },
        (error) => {
          this.snackBar.open('Failed to update report', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      );
    } else {
      this.analyticsService.saveCustomReport(reportData as CustomReport).subscribe(
        (newReport) => {
          this.snackBar.open('Report created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(newReport);
        },
        (error) => {
          this.snackBar.open('Failed to create report', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
