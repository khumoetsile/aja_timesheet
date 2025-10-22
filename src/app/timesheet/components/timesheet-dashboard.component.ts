import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TimesheetService } from '../services/timesheet.service';
import { TimesheetEntry } from '../models/timesheet-entry.interface';
import { TimesheetDialogComponent } from './timesheet-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-timesheet-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Statistics Cards Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayTotalHours | number:'1.2-2' }}</div>
            <div class="stat-label">Today's Hours</div>
            <div class="stat-change" [ngClass]="hoursChangePercent >= 0 ? 'positive' : 'negative'">
              <mat-icon>{{ hoursChangePercent >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              <span>{{ hoursChangePercent >= 0 ? '+' : '' }}{{ hoursChangePercent }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayBillableHours | number:'1.2-2' }}</div>
            <div class="stat-label">Billable Hours</div>
            <div class="stat-change" [ngClass]="billableChangePercent >= 0 ? 'positive' : 'negative'">
              <mat-icon>{{ billableChangePercent >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              <span>{{ billableChangePercent >= 0 ? '+' : '' }}{{ billableChangePercent }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <mat-icon>assignment</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayEntries }}</div>
            <div class="stat-label">Today's Entries</div>
            <div class="stat-change" [ngClass]="entriesChangePercent >= 0 ? 'positive' : entriesChangePercent < 0 ? 'negative' : 'neutral'">
              <mat-icon>{{ entriesChangePercent > 0 ? 'trending_up' : entriesChangePercent < 0 ? 'trending_down' : 'remove' }}</mat-icon>
              <span>{{ entriesChangePercent >= 0 ? '+' : '' }}{{ entriesChangePercent }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <mat-icon>speed</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ efficiencyRate }}%</div>
            <div class="stat-label">Efficiency Rate</div>
            <div class="stat-change" [ngClass]="efficiencyChangePercent >= 0 ? 'positive' : 'negative'">
              <mat-icon>{{ efficiencyChangePercent >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              <span>{{ efficiencyChangePercent >= 0 ? '+' : '' }}{{ efficiencyChangePercent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Row -->
      <div class="content-row">
        <!-- Recent Entries Table -->
        <div class="table-section">
          <div class="section-header">
            <div class="header-content">
              <h3>Recent Entries</h3>
              <p>Your latest timesheet activities</p>
            </div>
            <button mat-raised-button color="primary" (click)="addNewEntry()">
              <mat-icon>add</mat-icon>
              New Entry
            </button>
          </div>
          
          <!-- Compact Filters Section -->
          <div class="filters-section">
            <div class="filters-toolbar">
              <div class="filters-left">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Search</mat-label>
                  <input matInput [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search entries...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilter()">
                    <mat-option value="">All</mat-option>
                    <mat-option value="Completed">Completed</mat-option>
                    <mat-option value="CarriedOut">Ongoing</mat-option>
                    <mat-option value="NotStarted">Not Started</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Priority</mat-label>
                  <mat-select [(ngModel)]="selectedPriority" (selectionChange)="applyFilter()">
                    <mat-option value="">All</mat-option>
                    <mat-option value="Low">Low</mat-option>
                    <mat-option value="Medium">Medium</mat-option>
                    <mat-option value="High">High</mat-option>
                    <mat-option value="Critical">Critical</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="toggle-container">
                  <mat-slide-toggle 
                    [checked]="billableOnly === true" 
                    (change)="billableOnly = $event.checked; applyFilter()"
                    class="billable-toggle">
                    <span>Billable</span>
                  </mat-slide-toggle>
                </div>
              </div>

              <div class="filters-right">
                <div class="active-filters" *ngIf="hasActiveFilters()">
                  <div class="filter-badge" *ngIf="searchTerm">
                    <span>"{{ searchTerm }}"</span>
                    <button mat-icon-button (click)="searchTerm = ''; applyFilter()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="filter-badge" *ngIf="selectedStatus">
                    <span>{{ selectedStatus }}</span>
                    <button mat-icon-button (click)="selectedStatus = ''; applyFilter()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="filter-badge" *ngIf="selectedPriority">
                    <span>{{ selectedPriority }}</span>
                    <button mat-icon-button (click)="selectedPriority = ''; applyFilter()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="filter-badge" *ngIf="billableOnly">
                    <span>Billable</span>
                    <button mat-icon-button (click)="billableOnly = null; applyFilter()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>

                <button mat-stroked-button (click)="clearFilters()" class="clear-btn" *ngIf="hasActiveFilters()">
                  <mat-icon>clear</mat-icon>
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="recentEntriesDataSource" matSort class="dashboard-table">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let element">
                  <div class="date-cell">
                    <div class="date-main">{{element.date | date:'MMM dd'}}</div>
                    <div class="date-sub">{{element.date | date:'yyyy'}}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Client Column -->
              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
                <td mat-cell *matCellDef="let element">
                  <div class="client-cell">
                    <div class="client-name">{{element.client_file_number}}</div>
                    <div class="client-dept">{{element.department}}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Task Column -->
              <ng-container matColumnDef="task">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Task</th>
                <td mat-cell *matCellDef="let element">
                  <div class="task-cell">
                    <div class="task-title">{{element.task}}</div>
                    <div class="task-activity">{{element.activity}}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Hours Column -->
              <ng-container matColumnDef="hours">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Hours</th>
                <td mat-cell *matCellDef="let element">
                  <div class="hours-cell">
                    <div class="hours-value">{{element.total_hours | number:'1.2-2'}}</div>
                    <div class="hours-time">{{element.start_time}} - {{element.end_time}}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [class]="'status-' + element.status.toLowerCase()" class="status-chip">
                    {{element.status === 'CarriedOut' ? 'Ongoing' : element.status === 'NotStarted' ? 'Not Started' : element.status}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editEntry(element)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="viewDetails(element)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <!-- Pagination -->
            <mat-paginator 
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageSize]="5"
              showFirstLastButtons
              aria-label="Select page of entries">
            </mat-paginator>
          </div>
        </div>

        <!-- Activity Summary -->
        <div class="summary-section">
          <div class="summary-card">
            <div class="card-header">
              <h4>Weekly Summary</h4>
              <button mat-icon-button [matMenuTriggerFor]="periodMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #periodMenu="matMenu">
                <button mat-menu-item>
                  <mat-icon>today</mat-icon>
                  <span>This Week</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>date_range</mat-icon>
                  <span>Last Week</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>calendar_month</mat-icon>
                  <span>This Month</span>
                </button>
              </mat-menu>
            </div>
            
            <div class="summary-content">
              <div class="summary-item">
                <div class="summary-label">Total Hours</div>
                <div class="summary-value">{{ weeklyTotalHours | number:'1.2-2' }}</div>
                <mat-progress-bar 
                  [value]="weeklyProgress" 
                  color="primary" 
                  class="summary-progress">
                </mat-progress-bar>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="summary-item">
                <div class="summary-label">Billable Hours</div>
                <div class="summary-value">{{ weeklyBillableHours | number:'1.2-2' }}</div>
                <mat-progress-bar 
                  [value]="billableProgress" 
                  color="accent" 
                  class="summary-progress">
                </mat-progress-bar>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="summary-item">
                <div class="summary-label">Entries</div>
                <div class="summary-value">{{ weeklyEntries }}</div>
                <mat-progress-bar 
                  [value]="entriesProgress" 
                  color="warn" 
                  class="summary-progress">
                </mat-progress-bar>
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h4>Quick Actions</h4>
            </div>
            
            <div class="quick-actions">
              <button mat-stroked-button class="action-btn" (click)="addNewEntry()">
                <mat-icon>add</mat-icon>
                <span>New Entry</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="exportReport()">
                <mat-icon>download</mat-icon>
                <span>Export Report</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="viewAnalytics()">
                <mat-icon>analytics</mat-icon>
                <span>View Analytics</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="manageSettings()">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              
              <button mat-stroked-button class="action-btn" (click)="goToProfile()">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-md);
      background: var(--aja-surface-2);
      min-height: 100vh;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .stat-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      background: var(--aja-slate);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon {
      color: var(--aja-white);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
      line-height: 1.2;
      margin-bottom: var(--spacing-xs);
    }

    .stat-label {
      color: var(--aja-grey);
      font-size: 12px;
      font-weight: var(--font-weight-regular);
      margin-bottom: var(--spacing-sm);
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 10px;
      font-weight: var(--font-weight-regular);
    }

    .stat-change.positive {
      color: #10b981;
    }

    .stat-change.negative {
      color: #ef4444;
    }

    .stat-change.neutral {
      color: var(--aja-grey);
    }

    .stat-change mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .content-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-xl);
    }

    .table-section {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .section-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--aja-grey-lighter);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h3 {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: 1.125rem;
      font-weight: var(--font-weight-regular);
      color: var(--aja-charcoal);
    }

    .header-content p {
      margin: 0;
      color: var(--aja-grey);
      font-size: 12px;
    }

    .filters-section {
      background: #ffffff;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filters-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .search-field {
      min-width: 200px;
      flex: 1;
    }

    .filter-field {
      min-width: 120px;
    }

    .toggle-container {
      display: flex;
      align-items: center;
      padding: 0 8px;
    }

    .billable-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #495057;
    }

    .filters-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .active-filters {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-badge {
      display: flex;
      align-items: center;
      background: #dc3545;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      gap: 4px;
    }

    .filter-badge button {
      color: white;
      width: 14px;
      height: 14px;
      line-height: 14px;
      opacity: 0.8;
    }

    .filter-badge button:hover {
      opacity: 1;
    }

    .filter-badge button mat-icon {
      font-size: 10px;
      width: 10px;
      height: 10px;
    }

    .clear-btn {
      color: #6c757d;
      border-color: #dee2e6;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: 500;
      background: transparent;
      height: 28px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: auto;
    }

    .clear-btn:hover {
      background: #f8f9fa;
      color: #dc3545;
      border-color: #dc3545;
    }

    .clear-btn mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .filter-field ::ng-deep .mat-form-field-outline {
      color: #dee2e6;
    }

    .filter-field ::ng-deep .mat-form-field-label {
      color: #6c757d;
    }

    .filter-field ::ng-deep .mat-form-field-outline-thick {
      color: #dc3545;
    }

    .filter-field ::ng-deep .mat-form-field-wrapper {
      padding-bottom: 0;
    }

    .filter-field ::ng-deep .mat-form-field-infix {
      padding: 8px 0;
      min-height: auto;
    }

    @media (max-width: 768px) {
      .filters-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .filters-left {
        flex-direction: column;
        gap: 8px;
      }

      .search-field {
        min-width: auto;
      }

      .filter-field {
        min-width: auto;
      }

      .filters-right {
        justify-content: flex-start;
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .dashboard-table {
      width: 100%;
    }

    .dashboard-table ::ng-deep .mat-header-cell {
      background: var(--aja-surface-2);
      color: var(--aja-charcoal);
      font-weight: var(--font-weight-regular);
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
      padding: var(--spacing-md);
    }

    .dashboard-table ::ng-deep .mat-cell {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--aja-grey-lighter);
    }

    .status-chip {
      font-size: 12px !important;
      font-weight: 600 !important;
      padding: 6px 12px !important;
      border-radius: 16px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      min-height: 24px !important;
      line-height: 1.2 !important;
    }

    .status-completed {
      background: var(--aja-light-green) !important;
      color: var(--aja-charcoal) !important;
    }

    .status-carriedout {
      background: var(--aja-light-yellow) !important;
      color: var(--aja-charcoal) !important;
    }

    .status-notstarted {
      background: var(--aja-orange) !important;
      color: var(--aja-white) !important;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
    }

    .date-main {
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
      font-size: 14px;
    }

    .date-sub {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .client-cell {
      display: flex;
      flex-direction: column;
    }

    .client-name {
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
      font-size: 14px;
    }

    .client-dept {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .task-cell {
      display: flex;
      flex-direction: column;
    }

    .task-title {
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
      font-size: 14px;
    }

    .task-activity {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .hours-cell {
      display: flex;
      flex-direction: column;
    }

    .hours-value {
      font-weight: var(--font-weight-semibold);
      color: var(--aja-slate);
      font-size: 14px;
    }

    .hours-time {
      color: var(--aja-grey);
      font-size: 12px;
    }

    .summary-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .summary-card {
      background: var(--aja-surface-1);
      border-radius: var(--radius-lg);
      border: 1px solid var(--aja-grey-lighter);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--aja-grey-lighter);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h4 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: var(--font-weight-semibold);
      color: var(--aja-charcoal);
    }

    .summary-content {
      padding: var(--spacing-lg);
    }

    .summary-item {
      margin-bottom: var(--spacing-lg);
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-label {
      color: var(--aja-grey);
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-xs);
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold);
      color: var(--aja-charcoal);
      margin-bottom: var(--spacing-sm);
    }

    .summary-progress {
      height: 6px;
      border-radius: var(--radius-sm);
    }

    .quick-actions {
      padding: var(--spacing-lg);
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--aja-surface-2);
      transform: translateX(4px);
    }

    .action-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 1200px) {
      .content-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .dashboard-table {
        min-width: 600px;
      }
    }
  `]
})
export class TimesheetDashboardComponent implements OnInit {
  displayedColumns: string[] = ['date', 'client', 'task', 'hours', 'status', 'actions'];
  recentEntriesDataSource: MatTableDataSource<TimesheetEntry>;
  
  // Statistics
  todayTotalHours: number = 0;
  todayBillableHours: number = 0;
  todayEntries: number = 0;
  efficiencyRate: number = 85;
  
  // Trend calculations (previous day for comparison)
  previousDayTotalHours: number = 0;
  previousDayBillableHours: number = 0;
  previousDayEntries: number = 0;
  previousDayEfficiencyRate: number = 0;
  
  // Percentage changes
  hoursChangePercent: number = 0;
  billableChangePercent: number = 0;
  entriesChangePercent: number = 0;
  efficiencyChangePercent: number = 0;
  
  // Weekly summary
  weeklyTotalHours: number = 0;
  weeklyBillableHours: number = 0;
  weeklyEntries: number = 0;
  weeklyProgress: number = 75;
  billableProgress: number = 80;
  entriesProgress: number = 60;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPriority: string = '';
  billableOnly: boolean | null = null;

  constructor(
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.recentEntriesDataSource = new MatTableDataSource<TimesheetEntry>([]);
  }

  ngOnInit() {
    console.log('🎯 Dashboard component initialized');
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Subscribe to pagination changes
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        this.loadDashboardData();
      });
    }
    
    // Subscribe to sorting changes
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.loadDashboardData();
      });
    }
  }

  loadDashboardData() {
    // Build pagination parameters for table
    const pagination = {
      page: this.paginator?.pageIndex ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator?.pageSize || 5,
      sortBy: this.sort?.active || 'date',
      sortOrder: this.sort?.direction || 'desc'
    };

    // Build filter parameters
    const filters = {
      search: this.searchTerm,
      status: this.selectedStatus,
      priority: this.selectedPriority,
      ...(this.billableOnly !== null && { billable: this.billableOnly })
    };

    console.log('🔄 Loading dashboard data with pagination:', pagination);
    console.log('🔄 Loading dashboard data with filters:', filters);

    // Load paginated data for table
    this.timesheetService.getEntries(pagination, filters).subscribe({
      next: (response: any) => {
        console.log('✅ Dashboard data loaded:', response);
        this.recentEntriesDataSource.data = response.entries;
        
        // Update paginator with total count
        if (this.paginator) {
          this.paginator.length = response.total;
          this.paginator.pageIndex = response.page - 1;
        }
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
      }
    });

    // Load all entries for statistics (no pagination, no filters)
    this.timesheetService.getEntries({ page: 1, limit: 1000 }).subscribe({
      next: (response: any) => {
        console.log('📊 Statistics data loaded:', response);
        this.calculateStatistics(response.entries);
      },
      error: (error) => {
        console.error('❌ Error loading statistics data:', error);
      }
    });
  }

  calculateStatistics(entries: TimesheetEntry[]) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('📊 Calculating statistics from', entries.length, 'entries');
    console.log('📅 Today:', todayString);
    console.log('📊 Sample entries:', entries.slice(0, 3).map(e => ({ date: e.date, total_hours: e.total_hours, billable: e.billable })));
    
    // Calculate today's statistics
    const todayEntries = entries.filter(entry => {
      let entryDate = entry.date;
      
      // Handle different date formats
      if (entry.date && entry.date.includes('T')) {
        entryDate = entry.date.split('T')[0];
      } else if (entry.date && entry.date.includes(' ')) {
        entryDate = entry.date.split(' ')[0];
      }
      
      // Also try to parse the date if it's in a different format
      let parsedDate = entryDate;
      try {
        const dateObj = new Date(entry.date);
        if (!isNaN(dateObj.getTime())) {
          // Use local date instead of UTC to avoid timezone issues
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          parsedDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        // Keep original if parsing fails
      }
      
      console.log('📅 Entry date:', entryDate, 'Parsed:', parsedDate, 'vs Today:', todayString, 'Match:', parsedDate === todayString);
      
      return parsedDate === todayString;
    });

    this.todayEntries = todayEntries.length;
    this.todayTotalHours = todayEntries.reduce((sum: number, entry: any) => 
      sum + parseFloat(entry.total_hours?.toString() || '0'), 0);
    this.todayBillableHours = todayEntries.reduce((sum: number, entry: any) => {
      const isBillable = entry.billable === true || entry.billable === 1 || entry.billable === '1';
      const hours = parseFloat(entry.total_hours?.toString() || '0');
      console.log('💰 Entry billable check:', { 
        entryId: entry.id, 
        billable: entry.billable, 
        billableType: typeof entry.billable, 
        isBillable: isBillable, 
        hours: hours 
      });
      return sum + (isBillable ? hours : 0);
    }, 0);

    console.log('📊 Today\'s stats:', {
      entries: this.todayEntries,
      totalHours: this.todayTotalHours,
      billableHours: this.todayBillableHours
    });

    // Calculate efficiency rate based on TODAY's billable vs total hours
    if (this.todayTotalHours > 0) {
      this.efficiencyRate = Math.round((this.todayBillableHours / this.todayTotalHours) * 100);
      console.log('📊 Efficiency calculation:', {
        billableHours: this.todayBillableHours,
        totalHours: this.todayTotalHours,
        efficiencyRate: this.efficiencyRate,
        calculation: `${this.todayBillableHours} / ${this.todayTotalHours} * 100 = ${this.efficiencyRate}%`
      });
    } else {
      this.efficiencyRate = 0;
      console.log('📊 No total hours today, efficiency rate set to 0%');
    }
    
    console.log('📊 Today\'s efficiency rate:', this.efficiencyRate + '%');

    // Calculate trends by comparing with previous day
    this.calculateTrends(entries);

    // Calculate weekly statistics
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartString = weekStart.toISOString().split('T')[0];

    const weeklyEntries = entries.filter(entry => {
      let entryDate = entry.date;
      
      // Handle different date formats
      if (entry.date && entry.date.includes('T')) {
        entryDate = entry.date.split('T')[0];
      } else if (entry.date && entry.date.includes(' ')) {
        entryDate = entry.date.split(' ')[0];
      }
      
      // Also try to parse the date if it's in a different format
      let parsedDate = entryDate;
      try {
        const dateObj = new Date(entry.date);
        if (!isNaN(dateObj.getTime())) {
          // Use local date instead of UTC to avoid timezone issues
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          parsedDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        // Keep original if parsing fails
      }
      
      return parsedDate >= weekStartString;
    });

    this.weeklyEntries = weeklyEntries.length;
    this.weeklyTotalHours = weeklyEntries.reduce((sum, entry) => 
      sum + parseFloat(entry.total_hours?.toString() || '0'), 0);
    this.weeklyBillableHours = weeklyEntries.reduce((sum, entry) => 
      sum + (entry.billable ? parseFloat(entry.total_hours?.toString() || '0') : 0), 0);
    
    // Calculate progress percentages
    this.weeklyProgress = Math.min(Math.round((this.weeklyTotalHours / 40) * 100), 100); // Assuming 40 hours target
    this.billableProgress = Math.min(Math.round((this.weeklyBillableHours / 35) * 100), 100); // Assuming 35 billable hours target
    this.entriesProgress = Math.min(Math.round((this.weeklyEntries / 20) * 100), 100); // Assuming 20 entries target
  }

  calculateTrends(entries: TimesheetEntry[]) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    console.log('📈 Calculating trends - Yesterday:', yesterdayString);
    
    // Filter entries for yesterday
    const yesterdayEntries = entries.filter(entry => {
      let entryDate = entry.date;
      
      // Handle different date formats
      if (entry.date && entry.date.includes('T')) {
        entryDate = entry.date.split('T')[0];
      } else if (entry.date && entry.date.includes(' ')) {
        entryDate = entry.date.split(' ')[0];
      }
      
      // Parse date if needed
      let parsedDate = entryDate;
      try {
        const dateObj = new Date(entry.date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          parsedDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        // Keep original if parsing fails
      }
      
      return parsedDate === yesterdayString;
    });
    
    // Calculate yesterday's statistics
    this.previousDayEntries = yesterdayEntries.length;
    this.previousDayTotalHours = yesterdayEntries.reduce((sum: number, entry: any) => 
      sum + parseFloat(entry.total_hours?.toString() || '0'), 0);
    this.previousDayBillableHours = yesterdayEntries.reduce((sum: number, entry: any) => 
      sum + (entry.billable ? parseFloat(entry.total_hours?.toString() || '0') : 0), 0);
    
    if (this.previousDayTotalHours > 0) {
      this.previousDayEfficiencyRate = Math.round((this.previousDayBillableHours / this.previousDayTotalHours) * 100);
    } else {
      this.previousDayEfficiencyRate = 0;
    }
    
    // Calculate percentage changes
    this.hoursChangePercent = this.calculatePercentageChange(this.previousDayTotalHours, this.todayTotalHours);
    this.billableChangePercent = this.calculatePercentageChange(this.previousDayBillableHours, this.todayBillableHours);
    this.entriesChangePercent = this.calculatePercentageChange(this.previousDayEntries, this.todayEntries);
    this.efficiencyChangePercent = this.calculatePercentageChange(this.previousDayEfficiencyRate, this.efficiencyRate);
    
    console.log('📈 Trend calculations:', {
      yesterday: {
        entries: this.previousDayEntries,
        totalHours: this.previousDayTotalHours,
        billableHours: this.previousDayBillableHours,
        efficiencyRate: this.previousDayEfficiencyRate
      },
      changes: {
        hours: this.hoursChangePercent,
        billable: this.billableChangePercent,
        entries: this.entriesChangePercent,
        efficiency: this.efficiencyChangePercent
      }
    });
  }
  
  calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // If previous was 0 and current is > 0, that's 100% increase
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  navigateToTimesheet() {
    this.router.navigate(['/timesheet']);
  }

  editEntry(entry: TimesheetEntry) {
    const dialogRef = this.dialog.open(TimesheetDialogComponent, {
      data: { entry, mode: 'edit' },
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '85vh',
      panelClass: 'timesheet-dialog',
      disableClose: false,
      autoFocus: true,
      position: { top: '5vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData(); // Refresh data after successful edit
        this.snackBar.open('Entry updated successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  viewDetails(entry: TimesheetEntry) {
    const dialogRef = this.dialog.open(TimesheetDialogComponent, {
      data: { entry, mode: 'view' },
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '85vh',
      panelClass: 'timesheet-dialog',
      disableClose: false,
      autoFocus: true,
      position: { top: '5vh' }
    });
  }

  exportReport() {
    console.log('Export report functionality');
  }

  viewAnalytics() {
    console.log('View analytics functionality');
  }

  manageSettings() {
    console.log('Manage settings functionality');
  }

  goToProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      switch (currentUser.role) {
        case 'ADMIN':
          this.router.navigate(['/admin/profile']);
          break;
        case 'SUPERVISOR':
          this.router.navigate(['/supervisor/profile']);
          break;
        case 'STAFF':
          this.router.navigate(['/profile']);
          break;
        default:
          this.router.navigate(['/profile']);
          break;
      }
    } else {
      this.router.navigate(['/profile']);
    }
  }

  addNewEntry() {
    const dialogRef = this.dialog.open(TimesheetDialogComponent, {
      data: { mode: 'add' },
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '85vh',
      panelClass: 'timesheet-dialog',
      disableClose: false,
      autoFocus: true,
      position: { top: '5vh' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData(); // Refresh data after successful add
        this.snackBar.open('Entry added successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter() {
    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Reload data with server-side filtering
    this.loadDashboardData();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedStatus || this.selectedPriority || this.billableOnly !== null);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.billableOnly = null;
    
    // Reset to first page
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Reload data
    this.loadDashboardData();
  }
} 