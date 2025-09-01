import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface DepartmentAnalytics {
  departmentName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  overview: {
    totalEntries: number;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    completedTasks: number;
    pendingTasks: number;
    averageHoursPerEntry: number;
    completionRate: number;
    billableRate: number;
  };
  userPerformance: UserPerformanceMetrics[];
  projectBreakdown: ProjectMetrics[];
  timeDistribution: TimeDistribution[];
  productivityTrends: ProductivityTrend[];
  statusDistribution: StatusDistribution[];
  priorityAnalysis: PriorityAnalysis[];
}

export interface UserPerformanceMetrics {
  userId: string;
  userName: string;
  userEmail: string;
  totalEntries: number;
  totalHours: number;
  billableHours: number;
  averageHoursPerDay: number;
  completionRate: number;
  averageTaskDuration: number;
  lastActivity: string;
  status: 'active' | 'inactive';
  performanceScore: number;
}

export interface ProjectMetrics {
  projectName: string;
  clientFileNumber: string;
  totalEntries: number;
  totalHours: number;
  billableHours: number;
  completionRate: number;
  assignedUsers: number;
  averagePriority: string;
  status: string;
}

export interface TimeDistribution {
  period: string; // daily, weekly, monthly
  date: string;
  totalHours: number;
  billableHours: number;
  completedTasks: number;
  averageProductivity: number;
}

export interface ProductivityTrend {
  period: string;
  date: string;
  hoursPerEntry: number;
  completionRate: number;
  billableRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  totalHours: number;
}

export interface PriorityAnalysis {
  priority: string;
  count: number;
  averageCompletionTime: number;
  completionRate: number;
  totalHours: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  userIds?: string[];
  projects?: string[];
  status?: string[];
  priority?: string[];
  billableOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentAnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get comprehensive department analytics
   */
  getDepartmentAnalytics(filters?: ReportFilters): Observable<DepartmentAnalytics> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.userIds?.length) params = params.set('userIds', filters.userIds.join(','));
      if (filters.projects?.length) params = params.set('projects', filters.projects.join(','));
      if (filters.status?.length) params = params.set('status', filters.status.join(','));
      if (filters.priority?.length) params = params.set('priority', filters.priority.join(','));
      if (filters.billableOnly !== undefined) params = params.set('billableOnly', filters.billableOnly.toString());
    }

    return this.http.get<DepartmentAnalytics>(`${this.apiUrl}/department-summary`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  /**
   * Get user performance comparison
   */
  getUserPerformanceComparison(filters?: ReportFilters): Observable<UserPerformanceMetrics[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<UserPerformanceMetrics[]>(`${this.apiUrl}/user-performance`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  /**
   * Get project analytics
   */
  getProjectAnalytics(filters?: ReportFilters): Observable<ProjectMetrics[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ProjectMetrics[]>(`${this.apiUrl}/project-breakdown`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  /**
   * Get productivity trends
   */
  getProductivityTrends(period: 'daily' | 'weekly' | 'monthly' = 'weekly', filters?: ReportFilters): Observable<ProductivityTrend[]> {
    let params = new HttpParams().set('period', period);
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ProductivityTrend[]>(`${this.apiUrl}/productivity-trends`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  /**
   * Export department report
   */
  exportDepartmentReport(format: 'csv' | 'pdf' | 'excel', filters?: ReportFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.userIds?.length) params = params.set('userIds', filters.userIds.join(','));
      if (filters.projects?.length) params = params.set('projects', filters.projects.join(','));
      if (filters.billableOnly !== undefined) params = params.set('billableOnly', filters.billableOnly.toString());
    }

    return this.http.get(`${this.apiUrl}/export-department-report`, {
      headers: this.authService.getAuthHeaders(),
      params,
      responseType: 'blob'
    });
  }

  /**
   * Get available date ranges for reports
   */
  getAvailableDateRanges(): Observable<{earliest: string, latest: string}> {
    return this.http.get<{earliest: string, latest: string}>(`${this.apiUrl}/date-ranges`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Get department users for filtering
   */
  getDepartmentUsers(): Observable<{id: string, name: string, email: string, active: boolean}[]> {
    return this.http.get<{id: string, name: string, email: string, active: boolean}[]>(`${this.apiUrl}/department-users`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Get department projects for filtering
   */
  getDepartmentProjects(): Observable<{clientFileNumber: string, description: string, active: boolean}[]> {
    return this.http.get<{clientFileNumber: string, description: string, active: boolean}[]>(`${this.apiUrl}/department-projects`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}

