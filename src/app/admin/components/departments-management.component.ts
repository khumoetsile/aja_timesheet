import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentsManagementService, Department, UploadResult } from '../../services/departments-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-departments-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="departments-management-container">
      <!-- Header -->
      <div class="header">
        <h1>Departments & Tasks Management</h1>
        <p>Manage departments and their associated tasks</p>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <div class="upload-card">
          <h2>📤 Upload Departments & Tasks</h2>
          <p>Upload a JSON file containing departments and their tasks</p>
          
          <!-- File Upload Area -->
          <div 
            class="file-upload-area"
            [class.dragover]="isDragOver"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
          >
            <div class="upload-content">
              <i class="upload-icon">📁</i>
              <h3>Drop your JSON file here</h3>
              <p>or <span class="click-here">click to browse</span></p>
              <p class="file-info">Supports .json files only</p>
            </div>
          </div>

          <!-- Hidden File Input -->
          <input 
            #fileInput 
            type="file" 
            accept=".json" 
            (change)="onFileSelected($event)"
            style="display: none;"
          />

          <!-- Selected File Info -->
          <div *ngIf="selectedFile" class="selected-file">
            <div class="file-details">
              <span class="file-name">📄 {{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              <button class="remove-file" (click)="removeFile()">✕</button>
            </div>
          </div>

          <!-- Upload Button -->
          <div class="upload-actions">
            <button 
              class="upload-btn"
              [disabled]="!selectedFile || isUploading"
              (click)="uploadFile()"
            >
              <span *ngIf="!isUploading">🚀 Upload Departments & Tasks</span>
              <span *ngIf="isUploading">⏳ Uploading...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Results -->
      <div *ngIf="uploadResult" class="results-section">
        <div class="results-card">
          <h2>📊 Upload Results</h2>
          
          <!-- Summary Stats -->
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-number">{{ uploadResult.results.total_departments }}</span>
              <span class="stat-label">Departments</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ uploadResult.results.total_tasks }}</span>
              <span class="stat-label">Tasks</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{{ uploadResult.results.departments_created }}</span>
              <span class="stat-label">Created</span>
            </div>
            <div class="stat-item warning">
              <span class="stat-number">{{ uploadResult.results.departments_skipped }}</span>
              <span class="stat-label">Skipped</span>
            </div>
            <div class="stat-item error" *ngIf="uploadResult.results.departments_errors > 0">
              <span class="stat-number">{{ uploadResult.results.departments_errors }}</span>
              <span class="stat-label">Errors</span>
            </div>
          </div>

          <!-- Detailed Results -->
          <div class="detailed-results">
            <h3>Department Details</h3>
            <div class="results-list">
              <div 
                *ngFor="let detail of uploadResult.results.details" 
                class="result-item"
                [class.success]="detail.status === 'created'"
                [class.skipped]="detail.status === 'skipped'"
                [class.error]="detail.status === 'error'"
              >
                <div class="result-header">
                  <span class="department-name">{{ detail.department }}</span>
                  <span class="status-badge" [class]="detail.status">
                    {{ detail.status | titlecase }}
                  </span>
                </div>
                <div class="result-details">
                  <span class="tasks-count">{{ detail.tasks_processed }} tasks processed</span>
                  <div *ngIf="detail.error" class="error-message">
                    Error: {{ detail.error }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Departments -->
      <div class="departments-section">
        <div class="departments-header">
          <h2>📋 Current Departments</h2>
          <button class="refresh-btn" (click)="loadDepartments()" [disabled]="isLoading">
            <span *ngIf="!isLoading">🔄 Refresh</span>
            <span *ngIf="isLoading">⏳ Loading...</span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading departments...</p>
        </div>

        <!-- Departments List -->
        <div *ngIf="!isLoading && departments.length > 0" class="departments-list">
          <div *ngFor="let department of departments" class="department-card">
            <div class="department-header">
              <h3>{{ department.name }}</h3>
              <span class="task-count">{{ department.task_count || 0 }} tasks</span>
            </div>
            <p class="department-description" *ngIf="department.description">
              {{ department.description }}
            </p>
            <div class="department-status">
              <span class="status-indicator" [class.active]="department.is_active">
                {{ department.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && departments.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>No departments found</h3>
          <p>Upload a JSON file to add departments and tasks</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .departments-management-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .upload-section {
      margin-bottom: 3rem;
    }

    .upload-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
    }

    .upload-card h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .file-upload-area {
      border: 2px dashed #bdc3c7;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 1.5rem 0;
    }

    .file-upload-area:hover,
    .file-upload-area.dragover {
      border-color: #3498db;
      background-color: #f8f9fa;
    }

    .upload-content h3 {
      color: #2c3e50;
      margin: 1rem 0 0.5rem;
    }

    .click-here {
      color: #3498db;
      text-decoration: underline;
    }

    .file-info {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .selected-file {
      background: #f8f9fa;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
    }

    .file-details {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .file-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .file-size {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .remove-file {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-actions {
      text-align: center;
      margin-top: 1.5rem;
    }

    .upload-btn {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .upload-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    .upload-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .results-section {
      margin-bottom: 3rem;
    }

    .results-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .stat-item.success {
      background: #d4edda;
      color: #155724;
    }

    .stat-item.warning {
      background: #fff3cd;
      color: #856404;
    }

    .stat-item.error {
      background: #f8d7da;
      color: #721c24;
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detailed-results {
      margin-top: 2rem;
    }

    .results-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .result-item {
      padding: 1rem;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .result-item.success {
      border-color: #28a745;
      background: #f8fff9;
    }

    .result-item.skipped {
      border-color: #ffc107;
      background: #fffdf7;
    }

    .result-item.error {
      border-color: #dc3545;
      background: #fff8f8;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .department-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.created {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.skipped {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.error {
      background: #f8d7da;
      color: #721c24;
    }

    .result-details {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .error-message {
      color: #dc3545;
      margin-top: 0.5rem;
    }

    .departments-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
    }

    .departments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .departments-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .refresh-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #5a6268;
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .departments-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .department-card {
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .department-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .department-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .department-header h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.1rem;
    }

    .task-count {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .department-description {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    .department-status {
      margin-top: 1rem;
    }

    .status-indicator {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #f8d7da;
      color: #721c24;
    }

    .status-indicator.active {
      background: #d4edda;
      color: #155724;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .departments-management-container {
        padding: 1rem;
      }

      .summary-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .departments-list {
        grid-template-columns: 1fr;
      }

      .departments-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class DepartmentsManagementComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  departments: Department[] = [];
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  isLoading = false;
  uploadResult: UploadResult | null = null;

  constructor(
    private departmentsService: DepartmentsManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFile(target.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadResult = null;

    this.departmentsService.uploadDepartmentsFile(this.selectedFile).subscribe({
      next: (result) => {
        this.uploadResult = result;
        this.isUploading = false;
        this.selectedFile = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        // Reload departments to show updated list
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Upload failed: ' + (error.message || 'Unknown error'));
        this.isUploading = false;
      }
    });
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentsService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response.departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.isLoading = false;
        alert('Failed to load departments: ' + (error.message || 'Unknown error'));
      }
    });
  }
}
