import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <mat-icon>{{data.mode === 'add' ? 'person_add' : 'edit'}}</mat-icon>
            </div>
            <div class="header-text">
              <h2 class="dialog-title">{{data.mode === 'add' ? 'Add New User' : 'Edit User'}}</h2>
              <p class="dialog-subtitle">
                {{data.mode === 'add' ? 'Create a new user account' : 'Update user information'}}
              </p>
            </div>
          </div>
          <button mat-icon-button class="close-btn" (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <div class="dialog-body">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
          <div class="form-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" placeholder="Enter email address" type="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3 class="section-title">Role & Department</h3>
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="SUPERVISOR">Supervisor</mat-option>
                  <mat-option value="STAFF">Staff</mat-option>
                </mat-select>
                <mat-icon matSuffix>security</mat-icon>
                <mat-error *ngIf="userForm.get('role')?.hasError('required')">
                  Role is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Department</mat-label>
                <mat-select formControlName="department">
                  <mat-option value="Operations">Operations</mat-option>
                  <mat-option value="Legal">Legal</mat-option>
                  <mat-option value="Finance">Finance</mat-option>
                  <mat-option value="HR">HR</mat-option>
                  <mat-option value="IT">IT</mat-option>
                </mat-select>
                <mat-icon matSuffix>business</mat-icon>
                <mat-error *ngIf="userForm.get('department')?.hasError('required')">
                  Department is required
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Security</h3>
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Enter password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-hint>Minimum 6 characters required</mat-hint>
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" class="cancel-btn" (click)="closeDialog()">
              Cancel
            </button>
            <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="!userForm.valid">
              <mat-icon>{{data.mode === 'add' ? 'add' : 'save'}}</mat-icon>
              {{data.mode === 'add' ? 'Add User' : 'Save Changes'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 600px;
      max-width: 700px;
      padding: 0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      background: #2c3e50;
      color: white;
      padding: 0;
      margin: 0;
    }

    .header-content {
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .header-text {
      flex: 1;
    }

    .dialog-title {
      font-size: 24px;
      font-weight: 500;
      margin: 0 0 8px 0;
      line-height: 1.2;
      color: white;
    }

    .dialog-subtitle {
      margin: 0;
      opacity: 0.8;
      font-size: 14px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.9);
    }

    .close-btn {
      color: white;
      border-radius: 4px;
      width: 36px;
      height: 36px;
      transition: background-color 0.2s ease;
    }

    .close-btn:hover {
      background: transparent;
    }

    .dialog-body {
      padding: 32px;
      background: white;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 20px 0;
      color: #2c3e50;
      padding-bottom: 8px;
      border-bottom: 1px solid #ecf0f1;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-form-field-outline {
      color: #bdc3c7;
    }

    .form-field ::ng-deep .mat-form-field-label {
      color: #34495e;
      font-weight: 500;
    }

    .form-field ::ng-deep .mat-form-field-outline-thick {
      color: #3498db;
    }

    .form-field ::ng-deep .mat-form-field-hint {
      color: #7f8c8d;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #ecf0f1;
    }

    .cancel-btn {
      color: #7f8c8d;
      border-color: #bdc3c7;
      border-radius: 6px;
      padding: 12px 24px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: #f8f9fa;
      border-color: #95a5a6;
      color: #34495e;
    }

    .submit-btn {
      background: #3498db;
      color: white;
      border-radius: 6px;
      padding: 12px 24px;
      font-weight: 500;
      border: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .submit-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 768px) {
      .dialog-container {
        min-width: 90vw;
        max-width: 90vw;
      }

      .header-content {
        padding: 20px 24px;
        flex-direction: column;
        gap: 16px;
      }

      .header-left {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .dialog-body {
        padding: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .submit-btn, .cancel-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', user?: User }
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['STAFF', Validators.required],
      department: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.userForm.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        role: this.data.user.role,
        department: this.data.user.department
      });
      
      // Remove password requirement for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      if (this.data.mode === 'add') {
        // Handle add user logic
        console.log('Adding new user:', formValue);
        this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
      } else {
        // Handle edit user logic
        console.log('Updating user:', formValue);
        this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
      }
      
      this.dialogRef.close(formValue);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
} 