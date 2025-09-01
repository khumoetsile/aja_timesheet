import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { SettingsService, UserSettings } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="settings-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-main">
            <div class="header-icon-wrapper">
              <div class="header-icon">
                <mat-icon>tune</mat-icon>
              </div>
            </div>
            <div class="header-text">
              <h1>Settings</h1>
              <p>Personalize your experience</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-stroked-button class="reset-button" (click)="reset()" [disabled]="isLoading">
              <mat-icon>restore</mat-icon>
              Reset
            </button>
          </div>
          </div>
        </div>
        
      <!-- Settings Grid -->
      <div class="settings-grid">
        <form [formGroup]="form" (ngSubmit)="save()" [class.disabled]="isLoading">
          
          <!-- Theme & Appearance Card -->
          <mat-card class="settings-card theme-card">
            <div class="card-header">
              <div class="card-icon">
                <mat-icon>palette</mat-icon>
              </div>
              <div class="card-title">
                <h3>Theme & Appearance</h3>
                <p>Customize how your dashboard looks</p>
              </div>
            </div>
            
            <div class="card-content">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
              <mat-label>Theme</mat-label>
              <mat-select formControlName="theme" [disabled]="isLoading">
                    <mat-option value="dark">
                      <div class="select-option">
                        <div class="option-icon dark-icon">
                          <mat-icon>dark_mode</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-title">Dark</span>
                          <span class="option-subtitle">Easy on the eyes</span>
                        </div>
                      </div>
                    </mat-option>
                    <mat-option value="light">
                      <div class="select-option">
                        <div class="option-icon light-icon">
                          <mat-icon>light_mode</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-title">Light</span>
                          <span class="option-subtitle">Clean & bright</span>
                        </div>
                      </div>
                    </mat-option>
              </mat-select>
            </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
              <mat-label>Density</mat-label>
              <mat-select formControlName="density" [disabled]="isLoading">
                    <mat-option value="comfortable">
                      <div class="select-option">
                        <div class="option-icon">
                          <mat-icon>space_bar</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-title">Comfortable</span>
                          <span class="option-subtitle">More space</span>
                        </div>
                      </div>
                    </mat-option>
                    <mat-option value="compact">
                      <div class="select-option">
                        <div class="option-icon">
                          <mat-icon>view_compact</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-title">Compact</span>
                          <span class="option-subtitle">More content</span>
                        </div>
                      </div>
                    </mat-option>
              </mat-select>
            </mat-form-field>
              </div>
            </div>
          </mat-card>

          <!-- Work Schedule Card -->
          <mat-card class="settings-card schedule-card">
            <div class="card-header">
              <div class="card-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="card-title">
                <h3>Work Schedule</h3>
                <p>Set your standard working hours</p>
              </div>
            </div>
            
            <div class="card-content">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Start Time</mat-label>
                  <input matInput formControlName="start_time" type="time" [disabled]="isLoading">
                  <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>End Time</mat-label>
                  <input matInput formControlName="end_time" type="time" [disabled]="isLoading">
                  <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>
              </div>
              
              <div class="schedule-info">
                <div class="info-item">
                  <mat-icon>info</mat-icon>
                  <span>Standard 8-hour workday</span>
                </div>
                <div class="info-item">
                  <mat-icon>access_time</mat-icon>
                  <span>Used for overtime calculations</span>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Preferences Card -->
          <mat-card class="settings-card preferences-card">
            <div class="card-header">
              <div class="card-icon">
                <mat-icon>tune</mat-icon>
              </div>
              <div class="card-title">
                <h3>Preferences</h3>
                <p>Customize system behavior</p>
              </div>
            </div>
            
            <div class="card-content">
              <div class="preference-item">
                <div class="preference-content">
                  <div class="preference-text">
                    <h4>Remember Dashboard Filters</h4>
                    <p>Save your filter preferences for next time</p>
                  </div>
                  <mat-slide-toggle 
                    formControlName="remember_filters" 
                    [disabled]="isLoading"
                    color="primary">
              </mat-slide-toggle>
            </div>
          </div>

              <mat-divider></mat-divider>

              <div class="preference-item">
                <div class="preference-content">
                  <div class="preference-text">
                    <h4>Weekly Timesheet Reminders</h4>
                    <p>Get notified to submit your timesheet</p>
                  </div>
                  <mat-slide-toggle 
                    formControlName="weekly_reminder" 
                    [disabled]="isLoading"
                    color="primary">
                  </mat-slide-toggle>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Save Section -->
          <div class="save-section">
            <mat-card class="save-card">
              <div class="save-content">
                <div class="save-info">
                  <mat-icon>save</mat-icon>
                  <div class="save-text">
                    <h4>Save Your Changes</h4>
                    <p>Your preferences will be applied immediately</p>
                  </div>
                </div>
                <button mat-raised-button 
                        color="primary" 
                        type="submit" 
                        [disabled]="isLoading || form.invalid"
                        class="save-button">
              <mat-icon>save</mat-icon>
                  <span *ngIf="!isLoading">Save Changes</span>
                  <span *ngIf="isLoading">Saving...</span>
            </button>
              </div>
            </mat-card>
          </div>
        </form>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Updating your settings...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 0;
    }

    .page-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 3rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon-wrapper {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1rem;
      backdrop-filter: blur(10px);
    }

    .header-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }

    .header-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .header-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .header-text p {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
      font-weight: 400;
    }

    .reset-button {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .reset-button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }
    
    .settings-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 3rem;
    }

    .settings-card {
      background: white;
      border-radius: 20px;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-bottom: 2rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .settings-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .theme-card {
      border-left: 4px solid #8b5cf6;
    }

    .schedule-card {
      border-left: 4px solid #06b6d4;
    }

    .preferences-card {
      border-left: 4px solid #10b981;
    }

    .card-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .theme-card .card-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
      color: white;
    }

    .schedule-card .card-icon {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
    }

    .preferences-card .card-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .card-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .card-title h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .card-title p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .card-content {
      padding: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-field {
      width: 100%;
    }

    .select-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .option-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dark-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
    }

    .light-icon {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
    }

    .option-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .option-title {
      font-weight: 500;
      color: #1e293b;
      font-size: 0.95rem;
    }

    .option-subtitle {
      color: #64748b;
      font-size: 0.8rem;
    }

    .schedule-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.9rem;
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #06b6d4;
    }

    .preference-item {
      padding: 1.5rem 0;
    }

    .preference-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .preference-text h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .preference-text p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .mat-mdc-slide-toggle {
      flex-shrink: 0;
    }

    .save-section {
      margin-top: 2rem;
    }

    .save-card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      border-radius: 20px;
      border: none;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .save-content {
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }
    
    .save-info {
      display: flex; 
      align-items: center;
      gap: 1rem;
    }

    .save-info mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #60a5fa;
    }

    .save-text h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: white;
    }

    .save-text p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .save-button {
      background: #60a5fa;
      color: white;
      border-radius: 12px;
      padding: 1rem 2rem;
      font-weight: 500;
      font-size: 1rem;
      border: none;
      transition: all 0.3s ease;
      min-width: 160px;
    }

    .save-button:hover:not(:disabled) {
      background: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .save-button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-content {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .loading-content p {
      margin-top: 1rem;
      color: #64748b;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    form.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    
    /* Responsive Design */
    @media (max-width: 1024px) {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .header-text h1 {
        font-size: 2rem;
      }

      .settings-grid {
        padding: 0 1.5rem 2rem;
      }
    }
    
    @media (max-width: 768px) {
      .page-header {
        padding: 2rem 1rem;
        margin-bottom: 1.5rem;
      }

      .header-text h1 {
        font-size: 1.75rem;
      }

      .header-text p {
        font-size: 1rem;
      }
      
      .settings-grid {
        padding: 0 1rem 1.5rem;
      }

      .card-header {
        padding: 1.5rem;
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .card-content {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .preference-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .save-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .save-button {
        width: 100%;
      }

      .schedule-info {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .header-icon-wrapper {
        padding: 0.75rem;
      }

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .header-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .header-text h1 {
        font-size: 1.5rem;
      }

      .card-icon {
        width: 48px;
        height: 48px;
      }

      .card-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      theme: ['dark'],
      density: ['comfortable'],
      start_time: ['08:00'],
      end_time: ['17:00'],
      remember_filters: [true],
      weekly_reminder: [false]
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    
    this.settingsService.loadSettings().subscribe({
      next: (settings: UserSettings) => {
        console.log('📝 Populating form with settings:', settings);
        
        this.form.patchValue({
          theme: settings.theme,
          density: settings.density,
          start_time: settings.start_time,
          end_time: settings.end_time,
          remember_filters: settings.remember_filters,
          weekly_reminder: settings.weekly_reminder
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading settings:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading settings. Using defaults.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.isLoading) return;
    
    this.isLoading = true;
    const formValue = this.form.value;
    
    console.log('💾 Saving settings:', formValue);
    
    this.settingsService.updateSettings(formValue).subscribe({
      next: (settings: UserSettings) => {
        console.log('✅ Settings saved successfully:', settings);
        this.isLoading = false;
        
        this.snackBar.open('Settings saved successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Apply density if changed
        if (settings.density) {
          this.settingsService.applyDensity(settings.density);
        }
      },
      error: (error) => {
        console.error('❌ Error saving settings:', error);
        this.isLoading = false;
        
        this.snackBar.open('Error saving settings. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  reset(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    console.log('🔄 Resetting settings to defaults');
    
    this.settingsService.resetSettings().subscribe({
      next: (defaultSettings: UserSettings) => {
        console.log('✅ Settings reset successfully:', defaultSettings);
        
        this.form.patchValue({
          theme: defaultSettings.theme,
          density: defaultSettings.density,
          start_time: defaultSettings.start_time,
          end_time: defaultSettings.end_time,
          remember_filters: defaultSettings.remember_filters,
          weekly_reminder: defaultSettings.weekly_reminder
        });
        
        this.isLoading = false;
        
        this.snackBar.open('Settings reset to defaults!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('❌ Error resetting settings:', error);
        this.isLoading = false;
        
        this.snackBar.open('Error resetting settings. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

