import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { TimesheetCompliance } from './timesheet-monitoring.service';
import { map } from 'rxjs/operators';

export interface ComplianceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  userId?: string;
  userName?: string;
  department?: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComplianceNotificationService {
  private alertsSubject = new BehaviorSubject<ComplianceAlert[]>([]);
  private criticalAlertsCountSubject = new BehaviorSubject<number>(0);
  
  public alerts$ = this.alertsSubject.asObservable();
  public criticalAlertsCount$ = this.criticalAlertsCountSubject.asObservable();

  constructor() {
    // Check for new alerts every 5 minutes
    this.startAlertMonitoring();
  }

  private startAlertMonitoring(): void {
    timer(0, 300000).subscribe(() => {
      this.checkForNewAlerts();
    });
  }

  private checkForNewAlerts(): void {
    // This would typically check with the backend for new compliance issues
    // For now, we'll just update the count
    const currentAlerts = this.alertsSubject.value;
    const criticalCount = currentAlerts.filter(alert => 
      alert.type === 'critical' && !alert.acknowledged
    ).length;
    
    this.criticalAlertsCountSubject.next(criticalCount);
  }

  addAlert(alert: Omit<ComplianceAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const newAlert: ComplianceAlert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date(),
      acknowledged: false
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([newAlert, ...currentAlerts]);

    // Update critical count
    if (newAlert.type === 'critical') {
      const criticalCount = this.alertsSubject.value.filter(alert => 
        alert.type === 'critical' && !alert.acknowledged
      ).length;
      this.criticalAlertsCountSubject.next(criticalCount);
    }

    // Show browser notification if critical
    if (newAlert.type === 'critical') {
      this.showBrowserNotification(newAlert);
    }
  }

  acknowledgeAlert(alertId: string): void {
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    
    this.alertsSubject.next(updatedAlerts);

    // Update critical count
    const criticalCount = updatedAlerts.filter(alert => 
      alert.type === 'critical' && !alert.acknowledged
    ).length;
    this.criticalAlertsCountSubject.next(criticalCount);
  }

  dismissAlert(alertId: string): void {
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    this.alertsSubject.next(updatedAlerts);

    // Update critical count
    const criticalCount = updatedAlerts.filter(alert => 
      alert.type === 'critical' && !alert.acknowledged
    ).length;
    this.criticalAlertsCountSubject.next(criticalCount);
  }

  generateComplianceAlerts(compliance: TimesheetCompliance[]): void {
    // Clear existing alerts
    this.alertsSubject.next([]);

    compliance.forEach(user => {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      if (user.complianceStatus === 'critical') {
        this.addAlert({
          type: 'critical',
          message: `${fullName} hasn't submitted a timesheet entry for ${user.hoursSinceLastEntry} business hours`,
          userId: user.userId,
          userName: fullName,
          department: user.department,
          actionRequired: true
        });
      } else if (user.complianceStatus === 'warning') {
        this.addAlert({
          type: 'warning',
          message: `${fullName} is approaching compliance threshold (${user.businessHoursMissed} business hours missed)`,
          userId: user.userId,
          userName: fullName,
          department: user.department,
          actionRequired: false
        });
      }
    });
  }

  private showBrowserNotification(alert: ComplianceAlert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timesheet Compliance Alert', {
        body: alert.message,
        icon: '/assets/aja-logo.svg',
        tag: 'compliance-alert',
        requireInteraction: true
      });
    }
  }

  requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      return Notification.requestPermission().then(permission => {
        return permission === 'granted';
      });
    }
    return Promise.resolve(false);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getUnacknowledgedAlerts(): Observable<ComplianceAlert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => !alert.acknowledged))
    );
  }

  getCriticalAlerts(): Observable<ComplianceAlert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged))
    );
  }

  clearAllAlerts(): void {
    this.alertsSubject.next([]);
    this.criticalAlertsCountSubject.next(0);
  }
}
