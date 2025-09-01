import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
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
import { AuthService } from '../services/auth.service';

interface DepartmentTask {
  id?: number;
  department: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-supervisor-tasks',
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
    <div class="supervisor-tasks-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="page-title">
              <mat-icon class="title-icon">task_alt</mat-icon>
              <h1>Department Task Management</h1>
            </div>
            <p class="page-subtitle">Manage tasks for {{ userDepartment }} department</p>
          </div>
          <div class="header-actions">
            <button 
              mat-raised-button 
              color="primary" 
              class="refresh-btn"
              (click)="loadTasks()"
              [disabled]="isLoading">
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
            <mat-card-subtitle>{{ editingIndex === -1 ? 'Create a new task for ' + userDepartment + ' department' : 'Update the selected task' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="taskForm" class="task-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Department</mat-label>
                  <mat-select formControlName="department" [disabled]="true">
                    <mat-option [value]="userDepartment">
                      {{ userDepartment }}
                    </mat-option>
                  </mat-select>
                  <mat-hint>Department is locked to your assigned department</mat-hint>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Task Name *</mat-label>
                  <input matInput formControlName="name" placeholder="Enter task name">
                  <mat-error *ngIf="taskForm.get('name')?.hasError('required')">
                    Task name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3" placeholder="Enter task description"></textarea>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  mat-raised-button 
                  color="primary" 
                  (click)="saveTask()"
                  [disabled]="taskForm.invalid || isLoading">
                  <mat-icon>{{ editingIndex === -1 ? 'add' : 'save' }}</mat-icon>
                  {{ editingIndex === -1 ? 'Add Task' : 'Update Task' }}
                </button>
                <button 
                  type="button" 
                  mat-stroked-button 
                  (click)="resetForm()"
                  [disabled]="isLoading">
                  <mat-icon>clear</mat-icon>
                  Clear
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Tasks List Card -->
        <mat-card class="list-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="card-icon">list</mat-icon>
              Department Tasks
            </mat-card-title>
            <mat-card-subtitle>All tasks for {{ userDepartment }} department</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <!-- Loading State -->
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading tasks...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoading && filteredTasks.length === 0" class="empty-state">
              <mat-icon class="empty-icon">assignment</mat-icon>
              <h3>No tasks found</h3>
              <p>No tasks have been created for {{ userDepartment }} department yet.</p>
            </div>

            <!-- Tasks Table -->
            <div *ngIf="!isLoading && filteredTasks.length > 0" class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="tasks-table">
                <!-- Task Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Task Name</th>
                  <td mat-cell *matCellDef="let task">
                    <div class="task-name">{{ task.name }}</div>
                  </td>
                </ng-container>

                <!-- Description Column -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let task">
                    <div class="task-description" *ngIf="task.description; else noDescription">
                      {{ task.description }}
                    </div>
                    <ng-template #noDescription>
                      <span class="no-description">No description</span>
                    </ng-template>
                  </td>
                </ng-container>

                                 <!-- Status Column -->
                 <ng-container matColumnDef="status">
                   <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                   <td mat-cell *matCellDef="let task">
                     <div class="status-chip" [class]="task.is_active ? 'active-chip' : 'inactive-chip'">
                       {{ task.is_active ? 'Active' : 'Inactive' }}
                     </div>
                   </td>
                 </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let task; let i = index">
                    <div class="action-buttons">
                      <button 
                        mat-icon-button 
                        matTooltip="Edit task"
                        (click)="editTask(task, i)"
                        [disabled]="isLoading">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button 
                        mat-icon-button 
                        matTooltip="Delete task"
                        (click)="deleteTask(task.id)"
                        [disabled]="isLoading"
                        class="delete-btn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <!-- Pagination -->
              <mat-paginator 
                [length]="filteredTasks.length"
                [pageSize]="pageSize"
                [pageSizeOptions]="[5, 10, 25, 50]"
                [pageIndex]="currentPage"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .supervisor-tasks-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      color: white;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .title-icon {
      margin-right: 12px;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .page-title h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .page-subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .refresh-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }

    .form-card, .list-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      margin-right: 8px;
      color: #667eea;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .table-container {
      margin-top: 16px;
    }

    .tasks-table {
      width: 100%;
    }

    .task-name {
      font-weight: 500;
      color: #333;
    }

    .task-description {
      color: #666;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .no-description {
      color: #999;
      font-style: italic;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .delete-btn {
      color: #f44336;
    }

         .status-chip {
       display: inline-block;
       padding: 4px 12px;
       border-radius: 16px;
       font-size: 12px;
       font-weight: 500;
       text-transform: uppercase;
       letter-spacing: 0.5px;
     }

     .active-chip {
       background-color: #4caf50;
       color: white;
     }

     .inactive-chip {
       background-color: #f44336;
       color: white;
     }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .supervisor-tasks-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SupervisorTasksComponent implements OnInit, OnDestroy {
  @Input() userDepartment: string = '';

  taskForm: FormGroup;
  tasks: DepartmentTask[] = [];
  filteredTasks: DepartmentTask[] = [];
  isLoading = false;
  editingIndex = -1;
  currentPage = 0;
  pageSize = 10;
  searchTerm = '';

  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  dataSource: any;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      department: ['', Validators.required],
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Get user department from auth service if not provided
    if (!this.userDepartment) {
      const user = this.authService.getCurrentUser();
      this.userDepartment = user?.department || '';
    }

    // Set the department in the form (locked for supervisors)
    this.taskForm.patchValue({
      department: this.userDepartment
    });

    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading = true;
    
    this.taskService.getTasksByDepartment(this.userDepartment).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: { tasks: DepartmentTask[] }) => {
        // Tasks are already filtered by department from the backend
        this.tasks = response.tasks;
        this.filteredTasks = [...this.tasks];
        this.updateDataSource();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Failed to load tasks', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isLoading = true;
    const taskData = this.taskForm.value;

    if (this.editingIndex === -1) {
      // Add new task
      this.taskService.createTask(taskData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
               next: (response: any) => {
         // Backend returns { success: true, task: {...} } for creates
         if (response.task) {
           this.tasks.push(response.task);
           this.filteredTasks = [...this.tasks];
           this.updateDataSource();
         } else {
           // If no task returned, refresh the list
           this.loadTasks();
         }
         this.clearFormFields();
         this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
         this.isLoading = false;
       },
       error: (error: any) => {
         console.error('Error creating task:', error);
         this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
         this.isLoading = false;
       }
      });
    } else {
      // Update existing task
      const taskToUpdate = this.tasks[this.editingIndex];
      this.taskService.updateTask(taskToUpdate.id!, taskData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
               next: (response: any) => {
         // Backend returns { success: true } for updates, not the updated task
         // So we need to refresh the task list to get the updated data
         this.loadTasks();
         this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
         this.isLoading = false;
       },
       error: (error: any) => {
         console.error('Error updating task:', error);
         this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
         this.isLoading = false;
       }
      });
    }
  }

  editTask(task: DepartmentTask, index: number): void {
    this.editingIndex = index;
    this.taskForm.patchValue({
      department: task.department,
      name: task.name,
      description: task.description || ''
    });
  }

  deleteTask(taskId?: number): void {
    if (!taskId) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      
      this.taskService.deleteTask(taskId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
               next: (response: any) => {
         // Backend returns { success: true } for deletes
         this.tasks = this.tasks.filter(task => task.id !== taskId);
         this.filteredTasks = [...this.tasks];
         this.updateDataSource();
         this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
         this.isLoading = false;
       },
               error: (error: any) => {
         console.error('Error deleting task:', error);
         this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
         this.isLoading = false;
       }
      });
    }
  }

  resetForm(): void {
    this.clearFormFields();
  }

  private clearFormFields(): void {
    this.taskForm.patchValue({
      department: this.userDepartment, // Keep department locked
      name: '',
      description: ''
    });
    this.editingIndex = -1;
  }

  private updateDataSource(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource = this.filteredTasks.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDataSource();
  }
}
