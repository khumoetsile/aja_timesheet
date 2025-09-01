import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserDataService } from '../services/user-data.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    FormsModule
  ],
  template: `
    <div class="pc-layout" [class.theme-dark]="isDarkTheme" [class.theme-light]="!isDarkTheme">
      <!-- Mobile Overlay -->
      <div class="mobile-overlay" *ngIf="isMobileMenuOpen" (click)="toggleMobileMenu()"></div>
      <!-- Sidebar -->
      <nav class="pc-sidebar enhanced-sidebar" [class.navbar-collapsed]="isCollapsed" [class.mobile-open]="isMobileMenuOpen">
        <div class="m-header">
          <a class="b-brand" routerLink="/dashboard" (click)="closeMobileMenu()">
            <div class="logo-wrapper">
              <img src="assets/aja-logo.svg" alt="AJA" class="logo logo-lg">
            </div>
            <div class="brand-text" *ngIf="!isCollapsed">
              <div class="brand-name">AJA</div>
              <div class="brand-subtitle">Law Offices</div>
            </div>
          </a>
          <!-- collapse toggle removed (was duplicate/hamburger) -->
          <button mat-icon-button 
                  class="mobile-close-btn mobile-menu-toggle"
                  (click)="toggleMobileMenu()"
                  *ngIf="isMobileMenuOpen">
            <mat-icon>close</mat-icon>
          </button>
          <!-- notifications removed from top bar -->
          <!-- <button mat-icon-button class="notif-bell" aria-label="Notifications">
            <mat-icon>notifications</mat-icon>
            <span class="notif-count">0</span>
          </button> -->
        </div>

        <div class="navbar-content">
          <!-- Profile card -->
          <div class="profile-card enhanced-profile-card" *ngIf="currentUser && !isCollapsed">
            <div class="avatar enhanced-avatar">{{ getUserInitials() }}</div>
            <div class="profile-meta">
              <div class="profile-name">{{ getFullName() }}</div>
              <div class="profile-role">{{ getRoleDisplayName() }}</div>
            </div>
          </div>

          <ul class="pc-navbar enhanced-navbar">

            <!-- Core Navigation -->
            <li class="pc-item pc-caption">
              <label>Navigation</label>
              <span>Quick access</span>
            </li>

            <!-- Dashboard -->
            <li class="pc-item" [class.active]="isActiveRoute('/admin/reports')" *ngIf="isAdmin">
              <a routerLink="/admin/reports" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Reports' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">dashboard</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Reports</span>
              </a>
            </li>



            <li class="pc-item" [class.active]="isActiveRoute('/supervisor/dashboard')" *ngIf="isSupervisor">
              <a routerLink="/supervisor/dashboard" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Supervisor Dashboard' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">dashboard</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Supervisor Dashboard</span>
              </a>
            </li>

            <!-- Supervisor Management Section -->
            <li class="pc-item pc-caption" *ngIf="isSupervisor">
              <label>Department Management</label>
              <span>Manage your department</span>
            </li>

            <!-- Supervisor Tasks -->
            <li class="pc-item" [class.active]="isActiveRoute('/supervisor/tasks')" *ngIf="isSupervisor">
              <a routerLink="/supervisor/tasks" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Department Tasks' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">task_alt</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Department Tasks</span>
              </a>
            </li>

            <li class="pc-item" [class.active]="isActiveRoute('/dashboard')" *ngIf="isStaff">
              <a routerLink="/dashboard" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Dashboard' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">dashboard</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Dashboard</span>
              </a>
            </li>

            <!-- Timesheet (Staff only) -->
            <li class="pc-item" [class.active]="isActiveRoute('/timesheet')" *ngIf="isStaff">
              <a routerLink="/timesheet" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'My Timesheet' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">schedule</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">My Timesheet</span>
              </a>
            </li>

            <!-- Management Section (Admin only) -->
            <li class="pc-item pc-caption" *ngIf="isAdmin">
              <label>Admin</label>
              <span>Manage and monitor</span>
            </li>

            <!-- User Management (Admin only) -->
            <li class="pc-item" [class.active]="isActiveRoute('/admin/users')" *ngIf="isAdmin">
              <a routerLink="/admin/users" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'User Management' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">people</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">User Management</span>
              </a>
            </li>

            <!-- Admin Tasks -->
            <li class="pc-item" [class.active]="isActiveRoute('/admin/tasks')" *ngIf="isAdmin">
              <a routerLink="/admin/tasks" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Tasks' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">task</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Tasks</span>
              </a>
            </li>

            <!-- Analytics -->
            <li class="pc-item" [class.active]="isActiveRoute('/admin/analytics')" *ngIf="isAdmin">
              <a routerLink="/admin/analytics" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Analytics' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">analytics</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Analytics</span>
              </a>
            </li>

            <!-- Account Section -->
            <li class="pc-item pc-caption">
              <label>Account</label>
              <span>User settings</span>
            </li>

            <!-- Profile -->
            <li class="pc-item" [class.active]="isActiveRoute('/admin/profile')" *ngIf="isAdmin">
              <a routerLink="/admin/profile" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Profile' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">person</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Profile</span>
              </a>
            </li>

            <li class="pc-item" [class.active]="isActiveRoute('/supervisor/profile')" *ngIf="isSupervisor">
              <a routerLink="/supervisor/profile" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Profile' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">person</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Profile</span>
              </a>
            </li>

            <li class="pc-item" [class.active]="isActiveRoute('/profile')" *ngIf="isStaff">
              <a routerLink="/profile" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Profile' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">person</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Profile</span>
              </a>
            </li>

            <!-- Settings -->
            <li class="pc-item">
              <a routerLink="/settings" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Settings' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">settings</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Settings</span>
              </a>
            </li>

            <!-- Logout -->
            <li class="pc-item logout-item">
              <a (click)="logout()" class="pc-link" (click)="closeMobileMenu()" [matTooltip]="isCollapsed ? 'Sign Out' : ''" matTooltipPosition="right">
                <mat-icon class="pc-micon">logout</mat-icon>
                <span class="pc-mtext" *ngIf="!isCollapsed">Sign Out</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Header -->
      <header class="pc-header">
        <div class="header-wrapper">
          <div class="header-inner">
            <div class="header-left">
              <button mat-icon-button class="pc-head-link desktop-menu-toggle" (click)="toggleCollapse()" aria-label="Toggle navigation">
                <mat-icon>menu</mat-icon>
              </button>
              <div class="page-title">AJA</div>
            </div>

            <div class="header-right">
              <!-- simplified user control: just name + chevron -->
              <button mat-button class="pc-head-link user-name" [matMenuTriggerFor]="userMenu" matTooltip="User Menu">
                <span class="user-name">{{ getFullName() }}</span>
                <mat-icon class="chevron-down">expand_more</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu" class="pc-h-dropdown">
                <div class="dropdown-header"><h6>{{ getFullName() }}</h6><span>{{ getRoleDisplayName() }}</span></div>
                <mat-divider></mat-divider>
                <button mat-menu-item [routerLink]="getProfileRoute()"><mat-icon>person</mat-icon><span>Profile</span></button>
                <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
              </mat-menu>

              <button mat-icon-button class="pc-head-link" (click)="toggleTheme()" [matTooltip]="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'">
                <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="pc-main">
        <div class="pc-content">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* CSS Variables for Design Tokens */
    :host {
      --font-weight-light: 300;
      --font-weight-regular: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
      --shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
    }

    .pc-layout {
      display: flex;
      min-height: 100vh;
  }
    

    /* THEME TOKENS */
    .theme-dark { 
      --side-bg-1: #0f172a; 
      --side-bg-2: #111827; 
      --text-strong: #ffffff; 
      --text-muted: rgba(255,255,255,0.85); 
      --text-soft: rgba(255,255,255,0.6); 
      --link-hover: rgba(255,255,255,0.08); 
      --active-bg: rgba(59,130,246,0.15); 
      --active-stroke: rgba(59,130,246,0.4); 
      --header-bg: rgba(255,255,255,0.95); 
      --profile-bg: rgba(255,255,255,0.08);
      --profile-border: rgba(255,255,255,0.12);
      --divider: rgba(255,255,255,0.08);
    }
    
    .theme-light { 
      --side-bg-1: #f8fafc; 
      --side-bg-2: #e5e7eb; 
      --text-strong: #0f172a; 
      --text-muted: #334155; 
      --text-soft: #64748b; 
      --link-hover: rgba(15,23,42,0.06); 
      --active-bg: rgba(30,58,138,0.10); 
      --active-stroke: rgba(30,58,138,0.35); 
      --header-bg: rgba(255,255,255,0.98); 
      --profile-bg: rgba(15,23,42,0.04);
      --profile-border: rgba(15,23,42,0.08);
      --divider: rgba(15,23,42,0.08);
    }

    /* Sidebar Styles */
    .pc-sidebar {
  background: linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(51,65,85,0.85) 100%);
  box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.18);
  width: 260px;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1026;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  border-right: 1px solid rgba(255,255,255,0.08);
  border-radius: 0;
  backdrop-filter: blur(18px) saturate(180%);

      &.navbar-collapsed {
        width: 72px;

        .pc-mtext,
        .brand-text,
        .profile-card {
          display: none;
        }

        .pc-link {
          justify-content: center;
          padding: 16px 8px;
        }

        .pc-micon {
          margin-right: 0;
        }

        .pc-caption {
          display: none;
        }
      }
    }

    .m-header {
      padding: 20px 16px 16px 16px;
      border-bottom: 1px solid var(--divider);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
    }

    .b-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .logo-wrapper {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.15) 100%);
      border-radius: 12px;
      border: 1px solid rgba(59,130,246,0.2);
    }

    .logo {
      width: 24px;
      height: 24px;
    }

    .brand-text { 
      color: var(--text-strong); 
      opacity: .95; 
    }

    .brand-name { 
      font-size: 18px; 
      font-weight: 700; 
      line-height: 1.1; 
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-subtitle { 
      font-size: 11px; 
      color: var(--text-soft); 
      font-weight: 500; 
      letter-spacing: 0.3px; 
      text-transform: uppercase; 
    }

    .collapse-toggle {
      color: #38bdf8;
      background: #0f172a;
      border-radius: 50%;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(56,189,248,0.08);
      &:hover {
        background: #334155;
        color: #38bdf8;
  transform: none;
      }
    }

    .navbar-content {
      padding: 20px 0;
    }

    .profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 18px 18px 22px 18px;
  padding: 16px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #334155 0%, #18181b 100%);
  border: 1px solid #334155;
  box-shadow: 0 2px 12px rgba(56,189,248,0.07);
  backdrop-filter: blur(6px);
    }

    .profile-card .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  font-size: 18px;
  box-shadow: 0 4px 16px rgba(56,189,248,0.18);
    }

    .profile-meta {
  display: flex;
  flex-direction: column;
  color: #f1f5f9;
    }

    .profile-name { 
  font-size: 15px; 
  font-weight: 600; 
  margin-bottom: 2px;
    }
    
    .profile-role { 
  font-size: 11px; 
  color: #38bdf8; 
  text-transform: uppercase; 
  letter-spacing: .3px; 
  font-weight: 500;
    }

    .pc-navbar {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .pc-item {
      margin: 0;
    }

    .pc-caption {
      color: #38bdf8;
      padding: 18px 16px 8px 16px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      position: relative;
      label {
        display: block;
        margin-bottom: 2px;
        color: #38bdf8;
        font-weight: 600;
      }
      span {
        font-size: 9px;
        color: #94a3b8;
        text-transform: capitalize;
        font-weight: 400;
      }
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2px;
        height: 1px;
        background: #334155;
      }
    }

    .pc-link {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      color: #f1f5f9;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 10px;
      font-size: 15px;
      font-weight: 500;
      position: relative;
      margin: 4px 10px;
      letter-spacing: 0.08px;
      &:hover {
        background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
        color: #fff;
        transform: none;
        box-shadow: 0 2px 8px rgba(56,189,248,0.10);
      }
      &.active {
        background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
        color: #fff;
        box-shadow: 0 2px 16px rgba(56,189,248,0.18);
        font-weight: 700;
        .pc-micon {
          color: #fff;
          text-shadow: 0 0 8px #38bdf8;
        }
      }
      /* Accent bar */
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
  transform: translateY(-50%);
        width: 4px;
        height: 0px;
        background: linear-gradient(180deg, #38bdf8 0%, #6366f1 100%);
        border-radius: 2px;
        transition: height .3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: .9;
      }
      &.active::before { 
        height: 70%; 
      }
    }

    .pc-micon {
  margin-right: 12px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  transition: color 0.2s ease;
    }

    .pc-mtext {
      font-size: 14px;
      font-weight: 500;
    }

    .logout-item {
      margin-top: 22px;
      border-top: 1px solid #334155;
      padding-top: 16px;
      .pc-link {
        color: #f87171;
        &:hover {
          background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
          color: #fff;
        }
        .pc-micon {
          color: #f87171;
        }
      }
    }

    /* Header Styles */
    .pc-header {
      background: #f8fafc;
      color: #222;
      min-height: 64px;
      box-shadow: 0 1px 6px rgba(31,41,55,0.06);
      position: fixed;
      left: 260px;
      right: 0;
      z-index: 1025;
      border-bottom: 1px solid #e6eef6;
    }

    /* Make header-wrapper align to the main content area (to the right of the sidebar) */
    .header-wrapper {
      width: 100%;
      display: block;
      background: transparent;
    }
    .header-inner {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(16,24,40,0.04);
    }

    .header-left { display:flex; align-items:center; gap:12px; }
    .page-title { font-size:16px; font-weight:700; margin:0; color:#0f172a; }
    .avatar-mini {
      width:32px;
      height:32px;
      border-radius:6px;
      background: linear-gradient(135deg,#6366f1,#06b6d4);
      color: #fff;
      display:grid;
      place-items:center;
      font-weight:700;
      margin-right:8px;
      font-size:13px;
    }
  .header-right { display: flex !important; align-items:center; gap:12px; }
  .pc-head-link.user-name { padding: 6px 10px; border-radius: 8px; color:#0f172a; display:flex; align-items:center; gap:8px; }
  .pc-head-link.user-name:hover { background: rgba(15,23,42,0.03); }
  .chevron-down { margin-left:6px; font-size:20px; }
  .pc-h-item .pc-head-link.mat-icon-button { width:40px; height:40px; }
  .pc-h-item .pc-head-link.mat-icon-button mat-icon { font-size:20px; }
  /* notifications removed from top bar; keep header compact */
  /* .notif-bell { position: relative; } */
  /* .notif-bell mat-icon { font-size:20px; } */
  /* .notif-count { position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size:11px; width:18px; height:18px; border-radius:50%; display:grid; place-items:center; } */

    /* Remove hover zoom/scale effects globally for interactive elements inside navigation */
    .pc-link, .collapse-toggle, .pc-item, .profile-card, .pc-head-link, .mobile-close-btn, .mobile-menu-toggle {
      transition: background-color .15s ease, color .15s ease, box-shadow .15s ease;
    }
    /* Disable transform/scale on hover to prevent zooming */
    .pc-link:hover, .collapse-toggle:hover, .profile-card:hover, .pc-item:hover, .pc-head-link:hover, .mobile-close-btn:hover {
      transform: none !important;
      background: rgba(0,0,0,0.03);
      box-shadow: none;
    }

  /* Adjust main content to match header height and align with sidebar */
  .pc-main { margin-top: 64px; margin-left: 260px; }

    .user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
    }

    .user-name {
  font-size: 15px;
  font-weight: 600;
  color: #38bdf8;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
    }

  .header-right .user-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: inline-block; color: #0f172a; font-weight: 600; }
  .header-right .avatar-mini { margin-right: 8px; }
    .chevron-down {
  font-size: 20px;
  margin-left: 6px;
  transition: transform 0.2s ease;
    }

    .pc-head-link:hover .chevron-down {
      transform: rotate(180deg);
    }

    .pc-h-dropdown {
  min-width: 220px;
  padding: 8px 0;
  border-radius: 14px;
  box-shadow: 0 20px 25px rgba(56,189,248,0.10), 0 10px 10px rgba(99,102,241,0.04);
  border: 1px solid #334155;
  background: #18181b;
    }

    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid #334155;
      margin-bottom: 8px;
      background: #1e293b;
      h6 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 700;
        color: #38bdf8;
      }
      span {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    /* Main Content */
    .pc-main {
      flex: 1;
      margin-left: 260px;
      margin-top: 64px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: calc(100vh - 64px);
      background: #f8fafc;

      .navbar-collapsed + .pc-header + & {
        margin-left: 72px;
      }
    }

    .pc-content {
      padding: 24px;
    }

    /* Mobile Overlay */
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1025;
      display: none;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .mobile-overlay {
        display: block;
      }

      .pc-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1026;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;

        &.mobile-open {
          transform: translateX(0);
        }
      }

      .pc-header {
        left: 0;
      }

      .pc-main {
        margin-left: 0;
      }

      /* Mobile menu buttons */
      .mobile-menu-toggle {
        display: block !important;
      }

      .desktop-menu-toggle {
        display: none !important;
      }

      .mobile-close-btn {
        color: var(--text-strong);
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    @media (max-width: 768px) {
      .pc-header {
        .header-wrapper {
    padding: 0 24px;
        }
      }

      .pc-content {
        padding: 16px;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class NavigationComponent implements OnInit {
  currentUser: any;
  isAdmin = false;
  isSupervisor = false;
  isStaff = false;
  isCollapsed = false;
  isMobileMenuOpen = false;
  isDarkTheme = true;
  routeTitle = '';

  constructor(
    private authService: AuthService,
    public router: Router,
    private userDataService: UserDataService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    console.log('🧭 Navigation component initialized');
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current user updated:', this.currentUser);
      this.updateUserRole();
    });
    
    // Also get initial user
    this.currentUser = this.authService.getCurrentUser();
    console.log('Initial current user:', this.currentUser);
    this.updateUserRole();
    // Restore UI preferences
    try {
      const collapsed = localStorage.getItem('nav_collapsed');
      if (collapsed !== null) this.isCollapsed = collapsed === '1';
    } catch (_) {}
    
    // Load settings from API (including theme)
    this.settingsService.settings$.subscribe(settings => {
      console.log('🎨 Settings updated in navigation:', settings);
      this.isDarkTheme = settings.theme === 'dark';
    });
    
    // Update route title on navigation
    this.router.events.subscribe(() => {
      this.routeTitle = this.getPageTitle(this.router.url);
    });
    this.routeTitle = this.getPageTitle(this.router.url);
  }

  private updateUserRole() {
    if (this.currentUser) {
      this.isAdmin = this.currentUser.role === 'ADMIN';
      this.isSupervisor = this.currentUser.role === 'SUPERVISOR';
      this.isStaff = this.currentUser.role === 'STAFF';
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    try { localStorage.setItem('nav_collapsed', this.isCollapsed ? '1' : '0'); } catch (_) {}
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }



  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  getProfileRoute(): string {
    if (this.isAdmin) {
      return '/admin/profile';
    } else if (this.isSupervisor) {
      return '/supervisor/profile';
    } else {
      return '/profile';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const newTheme = this.isDarkTheme ? 'light' : 'dark';
    
    console.log('🎨 Toggling theme to:', newTheme);
    
    // Update settings via API
    this.settingsService.updateSettings({ theme: newTheme }).subscribe({
      next: (settings) => {
        console.log('✅ Theme updated successfully:', settings.theme);
        this.isDarkTheme = settings.theme === 'dark';
      },
      error: (error) => {
        console.error('❌ Error updating theme:', error);
        // Fallback to localStorage
        this.isDarkTheme = !this.isDarkTheme;
        try { 
          localStorage.setItem('theme_dark', this.isDarkTheme ? '1' : '0'); 
          document.body.classList.toggle('theme-dark', this.isDarkTheme);
          document.body.classList.toggle('theme-light', !this.isDarkTheme);
        } catch (_) {}
      }
    });
  }

  // Helper methods for template
  getFullName(): string {
    return this.userDataService.getFullName(this.currentUser);
  }

  getUserInitials(): string {
    return this.userDataService.getUserInitials(this.currentUser);
  }

  getRoleDisplayName(): string {
    return this.currentUser ? this.userDataService.getRoleDisplayName(this.currentUser.role) : '';
  }

  private getPageTitle(url: string): string {
    // Map common routes to human-friendly titles
    const map: Record<string, string> = {
      '/admin/reports': 'Reports',
      '/admin/analytics': 'Analytics Dashboard',
      '/admin/users': 'User Management',
      '/dashboard': 'Dashboard',
      '/timesheet': 'My Timesheet',
      '/settings': 'Settings',
      '/profile': 'Profile',
      '/admin/profile': 'Profile',
      '/supervisor/dashboard': 'Supervisor Dashboard',
      '/supervisor/tasks': 'Department Tasks',
      '/supervisor/profile': 'Profile'
    };
    if (map[url]) { return map[url]; }
    const parts = url.split('/').filter(Boolean);
    if (!parts.length) { return 'Home'; }
    return parts[parts.length - 1]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
} 