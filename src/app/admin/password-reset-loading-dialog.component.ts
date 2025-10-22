import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-password-reset-loading-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="loading-dialog">
      <div class="loading-content">
        <!-- Main Loading Section -->
        <div class="loading-header">
          <div class="loading-icon">
            <mat-icon class="spinning-icon" *ngIf="!isComplete && !isError">refresh</mat-icon>
            <mat-icon class="success-icon" *ngIf="isComplete && !isError">check_circle</mat-icon>
            <mat-icon class="error-icon" *ngIf="isError">error</mat-icon>
          </div>
          <div class="loading-text">
            <h2>{{ loadingMessage }}</h2>
            <p>{{ loadingSubMessage }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container" *ngIf="!isComplete && !isError">
          <mat-progress-bar mode="indeterminate" class="enhanced-progress-bar"></mat-progress-bar>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps" *ngIf="!isComplete && !isError">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <mat-icon>lock_reset</mat-icon>
            <span>Generating Password</span>
          </div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <mat-icon>email</mat-icon>
            <span>Sending Email</span>
          </div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <mat-icon>check_circle</mat-icon>
            <span>Complete</span>
          </div>
        </div>

        <!-- Success/Error State -->
        <div class="result-section" *ngIf="isComplete || isError">
          <div class="result-icon" [class.success]="isComplete && !isError" [class.error]="isError">
            <mat-icon *ngIf="isComplete && !isError">check_circle</mat-icon>
            <mat-icon *ngIf="isError">error</mat-icon>
          </div>
          <div class="result-text">
            <h3 [class.success-text]="isComplete && !isError" [class.error-text]="isError">
              {{ isComplete && !isError ? 'Password Reset Successful!' : 'Password Reset Failed' }}
            </h3>
            <p>{{ resultMessage }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="dialog-actions" *ngIf="showCloseButton">
          <button mat-button (click)="closeDialog()" class="close-button">
            {{ isError ? 'Try Again' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-dialog {
      padding: 24px;
      min-width: 400px;
      max-width: 500px;
    }

    .loading-content {
      text-align: center;
    }

    .loading-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .loading-icon {
      margin-right: 16px;
    }

    .spinning-icon {
      animation: spin 1s linear infinite;
      color: #2196F3;
      font-size: 32px;
    }

    .success-icon {
      color: #4CAF50;
      font-size: 32px;
    }

    .error-icon {
      color: #F44336;
      font-size: 32px;
    }

    .loading-text h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
      font-weight: 500;
    }

    .loading-text p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .progress-container {
      margin: 24px 0;
    }

    .enhanced-progress-bar {
      height: 6px;
      border-radius: 3px;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin: 24px 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      opacity: 0.4;
      transition: opacity 0.3s ease;
    }

    .step.active {
      opacity: 1;
    }

    .step.completed {
      opacity: 1;
    }

    .step mat-icon {
      margin-bottom: 8px;
      font-size: 20px;
    }

    .step span {
      font-size: 12px;
      color: #666;
    }

    .result-section {
      margin: 24px 0;
      padding: 16px;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .result-icon {
      margin-bottom: 16px;
    }

    .result-icon.success mat-icon {
      color: #4CAF50;
      font-size: 48px;
    }

    .result-icon.error mat-icon {
      color: #F44336;
      font-size: 48px;
    }

    .result-text h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .success-text {
      color: #4CAF50;
    }

    .error-text {
      color: #F44336;
    }

    .result-text p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .dialog-actions {
      margin-top: 24px;
    }

    .close-button {
      background-color: #2196F3;
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 4px;
      cursor: pointer;
    }

    .close-button:hover {
      background-color: #1976D2;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .loading-dialog {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class PasswordResetLoadingDialogComponent implements OnInit {
  loadingMessage = 'Initializing...';
  loadingSubMessage = 'Preparing to reset password';
  currentStep = 0;
  showCloseButton = false;
  isComplete = false;
  isError = false;
  resultMessage = '';
  userEmail = '';

  constructor(
    private dialogRef: MatDialogRef<PasswordResetLoadingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userEmail = data?.userEmail || '';
  }

  ngOnInit() {
    // Disable closing by clicking outside or pressing escape
    this.dialogRef.disableClose = true;
  }

  updateProgress(step: number, message: string, subMessage: string) {
    this.currentStep = step;
    this.loadingMessage = message;
    this.loadingSubMessage = subMessage;
  }

  showError(message: string) {
    this.isError = true;
    this.isComplete = false;
    this.loadingMessage = 'Password Reset Failed';
    this.loadingSubMessage = message;
    this.resultMessage = message;
    this.showCloseButton = true;
    this.dialogRef.disableClose = false;
  }

  showSuccess(message: string) {
    this.isComplete = true;
    this.isError = false;
    this.loadingMessage = 'Password Reset Successful!';
    this.loadingSubMessage = message;
    this.resultMessage = `New password has been sent to ${this.userEmail}`;
    this.showCloseButton = true;
    this.dialogRef.disableClose = false;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
