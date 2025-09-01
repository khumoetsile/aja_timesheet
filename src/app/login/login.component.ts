import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- AJA Logo and Branding -->
        <div class="branding-section">
          <div class="logo-container">
            <div class="aja-logo">
              <span class="aja-text">AJA</span>
            </div>
          </div>
          <div class="brand-text">
            <div class="law-offices">LAW OFFICES OF</div>
            <div class="main-name">AKHEEL JINABHAI</div>
            <div class="associates">& ASSOCIATES</div>
          </div>
          <div class="tagline">DRIVING SUCCESS THROUGH LEGAL STRATEGY</div>
        </div>

        <!-- Login Form -->
        <div class="login-form">
          <h2>Welcome Back</h2>
          <p class="login-subtitle">Please sign in to access your account</p>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Enter your password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>
              <a href="#" class="forgot-password">Forgot password?</a>
            </div>

            <button mat-raised-button color="primary" type="submit" class="login-button" 
                    [disabled]="loginForm.invalid || isLoading">
              <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div class="login-footer">
            <p>Don't have an account? <a href="#" class="signup-link">Contact administrator</a></p>
          </div>

          <!-- Demo Accounts Info -->
          <div class="demo-accounts">
            <h4>Demo Accounts</h4>
            <div class="demo-account" (click)="fillDemoAccount('admin@aja.com', 'admin123')">
              <strong>Admin:</strong> admin&#64;aja.com / admin123
            </div>
            <div class="demo-account" (click)="fillDemoAccount('supervisor@aja.com', 'admin123')">
              <strong>Supervisor:</strong> supervisor&#64;aja.com / admin123
            </div>
            <div class="demo-account" (click)="fillDemoAccount('staff@aja.com', 'admin123')">
              <strong>Staff:</strong> staff&#64;aja.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      width: 100%;
      max-width: 900px;
      display: flex;
      min-height: 600px;
    }

    .branding-section {
      flex: 1;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .logo-container {
      margin-bottom: 30px;
    }

    .aja-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      border: 2px solid #fff;
    }

    .aja-text {
      font-family: 'Georgia', serif;
      font-size: 24px;
      font-weight: normal;
      color: white;
      letter-spacing: 2px;
    }

    .brand-text {
      margin-bottom: 20px;
    }

    .law-offices {
      font-size: 12px;
      color: #ccc;
      margin-bottom: 5px;
      font-weight: 300;
    }

    .main-name {
      font-size: 24px;
      font-weight: normal;
      margin-bottom: 5px;
      font-family: 'Georgia', serif;
    }

    .associates {
      font-size: 16px;
      font-weight: normal;
      font-family: 'Georgia', serif;
    }

    .tagline {
      font-size: 14px;
      color: #ccc;
      font-weight: 300;
      margin-top: 20px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .login-form {
      flex: 1;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .login-form h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .login-subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .forgot-password {
      color: #1976d2;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
    }

    .login-footer p {
      color: #666;
      font-size: 14px;
    }

    .signup-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .signup-link:hover {
      text-decoration: underline;
    }

    .demo-accounts {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .demo-accounts h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    }

    .demo-account {
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .demo-account:hover {
      background: #e3f2fd;
      color: #1976d2;
      transform: translateX(4px);
    }

    .demo-account:active {
      transform: translateX(2px);
    }

    .demo-account strong {
      color: #333;
    }

    @media (max-width: 768px) {
      .login-card {
        flex-direction: column;
        max-width: 400px;
      }

      .branding-section {
        padding: 30px 20px;
      }

      .login-form {
        padding: 30px 20px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData.email, loginData.password)
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            
            // Token and user data are already stored by AuthService
            
            // Show success message
            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

            // Navigate based on role
            this.navigateByRole(response.user.role);
          },
          error: (error) => {
            this.isLoading = false;
            
            let errorMessage = 'Login failed. Please try again.';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
    }
  }

  private navigateByRole(role: string) {
    // Add a small delay to ensure proper component loading
    setTimeout(() => {
      switch (role) {
        case 'ADMIN':
          this.router.navigate(['/admin/reports']);
          break;
        case 'SUPERVISOR':
          this.router.navigate(['/supervisor/dashboard']);
          break;
        case 'STAFF':
          console.log('Navigating STAFF user to dashboard...');
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Navigation to dashboard completed');
          }).catch(err => {
            console.error('Navigation error:', err);
            // Fallback to direct navigation
            window.location.href = '/dashboard';
          });
          break;
        default:
          console.log('Navigating default user to dashboard...');
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Navigation to dashboard completed');
          }).catch(err => {
            console.error('Navigation error:', err);
            // Fallback to direct navigation
            window.location.href = '/dashboard';
          });
      }
    }, 100);
  }

  fillDemoAccount(email: string, password: string) {
    this.loginForm.get('email')?.setValue(email);
    this.loginForm.get('password')?.setValue(password);
    this.snackBar.open('Demo account filled!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
} 