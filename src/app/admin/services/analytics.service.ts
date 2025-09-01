import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface TimeAnalytics {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  averageHoursPerDay: number;
  averageHoursPerWeek: number;
  averageHoursPerUser: number;
  totalEntries: number;
  billableEntries: number;
  nonBillableEntries: number;
  uniqueUsers: number;
  totalDays: number;
  complianceRate: number;
  overtimeHours: number;
  utilizationRate: number;
}

export interface DepartmentAnalytics {
  department: string;
  totalHours: number;
  averageHoursPerUser: number;
  complianceRate: number;
  userCount: number;
  totalEntries: number;
  billableEntries: number;
  nonBillableEntries: number;
  billablePercentage: number;
  totalDays: number;
  utilizationRate: number;
}

export interface UserAnalytics {
  userId: string;
  firstName: string;
  lastName: string;
  department: string;
  totalHours: number;
  averageHoursPerDay: number;
  complianceRate: number;
  lastEntryDate: Date | null;
  totalEntries: number;
  billableEntries: number;
  nonBillableEntries: number;
  billablePercentage: number;
  totalDays: number;
  utilizationRate: number;
}

export interface TimeTrends {
  date: string;
  totalHours: number;
  userCount: number;
  complianceRate: number;
  averageHoursPerUser: number;
  totalEntries: number;
  billableEntries: number;
  billablePercentage: number;
}



export interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: any;
  columns: string[];
  schedule: 'daily' | 'weekly' | 'monthly' | 'none';
  recipients: string[];
  lastGenerated: Date | null;
  nextGeneration: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/frontend-analytics`;
  private analyticsSubject = new BehaviorSubject<TimeAnalytics | null>(null);
  private departmentAnalyticsSubject = new BehaviorSubject<DepartmentAnalytics[]>([]);
  private userAnalyticsSubject = new BehaviorSubject<UserAnalytics[]>([]);
  private trendsSubject = new BehaviorSubject<TimeTrends[]>([]);

  public analytics$ = this.analyticsSubject.asObservable();
  public departmentAnalytics$ = this.departmentAnalyticsSubject.asObservable();
  public userAnalytics$ = this.userAnalyticsSubject.asObservable();
  public trends$ = this.trendsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get overall time analytics
   */
  getTimeAnalytics(dateRange: { start: Date; end: Date }, filters?: any): Observable<TimeAnalytics> {
    const params = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      ...filters
    };

    return this.http.get<TimeAnalytics>(`${this.apiUrl}/time-analytics`, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(analytics => {
        this.analyticsSubject.next(analytics);
        return analytics;
      })
    );
  }

  /**
   * Get department-level analytics
   */
  getDepartmentAnalytics(dateRange: { start: Date; end: Date }, filters?: any): Observable<DepartmentAnalytics[]> {
    const params = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      ...filters
    };

    return this.http.get<DepartmentAnalytics[]>(`${this.apiUrl}/department-analytics`, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(analytics => {
        this.departmentAnalyticsSubject.next(analytics);
        return analytics;
      })
    );
  }

  /**
   * Get user-level analytics
   */
  getUserAnalytics(dateRange: { start: Date; end: Date }, filters?: any): Observable<UserAnalytics[]> {
    const params = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      ...filters
    };

    return this.http.get<UserAnalytics[]>(`${this.apiUrl}/user-analytics`, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(analytics => {
        this.userAnalyticsSubject.next(analytics);
        return analytics;
      })
    );
  }

  /**
   * Get time trends over a period
   */
  getTimeTrends(dateRange: { start: Date; end: Date }, granularity: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<TimeTrends[]> {
    const params = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      granularity
    };

    return this.http.get<TimeTrends[]>(`${this.apiUrl}/time-trends`, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(trends => {
        this.trendsSubject.next(trends);
        return trends;
      })
    );
  }



  /**
   * Generate custom report
   */
  generateCustomReport(reportConfig: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom-report`, reportConfig, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Export analytics data
   */
  exportAnalytics(format: 'csv' | 'excel' | 'pdf', data: any, filename?: string): Observable<Blob> {
    const params: any = { format };
    if (filename) {
      params.filename = filename;
    }

    return this.http.post(`${this.apiUrl}/export`, data, {
      params,
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Get saved custom reports
   */
  getCustomReports(): Observable<CustomReport[]> {
    return this.http.get<CustomReport[]>(`${this.apiUrl}/custom-reports`, {
      headers: this.authService.getAuthHeaders()
    });
  }

    /**
   * Save custom report
   */
  saveCustomReport(report: CustomReport): Observable<CustomReport> {
    if (report.id) {
      return this.http.put<CustomReport>(`${this.apiUrl}/custom-reports/${report.id}`, report, {
        headers: this.authService.getAuthHeaders()
      });
    } else {
      return this.http.post<CustomReport>(`${this.apiUrl}/custom-reports`, report, {
        headers: this.authService.getAuthHeaders()
      });
    }
  }

  /**
   * Delete custom report
   */
  deleteCustomReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/custom-reports/${reportId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Schedule report generation
   */
  scheduleReport(reportId: string, schedule: 'daily' | 'weekly' | 'monthly', recipients: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom-reports/${reportId}/schedule`, {
      schedule,
      recipients
    }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/real-time-dashboard`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Get KPI metrics
   */
  getKPIMetrics(dateRange: { start: Date; end: Date }): Observable<any> {
    const params = {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    };

    return this.http.get(`${this.apiUrl}/kpi-metrics`, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }
}
