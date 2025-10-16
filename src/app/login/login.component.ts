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
            <img src="assets/logo.jpeg" alt="AJA Law Offices" class="company-logo">
          </div>
          <div class="brand-text">
            <div class="law-offices">LAW OFFICES OF</div>
            <div class="main-name">AKHEEL JINABHAI</div>
            <div class="associates">& ASSOCIATES</div>
            <div class="association">IN ASSOCIATION WITH</div>
            <div class="mckee">MCKEE COMMERCIAL LAW</div>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      width: 100%;
      max-width: 1000px;
      display: flex;
      min-height: 650px;
      position: relative;
      z-index: 1;
    }

    .branding-section {
      flex: 1;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1a1a1a 100%);
      color: white;
      padding: 50px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .branding-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .logo-container {
      margin-bottom: 40px;
      position: relative;
      z-index: 2;
    }

    .company-logo {
      width: 200px;
      height: 200px;
      object-fit: contain;
      border-radius: 25px;
      margin: 0 auto 30px;
      display: block;
      background: white;
      padding: 25px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .company-logo:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    .brand-text {
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
    }

    .law-offices {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
      font-weight: 300;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .main-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      font-family: 'Georgia', serif;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    }

    .associates {
      font-size: 20px;
      font-weight: 400;
      font-family: 'Georgia', serif;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
    }

    .association {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 20px;
      margin-bottom: 8px;
      font-weight: 300;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .mckee {
      font-size: 22px;
      font-weight: 600;
      font-family: 'Georgia', serif;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    }

    .tagline {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
      margin-top: 30px;
      padding: 15px 25px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 25px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 2;
      letter-spacing: 1px;
    }

    .login-form {
      flex: 1;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      position: relative;
    }

    .login-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(102, 126, 234, 0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
      opacity: 0.5;
    }

    .login-form h2 {
      margin: 0 0 15px 0;
      color: #1a202c;
      font-size: 32px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .login-subtitle {
      color: #64748b;
      margin-bottom: 40px;
      font-size: 18px;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 25px;
      position: relative;
      z-index: 1;
    }

    .full-width ::ng-deep .mat-form-field {
      font-size: 16px;
    }

    .full-width ::ng-deep .mat-form-field-outline {
      color: #e2e8f0;
    }

    .full-width ::ng-deep .mat-form-field-outline-thick {
      color: #667eea;
    }

    .full-width ::ng-deep .mat-form-field-label {
      color: #64748b;
      font-weight: 500;
    }

    .full-width ::ng-deep .mat-input-element {
      color: #1a202c;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 35px;
      position: relative;
      z-index: 1;
    }

    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
      color: #5a67d8;
      text-decoration: underline;
    }

    .login-button {
      width: 100%;
      height: 55px;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 25px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    }

    .login-button:active {
      transform: translateY(0);
    }

    .login-footer {
      text-align: center;
      margin-top: 30px;
      position: relative;
      z-index: 1;
    }

    .login-footer p {
      color: #64748b;
      font-size: 16px;
      font-weight: 400;
    }

    .signup-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .signup-link:hover {
      color: #5a67d8;
      text-decoration: underline;
    }


    @media (max-width: 768px) {
      .login-container {
        padding: 10px;
      }

      .login-card {
        flex-direction: column;
        max-width: 450px;
        min-height: auto;
        border-radius: 15px;
      }

      .branding-section {
        padding: 40px 30px;
        order: 2;
      }

      .login-form {
        padding: 40px 30px;
        order: 1;
      }

      .company-logo {
        width: 150px;
        height: 150px;
      }

      .main-name {
        font-size: 24px;
      }

      .associates {
        font-size: 16px;
      }

      .mckee {
        font-size: 18px;
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

} 