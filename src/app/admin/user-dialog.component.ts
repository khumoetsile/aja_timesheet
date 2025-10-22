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
            <h3 class="section-title">User Information</h3>
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

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email Address</mat-label>
                <input matInput 
                       formControlName="email" 
                       [placeholder]="data.mode === 'edit' ? 'Email cannot be changed' : 'Enter email address'"
                       type="email"
                       [readonly]="data.mode === 'edit'">
                <mat-icon matSuffix>email</mat-icon>
                <mat-hint *ngIf="data.mode === 'edit'">Email cannot be modified</mat-hint>
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="ADMIN">Admin</mat-option>
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

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Password</mat-label>
                <input matInput 
                       type="password" 
                       formControlName="password" 
                       [placeholder]="data.mode === 'edit' ? 'Password cannot be changed here' : 'Enter password'"
                       [readonly]="data.mode === 'edit'">
                <mat-icon matSuffix>lock</mat-icon>
                <mat-hint *ngIf="data.mode === 'add'">Minimum 4 characters</mat-hint>
                <mat-hint *ngIf="data.mode === 'edit'">Use 'Reset Password' to change password</mat-hint>
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Password must be at least 4 characters
                </mat-error>
              </mat-form-field>
            </div>
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
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
    }

    .dialog-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 0;
      margin: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: white;
    }

    .header-text {
      flex: 1;
    }

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: white;
    }

    .dialog-subtitle {
      display: none;
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
      padding: 24px;
      background: #f8fafc;
    }

    .form-section {
      margin-bottom: 24px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #1e293b;
      padding-bottom: 8px;
      border-bottom: 2px solid #3b82f6;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 16px;
      background: #3b82f6;
      border-radius: 2px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row.single {
      grid-template-columns: 1fr;
    }

    .form-row.double {
      grid-template-columns: 1fr 1fr;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-form-field-outline {
      color: #cbd5e1;
    }

    .form-field ::ng-deep .mat-form-field-label {
      color: #475569;
      font-weight: 500;
    }

    .form-field ::ng-deep .mat-form-field-outline-thick {
      color: #3b82f6;
    }

    .form-field ::ng-deep .mat-form-field-hint {
      color: #64748b;
      font-size: 12px;
    }

    .form-field ::ng-deep .mat-form-field-wrapper {
      padding-bottom: 0;
    }

    .form-field ::ng-deep .mat-form-field-infix {
      border-top: none;
    }

    .form-field input[readonly] {
      background-color: #f8fafc;
      color: #64748b;
      cursor: not-allowed;
    }

    .form-field input[readonly]:focus {
      background-color: #f8fafc;
      color: #64748b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .cancel-btn {
      color: #64748b;
      border-color: #cbd5e1;
      border-radius: 6px;
      padding: 10px 20px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
    }

    .cancel-btn:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      color: #475569;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .submit-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 6px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
    }

    .submit-btn:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 768px) {
      .dialog-container {
        min-width: 95vw;
        max-width: 95vw;
        max-height: 95vh;
      }

      .header-content {
        padding: 16px 20px;
        flex-direction: column;
        gap: 12px;
      }

      .header-left {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .dialog-body {
        padding: 16px;
      }

      .form-section {
        padding: 16px;
        margin-bottom: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
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
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.userForm.patchValue({
        firstName: this.data.user.firstName || this.data.user.first_name,
        lastName: this.data.user.lastName || this.data.user.last_name,
        email: this.data.user.email,
        role: this.data.user.role,
        department: this.data.user.department,
        password: '' // Clear password field for security
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
        // Debug: Log the form values
        console.log('Form values being sent:', formValue);
        console.log('Password value:', formValue.password);
        console.log('Role value:', formValue.role);
        console.log('Current user:', this.authService.getCurrentUser());
        console.log('Auth token:', this.authService.getToken());
        
        // Create new user
        this.authService.registerUser({
          email: formValue.email,
          password: formValue.password,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: formValue.role,
          department: formValue.department
        }).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.snackBar.open('User created successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(formValue);
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.snackBar.open('Error creating user: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
          }
        });
      } else {
        // Handle edit user logic
        console.log('Updating user:', formValue);
        
        // Prepare update data (exclude password and email for security)
        const updateData: any = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: formValue.role,
          department: formValue.department
        };
        
        // Note: Password and email updates are handled separately for security
        
        // Call the update user service
        this.authService.updateUser(this.data.user?.id || '', updateData).subscribe({
          next: (response) => {
            console.log('User updated successfully:', response);
            this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(updateData);
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.snackBar.open('Error updating user: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
          }
        });
      }
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
} 