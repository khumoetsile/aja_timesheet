import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { TaskService } from '../services/task.service';
import { DepartmentService } from '../services/department.service';

interface DepartmentTask {
  id?: number;
  department: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="admin-tasks-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="page-title">
              <mat-icon class="title-icon">task_alt</mat-icon>
              <h1>Task Management</h1>
            </div>
            <p class="page-subtitle">Efficiently manage and organize tasks across all departments</p>
          </div>
          <div class="header-actions">
            <button 
              mat-raised-button 
              color="primary" 
              class="refresh-btn"
              (click)="onDepartmentChange()"
              [disabled]="!selectedDepartment || isLoading">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Task Form Card -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="card-icon">{{ editingIndex === -1 ? 'add_task' : 'edit' }}</mat-icon>
              {{ editingIndex === -1 ? 'Add New Task' : 'Edit Task' }}
            </mat-card-title>
            <mat-card-subtitle>{{ editingIndex === -1 ? 'Create a new task for the selected department' : 'Update the selected task' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="taskForm" class="task-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Department *</mat-label>
                  <mat-select formControlName="department" (selectionChange)="onDepartmentChange()">
                    <mat-option *ngFor="let dept of departments" [value]="dept.name">
                      {{ dept.name }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>business</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Task Name *</mat-label>
                  <input matInput formControlName="name" placeholder="Enter task name">
                  <mat-icon matSuffix>assignment</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3" 
                           placeholder="Provide a detailed description of the task"></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button 
                  type="button" 
                  mat-button 
                  class="cancel-btn"
                  (click)="cancelEdit()"
                  [disabled]="editingIndex === -1">
                  <mat-icon>close</mat-icon>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  mat-raised-button 
                  color="primary" 
                  class="submit-btn"
                  (click)="saveTask()"
                  [disabled]="!taskForm.valid || !selectedDepartment || isLoading">
                  <mat-icon *ngIf="!isLoading">{{ editingIndex === -1 ? 'add' : 'save' }}</mat-icon>
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  {{ editingIndex === -1 ? 'Add Task' : 'Update Task' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Tasks List Card -->
        <mat-card class="list-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="card-icon">list_alt</mat-icon>
              Department Tasks
            </mat-card-title>
            <mat-card-subtitle>
              {{ selectedDepartment ? selectedDepartment + ' Department' : 'Select a department to view tasks' }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="tasks-content">
              <!-- Loading State -->
              <div *ngIf="isLoading" class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading tasks...</p>
              </div>

              <!-- Empty State -->
              <div *ngIf="!isLoading && (!selectedDepartment || filteredTasks.length === 0)" class="empty-state">
                <mat-icon class="empty-icon">inbox</mat-icon>
                <h3>{{ !selectedDepartment ? 'Select a Department' : 'No Tasks Found' }}</h3>
                <p>{{ !selectedDepartment ? 'Choose a department from the form to view its tasks' : 'This department doesn\'t have any tasks yet. Create one above!' }}</p>
              </div>

              <!-- Tasks Table with Search and Pagination -->
              <div *ngIf="!isLoading && selectedDepartment && filteredTasks.length > 0" class="table-container">
                <!-- Search and Controls -->
                <div class="table-controls">
                  <div class="search-section">
                    <mat-form-field appearance="outline" class="search-field">
                      <mat-label>Search tasks</mat-label>
                      <input matInput [(ngModel)]="searchTerm" 
                             (input)="onSearchInput($event)"
                             placeholder="Search by task name or description">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                  <div class="stats-section">
                    <span class="task-count">{{ paginatedTasks.length }} of {{ filteredTasks.length }} Tasks</span>
                  </div>
                </div>

                <!-- Tasks Grid -->
                <div class="tasks-grid">
                  <div *ngFor="let task of paginatedTasks; trackBy: trackByTaskId; let i = index" class="task-item">
                    <div class="task-header">
                      <div class="task-title">
                        <h4>{{ task.name }}</h4>
                        <div class="task-meta">
                          <span class="dept-label">{{ task.department }}</span>
                        </div>
                      </div>
                      <div class="task-actions">
                        <button 
                          mat-icon-button 
                          matTooltip="Edit Task"
                          (click)="editTask(task, i)"
                          class="action-btn edit-btn">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button 
                          mat-icon-button 
                          matTooltip="Delete Task"
                          (click)="deleteTask(i)"
                          class="action-btn delete-btn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    
                    <div *ngIf="task.description" class="task-description">
                      <p>{{ task.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Pagination - Always show when there are tasks -->
                <div class="pagination-container" *ngIf="filteredTasks.length > 0">
                  <mat-paginator
                    [length]="filteredTasks.length"
                    [pageSize]="pageSize"
                    [pageSizeOptions]="[2, 5, 10, 25]"
                    [pageIndex]="currentPage"
                    (page)="onPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-tasks-container {
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    .page-header {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .page-title h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.025em;
    }

    .page-subtitle {
      margin: 0;
      font-size: 16px;
      color: #64748b;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .refresh-btn {
      border-radius: 12px;
      padding: 12px 20px;
      font-weight: 600;
      text-transform: none;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    .form-card, .list-card {
      border-radius: 16px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      background: white;
    }

    .form-card {
      position: sticky;
      top: 24px;
    }

    .card-icon {
      color: #3b82f6;
      margin-right: 8px;
    }

    mat-card-header {
      padding: 24px 24px 0;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    }

    mat-card-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    mat-card-subtitle {
      color: #64748b;
      font-size: 14px;
      font-weight: 400;
    }

    mat-card-content {
      padding: 24px;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    /* Remove black underlines from form fields */
    ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline {
      color: rgba(226, 232, 240, 0.6) !important;
    }

    ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-thick {
      color: #3b82f6 !important;
    }

    ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-gap {
      border-top-color: rgba(226, 232, 240, 0.6) !important;
    }

    ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-start,
    ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-end {
      border-color: rgba(226, 232, 240, 0.6) !important;
    }

    ::ng-deep .mat-mdc-form-field-appearance-outline.mat-focused .mat-mdc-form-field-outline-thick {
      color: #3b82f6 !important;
    }

    ::ng-deep .mat-mdc-form-field-appearance-outline.mat-focused .mat-mdc-form-field-outline-start,
    ::ng-deep .mat-mdc-form-field-appearance-outline.mat-focused .mat-mdc-form-field-outline-end {
      border-color: #3b82f6 !important;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .cancel-btn {
      border-radius: 10px;
      padding: 10px 20px;
      font-weight: 500;
      text-transform: none;
    }

    .submit-btn {
      border-radius: 10px;
      padding: 10px 24px;
      font-weight: 600;
      text-transform: none;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }

    .tasks-content {
      min-height: 200px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
      color: #64748b;
    }

    .loading-container p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #64748b;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      max-width: 300px;
    }

    .table-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    }

    .search-section {
      flex: 1;
      max-width: 400px;
    }

    .search-field {
      width: 100%;
    }

    .stats-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .task-count {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      background: #f1f5f9;
      padding: 8px 16px;
      border-radius: 20px;
    }

    .tasks-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .task-item {
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba(226, 232, 240, 0.6);
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .task-item:hover {
      background: #f8fafc;
      border-color: rgba(59, 130, 246, 0.2);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .task-title {
      flex: 1;
    }

    .task-title h4 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
    }

    .task-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    .dept-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      background: #f1f5f9;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .task-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .edit-btn {
      color: #3b82f6;
    }

    .edit-btn:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    .delete-btn {
      color: #ef4444;
    }

    .delete-btn:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .task-description {
      margin-top: 8px;
    }

    .task-description p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding: 20px 0;
      border-top: 1px solid rgba(226, 232, 240, 0.6);
      margin-top: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }

    /* Ensure pagination is always visible when needed */
    .pagination-container mat-paginator {
      background: transparent;
    }

    /* Make pagination controls more prominent */
    ::ng-deep .pagination-container .mat-mdc-paginator {
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Clean search field styling */
    .search-field {
      width: 100%;
    }

    .search-field ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline {
      color: rgba(226, 232, 240, 0.6) !important;
    }

    .search-field ::ng-deep .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-thick {
      color: #3b82f6 !important;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .form-card {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .admin-tasks-container {
        padding: 16px;
      }

      .page-header {
        padding: 24px;
        margin-bottom: 20px;
      }

      .header-content {
        flex-direction: column;
        gap: 20px;
      }

      .page-title h1 {
        font-size: 28px;
      }

      .content-grid {
        gap: 16px;
      }

      mat-card-content {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .submit-btn, .cancel-btn {
        width: 100%;
      }

      .table-controls {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-section {
        max-width: none;
      }
    }

    @media (max-width: 480px) {
      .admin-tasks-container {
        padding: 12px;
      }

      .page-header {
        padding: 20px;
        border-radius: 12px;
      }

      .page-title h1 {
        font-size: 24px;
      }

      .title-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      mat-card-content {
        padding: 16px;
      }

      .task-item {
        padding: 16px;
      }

      .task-header {
        flex-direction: column;
        gap: 12px;
      }

      .task-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class AdminTasksComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  taskForm: FormGroup;
  departments: any[] = [];
  tasks: DepartmentTask[] = [];
  filteredTasks: DepartmentTask[] = [];
  paginatedTasks: DepartmentTask[] = [];
  editingIndex: number = -1;
  selectedDepartment: string | null = null;
  isLoading: boolean = false;
  private isChangingDepartment: boolean = false;
  
  // Search and pagination
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 2;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private taskApi: TaskService,
    private deptApi: DepartmentService,
    private snack: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      department: ['', Validators.required],
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    
    // Watch for department changes with debouncing to prevent rapid API calls
    this.taskForm.get('department')?.valueChanges.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if value actually changed
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onDepartmentChange();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.deptApi.getDepartments().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.departments = response.departments;
        }
      },
      error: (error: any) => {
        console.error('Failed to load departments:', error);
        this.snack.open('Failed to load departments', 'Close', { duration: 3000 });
      }
    });
  }

  onDepartmentChange(): void {
    // Prevent multiple simultaneous department changes
    if (this.isChangingDepartment || this.isLoading) {
      return;
    }

    const department = this.taskForm.get('department')?.value;
    
    // If we're changing to a new department, reset the form first
    if (this.selectedDepartment && this.selectedDepartment !== department) {
      this.clearFormFields();
    }
    
    this.selectedDepartment = department;
    
    if (department) {
      this.isChangingDepartment = true;
      this.loadTasks(department);
    } else {
      this.tasks = [];
      this.filteredTasks = [];
      this.paginatedTasks = [];
    }
  }

  clearFormFields(): void {
    // Keep the department selected, only clear name and description
    const currentDepartment = this.taskForm.get('department')?.value;
    this.taskForm.patchValue({
      department: currentDepartment,
      name: '',
      description: ''
    });
    
    // Reset form state
    this.taskForm.markAsUntouched();
    this.taskForm.markAsPristine();
    
    // Reset component state but keep department
    this.editingIndex = -1;
    
    // Apply filters to refresh the task list
    setTimeout(() => {
      this.applyFilters();
    }, 100);
  }

  loadTasks(department: string): void {
    this.isLoading = true;
    this.taskApi.getTasksByDepartment(department).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tasks = response.tasks;
          this.applyFilters();
          // Scroll to the task list to show the newly added task
          this.scrollToTaskList();
        }
        this.isLoading = false;
        this.isChangingDepartment = false;
      },
      error: (error: any) => {
        console.error('Failed to load tasks:', error);
        this.snack.open('Failed to load tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.isChangingDepartment = false;
      }
    });
  }

  scrollToTaskList(): void {
    // Scroll to the task list section to show the newly added task
    setTimeout(() => {
      const taskListElement = document.querySelector('.list-card');
      if (taskListElement) {
        taskListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  applyFilters(): void {
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredTasks = this.tasks.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    } else {
      this.filteredTasks = [...this.tasks];
    }

    // Apply pagination
    this.currentPage = 0;
    this.updatePaginatedTasks();
  }

  updatePaginatedTasks(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedTasks();
  }

  saveTask(): void {
    const payload = this.taskForm.value as DepartmentTask;
    if (this.editingIndex === -1) {
      this.taskApi.createTask(payload as any).subscribe({
        next: () => {
          this.snack.open(`Task "${payload.name}" added successfully to ${payload.department} department`, 'Close', { duration: 3000 });
          this.loadTasks(payload.department);
          this.clearFormFields();
        },
        error: () => this.snack.open('Failed to add task', 'Close', { duration: 2500 })
      });
    } else if (this.tasks[this.editingIndex]?.id) {
      const id = this.tasks[this.editingIndex].id as number;
      this.taskApi.updateTask(id, payload as any).subscribe({
        next: () => {
          this.snack.open(`Task "${payload.name}" updated successfully`, 'Close', { duration: 3000 });
          this.loadTasks(payload.department);
          this.clearFormFields();
        },
        error: () => this.snack.open('Failed to update task', 'Close', { duration: 2500 })
      });
    }
  }

  editTask(task: DepartmentTask, index: number): void {
    this.editingIndex = index;
    
    // Check if task has department property
    if (!task.department) {
      console.error('❌ TASK MISSING DEPARTMENT PROPERTY!');
      console.error('Available properties:', Object.keys(task));
      return; // Don't proceed if department is missing
    }
    
    // Use setValue to ensure all form controls are properly updated
    this.taskForm.setValue({
      department: task.department,
      name: task.name,
      description: task.description || ''
    });
    
    // Ensure the selectedDepartment is set for editing mode
    this.selectedDepartment = task.department;
    
    // Force form validation update
    this.taskForm.updateValueAndValidity();
    
    // Use setTimeout to ensure the form control update happens after the current execution cycle
    setTimeout(() => {
      // Force another update if needed
      if (this.taskForm.get('department')?.value !== task.department) {
        this.taskForm.get('department')?.setValue(task.department);
      }
      if (this.taskForm.get('name')?.value !== task.name) {
        this.taskForm.get('name')?.setValue(task.name);
      }
      if (this.taskForm.get('description')?.value !== (task.description || '')) {
        this.taskForm.get('description')?.setValue(task.description || '');
      }
      
      // Now load tasks for the department being edited
      this.loadTasksForEditing(task.department);
    }, 0);
  }

  // Separate method to load tasks for editing mode
  loadTasksForEditing(department: string): void {
    this.isLoading = true;
    this.taskApi.getTasksByDepartment(department).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tasks = response.tasks;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load tasks for editing:', error);
        this.snack.open('Failed to load tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  deleteTask(index: number): void {
    const id = this.tasks[index]?.id;
    if (!id) { return; }
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskApi.deleteTask(id).subscribe({
        next: () => {
          this.snack.open('Task deleted successfully', 'Close', { duration: 2000 });
          // Reload tasks for current department
          if (this.selectedDepartment) {
            this.loadTasks(this.selectedDepartment);
          }
          this.resetForm();
        },
        error: () => this.snack.open('Failed to delete task', 'Close', { duration: 2500 })
      });
    }
  }

  resetForm(): void {
    // Clear ALL form values including department
    this.taskForm.patchValue({
      department: '',
      name: '',
      description: ''
    });
    
    // Reset form state
    this.taskForm.markAsUntouched();
    this.taskForm.markAsPristine();
    
    // Reset component state
    this.editingIndex = -1;
    this.searchTerm = '';
    this.currentPage = 0;
    
    // Clear selected department
    this.selectedDepartment = null;
    
    // Apply filters after a short delay to ensure form is reset
    setTimeout(() => {
      this.applyFilters();
    }, 100);
  }

  cancelEdit(): void {
    this.editingIndex = -1;
    this.resetForm();
  }

  trackByTaskId(index: number, task: DepartmentTask): number {
    return task.id || index;
  }

  onSearchChange(): void {
    this.currentPage = 0; // Reset to first page on search
    this.applyFilters();
  }

  // Alternative search method for better performance
  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 0;
    this.applyFilters();
  }
}


