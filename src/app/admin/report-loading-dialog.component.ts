import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-report-loading-dialog',
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
            <mat-icon class="spinning-icon">refresh</mat-icon>
          </div>
          <div class="loading-text">
            <h2>{{ loadingMessage }}</h2>
            <p>{{ loadingSubMessage }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container">
          <mat-progress-bar mode="indeterminate" class="enhanced-progress-bar"></mat-progress-bar>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <mat-icon>data_usage</mat-icon>
            <span>Fetching Data</span>
          </div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <mat-icon>analytics</mat-icon>
            <span>Processing</span>
          </div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <mat-icon>picture_as_pdf</mat-icon>
            <span>Generating</span>
          </div>
          <div class="step" [class.active]="currentStep >= 4" [class.completed]="currentStep > 4">
            <mat-icon>download</mat-icon>
            <span>Download</span>
          </div>
        </div>

        <!-- Report Details -->
        <div class="report-details" *ngIf="reportData">
          <div class="detail-item">
            <mat-icon>description</mat-icon>
            <span>{{ reportData.reportType }}</span>
          </div>
          <div class="detail-item">
            <mat-icon>file_download</mat-icon>
            <span>{{ reportData.exportFormat?.toUpperCase() }}</span>
          </div>
          <div class="detail-item" *ngIf="reportData.dateRange">
            <mat-icon>date_range</mat-icon>
            <span>{{ reportData.dateRange }}</span>
          </div>
        </div>
      </div>

      <!-- Action Button (only show if there's an error or completion) -->
      <mat-dialog-actions *ngIf="showCloseButton">
        <button mat-raised-button color="primary" (click)="closeDialog()">
          <mat-icon>close</mat-icon>
          Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .loading-dialog {
      min-width: 500px;
      max-width: 600px;
      padding: 0;
      overflow: hidden;
    }

    .loading-content {
      padding: var(--spacing-xl);
      text-align: center;
    }

    .loading-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .loading-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--aja-slate) 0%, var(--aja-navy) 100%);
      border-radius: 50%;
      color: var(--aja-white);
      box-shadow: var(--shadow-lg);
    }

    .loading-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .spinning-icon {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .loading-text h2 {
      margin: 0;
      color: var(--aja-charcoal);
      font-size: 1.5rem;
      font-weight: var(--font-weight-semibold);
    }

    .loading-text p {
      margin: var(--spacing-sm) 0 0 0;
      color: var(--aja-grey);
      font-size: 1rem;
    }

    .progress-container {
      margin: var(--spacing-xl) 0;
    }

    .enhanced-progress-bar {
      height: 12px !important;
      border-radius: 6px !important;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    ::ng-deep .enhanced-progress-bar .mat-progress-bar-fill::after {
      background: linear-gradient(135deg, var(--aja-slate) 0%, var(--aja-navy) 100%) !important;
    }

    ::ng-deep .enhanced-progress-bar .mat-progress-bar-buffer {
      background: var(--aja-surface-3) !important;
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      justify-content: space-between;
      margin: var(--spacing-xl) 0;
      padding: var(--spacing-lg);
      background: var(--aja-surface-2);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      opacity: 0.4;
      transition: all 0.3s ease;
      position: relative;
    }

    .step.active {
      opacity: 1;
      color: var(--aja-slate);
    }

    .step.completed {
      opacity: 1;
      color: var(--aja-slate);
    }

    .step.completed mat-icon {
      background: var(--aja-slate);
      color: var(--aja-white);
      border-radius: 50%;
      padding: 8px;
      width: 40px;
      height: 40px;
      font-size: 24px;
      box-shadow: var(--shadow-md);
    }

    .step.active:not(.completed) mat-icon {
      animation: pulse 1.5s ease-in-out infinite;
      color: var(--aja-slate);
      font-size: 28px;
      width: 32px;
      height: 32px;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }

    .step span {
      font-size: 0.85rem;
      font-weight: var(--font-weight-medium);
      text-align: center;
      line-height: 1.2;
    }

    .step mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      transition: all 0.3s ease;
    }

    /* Connection lines between steps */
    .step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 12px;
      right: -50%;
      width: 100%;
      height: 3px;
      background: var(--aja-grey-lighter);
      z-index: -1;
    }

    .step.completed:not(:last-child)::after {
      background: linear-gradient(90deg, var(--aja-slate) 0%, var(--aja-navy) 100%);
    }

    /* Report Details */
    .report-details {
      display: flex;
      justify-content: center;
      gap: var(--spacing-lg);
      margin-top: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--aja-slate);
      font-size: 0.9rem;
      font-weight: var(--font-weight-medium);
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--aja-grey);
    }

    /* Dialog Actions */
    mat-dialog-actions {
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--aja-surface-2);
      border-top: 1px solid var(--aja-grey-lighter);
      justify-content: center;
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

    ::ng-deep mat-dialog-actions .mat-raised-button:hover {
      background: linear-gradient(135deg, var(--aja-charcoal) 0%, var(--aja-navy) 100%);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .loading-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .loading-content {
        padding: var(--spacing-lg);
      }

      .loading-icon {
        width: 60px;
        height: 60px;
      }

      .loading-icon mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }

      .progress-steps {
        flex-wrap: wrap;
        gap: var(--spacing-md);
      }

      .step {
        flex: 1 1 40%;
        min-width: 80px;
      }

      .step:not(:last-child)::after {
        display: none;
      }

      .report-details {
        flex-direction: column;
        gap: var(--spacing-sm);
      }
    }

    /* Animation */
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    .loading-dialog {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class ReportLoadingDialogComponent implements OnInit {
  loadingMessage = 'Initializing...';
  loadingSubMessage = 'Preparing to generate your report';
  currentStep = 0;
  showCloseButton = false;
  reportData: any;

  constructor(
    private dialogRef: MatDialogRef<ReportLoadingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reportData = data?.reportData;
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
    this.loadingMessage = 'Error Occurred';
    this.loadingSubMessage = message;
    this.showCloseButton = true;
    this.dialogRef.disableClose = false;
  }

  showSuccess(message: string) {
    this.loadingMessage = 'Report Generated Successfully!';
    this.loadingSubMessage = message;
    this.currentStep = 5;
    this.showCloseButton = true;
    this.dialogRef.disableClose = false;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
