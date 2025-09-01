import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

export interface HeaderAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-header" [class]="customClass">
      <!-- Left Section -->
      <div class="header-left">
        <div class="header-title" *ngIf="!customHeaderLeft">
          <h1>{{ title }}</h1>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <ng-content select="[slot=header-left]"></ng-content>
      </div>

      <!-- Center Section -->
      <div class="header-center" *ngIf="showCenter">
        <ng-content select="[slot=header-center]"></ng-content>
      </div>

      <!-- Right Section -->
      <div class="header-right">
        <div class="header-actions" *ngIf="!customHeaderRight">
          <button 
            *ngFor="let action of actions" 
            mat-raised-button 
            [disabled]="action.disabled"
            [matBadge]="action.badge"
            [matBadgeHidden]="!action.badge"
            matBadgeColor="accent"
            class="header-action-btn"
            (click)="action.action()">
            <mat-icon>{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
        </div>
        <ng-content select="[slot=header-right]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--template-header-padding, var(--spacing-xl));
      background: var(--template-header-bg, var(--aja-surface-1));
      color: var(--template-header-color, var(--aja-charcoal));
      border-radius: var(--template-header-radius, var(--radius-lg));
      margin-bottom: var(--template-header-margin, var(--spacing-xl));
      border: var(--template-header-border, 1px solid var(--aja-grey-lighter));
      box-shadow: var(--template-header-shadow, var(--shadow-md));
      min-height: var(--template-header-height, 80px);
    }

    .header-left {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .header-center {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .header-right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .header-title h1 {
      margin: 0;
      font-size: var(--template-title-size, 2rem);
      font-weight: var(--template-title-weight, var(--font-weight-regular));
      color: var(--template-title-color, var(--aja-charcoal));
      line-height: 1.2;
    }

    .header-title p {
      margin: var(--spacing-sm) 0 0 0;
      font-size: var(--template-subtitle-size, 1rem);
      color: var(--template-subtitle-color, var(--aja-grey));
      line-height: 1.4;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }

    .header-action-btn {
      background: var(--template-action-bg, var(--aja-slate));
      color: var(--template-action-color, var(--aja-white));
      border-radius: var(--template-action-radius, var(--radius-md));
      transition: all 0.2s ease;
    }

    .header-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .header-action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .header-left,
      .header-center,
      .header-right {
        flex: none;
        justify-content: center;
      }

      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    /* Template-specific overrides */
    .template-sidebar .dashboard-header {
      margin-left: var(--template-sidebar-width, 280px);
    }

    .template-topbar .dashboard-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      margin-bottom: 0;
      border-radius: 0;
    }

    .template-hybrid .dashboard-header {
      margin-left: var(--template-sidebar-width, 280px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
  `]
})
export class DashboardHeaderComponent {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = '';
  @Input() actions: HeaderAction[] = [];
  @Input() customClass: string = '';
  @Input() showCenter: boolean = false;
  @Input() customHeaderLeft: boolean = false;
  @Input() customHeaderRight: boolean = false;

  @Output() actionClicked = new EventEmitter<string>();

  constructor() {}
}

