import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { TimesheetEntry } from '../models/timesheet-entry.interface';
import { TimesheetService } from '../services/timesheet.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../services/timesheet.service';

// Custom validator for time validation
function timeRangeValidator() {
  return (formGroup: FormGroup) => {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;
    
    if (!startTime || !endTime) {
      return null; // Let required validators handle empty values
    }
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    if (startMinutes >= endMinutes) {
      return { timeRange: true };
    }
    
    return null;
  };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

@Component({
  selector: 'app-timesheet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
        <div class="dialog-title">
          <div class="title-left">
            <div class="title-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="title-text">
              <h2>{{isView ? 'View' : (isEdit ? 'Edit' : 'Add')}} Timesheet Entry</h2>
              <span>Legal time tracking and billing</span>
            </div>
          </div>
          <button mat-icon-button mat-dialog-close aria-label="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-form">
        <mat-dialog-content class="dialog-content">
        <!-- Helper banner -->
        <div class="helper-banner">
          <mat-icon>lightbulb</mat-icon>
          <div class="helper-text">
            <div><strong>Tip:</strong> Pick a date, choose a task, then select start and end times. We calculate the hours for you.</div>
            <div><strong>Guide:</strong> Billable is disabled automatically when it does not apply (e.g., Completed with 0h).</div>
          </div>
        </div>
        <div class="form-grid">
            <!-- Row 1: Date, Client File Number, Department -->
          <div class="form-row">
            <mat-form-field appearance="outline" matTooltip="The date you performed the work" matTooltipPosition="above">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('date')?.hasError('required')">Date is required</mat-error>
              <mat-hint>e.g., today</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" matTooltip="Client or file reference to associate this time with" matTooltipPosition="above">
              <mat-label>Client File Number</mat-label>
              <input matInput formControlName="clientFileNumber" required>
              <mat-error *ngIf="form.get('clientFileNumber')?.hasError('required')">Client file number is required</mat-error>
              <mat-hint>Example: CFN-2025-0001</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" matTooltip="Your department is preselected from your profile" matTooltipPosition="above">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department" required>
                <mat-option value="Legal">Legal</mat-option>
                <mat-option value="Finance">Finance</mat-option>
                <mat-option value="IT">IT</mat-option>
                <mat-option value="HR">HR</mat-option>
                <mat-option value="Sales">Sales</mat-option>
                <mat-option value="Marketing">Marketing</mat-option>
                <mat-option value="Operations">Operations</mat-option>
                <mat-option value="Support">Support</mat-option>
                <mat-option value="IT Security">IT Security</mat-option>
                <mat-option value="Admin">Admin</mat-option>
                <mat-option value="R&D">R&D</mat-option>
                <mat-option value="Procurement">Procurement</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('department')?.hasError('required')">Department is required</mat-error>
              <mat-hint>Department is set to your assigned department</mat-hint>
            </mat-form-field>
          </div>

            <!-- Row 2: Task, Priority, Status -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="task-field" matTooltip="Pick the task you worked on. Type to filter." matTooltipPosition="above">
              <mat-label>Task</mat-label>
              <mat-select formControlName="task" required (openedChange)="onTaskPanelOpened($event)">
                <!-- Inline filter input inside the panel -->
                <mat-option class="task-filter-option" disabled>
                  <input matInput placeholder="Search tasks..." (click)="$event.stopPropagation()" (keyup)="applyTaskFilter($event)">
                </mat-option>
                <mat-option *ngFor="let task of availableTasksFiltered" [value]="task">{{task}}</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('task')?.hasError('required')">Task is required</mat-error>
              <mat-hint>Select a task from your department</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" matTooltip="How important this activity is" matTooltipPosition="above">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority" required>
                <mat-option value="Low">Low</mat-option>
                <mat-option value="Medium">Medium</mat-option>
                <mat-option value="High">High</mat-option>
                <mat-option value="Critical">Critical</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('priority')?.hasError('required')">Priority is required</mat-error>
            </mat-form-field>

              <mat-form-field appearance="outline" matTooltip="Current progress of the task" matTooltipPosition="above">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="Completed">Completed</mat-option>
                  <mat-option value="CarriedOut">Ongoing</mat-option>
                  <mat-option value="NotStarted">Not Started</mat-option>
                </mat-select>
                <mat-error *ngIf="form.get('status')?.hasError('required')">Status is required</mat-error>
              </mat-form-field>
          </div>

            <!-- Row 3: Start Time, End Time, Billable Toggle -->
          <div class="form-row time-inputs">
            <mat-form-field appearance="outline" matTooltip="Start time in 15-minute steps" matTooltipPosition="above">
              <mat-label>Start Time</mat-label>
                <mat-select formControlName="startTime" required>
                  <mat-option *ngFor="let time of timeIntervals" [value]="time">{{time}}</mat-option>
                </mat-select>
              <mat-error *ngIf="form.get('startTime')?.hasError('required')">Start time is required</mat-error>
              <mat-hint>Tip: Use arrow keys to move quickly</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" matTooltip="End time in 15-minute steps" matTooltipPosition="above">
              <mat-label>End Time</mat-label>
                <mat-select formControlName="endTime" required>
                  <mat-option *ngFor="let time of timeIntervals" [value]="time">{{time}}</mat-option>
                </mat-select>
              <mat-error *ngIf="form.get('endTime')?.hasError('required')">End time is required</mat-error>
              <mat-hint>We’ll detect overlaps automatically</mat-hint>
            </mat-form-field>

              <div class="billable-toggle">
                <mat-slide-toggle formControlName="billable" [disabled]="isBillableDisabled()">
                  Billable
                </mat-slide-toggle>
            </div>
          </div>
          
          <!-- Time range validation error - positioned below the time inputs -->
          <div class="time-validation-error" *ngIf="form.hasError('timeRange')">
            <mat-icon>error</mat-icon>
            <span>End time must be after start time</span>
          </div>

            <!-- Row 4: Activity (Full Width) -->
            <div class="form-row full-width">
            <mat-form-field appearance="outline" matTooltip="Brief description of the work you did" matTooltipPosition="above">
                <mat-label>Activity *</mat-label>
                <textarea matInput formControlName="activity" rows="2" required></textarea>
                <mat-error *ngIf="form.get('activity')?.hasError('required')">Activity description is required</mat-error>
                <mat-hint>e.g., Drafted affidavit, configured firewall rules…</mat-hint>
            </mat-form-field>
          </div>

            <!-- Row 5: Comments (Full Width) -->
            <div class="form-row full-width">
            <mat-form-field appearance="outline" matTooltip="Optional internal notes for your team" matTooltipPosition="above">
              <mat-label>Comments</mat-label>
                <textarea matInput formControlName="comments" rows="1"></textarea>
                <mat-hint>Not shown on invoices</mat-hint>
            </mat-form-field>
            </div>

            <!-- Hours Display -->
            <div class="hours-display" *ngIf="totalHours !== null">
              <h4>Total Hours</h4>
              <div class="hours-value">{{ totalHours | number:'1.2-2' }}</div>
            </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>
            {{isView ? 'Close' : 'Cancel'}}
          </button>
          <button *ngIf="!isView" 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="form.invalid">
          {{isEdit ? 'Update' : 'Add'}}
        </button>
      </mat-dialog-actions>
    </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
      border: 1px solid #e5e7eb;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
    }

    /* Ensure dialog is centered on all screen sizes */
    ::ng-deep .mat-mdc-dialog-container {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      border-radius: 16px !important;
      overflow: hidden !important;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: #1e3a8a;
      color: #ffffff;
      padding: 16px 20px;
      margin: 0 0 16px 0;
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .title-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.15);
    }

    .title-icon mat-icon {
      color: #ffffff;
    }

    .title-text h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      color: #ffffff;
    }

    .title-text span {
      display: block;
      margin-top: 2px;
      font-size: 12px;
      color: #c7d2fe;
      opacity: 0.95;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-row {
      display: contents;
    }

    .form-row > * {
      grid-column: span 1;
    }

    .form-row.full-width > * {
      grid-column: 1 / -1;
    }

    .time-inputs {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 8px;
    }

    .hours-display {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin-top: 20px;
      border: 1px solid #bbf7d0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .hours-display h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #166534;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .hours-value {
      font-size: 2rem;
      font-weight: 700;
      color: #15803d;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--aja-grey-lighter);
    }

    .save-btn {
      background: var(--aja-crimson);
      color: var(--aja-white);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-weight: var(--font-weight-regular);
      border: none;
      box-shadow: var(--shadow-md);
    }

    .save-btn:hover {
      background: #b91c1c;
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    .cancel-btn {
      color: var(--aja-grey);
      border-color: var(--aja-grey-lighter);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-weight: var(--font-weight-medium);
      background: transparent;
    }

    .cancel-btn:hover {
      background: var(--aja-surface-2);
      color: var(--aja-charcoal);
      border-color: var(--aja-crimson);
    }

    .dialog-content {
      padding: 32px;
      flex: 1;
      overflow-y: auto;
      background: white;
      min-height: 0;
    }

    .helper-banner {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .helper-banner mat-icon {
      color: #f59e0b;
    }

    .helper-text {
      display: grid;
      gap: 4px;
      font-size: 12px;
      color: #334155;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .billable-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
      border-radius: 8px;
      margin-top: 8px;
    }

    .billable-toggle mat-slide-toggle {
      margin: 0;
    }

    .billable-toggle mat-slide-toggle ::ng-deep .mdc-switch {
      margin-right: 8px;
    }

    .time-validation-error {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #dc2626;
      font-size: 13px;
      font-weight: 500;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin-top: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .time-validation-error mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #dc2626;
    }

    @media (max-width: 768px) {
      .dialog-container {
        min-width: 100%;
        max-width: 100%;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .time-inputs {
        flex-direction: column;
      }
    }
  `]
})
export class TimesheetDialogComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  isView: boolean;
  totalHours: number | null = null;
  dialogData: any;

  // Define time intervals for mat-select
  timeIntervals: string[] = [];
  availableTasks: string[] = [];
  availableTasksFiltered: string[] = [];

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TimesheetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogData = data;
    this.isEdit = data?.mode === 'edit';
    this.isView = data?.mode === 'view';
    console.log('🔍 Dialog constructor - data:', data);
    console.log('🔍 Dialog constructor - isEdit:', this.isEdit);
    console.log('🔍 Dialog constructor - isView:', this.isView);
    
    // Get current user's department - ALWAYS ensure it's populated
    const currentUser = this.authService.getCurrentUser();
    const userDepartment = currentUser?.department || 'IT'; // Fallback to IT if no user found
    
    this.form = this.fb.group({
      date: [this.isEdit || this.isView ? '' : new Date(), Validators.required],
      clientFileNumber: ['', Validators.required],
      department: [userDepartment, Validators.required],
      task: ['', Validators.required],
      activity: ['', Validators.required],
      priority: ['', Validators.required],
      startTime: [this.isEdit || this.isView ? '' : '', Validators.required],
      endTime: [this.isEdit || this.isView ? '' : '', Validators.required],
      status: ['', Validators.required],
      billable: [false],
      comments: ['']
    }, { validators: timeRangeValidator() });
    
    // Disable department field for all modes (add, edit, view)
    this.form.get('department')?.disable();

    // Disable form if in view mode
    if (this.isView) {
      this.form.disable();
    }

    // Generate time intervals for mat-select (24 hours, 15-minute intervals)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeIntervals.push(time);
      }
    }

    // No default times - let user choose
  }

  ngOnInit(): void {
    console.log('🔍 ngOnInit - data:', this.dialogData);
    console.log('🔍 ngOnInit - isEdit:', this.isEdit);
    console.log('🔍 ngOnInit - isView:', this.isView);
    
    if (this.dialogData?.entry && this.dialogData.entry.id) {
      console.log('🔄 Patching form with existing data');
      
      // Convert status from database format to form format
      let statusValue = this.dialogData.entry.status;
      if (statusValue === 'Carried Out') {
        statusValue = 'CarriedOut';
      } else if (statusValue === 'Not Started') {
        statusValue = 'NotStarted';
      }
      
      this.form.patchValue({
        date: new Date(this.dialogData.entry.date),
        clientFileNumber: this.dialogData.entry.client_file_number,
        department: this.dialogData.entry.department, // Keep original department for display
        task: this.dialogData.entry.task,
        activity: this.dialogData.entry.activity,
        priority: this.dialogData.entry.priority,
        startTime: this.dialogData.entry.start_time,
        endTime: this.dialogData.entry.end_time,
        status: statusValue,
        billable: this.dialogData.entry.billable,
        comments: this.dialogData.entry.comments
      });
    } else {
      console.log('➕ Creating new entry - using current date');
      // Ensure department is always set for new entries
      const currentUser = this.authService.getCurrentUser();
      const userDepartment = currentUser?.department || 'IT';
      this.form.patchValue({ department: userDepartment });
    }

    // Initialize available tasks based on user's department
    this.updateAvailableTasks();

    // Subscribe to department changes to update available tasks
    this.form.get('department')?.valueChanges.subscribe((department) => {
      this.updateAvailableTasks();
    });

    // Subscribe to time changes only
    this.form.get('startTime')?.valueChanges.subscribe(() => {
      this.calculateHours();
      this.form.updateValueAndValidity(); // Trigger validation
    });

    this.form.get('endTime')?.valueChanges.subscribe(() => {
      this.calculateHours();
      this.form.updateValueAndValidity(); // Trigger validation
    });

    // Subscribe to status changes only
    this.form.get('status')?.valueChanges.subscribe(() => {
      this.updateBillableState();
    });

    this.calculateHours();
    this.updateBillableState();

    // No auto-restoration - let user enter fresh data each time
  }

  onTaskPanelOpened(opened: boolean) {
    if (opened) {
      // reset filtered list whenever panel opens
      this.availableTasksFiltered = [...this.availableTasks];
    }
  }

  applyTaskFilter(event: any) {
    const value = String(event?.target?.value || '').toLowerCase();
    this.availableTasksFiltered = this.availableTasks.filter(t => t.toLowerCase().includes(value));
  }

  updateAvailableTasks(): void {
    const department = this.form.get('department')?.value;
    if (department) {
      this.timesheetService.getTasksByDepartment(department).subscribe({
        next: (response) => {
          this.availableTasks = response.tasks.map(task => task.name);
          this.availableTasksFiltered = [...this.availableTasks];
          console.log('📋 Updated available tasks for department:', department, this.availableTasks);
        },
        error: (error) => {
          console.error('❌ Error fetching tasks:', error);
          this.availableTasks = [];
          this.availableTasksFiltered = [];
        }
      });
    } else {
      this.availableTasks = [];
      this.availableTasksFiltered = [];
      console.log('📋 No department selected');
    }
  }

  calculateHours(): void {
    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    if (startTime && endTime) {
      const start = this.timeToMinutes(startTime);
      const end = this.timeToMinutes(endTime);
      this.totalHours = Math.max(0, (end - start) / 60);
      // Gentle nudge if hours are unusually long
      if (!this.isView && !this.isEdit && this.totalHours > 8) {
        // no blocking, just a console log; could show a snackbar if desired
        console.log('ℹ️ Long entry detected (>8h). Consider splitting across tasks.');
      }
    } else {
      this.totalHours = null;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  updateBillableState(): void {
    const status = this.form.get('status')?.value;
    const hours = this.totalHours || 0;
    const billableControl = this.form.get('billable');
    
    if (!billableControl) return;
    
    if (status === 'Completed' && hours === 0) {
      if (billableControl.enabled) {
        billableControl.disable();
        billableControl.setValue(false, { emitEvent: false });
      }
    } else {
      if (billableControl.disabled) {
        billableControl.enable();
      }
    }
  }

  isBillableDisabled(): boolean {
    const status = this.form.get('status')?.value;
    const hours = this.totalHours || 0;
    return status === 'Completed' && hours === 0;
  }

  onSubmit(): void {
    console.log('🔍 Form submission started');
    console.log('Form valid:', this.form.valid);
    console.log('Form values:', this.form.value);
    console.log('Form raw values:', this.form.getRawValue());
    
    if (this.form.valid) {
      const formValue = this.form.getRawValue(); // Use getRawValue to include disabled fields
      
      // Convert date to local date string format (YYYY-MM-DD)
      let dateValue;
      if (formValue.date instanceof Date) {
        const year = formValue.date.getFullYear();
        const month = String(formValue.date.getMonth() + 1).padStart(2, '0');
        const day = String(formValue.date.getDate()).padStart(2, '0');
        dateValue = `${year}-${month}-${day}`;
      } else {
        dateValue = formValue.date;
      }
      
      // Ensure billable is always a boolean
      const billableValue = formValue.billable === null || formValue.billable === undefined ? 
        false : Boolean(formValue.billable);
      
      const entry: TimesheetEntry = {
        date: dateValue,
        client_file_number: formValue.clientFileNumber,
        department: formValue.department,
        task: formValue.task,
        activity: formValue.activity,
        priority: formValue.priority,
        start_time: formValue.startTime,
        end_time: formValue.endTime,
        status: formValue.status,
        billable: billableValue,
        comments: formValue.comments
      };

      console.log('📤 Sending entry to backend:', entry);
      console.log('Billable value type:', typeof entry.billable, 'Value:', entry.billable);
      console.log('Status value type:', typeof entry.status, 'Value:', entry.status);
      console.log('Full request payload:', JSON.stringify(entry, null, 2));

      if (this.isEdit && this.dialogData?.entry) {
        console.log('🔄 Updating existing entry...');
        this.timesheetService.updateEntry(this.dialogData.entry.id!, entry).subscribe({
          next: (response) => {
            console.log('✅ Entry updated successfully:', response);
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('❌ Error updating entry:', error);
            console.error('Error details:', error.error);
            // You might want to show an error message to the user here
          }
        });
      } else {
        console.log('➕ Creating new entry...');
        this.timesheetService.createEntry(entry).subscribe({
          next: (response) => {
            console.log('✅ Entry created successfully:', response);
            // Persist last end time & last selected values for better defaults
            try {
              localStorage.setItem('ts_last_end_time', formValue.endTime);
              if (formValue.clientFileNumber) localStorage.setItem('ts_last_client', formValue.clientFileNumber);
              if (formValue.task) localStorage.setItem('ts_last_task', formValue.task);
            } catch (_) {}
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('❌ Error creating entry:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            // You might want to show an error message to the user here
          }
        });
      }
    } else {
      console.log('❌ Form is invalid');
      console.log('Form errors:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });
    }
  }
} 