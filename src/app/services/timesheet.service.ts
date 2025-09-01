import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimesheetEntry {
  id?: string;
  date: string;
  client_file_number: string;
  department: string;
  task: string;
  activity: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_time: string;
  end_time: string;
  total_hours?: number;
  status: 'Completed' | 'CarriedOut' | 'NotStarted';
  billable: boolean;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeInterval {
  intervals: string[];
}

export interface Department {
  departments: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private apiUrl = `${environment.apiUrl}/timesheet`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get timesheet entries for current user
  getEntries(): Observable<{ entries: TimesheetEntry[] }> {
    return this.http.get<{ entries: TimesheetEntry[] }>(`${this.apiUrl}/entries`, {
      headers: this.getHeaders()
    });
  }

  // Get all timesheet entries (Admin/Supervisor only)
  getAllEntries(): Observable<{ entries: TimesheetEntry[] }> {
    return this.http.get<{ entries: TimesheetEntry[] }>(`${this.apiUrl}/all-entries`, {
      headers: this.getHeaders()
    });
  }

  // Create new timesheet entry
  createEntry(entry: TimesheetEntry): Observable<{ message: string; entry: TimesheetEntry }> {
    return this.http.post<{ message: string; entry: TimesheetEntry }>(`${this.apiUrl}/entries`, entry, {
      headers: this.getHeaders()
    });
  }

  // Update timesheet entry
  updateEntry(id: string, entry: TimesheetEntry): Observable<{ message: string; entry: TimesheetEntry }> {
    return this.http.put<{ message: string; entry: TimesheetEntry }>(`${this.apiUrl}/entries/${id}`, entry, {
      headers: this.getHeaders()
    });
  }

  // Delete timesheet entry
  deleteEntry(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/entries/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get time intervals for dropdown
  getTimeIntervals(): Observable<TimeInterval> {
    return this.http.get<TimeInterval>(`${this.apiUrl}/time-intervals`, {
      headers: this.getHeaders()
    });
  }

  // Get departments for dropdown
  getDepartments(): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments`, {
      headers: this.getHeaders()
    });
  }
} 