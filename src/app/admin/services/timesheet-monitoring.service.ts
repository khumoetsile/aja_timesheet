import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, combineLatest, Subject, of } from 'rxjs';
import { map, switchMap, startWith, distinctUntilChanged, takeUntil, debounceTime, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface TimesheetCompliance {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  department: string;
  lastEntryDate: Date | null;
  lastEntryTime: string | null;
  hoursSinceLastEntry: number;
  isCompliant: boolean;
  complianceStatus: 'compliant' | 'warning' | 'critical';
  businessHoursMissed: number;
  nextExpectedEntry: Date;
  riskLevel: 'low' | 'medium' | 'high';
  notificationSent: boolean;
  lastNotificationSent: Date | null;
}

export interface ComplianceSummary {
  totalUsers: number;
  compliantUsers: number;
  nonCompliantUsers: number;
  criticalUsers: number;
  warningUsers: number;
  overallComplianceRate: number;
  departments: {
    [key: string]: {
      total: number;
      compliant: number;
      nonCompliant: number;
      critical: number;
    };
  };
}

export interface BusinessHoursConfig {
  startHour: number;      // 8 AM
  endHour: number;        // 5 PM
  startMinute: number;    // 0
  endMinute: number;      // 0
  timezone: string;       // 'America/New_York' or similar
  excludeWeekends: boolean; // true
  excludeHolidays: boolean; // true (future enhancement)
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetMonitoringService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/timesheet`;
  private complianceSubject = new BehaviorSubject<TimesheetCompliance[]>([]);
  private summarySubject = new BehaviorSubject<ComplianceSummary | null>(null);
  
  // Default business hours: 8 AM - 5 PM, Monday-Friday
  private businessHours: BusinessHoursConfig = {
    startHour: 8,
    endHour: 17,
    startMinute: 0,
    endMinute: 0,
    timezone: 'America/New_York',
    excludeWeekends: true,
    excludeHolidays: true
  };

  // Compliance thresholds (in hours)
  private thresholds = {
    warning: 8,      // Warning after 8 business hours
    critical: 16,    // Critical after 16 business hours (2 business days)
    maxBusinessHours: 9  // Maximum business hours per day
  };

  public compliance$ = this.complianceSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  private autoRefreshStarted = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Don't start auto-refresh immediately to prevent rate limiting
    // It will be started when first accessed
  }

  /**
   * Start automatic refresh of compliance data
   */
  private startAutoRefresh(): void {
    // Prevent multiple auto-refresh instances
    if (this.autoRefreshStarted) {
      return;
    }
    
    this.autoRefreshStarted = true;
    
    // Load data immediately, then refresh every 5 minutes (reduced from 15 to be more responsive)
    timer(0, 300000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.refreshComplianceData())
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the service and start auto-refresh if not already started
   */
  private initializeService(): void {
    if (!this.autoRefreshStarted) {
      this.startAutoRefresh();
    }
  }

  /**
   * Refresh all compliance data
   */
  refreshComplianceData(): Observable<void> {
    return this.fetchAllUsersCompliance().pipe(
      takeUntil(this.destroy$),
      map(compliance => {
        this.complianceSubject.next(compliance);
        this.updateSummary(compliance);
        return;
      })
    );
  }

  /**
   * Manual refresh method for components to call
   */
  manualRefresh(): Observable<void> {
    return this.refreshComplianceData();
  }

  /**
   * Get compliance data - initializes service if needed
   */
  getComplianceData(): Observable<TimesheetCompliance[]> {
    this.initializeService();
    return this.compliance$;
  }

  /**
   * Load compliance data once without auto-refresh
   */
  loadComplianceData(): Observable<void> {
    return this.refreshComplianceData();
  }

  /**
   * Fetch compliance data for all users
   */
  private fetchAllUsersCompliance(): Observable<TimesheetCompliance[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users-compliance`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      takeUntil(this.destroy$),
      map(users => {
        console.log('🔍 Raw users data from backend:', users);
        const compliance = users.map(user => this.calculateCompliance(user));
        console.log('🔍 Processed compliance data:', compliance);
        return compliance;
      }),
      // Handle rate limiting gracefully - return empty array instead of throwing error
      catchError(error => {
        console.warn('Rate limiting detected, returning empty compliance data:', error);
        return of([]);
      })
    );
  }

  /**
   * Calculate compliance for a specific user
   */
  private calculateCompliance(user: any): TimesheetCompliance {
    const now = new Date();
    const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
    
    console.log(`🔍 Processing user: ${user.firstName} ${user.lastName}`);
    console.log(`🔍 Last entry: ${lastEntry}`);
    console.log(`🔍 Current time: ${now}`);
    console.log(`🔍 Is weekend: ${this.isWeekend(now)}`);
    console.log(`🔍 Is before business hours: ${this.isBeforeBusinessHours(now)}`);
    console.log(`🔍 Is business hours: ${this.isBusinessHours(now)}`);
    console.log(`🔍 Is after business hours: ${this.isAfterBusinessHours(now)}`);
    
    let hoursSinceLastEntry = 0;
    let complianceStatus: TimesheetCompliance['complianceStatus'] = 'compliant';
    let businessHoursMissed = 0;
    let riskLevel: TimesheetCompliance['riskLevel'] = 'low';

    if (lastEntry) {
      hoursSinceLastEntry = this.calculateHoursDifference(lastEntry, now);
      businessHoursMissed = this.calculateBusinessHoursMissed(lastEntry, now);
      
      console.log(`🔍 Hours since last entry: ${hoursSinceLastEntry}`);
      console.log(`🔍 Business hours missed: ${businessHoursMissed}`);
      
      // Determine compliance status based on business hours missed
      // Only show three main statuses: compliant, warning, critical
      if (businessHoursMissed >= this.thresholds.critical) {
        complianceStatus = 'critical';
        riskLevel = 'high';
      } else if (businessHoursMissed >= this.thresholds.warning) {
        complianceStatus = 'warning';
        riskLevel = 'medium';
      } else {
        complianceStatus = 'compliant';
        riskLevel = 'low';
      }
      
      console.log(`🔍 Final compliance status: ${complianceStatus}`);
         } else {
       // No entries at all - always calculate business hours missed
       businessHoursMissed = this.calculateBusinessHoursMissed(new Date(0), now); // Start from epoch
       
       // Determine compliance status based on business hours missed
       if (businessHoursMissed >= this.thresholds.critical) {
         complianceStatus = 'critical';
         riskLevel = 'high';
       } else if (businessHoursMissed >= this.thresholds.warning) {
         complianceStatus = 'warning';
         riskLevel = 'medium';
       } else {
         complianceStatus = 'compliant';
         riskLevel = 'low';
       }
       
       console.log(`🔍 No entries - business hours missed: ${businessHoursMissed}, compliance status: ${complianceStatus}`);
     }

    const nextExpectedEntry = this.calculateNextExpectedEntry(now);

    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      userEmail: user.userEmail,
      department: user.department || 'Unknown',
      lastEntryDate: lastEntry,
      lastEntryTime: lastEntry ? lastEntry.toLocaleTimeString() : null,
      hoursSinceLastEntry,
      isCompliant: complianceStatus === 'compliant',
      complianceStatus,
      businessHoursMissed,
      nextExpectedEntry,
      riskLevel,
      notificationSent: false,
      lastNotificationSent: null
    };
  }

  /**
   * Calculate hours difference between two dates
   */
  private calculateHoursDifference(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Calculate business hours missed since last entry
   */
  private calculateBusinessHoursMissed(lastEntry: Date, now: Date): number {
    let missedHours = 0;
    let current = new Date(lastEntry);
    
    // If last entry was on weekend or after hours, start counting from next business day
    if (this.isWeekend(current) || this.isAfterBusinessHours(current)) {
      current = this.getNextBusinessDay(current);
    }
    
    // Count business hours missed up to the current time
    // Don't stop counting just because we're currently outside business hours
    while (current < now) {
      if (this.isBusinessDay(current) && this.isBusinessHours(current)) {
        missedHours++;
      }
      current.setHours(current.getHours() + 1);
    }

    console.log(`🔍 Business hours missed calculation: ${missedHours} hours`);
    return missedHours;
  }

  /**
   * Check if date is weekend
   */
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Check if date is a business day
   */
  private isBusinessDay(date: Date): boolean {
    return !this.isWeekend(date);
  }

  /**
   * Check if time is within business hours
   */
  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    const startTime = this.businessHours.startHour * 60 + this.businessHours.startMinute;
    const endTime = this.businessHours.endHour * 60 + this.businessHours.endMinute;
    
    return timeInMinutes >= startTime && timeInMinutes < endTime;
  }

  /**
   * Check if time is before business hours
   */
  private isBeforeBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    const startTime = this.businessHours.startHour * 60 + this.businessHours.startMinute;
    
    return timeInMinutes < startTime;
  }

  /**
   * Check if time is after business hours
   */
  private isAfterBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    const endTime = this.businessHours.endHour * 60 + this.businessHours.endMinute;
    
    return timeInMinutes >= endTime;
  }

  /**
   * Get next business day at start of business hours
   */
  private getNextBusinessDay(date: Date): Date {
    const next = new Date(date);
    
    // If it's weekend, next business day is Monday
    if (this.isWeekend(next)) {
      const daysUntilMonday = next.getDay() === 0 ? 1 : 8 - next.getDay();
      next.setDate(next.getDate() + daysUntilMonday);
    } else if (this.isAfterBusinessHours(next)) {
      // If it's after business hours, next business day is tomorrow
      next.setDate(next.getDate() + 1);
    }
    
    // Set to start of business hours
    next.setHours(this.businessHours.startHour, this.businessHours.startMinute, 0, 0);
    return next;
  }

  /**
   * Calculate next expected entry time
   */
  private calculateNextExpectedEntry(now: Date): Date {
    const next = new Date(now);
    
    // If it's weekend, next expected entry is Monday 8 AM
    if (this.isWeekend(now)) {
      const daysUntilMonday = now.getDay() === 0 ? 1 : 8 - now.getDay();
      next.setDate(next.getDate() + daysUntilMonday);
      next.setHours(this.businessHours.startHour, this.businessHours.startMinute, 0, 0);
      return next;
    }
    
    // If it's after business hours, next expected entry is tomorrow 8 AM
    if (this.isAfterBusinessHours(now)) {
      next.setDate(next.getDate() + 1);
      next.setHours(this.businessHours.startHour, this.businessHours.startMinute, 0, 0);
      return next;
    }
    
    // If it's during business hours, next expected entry is in 8 hours
    next.setHours(next.getHours() + this.thresholds.warning);
    return next;
  }

  /**
   * Update compliance summary
   */
  private updateSummary(compliance: TimesheetCompliance[]): void {
    const summary: ComplianceSummary = {
      totalUsers: compliance.length,
      compliantUsers: compliance.filter(c => c.isCompliant).length,
      nonCompliantUsers: compliance.filter(c => !c.isCompliant).length,
      criticalUsers: compliance.filter(c => c.complianceStatus === 'critical').length,
      warningUsers: compliance.filter(c => c.complianceStatus === 'warning').length,
      overallComplianceRate: compliance.length > 0 ? 
        (compliance.filter(c => c.isCompliant).length / compliance.length) * 100 : 0,
      departments: {}
    };

    // Calculate department-level statistics
    compliance.forEach(user => {
      if (!summary.departments[user.department]) {
        summary.departments[user.department] = {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          critical: 0
        };
      }
      
      summary.departments[user.department].total++;
      
      if (user.isCompliant) {
        summary.departments[user.department].compliant++;
      } else {
        summary.departments[user.department].nonCompliant++;
      }
      
      if (user.complianceStatus === 'critical') {
        summary.departments[user.department].critical++;
      }
    });

    this.summarySubject.next(summary);
  }

  /**
   * Get users with critical compliance issues
   */
  getCriticalUsers(): Observable<TimesheetCompliance[]> {
    return this.compliance$.pipe(
      map(compliance => compliance.filter(c => c.complianceStatus === 'critical'))
    );
  }

  /**
   * Get users with warning compliance issues
   */
  getWarningUsers(): Observable<TimesheetCompliance[]> {
    return this.compliance$.pipe(
      map(compliance => compliance.filter(c => c.complianceStatus === 'warning'))
    );
  }

  /**
   * Get users by department
   */
  getUsersByDepartment(department: string): Observable<TimesheetCompliance[]> {
    return this.compliance$.pipe(
      map(compliance => compliance.filter(c => c.department === department))
    );
  }

  /**
   * Get compliance trends (for future analytics)
   */
  getComplianceTrends(): Observable<any> {
    // This would integrate with historical data for trend analysis
    return this.http.get(`${this.apiUrl}/compliance-trends`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Send notification to user about compliance
   */
  sendComplianceNotification(userId: string, type: 'warning' | 'critical'): Observable<any> {
    return this.http.post(`${this.apiUrl}/compliance-notification`, {
      userId,
      type,
      timestamp: new Date().toISOString()
    }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Update business hours configuration
   */
  updateBusinessHours(config: Partial<BusinessHoursConfig>): void {
    this.businessHours = { ...this.businessHours, ...config };
    // Refresh compliance data with new business hours
    this.refreshComplianceData().subscribe();
  }

  /**
   * Get current business hours configuration
   */
  getBusinessHours(): BusinessHoursConfig {
    return { ...this.businessHours };
  }
}
