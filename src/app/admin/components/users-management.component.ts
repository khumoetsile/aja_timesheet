import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersManagementService, BulkSeedResult, User } from '../../services/users-management.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  template: `
    <div class="users-management-container">
      <!-- Header -->
      <div class="header">
        <h1>Users Management</h1>
        <p>Bulk upload users and manage user accounts</p>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <div class="upload-card">
          <h2>📤 Upload Users</h2>
          <p>Upload a JSON file containing user data</p>

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
              <i class="upload-icon">👥</i>
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

          <!-- Options -->
          <div class="options-section" *ngIf="selectedFile">
            <h3>Upload Options</h3>
            <div class="options-grid">
              <mat-checkbox [(ngModel)]="sendEmails">
                📧 Send welcome emails to users
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="skipDuplicates">
                ⏭️ Skip existing users
              </mat-checkbox>
            </div>
          </div>

          <!-- Upload Button -->
          <div class="upload-actions">
            <button
              class="upload-btn"
              [disabled]="!selectedFile || isUploading"
              (click)="uploadFile()"
            >
              <span *ngIf="!isUploading">🚀 Upload Users</span>
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
              <span class="stat-number">{{ uploadResult.results.total }}</span>
              <span class="stat-label">Total Users</span>
            </div>
            <div class="stat-item success">
              <span class="stat-number">{{ uploadResult.results.created }}</span>
              <span class="stat-label">Created</span>
            </div>
            <div class="stat-item warning">
              <span class="stat-number">{{ uploadResult.results.skipped }}</span>
              <span class="stat-label">Skipped</span>
            </div>
            <div class="stat-item error" *ngIf="uploadResult.results.errors > 0">
              <span class="stat-number">{{ uploadResult.results.errors }}</span>
              <span class="stat-label">Errors</span>
            </div>
            <div class="stat-item info" *ngIf="sendEmails">
              <span class="stat-number">{{ uploadResult.results.emailsSent }}</span>
              <span class="stat-label">Emails Sent</span>
            </div>
          </div>

          <!-- Detailed Results -->
          <div class="detailed-results">
            <h3>User Details</h3>
            <div class="results-list">
              <div
                *ngFor="let detail of uploadResult.results.details"
                class="result-item"
                [class.success]="detail.status === 'created'"
                [class.skipped]="detail.status === 'skipped'"
                [class.error]="detail.status === 'error'"
              >
                <div class="result-header">
                  <span class="user-name">{{ detail.user }}</span>
                  <span class="status-badge" [class]="detail.status">
                    {{ detail.status | titlecase }}
                  </span>
                </div>
                <div class="result-details">
                  <span *ngIf="detail.email" class="email">{{ detail.email }}</span>
                  <span *ngIf="detail.department" class="department">{{ detail.department }}</span>
                  <span *ngIf="detail.role" class="role">{{ detail.role }}</span>
                  <span *ngIf="detail.emailSent" class="email-sent">📧 Email sent</span>
                  <div *ngIf="detail.error" class="error-message">
                    Error: {{ detail.error }}
                  </div>
                  <div *ngIf="detail.reason" class="reason-message">
                    {{ detail.reason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Users -->
      <div class="users-section">
        <div class="users-header">
          <h2>👥 Current Users</h2>
          <button class="refresh-btn" (click)="loadUsers()" [disabled]="isLoading">
            <span *ngIf="!isLoading">🔄 Refresh</span>
            <span *ngIf="isLoading">⏳ Loading...</span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading users...</p>
        </div>

        <!-- Users List -->
        <div *ngIf="!isLoading && users.length > 0" class="users-list">
          <div *ngFor="let user of users" class="user-card">
            <div class="user-header">
              <h3>{{ user.first_name }} {{ user.last_name }}</h3>
              <span class="role-badge" [class]="user.role.toLowerCase()">
                {{ user.role }}
              </span>
            </div>
            <div class="user-details">
              <p class="email">{{ user.email }}</p>
              <p class="department">{{ user.department }}</p>
              <div class="user-stats">
                <span class="timesheet-entries">{{ user.timesheet_entries || 0 }} entries</span>
                <span class="status" [class.active]="user.is_active">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && users.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Upload a JSON file to add users</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-management-container {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .header p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .upload-section {
      margin-bottom: 32px;
    }

    .upload-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .upload-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .upload-card p {
      color: #666;
      margin: 0 0 24px 0;
    }

    .file-upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .file-upload-area:hover,
    .file-upload-area.dragover {
      border-color: #1976d2;
      background: #f0f8ff;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .upload-icon {
      font-size: 3rem;
      color: #1976d2;
    }

    .upload-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .upload-content p {
      color: #666;
      margin: 0;
    }

    .click-here {
      color: #1976d2;
      font-weight: 600;
    }

    .file-info {
      font-size: 0.875rem;
      color: #999;
    }

    .selected-file {
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .file-details {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-name {
      font-weight: 600;
      color: #1a1a1a;
    }

    .file-size {
      color: #666;
      font-size: 0.875rem;
    }

    .remove-file {
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      margin-left: auto;
    }

    .options-section {
      margin: 24px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .options-section h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upload-actions {
      margin-top: 24px;
      text-align: center;
    }

    .upload-btn {
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 32px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .upload-btn:hover:not(:disabled) {
      background: #1565c0;
    }

    .upload-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .results-section {
      margin-bottom: 32px;
    }

    .results-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .results-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 24px 0;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .stat-item.success {
      background: #e8f5e8;
    }

    .stat-item.warning {
      background: #fff3e0;
    }

    .stat-item.error {
      background: #ffebee;
    }

    .stat-item.info {
      background: #e3f2fd;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #666;
      margin-top: 4px;
    }

    .detailed-results h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .result-item {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .result-item.success {
      background: #e8f5e8;
      border-color: #4caf50;
    }

    .result-item.skipped {
      background: #fff3e0;
      border-color: #ff9800;
    }

    .result-item.error {
      background: #ffebee;
      border-color: #f44336;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .user-name {
      font-weight: 600;
      color: #1a1a1a;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.created {
      background: #4caf50;
      color: white;
    }

    .status-badge.skipped {
      background: #ff9800;
      color: white;
    }

    .status-badge.error {
      background: #f44336;
      color: white;
    }

    .result-details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.875rem;
    }

    .email {
      color: #1976d2;
    }

    .department {
      color: #666;
    }

    .role {
      color: #666;
    }

    .email-sent {
      color: #4caf50;
    }

    .error-message {
      color: #f44336;
      font-weight: 600;
    }

    .reason-message {
      color: #ff9800;
    }

    .users-section {
      margin-bottom: 32px;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .users-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .refresh-btn {
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
    }

    .refresh-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading-state {
      text-align: center;
      padding: 48px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .users-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .user-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .user-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.admin {
      background: #f44336;
      color: white;
    }

    .role-badge.supervisor {
      background: #ff9800;
      color: white;
    }

    .role-badge.staff {
      background: #4caf50;
      color: white;
    }

    .user-details p {
      margin: 4px 0;
      color: #666;
    }

    .user-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 0.875rem;
    }

    .timesheet-entries {
      color: #666;
    }

    .status {
      color: #666;
    }

    .status.active {
      color: #4caf50;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .users-management-container {
        padding: 16px;
      }

      .upload-card {
        padding: 20px;
      }

      .file-upload-area {
        padding: 32px 16px;
      }

      .users-list {
        grid-template-columns: 1fr;
      }

      .summary-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  isLoading = false;
  uploadResult: BulkSeedResult | null = null;
  users: User[] = [];
  sendEmails = false;
  skipDuplicates = true;

  constructor(
    private usersService: UsersManagementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFile(target.files[0]);
    }
  }

  private handleFile(file: File) {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.snackBar.open('Please select a JSON file', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.uploadResult = null;
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadResult = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadResult = null;

    try {
      const fileContent = await this.readFileContent(this.selectedFile);
      const users = JSON.parse(fileContent);

      // Validate data
      const validation = this.usersService.validateUserData(users);
      if (!validation.valid) {
        this.snackBar.open(`Data validation failed: ${validation.errors.join(', ')}`, 'Close', { duration: 5000 });
        return;
      }

      // Fix common issues
      const fixedUsers = this.usersService.fixUserData(users);
      
      // Upload users
      this.usersService.bulkSeedUsers(fixedUsers, {
        sendEmails: this.sendEmails,
        skipDuplicates: this.skipDuplicates
      }).subscribe({
        next: (result) => {
          this.uploadResult = result;
          this.isUploading = false;
          this.loadUsers(); // Refresh users list
          
          if (result.success) {
            this.snackBar.open(`Successfully processed ${result.results.total} users`, 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Upload completed with some issues', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.snackBar.open('Upload failed: ' + error.message, 'Close', { duration: 5000 });
          this.isUploading = false;
        }
      });

    } catch (error) {
      console.error('File processing error:', error);
      this.snackBar.open('Failed to process file: ' + error, 'Close', { duration: 5000 });
      this.isUploading = false;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.usersService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
