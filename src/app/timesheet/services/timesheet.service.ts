import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimesheetEntry } from '../models/timesheet-entry.interface';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface TimeInterval {
  intervals: string[];
}

export interface Department {
  departments: string[];
}

export interface Task {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface TasksResponse {
  success: boolean;
  department: string;
  tasks: Task[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  priority?: string;
  billable?: boolean;
  search?: string;
  department?: string;
  userEmail?: string;
}

export interface PaginatedResponse {
  entries: TimesheetEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private apiUrl = `${environment.apiUrl}/timesheet`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getEntries(pagination?: PaginationParams, filters?: FilterParams): Observable<PaginatedResponse> {
    // Use different endpoint based on user role
    const endpoint = this.authService.hasRole('SUPERVISOR') ? '/all-entries' : '/entries';
    
    let params = new HttpParams();
    
    // Add pagination parameters
    if (pagination) {
      params = params.set('page', pagination.page.toString());
      params = params.set('limit', pagination.limit.toString());
      if (pagination.sortBy) {
        params = params.set('sortBy', pagination.sortBy);
        params = params.set('sortOrder', pagination.sortOrder || 'desc');
      }
    }
    
    // Add filter parameters
    if (filters) {
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.billable !== undefined) params = params.set('billable', filters.billable.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.userEmail) params = params.set('userEmail', filters.userEmail);
    }
    
    return this.http.get<PaginatedResponse>(`${this.apiUrl}${endpoint}`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  getAllEntries(pagination?: PaginationParams, filters?: FilterParams): Observable<PaginatedResponse> {
    let params = new HttpParams();
    
    // Add pagination parameters
    if (pagination) {
      params = params.set('page', pagination.page.toString());
      params = params.set('limit', pagination.limit.toString());
      if (pagination.sortBy) {
        params = params.set('sortBy', pagination.sortBy);
        params = params.set('sortOrder', pagination.sortOrder || 'desc');
      }
    }
    
    // Add filter parameters
    if (filters) {
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.billable !== undefined) params = params.set('billable', filters.billable.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.userEmail) params = params.set('userEmail', filters.userEmail);
    }
    
    return this.http.get<PaginatedResponse>(`${this.apiUrl}/all-entries`, {
      headers: this.authService.getAuthHeaders(),
      params
    });
  }

  createEntry(entry: TimesheetEntry): Observable<{ message: string; entry: TimesheetEntry }> {
    return this.http.post<{ message: string; entry: TimesheetEntry }>(`${this.apiUrl}/entries`, entry, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateEntry(id: string, entry: TimesheetEntry): Observable<{ message: string; entry: TimesheetEntry }> {
    return this.http.put<{ message: string; entry: TimesheetEntry }>(`${this.apiUrl}/entries/${id}`, entry, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteEntry(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/entries/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getTimeIntervals(): Observable<TimeInterval> {
    return this.http.get<TimeInterval>(`${this.apiUrl}/time-intervals`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getDepartments(): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getTasksByDepartment(department: string): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks/${encodeURIComponent(department)}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 